import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { startSession, processUploadedFile } from '../controllers/optimizeController.js';
import { createZipDownload, getSessionStatus } from '../controllers/downloadController.js';
const router = Router();
router.post('/start', startSession);
router.post('/upload', upload.single('image'), processUploadedFile);
router.get('/status/:sessionId', getSessionStatus);
router.get('/zip/:sessionId', createZipDownload);
export default router;
//# sourceMappingURL=optimizeRoutes.js.map