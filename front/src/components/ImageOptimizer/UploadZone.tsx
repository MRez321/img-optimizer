import {useRef, useState, useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import axios from 'axios';
import './UploadZone.css';

// import { type LucideProps } from 'lucide-react';
import { Download, ImageDown, BrushCleaning, FileArchive, Expand, ImagePlus, Maximize2, X, ArrowDownToLine, SquarePlus } from 'lucide-react';

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

export default function UploadZone({onComplete, options = {}}: UploadZoneProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

    const processFiles = useCallback(async (files: File[]) => {
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        setIsUploading(true);
        setProgress({current: 0, total: imageFiles.length});

        try {
            // Start optimization session
            console.log('🚀 Starting optimization session with options:', {
                quality: 80,
                stripMetadata: true,
                progressive: true,
                lossless: false,
                ...options,
            });

            const sessionRes = await axios.post(`${API_BASE}/api/optimize/start`, {
                quality: 80,
                stripMetadata: true,
                progressive: true,
                lossless: false,
                ...options,
            });

            console.log('✅ Session started:', sessionRes.data);
            const {sessionId} = sessionRes.data;

            const images: OptimizedImage[] = [];
            const errors: { name: string; error: string }[] = [];

            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                setProgress({current: i + 1, total: imageFiles.length});

                try {
                    const formData = new FormData();
                    formData.append('sessionId', sessionId);
                    formData.append('image', file);

                    console.log(`📤 Uploading image ${i + 1}/${imageFiles.length}: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

                    const uploadRes = await axios.post(`${API_BASE}/api/optimize/upload`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    console.log(`✅ Received from backend for ${file.name}:`, uploadRes.data);

                    const data = uploadRes.data;

                    if (!data.success) {
                        errors.push({name: file.name, error: data.message ?? 'Upload failed'});
                    } else {
                        images.push(data.image);
                    }
                } catch (err: any) {
                    console.error(`❌ Error uploading ${file.name}:`, err.response?.data || err.message);
                    errors.push({name: file.name, error: err.response?.data?.message ?? 'Network error'});
                }
            }

            const result: UploadResult = {sessionId, images, errors};
            console.log('🎉 Upload process completed:', result);

            onComplete(result);
        } catch (err: any) {
            console.error('❌ Upload session error:', err.response?.data || err.message);
        } finally {
            setIsUploading(false);
            setProgress(null);
        }
    }, [onComplete, options]);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            processFiles(acceptedFiles);
        },
        [processFiles]
    );

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.tiff', '.gif', '.svg'],
        },
        multiple: true,
        disabled: isUploading,
        noClick: isUploading,
    });

    return (
        <div className="upload-zone-container">



            <div
                {...getRootProps()}
                className={`upload-zone ${isUploading ? 'uploading' : ''} ${isDragActive ? 'dragging' : ''}`}
            >
                <div className="upload-icon">
                    {/*<ImagePlus />*/}
                    {/*<ArrowDownToLine />*/}
                    {/*<SquarePlus />*/}

                    {/*<Download />*/}
                    {/*<ImageDown />*/}
                    {/*<BrushCleaning />*/}
                    {/*<FileArchive />*/}
                    {/*<Expand />*/}
                    {/*<ImagePlus />*/}
                    {/*<Maximize2 />*/}
                    {/*<X color={'crimson'}/>*/}

                    <SquarePlus />

                </div>

                {isUploading && progress ? (
                    <div className="upload-progress">
                        <p className="upload-text">
                            Optimizing {progress.current} / {progress.total}
                        </p>
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar"
                                style={{width: `${(progress.current / progress.total) * 100}%`}}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="upload-title">
                            {isDragActive ? 'Drop the images here' : 'Drop your images here'}
                        </p>
                        <p className="upload-subtitle">or</p>
                        <button
                            type="button"
                            className="browse-button"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Browse Files
                        </button>
                    </>
                )}

                <input {...getInputProps()} className="file-input"/>
            </div>
        </div>
    );
}