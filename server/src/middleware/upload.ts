import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

const storage = multer.diskStorage({
    destination: async (req: any, file: Express.Multer.File, cb) => {
        const { sessionId } = req.body;
        if (!sessionId) return cb(new Error('Session ID required'), '');

        const [rows] = await (await import('../config/db.js')).default.query<any[]>(
            'SELECT upload_path FROM sessions WHERE id = ?', [sessionId]
        );

        if (!rows[0]) return cb(new Error('Session not found'), '');

        const uploadPath = rows[0].upload_path;
        await fs.mkdir(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueId}${ext}`);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = /jpeg|jpg|png|webp|tiff|gif|svg/i;
    const mimeOk = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/gif', 'image/svg+xml'].includes(file.mimetype);
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());

    if (mimeOk && extOk) cb(null, true);
    else cb(new Error(`Invalid file type: ${file.mimetype}`));
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024, files: 20 }
});