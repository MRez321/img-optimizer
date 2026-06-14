import { useState, useCallback, useRef } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import UploadZone from './UploadZone';
import FileTable from './FileTable';
import ResultsBar from './ResultsBar';
import type { CompressedFile } from '../types';
import type { UploadResult } from './UploadZone';

const API_BASE = 'http://localhost:3200';

export default function ImageCompressor() {
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
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <Hero />

            <UploadZone onComplete={handleUploadComplete} />

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