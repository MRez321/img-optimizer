import multer from 'multer';
import path from 'path';

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/gif', 'image/svg+xml'];
    const extOk = /jpeg|jpg|png|webp|tiff|gif|svg/i.test(path.extname(file.originalname));

    if (allowedMimes.includes(file.mimetype) && extOk) cb(null, true);
    else cb(new Error(`Invalid file type: ${file.mimetype}`));
};

export const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024, files: 20 }
});