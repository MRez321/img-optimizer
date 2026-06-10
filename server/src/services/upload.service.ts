import multer from 'multer';
import path from 'path';
import fs from 'fs';

import type { StorageEngine, FileFilterCallback } from 'multer';
import type { Request } from 'express';

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const MAX_FILE_SIZE_MB = 20;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff'];

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    // Sanitize: lowercase + replace spaces with dashes
    const sanitized = file.originalname.toLowerCase().replace(/\s+/g, '-');
    cb(null, sanitized);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 20,
  },
});

export { UPLOADS_DIR };
