import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import { errorHandler } from './middleware/errorHandler.js';
import optimizeRoutes from './routes/optimizeRoutes.js';
import authRoutes from './routes/authRoutes.js';


const app = express();

// NOTE: cors credentials must be true so the browser sends/receives
// the httpOnly auth cookies. With credentials: true, origin can't be '*' -
// set CORS_ORIGIN to your frontend's actual URL (e.g. http://localhost:5173).
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/data', express.static(path.join(process.cwd(), 'data'), {
    setHeaders: (res) => {
        res.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    }
}));


// Routes


// API Routes
app.use('/api', optimizeRoutes);
app.use('/api/optimize', optimizeRoutes);
app.use('/api/auth', authRoutes);


// Global Error Handler
app.use(errorHandler);


export default app;
