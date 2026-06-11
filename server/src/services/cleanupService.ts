import cron from 'node-cron';
import dbPool from '../config/db.js';
import fs from 'fs/promises';
import path from 'path';

// Run every hour
cron.schedule('0 * * * *', async () => {
    try {
        const [rows] = await dbPool.query<any[]>('SELECT id, upload_path, optimized_path FROM sessions WHERE expires_at < NOW()');

        for (const row of rows) {
            await Promise.all([
                fs.rm(row.upload_path, { recursive: true, force: true }).catch(() => {}),
                fs.rm(row.optimized_path, { recursive: true, force: true }).catch(() => {})
            ]);
        }
    } catch (err) {
        console.error('Cleanup error:', err);
    }
});