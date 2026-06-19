import {useState, useCallback, useRef} from 'react';
import {Dropzone} from '../components/Dropzone';
import {OptionsPanel} from '../components/OptionsPanel';
import {FileRow} from '../components/FileRow';
import {SummaryBar} from '../components/SummaryBar';
import {useOptimizerSocket} from '../hooks/useOptimizerSocket';
import {useHeartbeat} from '../hooks/useHeartbeat';
import {startSession, uploadFile, requestZip} from '../lib/api';
import {generateId} from '../lib/format';
import type {ProcessOptions, QueuedFile, ZipReadyEvent} from '../types';
import {Trash2, Zap} from 'lucide-react';

const DEFAULT_OPTIONS: ProcessOptions = {
    quality: 80,
    format: 'webp',
    stripMetadata: true,
    progressive: true,
    lossless: false,
};

export const OptimizerPage = () => {
    const [options, setOptions] = useState<ProcessOptions>(DEFAULT_OPTIONS);
    const [queue, setQueue] = useState<QueuedFile[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [expected, setExpected] = useState(0);
    const [zipData, setZipData] = useState<ZipReadyEvent | null>(null);
    const [running, setRunning] = useState(false);
    const queueRef = useRef<QueuedFile[]>([]);

    const updateFile = useCallback(
        (id: string, patch: Partial<QueuedFile>) => {
            console.log('[UPDATE FILE]', {
                id,
                patch,
            });

            setQueue((prev) => {
                const next = prev.map((f) =>
                    f.id === id ? { ...f, ...patch } : f
                );

                console.log(
                    '[QUEUE AFTER UPDATE]',
                    next.map((f) => ({
                        id: f.id,
                        name: f.file.name,
                        status: f.status,
                    }))
                );

                queueRef.current = next;
                return next;
            });
        },
        []
    );

    const {connected, joinSession, leaveSession, sendHeartbeat} =
        useOptimizerSocket({
            onFileProcessed: ({ image }) => {
                console.log('[SOCKET] file-processed received', image);

                const target = queueRef.current.find(
                    (f) =>
                        f.file.name === image.originalName &&
                        f.status !== 'done' &&
                        f.status !== 'error'
                );

                if (target) {
                    console.log('[STATE] -> done', {
                        file: image.originalName,
                        previousStatus: target.status,
                    });

                    updateFile(target.id, {
                        status: 'done',
                        result: image,
                    });
                } else {
                    console.warn(
                        '[SOCKET] file processed but no matching target found',
                        {
                            originalName: image.originalName,
                        }
                    );
                }
            },

            onFileError: ({originalName, message}) => {
                console.log('[SOCKET] file-error', {
                    originalName,
                    message,
                });

                const target = queueRef.current.find(
                    (f) =>
                        f.file.name === originalName &&
                        f.status !== 'done' &&
                        f.status !== 'error'
                );

                console.log('[SOCKET] error target', target);

                if (target) {
                    updateFile(target.id, {
                        status: 'error',
                        errorMessage: message,
                    });
                }
            },

            onZipReady: (data) => {
                console.log('[SOCKET] zip-ready', data);

                setZipData(data);
            },
        });

    useHeartbeat(sessionId, sendHeartbeat);

    const handleFiles = useCallback((files: File[]) => {
        const newItems: QueuedFile[] = files.map((file) => ({
            id: generateId(),
            file,
            status: 'queued',
        }));
        setQueue((prev) => {
            const next = [...prev, ...newItems];
            queueRef.current = next;
            return next;
        });
    }, []);

    const removeFile = (id: string) => {
        setQueue((prev) => {
            const next = prev.filter((f) => f.id !== id);
            queueRef.current = next;
            return next;
        });
    };

    const clearAll = () => {
        if (sessionId) leaveSession(sessionId);
        setQueue([]);
        queueRef.current = [];
        setSessionId(null);
        setZipData(null);
        setExpected(0);
    };

    const completedCount = queue.filter((f) => f.status === 'done').length;
    const totalOriginal = queue.filter((f) => f.result).reduce((sum, f) => sum + (f.result?.originalSize || 0), 0);
    const totalOptimized = queue.filter((f) => f.result).reduce((sum, f) => sum + (f.result?.optimizedSize || 0), 0);

    const startCompression = async () => {
        const pending = queue.filter((f) => f.status === 'queued');
        if (pending.length === 0) return;

        setRunning(true);
        setZipData(null);

        try {
            const {sessionId: newSessionId, expectedFiles} = await startSession({
                ...options,
                totalFiles: pending.length,
            });

            console.log('[SESSION CREATED]', {
                sessionId: newSessionId,
                expectedFiles,
            });

            setSessionId(newSessionId);
            setExpected(expectedFiles);
            await joinSession(newSessionId);

            // Upload sequentially - matches the backend's single-file endpoint design
            for (const item of pending) {
                updateFile(item.id, {status: 'uploading'});
                try {
                    await uploadFile(newSessionId, item.file);

                    const current = queueRef.current.find(
                        (f) => f.id === item.id
                    );

                    console.log('[UPLOAD COMPLETE]', {
                        file: item.file.name,
                        currentStatus: current?.status,
                    });

                    if (current?.status === 'uploading') {
                        console.log('[STATE] uploading -> processing', item.file.name);

                        updateFile(item.id, {
                            status: 'processing',
                        });
                    } else {
                        console.log(
                            '[STATE] processing skipped because socket already updated status',
                            {
                                file: item.file.name,
                                currentStatus: current?.status,
                            }
                        );
                    }
                } catch (err: any) {
                    updateFile(item.id, {
                        status: 'error',
                        errorMessage: err?.response?.data?.error || 'Upload failed',
                    });
                }
            }
        } catch (err: any) {
            console.error('Failed to start session:', err);
        } finally {
            setRunning(false);
        }
    };

    const handleManualZip = async () => {
        if (!sessionId) return;
        try {
            const data = await requestZip(sessionId);
            setZipData({
                zipUrl: data.zipUrl,
                folderName: data.folderName,
                totalOriginalSize: Number(data.totalOriginalSize),
                totalOptimizedSize: Number(data.totalOptimizedSize),
                totalSavings: Number(data.totalSavings),
            });
        } catch (err) {
            console.error('Manual zip request failed:', err);
        }
    };

    const queuedCount = queue.filter((f) => f.status === 'queued').length;
    const hasActivity = queue.length > 0;

    return (
        <div className="optimizer">
            <section className="hero">
                <h1 className="hero__title">
                    Shrink images.
                    <br/>
                    <span className="hero__title-accent">Keep the detail.</span>
                </h1>
                <p className="hero__subtitle">
                    Drop in a batch, pick a format, watch every file compress in real time.
                </p>
            </section>

            <div className="optimizer__layout">
                <div className="optimizer__main">
                    <Dropzone onFiles={handleFiles} disabled={running}/>

                    {hasActivity && (
                        <div className="queue-panel">
                            <div className="queue-panel__header">
                                <span>{queue.length} file{queue.length !== 1 ? 's' : ''}</span>
                                <button className="icon-btn" onClick={clearAll} disabled={running} title="Clear all">
                                    <Trash2 size={14}/>
                                </button>
                            </div>

                            <div className="queue-panel__list">
                                {queue.map((item) => (
                                    <FileRow key={item.id} item={item} onRemove={removeFile}/>
                                ))}
                            </div>

                            {queuedCount > 0 && (
                                <button className="btn btn--primary btn--full" onClick={startCompression}
                                        disabled={running}>
                                    <Zap size={16}/>
                                    {running ? 'Compressing…' : `Compress ${queuedCount} file${queuedCount !== 1 ? 's' : ''}`}
                                </button>
                            )}

                            {(sessionId || completedCount > 0) && (
                                <SummaryBar
                                    completed={completedCount}
                                    expected={expected}
                                    totalOriginal={totalOriginal}
                                    totalOptimized={totalOptimized}
                                    zipData={zipData}
                                    connected={connected}
                                    onManualZip={handleManualZip}
                                    zipRequestable={!!sessionId}
                                />
                            )}
                        </div>
                    )}
                </div>

                <aside className="optimizer__sidebar">
                    <OptionsPanel options={options} onChange={setOptions} disabled={running}/>
                </aside>
            </div>
        </div>
    );
};
