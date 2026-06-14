import { useState, useCallback } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import UploadZone from './UploadZone';
import FileTable from './FileTable';
import ResultsBar from './ResultsBar';
import type { CompressedFile } from '../types';

export default function ImageCompressor() {
    const [files, setFiles] = useState<CompressedFile[]>([]);

    const handleFilesSelected = useCallback((newFiles: File[]) => {
        const processed: CompressedFile[] = newFiles.map((file) => ({
            id: crypto.randomUUID(),
            name: file.name,
            originalSize: file.size,
            status: 'pending',
            originalPreview: URL.createObjectURL(file),
        }));

        setFiles((prev) => [...prev, ...processed]);

        // Simulate compression (replace with real API call)
        processed.forEach((file) => {
            setTimeout(() => {
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === file.id
                            ? {
                                ...f,
                                status: 'completed',
                                compressedSize: Math.floor(f.originalSize * 0.55),
                                compressionRatio: 45,
                                compressedPreview: f.originalPreview, // In real app, use compressed image
                                compressedUrl: f.originalPreview,
                            }
                            : f
                    )
                );
            }, 1200);
        });
    }, []);

    const handleDownload = (file: CompressedFile) => {
        if (file.compressedUrl) {
            const a = document.createElement('a');
            a.href = file.compressedUrl;
            a.download = `compressed-${file.name}`;
            a.click();
        }
    };

    const handleDownloadAll = () => {
        alert('ZIP download would go here (use JSZip library for real implementation)');
    };

    const handleClear = () => setFiles([]);

    const handleCompare = (file: CompressedFile) => {
        alert(`Image comparison for ${file.name} (implement side-by-side modal)`);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <Hero />

            <UploadZone onFilesSelected={handleFilesSelected} />

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