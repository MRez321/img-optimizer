import cron from 'node-cron';
import dbPool from '../config/db.js';
import fs from 'fs/promises';

// ── Abandoned session cleanup (runs every minute) ─────────────────────────
// Sessions where the client stopped sending heartbeats for more than 5 minutes
// and never completed are considered abandoned. Their files are deleted
// immediately to free disk space. This covers:
//   - User closed the tab mid-upload
//   - Browser crashed
//   - Network dropped and client never reconnected
//   - Page refresh that didn't resume (no re-upload)
//
// 5-minute threshold survives:
//   - Normal page refresh (~2-3s)
//   - Brief network hiccup
//   - Slow reconnect on mobile
//
// Heartbeat interval is 30s, so 5 minutes = ~10 missed heartbeats.
// Anything beyond that is genuinely abandoned.

cron.schedule('* * * * *', async () => {
    try {
        const [rows] = await dbPool.query<any[]>(
            `SELECT id, upload_path, optimized_path 
             FROM sessions 
             WHERE status = 'pending'
             AND last_active < DATE_SUB(NOW(), INTERVAL 5 MINUTE)`
        );

        if (rows.length === 0) return;

        console.log(`🧹 Cleaning up ${rows.length} abandoned session(s)...`);

        for (const row of rows) {
            // Delete files from disk first, then mark abandoned.
            // Order matters: if the file delete fails, we keep the DB row
            // so we can retry on the next cron tick.
            try {
                await Promise.all([
                    fs.rm(row.upload_path,    { recursive: true, force: true }),
                    fs.rm(row.optimized_path, { recursive: true, force: true }),
                ]);

                await dbPool.query(
                    `UPDATE sessions SET status = 'abandoned' WHERE id = ?`,
                    [row.id]
                );

                console.log(`  ✓ Abandoned session cleaned: ${row.id}`);
            } catch (err) {
                // Log per-session errors but keep going - don't let one
                // failed delete stop the rest of the cleanup pass.
                console.error(`  ✗ Failed to clean session ${row.id}:`, err);
            }
        }
    } catch (err) {
        console.error('Abandoned session cleanup error:', err);
    }
});


// ── Expired completed session cleanup (runs every hour) ───────────────────
// Sessions the user actually finished (status = 'completed') are kept for
// 3 days so they can re-download the zip. Once expires_at passes, clean up.

cron.schedule('0 * * * *', async () => {
    try {
        const [rows] = await dbPool.query<any[]>(
            `SELECT id, upload_path, optimized_path 
             FROM sessions 
             WHERE expires_at < NOW()
             AND status = 'completed'`
        );

        if (rows.length === 0) return;

        console.log(`🧹 Cleaning up ${rows.length} expired session(s)...`);

        for (const row of rows) {
            try {
                await Promise.all([
                    fs.rm(row.upload_path,    { recursive: true, force: true }),
                    fs.rm(row.optimized_path, { recursive: true, force: true }),
                ]);

                await dbPool.query(
                    `DELETE FROM sessions WHERE id = ?`,
                    [row.id]
                );

                console.log(`  ✓ Expired session cleaned: ${row.id}`);
            } catch (err) {
                console.error(`  ✗ Failed to clean session ${row.id}:`, err);
            }
        }
    } catch (err) {
        console.error('Expired session cleanup error:', err);
    }
});
