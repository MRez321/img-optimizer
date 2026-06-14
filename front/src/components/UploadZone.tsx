import React, { useRef, useState } from 'react';

interface UploadZoneProps {
    onFilesSelected: (files: File[]) => void;
}

export default function UploadZone({ onFilesSelected }: UploadZoneProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        );
        onFilesSelected(droppedFiles);
    };

    const handleClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) onFilesSelected(Array.from(e.target.files));
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <div
                onClick={handleClick}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer
          ${isDragging
                    ? 'border-cyan-400 bg-cyan-950/30'
                    : 'border-gray-700 hover:border-gray-500 bg-gray-900'
                }`}
            >
                <div className="mx-auto w-16 h-16 mb-6 text-cyan-400">
                    <svg viewBox="64 64 896 896" fill="currentColor">
                        <path d="M328 544h152v152c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V544h152c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H544V328c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v152H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8z" />
                        <path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z" />
                    </svg>
                </div>

                <p className="text-2xl font-medium mb-2">Drop your images here</p>
                <p className="text-gray-400 mb-6">or</p>

                <span className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-8 py-3 rounded-xl transition">
          Browse Files
        </span>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg, image/png, image/webp, image/tiff, image/gif, image/svg+xml"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}