import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';

import { errorHandler } from './middleware/errorHandler.js';
import optimizeRoutes from './routes/optimizeRoutes.js';


const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
app.use(express.static(path.join(process.cwd(), 'public')));
// app.use('/data', express.static(path.join(process.cwd(), 'data')));
app.use('/data', express.static(path.join(process.cwd(), 'data'), {
    setHeaders: (res) => {
        res.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    }
}));


// Routes


// API Routes
app.use('/api', optimizeRoutes);
app.use('/api/optimize', optimizeRoutes);


// Global Error Handler
app.use(errorHandler);


export default app;


