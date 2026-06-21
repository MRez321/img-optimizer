import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import dbPool from '../config/db.js';
// ---------- Users ----------
export const findUserByEmail = async (email) => {
    const [rows] = await dbPool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] ?? null;
};
export const findUserById = async (id) => {
    const [rows] = await dbPool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] ?? null;
};
export const createUser = async (data) => {
    const id = uuidv4();
    await dbPool.query(`INSERT INTO users (id, email, password_hash, name, avatar_url, email_verified)
         VALUES (?, ?, ?, ?, ?, ?)`, [
        id,
        data.email,
        data.passwordHash ?? null,
        data.name ?? null,
        data.avatarUrl ?? null,
        data.emailVerified ?? false,
    ]);
    return (await findUserById(id));
};
export const updateUserProfile = async (id, data) => {
    const fields = [];
    const values = [];
    if (data.name !== undefined) {
        fields.push('name = ?');
        values.push(data.name);
    }
    if (data.avatarUrl !== undefined) {
        fields.push('avatar_url = ?');
        values.push(data.avatarUrl);
    }
    if (fields.length === 0)
        return findUserById(id);
    values.push(id);
    await dbPool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return findUserById(id);
};
export const markEmailVerified = async (userId) => {
    await dbPool.query('UPDATE users SET email_verified = TRUE WHERE id = ?', [userId]);
};
// ---------- OAuth accounts ----------
export const findOAuthAccount = async (provider, providerUserId) => {
    const [rows] = await dbPool.query('SELECT user_id FROM oauth_accounts WHERE provider = ? AND provider_user_id = ?', [provider, providerUserId]);
    return rows[0] ?? null;
};
export const linkOAuthAccount = async (userId, provider, providerUserId) => {
    await dbPool.query(`INSERT INTO oauth_accounts (id, user_id, provider, provider_user_id)
         VALUES (?, ?, ?, ?)`, [uuidv4(), userId, provider, providerUserId]);
};
// ---------- Refresh tokens ----------
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};
export const storeRefreshToken = async (userId, tokenId, rawToken, expiresAt) => {
    await dbPool.query(`INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
         VALUES (?, ?, ?, ?)`, [tokenId, userId, hashToken(rawToken), expiresAt]);
};
export const findRefreshToken = async (tokenId) => {
    const [rows] = await dbPool.query('SELECT * FROM refresh_tokens WHERE id = ? AND revoked = FALSE', [tokenId]);
    return rows[0] ?? null;
};
export const verifyRefreshTokenHash = (rawToken, storedHash) => {
    return hashToken(rawToken) === storedHash;
};
export const revokeRefreshToken = async (tokenId) => {
    await dbPool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE id = ?', [tokenId]);
};
export const revokeAllRefreshTokensForUser = async (userId) => {
    await dbPool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ?', [userId]);
};
// ---------- Email verification ----------
export const createEmailVerificationCode = async (userId) => {
    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit code
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await dbPool.query(`INSERT INTO email_verifications (id, user_id, code, expires_at)
         VALUES (?, ?, ?, ?)`, [uuidv4(), userId, code, expiresAt]);
    return code;
};
export const findValidVerificationCode = async (userId, code) => {
    const [rows] = await dbPool.query(`SELECT * FROM email_verifications
         WHERE user_id = ? AND code = ? AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`, [userId, code]);
    return rows[0] ?? null;
};
export const deleteVerificationCodesForUser = async (userId) => {
    await dbPool.query('DELETE FROM email_verifications WHERE user_id = ?', [userId]);
};
// ---------- Serialization helper ----------
// Strips sensitive fields before sending user data to the client
export const toPublicUser = (user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    emailVerified: !!user.email_verified,
    role: user.role,
    createdAt: user.created_at,
});
//# sourceMappingURL=userModel.js.map