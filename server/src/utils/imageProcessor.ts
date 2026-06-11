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
        pipeline = pipeline.withMetadata(false);
    }

    if (options.resize) {
        pipeline = pipeline.resize(options.resize.width, options.resize.height, {
            fit: options.resize.fit || 'inside',
            withoutEnlargement: true
        });
    }

    const format = options.format || 'webp';

    if (format === 'jpeg' || format === 'jpg') {
        pipeline = pipeline.jpeg({ quality: options.quality, progressive: options.progressive });
    } else if (format === 'png') {
        pipeline = pipeline.png({ quality: options.quality, compressionLevel: options.lossless ? 9 : 6 });
    } else if (format === 'webp') {
        pipeline = pipeline.webp({ quality: options.quality, lossless: options.lossless });
    } else if (format === 'tiff') {
        pipeline = pipeline.tiff({ quality: options.quality });
    } else if (format === 'gif') {
        pipeline = pipeline.gif();
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