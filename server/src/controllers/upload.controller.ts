import { Request, Response } from 'express';

export const uploadController = {
  handleUpload(req: Request, res: Response): void {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded.' });
      return;
    }

    res.status(200).json({
      message: `${files.length} file(s) uploaded successfully.`,
      files: files.map((f) => ({
        originalName: f.originalname,
        savedAs: f.filename,
        size: f.size,
        mimetype: f.mimetype,
      })),
    });
  },
};
