import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';


import { errorHandler } from './middleware/errorHandler.js';
import optimizeRoutes from './routes/optimizeRoutes.js';


const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/data', express.static(path.join(process.cwd(), 'data')));

// // Multer setup (if you want to keep it here)
// const storage = multer.diskStorage({
//     destination: (req: Request, file: Express.Multer.File, cb) => {
//         cb(null, 'src/uploads/');
//     },
//     filename: (req: Request, file: Express.Multer.File, cb) => {
//         cb(null, file.originalname);
//     }
// });
//
// const upload = multer({ storage });

// Routes
// app.post('/upload', upload.array('files', 20), (req: Request, res: Response) => {
//     if (!req.files || req.files.length === 0) {
//         return res.status(400).send('No files were uploaded.');
//     }
//     res.send('Files uploaded successfully');
// });

// app.use('/', deleteRoute);
// app.use('/', downloadZipRoute);

// app.get('/optimize', (req: Request, res: Response) => {
//     // optimizeImages();  // You can import and call if needed
//     res.send('Optimization process completed');
// });


// API Routes
app.use('/api', optimizeRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;