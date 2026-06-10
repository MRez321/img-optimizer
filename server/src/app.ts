import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';

import drugRoutes from './routes/drugRoutes.js';
import deleteRoute from './routes/delete.js';
import downloadZipRoute from './routes/downloadZip.js';

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Multer setup (if you want to keep it here)
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        cb(null, 'src/uploads/');
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// Routes
app.post('/upload', upload.array('files', 20), (req: Request, res: Response) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    res.send('Files uploaded successfully');
});

app.use('/', deleteRoute);
app.use('/', downloadZipRoute);

app.get('/optimize', (req: Request, res: Response) => {
    // optimizeImages();  // You can import and call if needed
    res.send('Optimization process completed');
});

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.get('/kalagh', (req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'views', 'kalagh.html'));
});

// API Routes
app.use('/api', drugRoutes);

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: 'Not Found' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Global Error Handler:", err.stack);

    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            message: `File upload error: ${err.message}`
        });
    }

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        message: err.message || 'Something went wrong on the server!',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

export default app;