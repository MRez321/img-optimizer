import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import UploadZone from './components/UploadZone';
import FileTable from './components/FileTable';
import ResultsBar from './components/ResultsBar';
import type { CompressedFile } from './types';

const App: React.FC = () => {
    const [files, setFiles] = useState<CompressedFile[]>([]);

    const handleFilesSelected = (newFiles: File[]) => {
        const processedFiles: CompressedFile[] = newFiles.map((file) => ({
            id: crypto.randomUUID(),
            name: file.name,
            originalSize: file.size,
            status: 'pending',
        }));

        setFiles((prev) => [...prev, ...processedFiles]);

        // Simulate compression (replace with real backend call)
        processedFiles.forEach((file) => {
            setTimeout(() => {
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === file.id
                            ? {
                                ...f,
                                status: 'completed',
                                compressedSize: Math.floor(f.originalSize * 0.6),
                                compressionRatio: 40,
                                compressedUrl: URL.createObjectURL(new Blob()), // simulate
                            }
                            : f
                    )
                );
            }, 1500);
        });
    };

    const handleDownload = (file: CompressedFile) => {
        if (file.compressedUrl) {
            const link = document.createElement('a');
            link.href = file.compressedUrl;
            link.download = `compressed-${file.name}`;
            link.click();
        }
    };

    const handleDownloadAll = () => {
        alert('Downloading all files as ZIP... (implement real ZIP logic)');
    };

    const handleClear = () => setFiles([]);

    return (
        <>
            <Navbar />
        <Hero />

        <section>
            <UploadZone onFilesSelected={handleFilesSelected} />
    </section>

    {files.length > 0 && (
        <section className="filelist-wrapper">
        <FileTable
            files={files}
        onDownload={handleDownload}
        onCompare={(file) => alert(`Compare ${file.name}`)}
        />
        <ResultsBar
        files={files}
        onClear={handleClear}
        onDownloadAll={handleDownloadAll}
        />
        </section>
    )}
    </>
);
};

export default App;