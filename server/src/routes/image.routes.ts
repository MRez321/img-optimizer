import { Router } from 'express';

import { upload } from '../services/upload.service.js';
import { uploadController } from '../controllers/upload.controller.js';
import { optimizeController } from '../controllers/optimize.controller.js';
import { downloadController } from '../controllers/download.controller.js';
import { deleteController } from '../controllers/delete.controller.js';

const router = Router();

// POST /api/upload  — upload up to 20 images
router.post('/upload', upload.array('files', 20), uploadController.handleUpload);

// POST /api/optimize?quality=80  — optimize all uploaded images to WebP
router.post('/optimize', optimizeController.optimizeAll);

// GET  /api/download  — stream a zip of all optimized images
router.get('/download', downloadController.downloadZip);

// DELETE /api/files  — delete all uploads + optimized files
router.delete('/files', deleteController.deleteAll);

export default router;
