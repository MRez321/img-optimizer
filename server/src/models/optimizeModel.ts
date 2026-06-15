import { v4 as uuidv4 } from 'uuid';
import dbPool from '../config/db.js';
import type { ProcessOptions } from '../types/types.js';

export const createSession = async (
    sessionId: string,
    folderName: string,
    uploadPath: string,
    optimizedPath: string,
    options: ProcessOptions,
    expectedFiles: number = 0
) => {
    await dbPool.query(
        `INSERT INTO sessions (id, folder_name, upload_path, optimized_path, options, expected_files, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 3 DAY))`,
        [sessionId, folderName, uploadPath, optimizedPath, JSON.stringify(options), expectedFiles]
    );
};

export const getSessionById = async (sessionId: string) => {
    const [rows] = await dbPool.query<any[]>(
        'SELECT * FROM sessions WHERE id = ?',
        [sessionId]
    );
    return rows[0] ?? null;
};

export const insertImage = async (
    sessionId: string,
    originalName: string,
    originalSize: number,
    optimizedName: string,
    optimizedSize: number,
    originalFormat: string,
    optimizedFormat: string,
    savings: number,
    width: number,
    height: number
) => {
    await dbPool.query(
        `INSERT INTO images (id, session_id, original_name, original_size, optimized_name, optimized_size,
                             format, optimized_format, savings_percentage, width, height)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), sessionId, originalName, originalSize, optimizedName, optimizedSize,
            originalFormat, optimizedFormat, savings, width, height]
    );
};

export const updateSessionStats = async (
    sessionId: string,
    originalSize: number,
    optimizedSize: number
) => {
    await dbPool.query(
        `UPDATE sessions
         SET total_files          = total_files + 1,
             total_original_size  = total_original_size + ?,
             total_optimized_size = total_optimized_size + ?,
             last_active          = NOW()
         WHERE id = ?`,
        [originalSize, optimizedSize, sessionId]
    );
};

// Returns the updated session row after incrementing total_files,
// so the controller can check completed vs expected in one round trip.
export const incrementAndGetSession = async (
    sessionId: string,
    originalSize: number,
    optimizedSize: number
) => {
    await updateSessionStats(sessionId, originalSize, optimizedSize);
    return getSessionById(sessionId);
};
