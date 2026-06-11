import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import dbPool from '../config/db.js';
import { ensureDir } from '../utils/fileUtils.js';
import { processImage } from '../utils/imageProcessor.js';
import type { ProcessOptions } from '../types/types.js';

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

    await dbPool.query(
        `INSERT INTO sessions (id, folder_name, upload_path, optimized_path, options, expires_at)
     VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 3 DAY))`,
        [sessionId, folderName, uploadPath, optimizedPath, JSON.stringify(options)]
    );

    res.json({ sessionId, folderName });
};

export const processUploadedFile = async (req: any, res: Response) => {
    const { sessionId } = req.body;
    const file = req.file;

    if (!file || !sessionId) return res.status(400).json({ error: 'Missing file or sessionId' });

    try {
        const [sessionRows] = await dbPool.query<any[]>('SELECT * FROM sessions WHERE id = ?', [sessionId]);
        const session = sessionRows[0];
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const optimizedDir = session.optimized_path;
        const optimizedExt = `.${session.options ? JSON.parse(session.options).format : 'webp'}`;
        const optimizedName = `${uuidv4()}${optimizedExt}`;
        const optimizedFullPath = path.join(optimizedDir, optimizedName);

        const options = JSON.parse(session.options || '{}') as ProcessOptions;
        const result = await processImage(file.path, optimizedFullPath, options);

        const savings = file.size > 0 ? ((file.size - result.size) / file.size) * 100 : 0;

        await dbPool.query(
            `INSERT INTO images (id, session_id, original_name, original_size, optimized_name, optimized_size,
                                 format, optimized_format, savings_percentage, width, height)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), sessionId, file.originalname, file.size, optimizedName, result.size,
                path.extname(file.originalname).slice(1), options.format, savings, result.width, result.height]
        );

        await dbPool.query(
            `UPDATE sessions
             SET total_files = total_files + 1,
                 total_original_size = total_original_size + ?,
                 total_optimized_size = total_optimized_size + ?,
                 last_active = NOW()
             WHERE id = ?`,
            [file.size, result.size, sessionId]
        );

        res.json({
            success: true,
            image: {
                originalName: file.originalname,
                optimizedName,
                originalSize: file.size,
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