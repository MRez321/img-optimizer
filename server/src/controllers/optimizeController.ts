import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { ensureDir } from '../utils/fileUtils.js';
import { processImage } from '../utils/imageProcessor.js';
import type { ProcessOptions } from '../types/types.js';
import {
    createSession,
    getSessionById,
    insertImage,
    updateSessionStats
} from '../models/optimizeModel.js';


export const startSession = async (req: Request, res: Response) => {
    const sessionId = uuidv4();
    const timestamp = new Date().toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, '')
        .replace('T', ' ');

    const folderName = `${sessionId} - ${timestamp}`;
    const uploadPath = path.join(process.cwd(), 'data/uploads', folderName);
    const optimizedPath = path.join(process.cwd(), 'data/optimized', folderName);

    await Promise.all([ensureDir(uploadPath), ensureDir(optimizedPath)]);

    const options: ProcessOptions = {
        compress: true,
        quality: Number(req.body.quality) || 80,
        format: (req.body.format as any) || 'webp',
        stripMetadata: req.body.stripMetadata !== false,
        progressive: req.body.progressive !== false,
        lossless: req.body.lossless === true,
        resize: req.body.resize || undefined
    };

    await createSession(sessionId, folderName, uploadPath, optimizedPath, options);

    res.json({ sessionId, folderName });
};


export const processUploadedFile = async (req: any, res: Response) => {
    const { sessionId } = req.body;
    const file = req.file;

    if (!file || !sessionId) {
        return res.status(400).json({ error: 'Missing file or sessionId' });
    }

    try {
        const session = await getSessionById(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const options = (session.options ?? {}) as ProcessOptions;

        // Write buffer to disk (multer now uses memoryStorage)
        const uploadExt = path.extname(file.originalname).toLowerCase();
        const uploadFilename = `${uuidv4()}${uploadExt}`;
        const uploadFilePath = path.join(session.upload_path, uploadFilename);
        await fs.mkdir(session.upload_path, { recursive: true });
        await fs.writeFile(uploadFilePath, file.buffer);

        // Process the saved file
        const optimizedExt = `.${options.format ?? 'webp'}`;
        const optimizedName = `${uuidv4()}${optimizedExt}`;
        const optimizedFullPath = path.join(session.optimized_path, optimizedName);
        await fs.mkdir(session.optimized_path, { recursive: true });

        const result = await processImage(uploadFilePath, optimizedFullPath, options);

        const originalSize = file.size;
        const savings = originalSize > 0
            ? ((originalSize - result.size) / originalSize) * 100
            : 0;

        const originalFormat = uploadExt.replace('.', '');

        await insertImage(
            sessionId,
            file.originalname,
            originalSize,
            optimizedName,
            result.size,
            originalFormat,
            options.format ?? 'webp',
            savings,
            result.width,
            result.height
        );

        await updateSessionStats(sessionId, originalSize, result.size);

        res.json({
            success: true,
            image: {
                originalName: file.originalname,
                optimizedName,
                originalSize,
                optimizedSize: result.size,
                savings: Number(savings.toFixed(2)),
                downloadUrl: `/data/optimized/${session.folder_name}/${optimizedName}`
            }
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Processing failed' });
    }
};