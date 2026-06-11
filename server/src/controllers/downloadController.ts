import type { Request, Response } from 'express';
import dbPool from '../config/db.js';
import { createZip } from '../utils/zipBuilder.js';
import path from 'path';
import fs from 'fs';

export const createZipDownload = async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    try {
        const [sessionRows] = await dbPool.query<any[]>('SELECT * FROM sessions WHERE id = ?', [sessionId]);
        const session = sessionRows[0];

        if (!session) return res.status(404).json({ error: 'Session not found' });

        const optimizedDir = session.optimized_path;
        const zipName = `${session.folder_name}.zip`;
        const zipPath = path.join(optimizedDir, zipName);
        const zipUrl = `/data/optimized/${session.folder_name}/${zipName}`;

        // Check if zip already exists
        if (!fs.existsSync(zipPath)) {
            await createZip(optimizedDir, zipPath);
        }

        // Update session status
        await dbPool.query(
            'UPDATE sessions SET status = "completed", expires_at = DATE_ADD(NOW(), INTERVAL 3 DAY) WHERE id = ?',
            [sessionId]
        );

        res.json({
            zipUrl,
            folderName: session.folder_name,
            totalOriginalSize: session.total_original_size,
            totalOptimizedSize: session.total_optimized_size,
            totalSavings: session.total_original_size > 0
                ? ((session.total_original_size - session.total_optimized_size) / session.total_original_size * 100).toFixed(2)
                : 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create ZIP' });
    }
};

export const getSessionStatus = async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const [rows] = await dbPool.query<any[]>('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    const session = rows[0];

    if (!session) return res.status(404).json({ error: 'Session not found' });

    const [images] = await dbPool.query<any[]>('SELECT * FROM images WHERE session_id = ?', [sessionId]);

    res.json({
        session,
        images,
        isComplete: session.status === 'completed' || images.length === session.total_files
    });
};