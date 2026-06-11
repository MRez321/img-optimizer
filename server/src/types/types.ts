export interface ProcessOptions {
  compress: boolean;
  quality: number;           // 1-100
  format: 'jpeg' | 'png' | 'webp' | 'tiff' | 'gif';
  resize?: { width?: number; height?: number; fit?: 'cover' | 'contain' | 'fill' };
  stripMetadata: boolean;
  progressive: boolean;
  lossless: boolean;
}

export interface ImageResult {
  id: string;
  originalName: string;
  originalSize: number;
  optimizedName: string;
  optimizedSize: number;
  format: string;
  savings: number;
  url: string;
  downloadUrl: string;
}

export interface SessionResponse {
  sessionId: string;
  folderName: string;
  images: ImageResult[];
  totalSavings: number;
  zipUrl: string;
  status: string;
}