import fs from 'fs/promises';
import path from 'path';

export const ensureDir = async (dir: string) => {
    await fs.mkdir(dir, { recursive: true });
};

export const getPublicUrl = (filename: string, type: 'upload' | 'optimized') => {
    return `/data/${type}/${filename}`;
};