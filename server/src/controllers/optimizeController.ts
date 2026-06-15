import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { ensureDir } from '../utils/fileUtils.js';
import { processImage } from '../utils/imageProcessor.js';
import { createZip } from '../utils/zipBuilder.js';
import { emitToSession } from '../services/socketService.js';
import type { ProcessOptions } from '../types/types.js';
import {
    createSession,
    getSessionById,
    insertImage,
    incrementAndGetSession
} from '../models/optimizeModel.js';
import { markSessionCompleted } from '../models/sessionModel.js';


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

    // Client tells us how many files it intends to upload in this batch.
    // Used to know when the batch is "done" for auto-zip + progress events.
    const expectedFiles = Number(req.body.totalFiles) || 0;

    await createSession(sessionId, folderName, uploadPath, optimizedPath, options, expectedFiles);

    res.json({ sessionId, folderName, expectedFiles });
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

        // Increment total_files and grab the fresh session row in one go
        const updatedSession = await incrementAndGetSession(sessionId, originalSize, result.size);

        const imageResult = {
            originalName: file.originalname,
            optimizedName,
            originalSize,
            optimizedSize: result.size,
            savings: Number(savings.toFixed(2)),
            width: result.width,
            height: result.height,
            downloadUrl: `/data/optimized/${session.folder_name}/${optimizedName}`
        };

        const completedFiles = updatedSession?.total_files ?? 0;
        const expectedFiles = updatedSession?.expected_files ?? 0;

        // Emit per-file result + progress to everyone in this session room
        emitToSession(sessionId, 'file-processed', {
            image: imageResult,
            progress: {
                completed: completedFiles,
                expected: expectedFiles
            }
        });

        // If we know the expected total and we've hit it, auto-build the ZIP
        if (expectedFiles > 0 && completedFiles >= expectedFiles) {
            try {
                const optimizedDir = updatedSession.optimized_path;
                const zipName = `${updatedSession.folder_name}.zip`;
                const zipPath = path.join(optimizedDir, zipName);
                const zipUrl = `/data/optimized/${updatedSession.folder_name}/${zipName}`;

                await createZip(optimizedDir, zipPath);
                await markSessionCompleted(sessionId);

                const totalOriginal = updatedSession.total_original_size;
                const totalOptimized = updatedSession.total_optimized_size;

                emitToSession(sessionId, 'zip-ready', {
                    zipUrl,
                    folderName: updatedSession.folder_name,
                    totalOriginalSize: totalOriginal,
                    totalOptimizedSize: totalOptimized,
                    totalSavings: totalOriginal > 0
                        ? Number(((totalOriginal - totalOptimized) / totalOriginal * 100).toFixed(2))
                        : 0
                });
            } catch (zipErr: any) {
                console.error('Auto-zip failed:', zipErr);
                emitToSession(sessionId, 'file-error', {
                    stage: 'zip',
                    message: zipErr.message || 'Failed to create ZIP'
                });
            }
        }

        res.json({
            success: true,
            image: imageResult
        });
    } catch (err: any) {
        console.error(err);

        // Notify the session room about this specific failure
        emitToSession(sessionId, 'file-error', {
            stage: 'processing',
            originalName: file?.originalname,
            message: err.message || 'Processing failed'
        });

        res.status(500).json({ error: err.message || 'Processing failed' });
    }
};
