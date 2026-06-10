export interface OptimizeResult {
  originalName: string;
  optimizedName: string;
  originalSize: number;
  optimizedSize: number;
  savedBytes: number;
  savedPercent: number;
}

export interface DeleteResult {
  deleted: number;
  errors: string[];
}
