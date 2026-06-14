export interface CompressedFile {
    id: string;
    name: string;
    originalSize: number;
    compressedSize?: number;
    status: 'pending' | 'compressing' | 'completed' | 'error';
    compressionRatio?: number;
    originalPreview?: string;
    compressedPreview?: string;
    compressedUrl?: string;
}