import express, { Router } from 'express';
import multer from 'multer';
import path from 'path';

import * as controller from '../controllers/drugController';   // or use default import if you prefer

const router: Router = express.Router();

// Multer setup for images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Routes
router.get('/drugs', controller.getAllDrugs);
router.get('/drugs/:id', controller.getDrug);
router.post('/addDrugs', upload.array('drugImg'), controller.createDrug);
router.put('/drugs/:id', upload.array('drugImg'), controller.updateDrug);
router.delete('/drugs/:id', controller.deleteDrug);
router.put('/drugs/restore/:id', controller.restoreDrug);
router.get('/search', controller.searchDrugs);

export default router;