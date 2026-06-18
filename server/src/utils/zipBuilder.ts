import { zip, type Zippable } from 'fflate';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const fsWriteFile = promisify(fs.writeFile);
const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);


const readDirectoryRecursive = async (
    dirPath: string,
    zipObject: Zippable = {},
    rootDir: string = dirPath
): Promise<Zippable> => {
    const files = await fsReaddir(dirPath);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const fileStat = await fsStat(filePath);

        const relativePath = path.relative(rootDir, filePath);

        if (fileStat.isDirectory()) {
            zipObject[relativePath + '/'] = new Uint8Array();
            await readDirectoryRecursive(filePath, zipObject, rootDir);
        } else {
            const fileContent = await fs.promises.readFile(filePath);
            zipObject[relativePath] = new Uint8Array(fileContent);
        }
    }
    return zipObject;
};

// fflate's zip() is callback-based (data, opts, cb), not promise-based.
// This wraps it properly instead of awaiting it directly (which throws
// "no callback" / error code 7, since the callback is never passed).
const zipAsync = (data: Zippable): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
        zip(data, {}, (err, zipped) => {
            if (err) {
                reject(err);
            } else {
                resolve(zipped);
            }
        });
    });
};

export const createZip = async (sourceDir: string, zipPath: string): Promise<void> => {
    try {
        const zipData: Zippable = await readDirectoryRecursive(sourceDir, {}, sourceDir);

        const zippedContent = await zipAsync(zipData);

        await fsWriteFile(zipPath, zippedContent);
        console.log(`Successfully created zip file at: ${zipPath}`);
    } catch (error) {
        console.error('Error creating zip file:', error);
        throw error;
    }
};