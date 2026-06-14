import React, { useRef, useState } from 'react';

const API_BASE = 'http://localhost:3200';

export interface OptimizedImage {
    originalName: string;
    optimizedName: string;
    originalSize: number;
    optimizedSize: number;
    savings: number;
    downloadUrl: string;
}

export interface UploadResult {
    sessionId: string;
    images: OptimizedImage[];
    errors: { name: string; error: string }[];
}

interface UploadZoneProps {
    onComplete: (result: UploadResult) => void;
    options?: {
        quality?: number;
        format?: string;
        stripMetadata?: boolean;
        progressive?: boolean;
        lossless?: boolean;
        resize?: { width?: number; height?: number; fit?: string };
    };
}

export default function UploadZone({ onComplete, options = {} }: UploadZoneProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

    const processFiles = async (files: File[]) => {
        if (files.length === 0) return;

        setIsUploading(true);
        setProgress({ current: 0, total: files.length });

        try {
            // Step 1: Start session
            const sessionRes = await fetch(`${API_BASE}/api/optimize/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quality: 80,
                    stripMetadata: true,
                    progressive: true,
                    lossless: false,
                    ...options,
                }),
            });

            if (!sessionRes.ok) throw new Error('Failed to start session');
            const { sessionId } = await sessionRes.json();

            // Step 2: Upload files one by one
            const images: OptimizedImage[] = [];
            const errors: { name: string; error: string }[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setProgress({ current: i + 1, total: files.length });

                try {
                    const form = new FormData();
                    form.append('sessionId', sessionId);
                    form.append('image', file);

                    const uploadRes = await fetch(`${API_BASE}/api/optimize/upload`, {
                        method: 'POST',
                        body: form,
                    });

                    const data = await uploadRes.json();

                    if (!uploadRes.ok || !data.success) {
                        errors.push({ name: file.name, error: data.message ?? 'Upload failed' });
                    } else {
                        images.push(data.image);
                        console.log(data)
                    }
                } catch (err) {
                    errors.push({ name: file.name, error: 'Network error' });
                }
            }

            onComplete({ sessionId, images, errors });
        } catch (err) {
            console.error('Session error:', err);
        } finally {
            setIsUploading(false);
            setProgress(null);
            // Reset input so the same files can be re-selected
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        processFiles(files);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(Array.from(e.target.files));
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); if (!isUploading) setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all
          ${isUploading
                    ? 'border-cyan-500 bg-cyan-950/30 cursor-wait'
                    : isDragging
                        ? 'border-cyan-400 bg-cyan-950/30 cursor-copy'
                        : 'border-gray-700 hover:border-gray-500 bg-gray-900 cursor-pointer'
                }`}
            >
                <div className={`mx-auto w-16 h-16 mb-6 ${isUploading ? 'text-cyan-300 animate-pulse' : 'text-cyan-400'}`}>
                    <svg viewBox="64 64 896 896" fill="currentColor">
                        <path d="M328 544h152v152c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V544h152c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H544V328c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v152H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8z" />
                        <path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z" />
                    </svg>
                </div>

                {isUploading && progress ? (
                    <>
                        <p className="text-2xl font-medium mb-2">
                            Optimizing {progress.current} / {progress.total}...
                        </p>
                        <div className="w-full max-w-xs mx-auto mt-4 bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-2xl font-medium mb-2">Drop your images here</p>
                        <p className="text-gray-400 mb-6">or</p>
                        <span className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-8 py-3 rounded-xl transition">
                            Browse Files
                        </span>
                    </>
                )}

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