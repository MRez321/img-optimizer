// @ts-ignore
import archiver from 'archiver';

// import * as archiver from 'archiver';
import fs from 'fs';
import path from 'path';

export const createZip = async (sourceDir: string, zipPath: string): Promise<void> => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory(sourceDir, false);
    await archive.finalize();
};