import sharp from 'sharp';
import path from 'path';
import fs from "fs";
import type { ProcessOptions } from '../types/types.js';

export const processImage = async (
    inputPath: string,
    outputPath: string,
    options: ProcessOptions
): Promise<{ size: number; width: number; height: number }> => {
    let pipeline = sharp(inputPath);

    if (options.stripMetadata) {
        // pipeline = pipeline.withMetadata(false);
        pipeline = pipeline.withMetadata({});  // Empty object removes most metadata
    }

    if (options.resize) {
        pipeline = pipeline.resize(options.resize.width, options.resize.height, {
            fit: options.resize.fit || 'inside',
            withoutEnlargement: true
        });
    }

    // Normalize format string
    let format: string = options.format ? options.format.toLowerCase() : 'webp';

    // Convert 'jpg' to 'jpeg'
    if (format === 'jpg') {
        format = 'jpeg';
    }

    // Apply format-specific options
    switch (format) {
        case 'jpeg':
            pipeline = pipeline.jpeg({ quality: options.quality, progressive: options.progressive });
            break;
        case 'png':
            pipeline = pipeline.png({ quality: options.quality, compressionLevel: options.lossless ? 9 : 6 });
            break;
        case 'webp':
            pipeline = pipeline.webp({ quality: options.quality, lossless: options.lossless });
            break;
        case 'tiff':
            pipeline = pipeline.tiff({ quality: options.quality });
            break;
        case 'gif':
            pipeline = pipeline.gif();
            break;
        default:
            throw new Error(`Unsupported format: ${format}`);
    }

    await pipeline.toFile(outputPath);
    const info = await sharp(outputPath).metadata();

    const stats = await fs.promises.stat(outputPath);
    return {
        size: stats.size,
        width: info.width || 0,
        height: info.height || 0
    };
};
