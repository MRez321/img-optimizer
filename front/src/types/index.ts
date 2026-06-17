export interface ProcessOptions {
  quality: number;
  format: 'jpeg' | 'png' | 'webp' | 'tiff' | 'gif';
  stripMetadata: boolean;
  progressive: boolean;
  lossless: boolean;
  resize?: { width?: number; height?: number };
}

export interface ImageResult {
  originalName: string;
  optimizedName: string;
  originalSize: number;
  optimizedSize: number;
  savings: number;
  width: number;
  height: number;
  downloadUrl: string;
}

export interface FileProgressEvent {
  image: ImageResult;
  progress: { completed: number; expected: number };
}

export interface FileErrorEvent {
  stage: 'processing' | 'zip';
  originalName?: string;
  message: string;
}

export interface ZipReadyEvent {
  zipUrl: string;
  folderName: string;
  totalOriginalSize: number;
  totalOptimizedSize: number;
  totalSavings: number;
}

export type FileStatus = 'queued' | 'uploading' | 'processing' | 'done' | 'error';

export interface QueuedFile {
  id: string;
  file: File;
  status: FileStatus;
  result?: ImageResult;
  errorMessage?: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  role: 'user' | 'admin';
  createdAt: string;
}
