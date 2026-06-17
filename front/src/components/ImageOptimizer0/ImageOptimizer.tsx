import { useState, useCallback, useRef } from 'react';
import Navbar from './Navbar.tsx';
import Hero from './Hero.tsx';
import UploadZone from './UploadZone.tsx';
import FileTable from './FileTable.tsx';
import ResultsBar from './ResultsBar.tsx';
import './ImageOptimizer.css'
import type { CompressedFile } from '../../types/types.ts';
import type { UploadResult } from './UploadZone.tsx';

const API_BASE = 'http://localhost:3200';

export default function ImageOptimizer() {
    const [files, setFiles] = useState<CompressedFile[]>([]);
    const sessionIdRef = useRef<string | null>(null);

    const handleUploadComplete = useCallback((result: UploadResult) => {
        sessionIdRef.current = result.sessionId;

        const completed: CompressedFile[] = result.images.map((img) => ({
            id: crypto.randomUUID(),
            name: img.originalName,
            originalSize: img.originalSize,
            compressedSize: img.optimizedSize,
            compressionRatio: img.savings,
            status: 'completed',
            compressedUrl: `${API_BASE}${img.downloadUrl}`,
            downloadUrl: img.downloadUrl,
        }));

        const errored: CompressedFile[] = result.errors.map((e) => ({
            id: crypto.randomUUID(),
            name: e.name,
            originalSize: 0,
            status: 'error',
        }));

        setFiles((prev) => [...prev, ...completed, ...errored]);
    }, []);

    const handleDownload = (file: CompressedFile) => {
        if (!file.compressedUrl) return;
        const a = document.createElement('a');
        a.href = file.compressedUrl;
        a.download = file.name;
        a.click();
    };

    const handleDownloadAll = async () => {
        const sessionId = sessionIdRef.current;
        if (!sessionId) return;

        try {
            const res = await fetch(`${API_BASE}/api/optimize/zip/${sessionId}`);
            if (!res.ok) throw new Error('Failed to get ZIP');

            const data = await res.json();
            const a = document.createElement('a');
            a.href = `${API_BASE}${data.zipUrl}`;
            a.download = `${data.folderName}.zip`;
            a.click();
        } catch (err) {
            console.error('ZIP download failed:', err);
        }
    };

    const handleClear = () => {
        setFiles([]);
        sessionIdRef.current = null;
    };

    const handleCompare = (file: CompressedFile) => {
        alert(`Compare: ${file.name}`);
    };

    return (
        <div className="body-wrapper">
            <Navbar/>
            <Hero/>

            <UploadZone onComplete={handleUploadComplete}/>

            {/*tempppppppppp*/}

            <div className="max-w-6xl mx-auto px-6">
                <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-800 text-left text-sm text-gray-400">
                            <th className="py-5 px-8 font-normal">Name</th>
                            <th className="py-5 px-6 font-normal">Before</th>
                            <th className="py-5 px-6 font-normal">Status</th>
                            <th className="py-5 px-6 font-normal">After</th>
                            <th className="py-5 px-8 font-normal text-right">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                        <tr className="hover:bg-gray-800/50 transition">
                            <td className="py-5 px-8 flex items-center gap-4">
                                <div>
                                    <div className="font-medium truncate max-w-xs">HKInKCzWwAArsY6.jpg</div>
                                </div>
                            </td>
                            <td className="py-5 px-6 text-gray-300">533.1 KB</td>
                            <td className="py-5 px-6"><span className="text-emerald-400 font-medium">Saved 38.2%</span>
                            </td>
                            <td className="py-5 px-6 text-gray-300">329.5 KB</td>
                            <td className="py-5 px-8 text-right">
                                <div className="flex gap-3 justify-end">
                                    <button
                                        className="px-5 py-2 text-sm border border-gray-700 hover:border-gray-500 rounded-xl transition">Compare
                                    </button>
                                    <button
                                        className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition">Download
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-800/50 transition">
                            <td className="py-5 px-8 flex items-center gap-4">
                                <div>
                                    <div className="font-medium truncate max-w-xs">HKPtldiWAAAyDmI.jpg</div>
                                </div>
                            </td>
                            <td className="py-5 px-6 text-gray-300">38.8 KB</td>
                            <td className="py-5 px-6"><span className="text-emerald-400 font-medium">Saved 45.2%</span>
                            </td>
                            <td className="py-5 px-6 text-gray-300">21.3 KB</td>
                            <td className="py-5 px-8 text-right">
                                <div className="flex gap-3 justify-end">
                                    <button
                                        className="px-5 py-2 text-sm border border-gray-700 hover:border-gray-500 rounded-xl transition">Compare
                                    </button>
                                    <button
                                        className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition">Download
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-800/50 transition">
                            <td className="py-5 px-8 flex items-center gap-4">
                                <div>
                                    <div className="font-medium truncate max-w-xs">Screenshot 2026-06-08 142405.png
                                    </div>
                                </div>
                            </td>
                            <td className="py-5 px-6 text-gray-300">21.5 KB</td>
                            <td className="py-5 px-6"><span className="text-emerald-400 font-medium">Saved 19.0%</span>
                            </td>
                            <td className="py-5 px-6 text-gray-300">17.4 KB</td>
                            <td className="py-5 px-8 text-right">
                                <div className="flex gap-3 justify-end">
                                    <button
                                        className="px-5 py-2 text-sm border border-gray-700 hover:border-gray-500 rounded-xl transition">Compare
                                    </button>
                                    <button
                                        className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition">Download
                                    </button>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-8 flex justify-between items-center">
                <button className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition">Clear
                    List
                </button>
                <div className="text-center">
                    <div className="text-xl font-semibold">Total Saved: <span
                        className="text-emerald-400">225.3 KB</span></div>
                    <div className="text-sm text-gray-400 mt-1">38.0% reduction across 3 files</div>
                </div>
                <button
                    className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-2xl font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition">Download
                    All as ZIP
                </button>
            </div>


            <FileTable
                files={files}
                onDownload={handleDownload}
                onCompare={handleCompare}
            />
            <ResultsBar
                files={files}
                onClear={handleClear}
                onDownloadAll={handleDownloadAll}
            />
            tempppppppppp

            {files.length > 0 && (
                <>
                    <FileTable
                        files={files}
                        onDownload={handleDownload}
                        onCompare={handleCompare}
                    />
                    <ResultsBar
                        files={files}
                        onClear={handleClear}
                        onDownloadAll={handleDownloadAll}
                    />
                </>
            )}
        </div>
    );
}