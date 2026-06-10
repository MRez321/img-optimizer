import express, { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';

// Import controller (adjust based on how you export from drugController)
import * as drugController from '../controllers/drugController.js';

const router: Router = express.Router();




// ==================== Multer Configuration ====================
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, 'uploads/');
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Optional: 5MB limit
});

// ==================== Routes ====================

router.get('/drugs', drugController.getAllDrugs);
router.get('/drugs/:id', drugController.getDrug);

router.post('/addDrugs', upload.array('drugImg'), drugController.createDrug);
router.put('/drugs/:id', upload.array('drugImg'), drugController.updateDrug);

router.delete('/drugs/:id', drugController.deleteDrug);
router.put('/drugs/restore/:id', drugController.restoreDrug);
router.get('/search', drugController.searchDrugs);

export default router;