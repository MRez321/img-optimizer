import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { OptimizeResult } from '../types/image.types.js';

const OPTIMIZED_DIR = path.join(__dirname, '../../optimized');

if (!fs.existsSync(OPTIMIZED_DIR)) {
  fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
}

export async function optimizeImage(
  filePath: string,
  quality = 80
): Promise<OptimizeResult> {
  const originalName = path.basename(filePath);
  const baseName = path.parse(originalName).name.toLowerCase().replace(/\s+/g, '-');
  const optimizedName = `${baseName}.webp`;
  const outputPath = path.join(OPTIMIZED_DIR, optimizedName);

  const originalSize = fs.statSync(filePath).size;

  const info = await sharp(filePath)
    .webp({ quality })
    .toFile(outputPath);

  const optimizedSize = info.size;
  const savedBytes = originalSize - optimizedSize;
  const savedPercent = Math.round((savedBytes / originalSize) * 100);

  return {
    originalName,
    optimizedName,
    originalSize,
    optimizedSize,
    savedBytes,
    savedPercent,
  };
}

export async function optimizeAll(quality = 80): Promise<OptimizeResult[]> {
  const uploadsDir = path.join(__dirname, '../../uploads');
  const files = fs.readdirSync(uploadsDir);

  const results = await Promise.allSettled(
    files
      .filter((f) => !fs.statSync(path.join(uploadsDir, f)).isDirectory())
      .map((f) => optimizeImage(path.join(uploadsDir, f), quality))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<OptimizeResult> => r.status === 'fulfilled')
    .map((r) => r.value);
}

export { OPTIMIZED_DIR };
