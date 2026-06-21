import dbPool from '../config/db.js';
export const getSessionById = async (sessionId) => {
    const [rows] = await dbPool.query('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    return rows[0] ?? null;
};
export const getImagesBySessionId = async (sessionId) => {
    const [rows] = await dbPool.query('SELECT * FROM images WHERE session_id = ?', [sessionId]);
    return rows;
};
export const markSessionCompleted = async (sessionId) => {
    await dbPool.query('UPDATE sessions SET status = "completed", expires_at = DATE_ADD(NOW(), INTERVAL 3 DAY) WHERE id = ?', [sessionId]);
};
//# sourceMappingURL=sessionModel.js.map