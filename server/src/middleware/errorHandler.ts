import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export interface AppError extends Error {
    statusCode?: number;
    status?: number;
}

// Global Error Handler Middleware
export const errorHandler = (
    err: AppError | multer.MulterError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("Global Error Handler:", err.stack);

    // Handle Multer errors specifically
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            message: `File upload error: ${err.message}`,
        });
    }

    // Handle custom or standard errors
    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        message: err.message || 'Something went wrong on the server!',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};