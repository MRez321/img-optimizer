import fs from 'fs';
import path from 'path';
import { DeleteResult } from '../types/image.types';
import { OPTIMIZED_DIR } from './optimize.service.js';
import { UPLOADS_DIR } from './upload.service.js';

function clearDirectory(dir: string): { deleted: number; errors: string[] } {
  let deleted = 0;
  const errors: string[] = [];

  if (!fs.existsSync(dir)) return { deleted, errors };

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      if (fs.statSync(filePath).isDirectory()) continue; // never recurse into subdirs
      fs.unlinkSync(filePath);
      deleted++;
    } catch (err) {
      errors.push(`Failed to delete ${filePath}: ${(err as Error).message}`);
    }
  }

  return { deleted, errors };
}

export function clearAll(): DeleteResult {
  const uploadsResult = clearDirectory(UPLOADS_DIR);
  const optimizedResult = clearDirectory(OPTIMIZED_DIR);

  return {
    deleted: uploadsResult.deleted + optimizedResult.deleted,
    errors: [...uploadsResult.errors, ...optimizedResult.errors],
  };
}
