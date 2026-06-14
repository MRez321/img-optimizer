import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createZip } from '../utils/zipBuilder.js';
import {
    getSessionById,
    getImagesBySessionId,
    markSessionCompleted
} from '../models/sessionModel.js';


export const createZipDownload = async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    try {
        const session = await getSessionById(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const optimizedDir = session.optimized_path;
        const zipName = `${session.folder_name}.zip`;
        const zipPath = path.join(optimizedDir, zipName);
        const zipUrl = `/data/optimized/${session.folder_name}/${zipName}`;

        if (!fs.existsSync(zipPath)) {
            await createZip(optimizedDir, zipPath);
        }

        await markSessionCompleted(sessionId);

        res.json({
            zipUrl,
            folderName: session.folder_name,
            totalOriginalSize: session.total_original_size,
            totalOptimizedSize: session.total_optimized_size,
            totalSavings: session.total_original_size > 0
                ? ((session.total_original_size - session.total_optimized_size) / session.total_original_size * 100).toFixed(2)
                : '0'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create ZIP' });
    }
};


export const getSessionStatus = async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    try {
        const session = await getSessionById(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const images = await getImagesBySessionId(sessionId);

        res.json({
            session,
            images,
            isComplete: session.status === 'completed' || images.length === session.total_files
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get session status' });
    }
};