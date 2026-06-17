import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import dbPool from '../config/db.js';

export interface User {
    id: string;
    email: string;
    password_hash: string | null;
    name: string | null;
    avatar_url: string | null;
    email_verified: boolean;
    role: 'user' | 'admin';
    created_at: Date;
    updated_at: Date;
}

// ---------- Users ----------

export const findUserByEmail = async (email: string): Promise<User | null> => {
    const [rows] = await dbPool.query<any[]>('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] ?? null;
};

export const findUserById = async (id: string): Promise<User | null> => {
    const [rows] = await dbPool.query<any[]>('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] ?? null;
};

export const createUser = async (data: {
    email: string;
    passwordHash?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
    emailVerified?: boolean;
}): Promise<User> => {
    const id = uuidv4();
    await dbPool.query(
        `INSERT INTO users (id, email, password_hash, name, avatar_url, email_verified)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            id,
            data.email,
            data.passwordHash ?? null,
            data.name ?? null,
            data.avatarUrl ?? null,
            data.emailVerified ?? false,
        ]
    );
    return (await findUserById(id))!;
};

export const updateUserProfile = async (
    id: string,
    data: { name?: string | null; avatarUrl?: string | null }
): Promise<User | null> => {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
        fields.push('name = ?');
        values.push(data.name);
    }
    if (data.avatarUrl !== undefined) {
        fields.push('avatar_url = ?');
        values.push(data.avatarUrl);
    }

    if (fields.length === 0) return findUserById(id);

    values.push(id);
    await dbPool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return findUserById(id);
};

export const markEmailVerified = async (userId: string): Promise<void> => {
    await dbPool.query('UPDATE users SET email_verified = TRUE WHERE id = ?', [userId]);
};

// ---------- OAuth accounts ----------

export const findOAuthAccount = async (
    provider: string,
    providerUserId: string
): Promise<{ user_id: string } | null> => {
    const [rows] = await dbPool.query<any[]>(
        'SELECT user_id FROM oauth_accounts WHERE provider = ? AND provider_user_id = ?',
        [provider, providerUserId]
    );
    return rows[0] ?? null;
};

export const linkOAuthAccount = async (
    userId: string,
    provider: string,
    providerUserId: string
): Promise<void> => {
    await dbPool.query(
        `INSERT INTO oauth_accounts (id, user_id, provider, provider_user_id)
         VALUES (?, ?, ?, ?)`,
        [uuidv4(), userId, provider, providerUserId]
    );
};

// ---------- Refresh tokens ----------

const hashToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

export const storeRefreshToken = async (
    userId: string,
    tokenId: string,
    rawToken: string,
    expiresAt: Date
): Promise<void> => {
    await dbPool.query(
        `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
         VALUES (?, ?, ?, ?)`,
        [tokenId, userId, hashToken(rawToken), expiresAt]
    );
};

export const findRefreshToken = async (tokenId: string): Promise<any | null> => {
    const [rows] = await dbPool.query<any[]>(
        'SELECT * FROM refresh_tokens WHERE id = ? AND revoked = FALSE',
        [tokenId]
    );
    return rows[0] ?? null;
};

export const verifyRefreshTokenHash = (rawToken: string, storedHash: string): boolean => {
    return hashToken(rawToken) === storedHash;
};

export const revokeRefreshToken = async (tokenId: string): Promise<void> => {
    await dbPool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE id = ?', [tokenId]);
};

export const revokeAllRefreshTokensForUser = async (userId: string): Promise<void> => {
    await dbPool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ?', [userId]);
};

// ---------- Email verification ----------

export const createEmailVerificationCode = async (userId: string): Promise<string> => {
    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit code
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await dbPool.query(
        `INSERT INTO email_verifications (id, user_id, code, expires_at)
         VALUES (?, ?, ?, ?)`,
        [uuidv4(), userId, code, expiresAt]
    );

    return code;
};

export const findValidVerificationCode = async (
    userId: string,
    code: string
): Promise<any | null> => {
    const [rows] = await dbPool.query<any[]>(
        `SELECT * FROM email_verifications
         WHERE user_id = ? AND code = ? AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [userId, code]
    );
    return rows[0] ?? null;
};

export const deleteVerificationCodesForUser = async (userId: string): Promise<void> => {
    await dbPool.query('DELETE FROM email_verifications WHERE user_id = ?', [userId]);
};

// ---------- Serialization helper ----------

// Strips sensitive fields before sending user data to the client
export const toPublicUser = (user: User) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    emailVerified: !!user.email_verified,
    role: user.role,
    createdAt: user.created_at,
});
