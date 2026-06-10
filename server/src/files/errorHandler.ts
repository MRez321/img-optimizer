import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof MulterError) {
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }

  // File type rejection from our fileFilter
  if (err.message.startsWith('Unsupported file type')) {
    res.status(415).json({ error: err.message });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
}
