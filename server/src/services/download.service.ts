import archiver from 'archiver';
import path from 'path';
import fs from 'fs';

import type { Response } from 'express';

import { OPTIMIZED_DIR } from './optimize.service.js';

/**
 * Streams a zip of all optimized files directly to the response.
 * No temp zip file written to disk.
 */
export function streamZip(res: Response): void {
  const files = fs.readdirSync(OPTIMIZED_DIR).filter((f) => {
    const fullPath = path.join(OPTIMIZED_DIR, f);
    return !fs.statSync(fullPath).isDirectory();
  });

  if (files.length === 0) {
    res.status(404).json({ error: 'No optimized files found to download.' });
    return;
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="optimized.zip"');

  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => {
    console.error('Archive error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to create zip.' });
    }
  });

  archive.pipe(res);

  files.forEach((file) => {
    archive.file(path.join(OPTIMIZED_DIR, file), { name: file });
  });

  archive.finalize();
}
