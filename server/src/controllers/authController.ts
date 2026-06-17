import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import {
    findUserByEmail,
    findUserById,
    createUser,
    updateUserProfile,
    markEmailVerified,
    findOAuthAccount,
    linkOAuthAccount,
    storeRefreshToken,
    findRefreshToken,
    verifyRefreshTokenHash,
    revokeRefreshToken,
    revokeAllRefreshTokensForUser,
    createEmailVerificationCode,
    findValidVerificationCode,
    deleteVerificationCodesForUser,
    toPublicUser,
} from '../models/userModel.js';
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    REFRESH_TOKEN_TTL_MS,
    ACCESS_COOKIE_NAME,
    REFRESH_COOKIE_NAME,
    accessCookieOptions,
    refreshCookieOptions,
} from '../config/jwt.js';
import { sendVerificationEmail } from '../config/mailer.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const BCRYPT_ROUNDS = 10;

// Issues a fresh access + refresh token pair for a user and sets cookies.
const issueTokens = async (res: Response, userId: string, email: string, role: 'user' | 'admin') => {
    const accessToken = signAccessToken({ userId, email, role });

    const tokenId = uuidv4();
    const refreshToken = signRefreshToken({ userId, tokenId });
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await storeRefreshToken(userId, tokenId, refreshToken, expiresAt);

    res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
};

const clearAuthCookies = (res: Response) => {
    res.clearCookie(ACCESS_COOKIE_NAME, { path: accessCookieOptions.path });
    res.clearCookie(REFRESH_COOKIE_NAME, { path: refreshCookieOptions.path });
};

// ---------- Register ----------

export const register = async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await createUser({ email, passwordHash, name: name || null });

    await issueTokens(res, user.id, user.email, user.role);

    // Kick off email verification (non-blocking on the response)
    const code = await createEmailVerificationCode(user.id);
    sendVerificationEmail(user.email, code).catch((err) =>
        console.error('sendVerificationEmail failed:', err)
    );

    res.status(201).json({ user: toPublicUser(user) });
};

// ---------- Login (email + password) ----------

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await findUserByEmail(email);

    // Avoid leaking whether the email exists - generic error for both cases
    if (!user || !user.password_hash) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    await issueTokens(res, user.id, user.email, user.role);

    res.json({ user: toPublicUser(user) });
};

// ---------- Google login (frontend ID token verification) ----------

export const googleLogin = async (req: Request, res: Response) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ error: 'idToken is required' });
    }
    if (!GOOGLE_CLIENT_ID) {
        return res.status(500).json({ error: 'Google login is not configured on the server' });
    }

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid Google token' });
    }

    if (!payload?.sub || !payload?.email) {
        return res.status(401).json({ error: 'Google token missing required fields' });
    }

    const googleUserId = payload.sub;
    const email = payload.email;
    const name = payload.name || null;
    const avatarUrl = payload.picture || null;

    // 1. Already linked? log them in.
    const existingLink = await findOAuthAccount('google', googleUserId);
    let user = existingLink ? await findUserById(existingLink.user_id) : null;

    // 2. Not linked, but an account with this email exists? link it.
    if (!user) {
        user = await findUserByEmail(email);
        if (user) {
            await linkOAuthAccount(user.id, 'google', googleUserId);
        }
    }

    // 3. No existing account at all? create a new one (Google-verified email = trusted)
    if (!user) {
        user = await createUser({
            email,
            passwordHash: null,
            name,
            avatarUrl,
            emailVerified: true, // Google has already verified this email
        });
        await linkOAuthAccount(user.id, 'google', googleUserId);
    }

    await issueTokens(res, user.id, user.email, user.role);

    res.json({ user: toPublicUser(user) });
};

// ---------- Refresh ----------

export const refresh = async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!token) {
        return res.status(401).json({ error: 'No refresh token' });
    }

    let payload;
    try {
        payload = verifyRefreshToken(token);
    } catch {
        clearAuthCookies(res);
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const stored = await findRefreshToken(payload.tokenId);
    if (!stored || !verifyRefreshTokenHash(token, stored.token_hash)) {
        clearAuthCookies(res);
        return res.status(401).json({ error: 'Refresh token revoked or not recognized' });
    }

    if (new Date(stored.expires_at) < new Date()) {
        clearAuthCookies(res);
        return res.status(401).json({ error: 'Refresh token expired' });
    }

    const user = await findUserById(payload.userId);
    if (!user) {
        clearAuthCookies(res);
        return res.status(401).json({ error: 'User not found' });
    }

    // Rotate: revoke the old refresh token, issue a fresh pair
    await revokeRefreshToken(payload.tokenId);
    await issueTokens(res, user.id, user.email, user.role);

    res.json({ user: toPublicUser(user) });
};

// ---------- Logout ----------

export const logout = async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];

    if (token) {
        try {
            const payload = verifyRefreshToken(token);
            await revokeRefreshToken(payload.tokenId);
        } catch {
            // token already invalid/expired - nothing to revoke
        }
    }

    clearAuthCookies(res);
    res.json({ success: true });
};

// Logs out of all sessions/devices (revokes every refresh token for the user)
export const logoutAll = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    await revokeAllRefreshTokensForUser(req.user.userId);
    clearAuthCookies(res);
    res.json({ success: true });
};

// ---------- Current user ----------

export const me = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const user = await findUserById(req.user.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    res.json({ user: toPublicUser(user) });
};

// ---------- Profile update ----------

export const updateProfile = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { name, avatarUrl } = req.body;

    const updated = await updateUserProfile(req.user.userId, {
        name: name !== undefined ? name : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
    });

    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({ user: toPublicUser(updated) });
};

// ---------- Email verification ----------

// Sends (or re-sends) a verification code to the logged-in user's email
export const requestEmailVerification = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const user = await findUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.email_verified) {
        return res.json({ message: 'Email already verified' });
    }

    // Clean up old codes, issue a fresh one
    await deleteVerificationCodesForUser(user.id);
    const code = await createEmailVerificationCode(user.id);
    await sendVerificationEmail(user.email, code);

    res.json({ message: 'Verification code sent' });
};

// Verifies the code submitted by the user
export const verifyEmail = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const record = await findValidVerificationCode(req.user.userId, code);
    if (!record) {
        return res.status(400).json({ error: 'Invalid or expired code' });
    }

    await markEmailVerified(req.user.userId);
    await deleteVerificationCodesForUser(req.user.userId);

    res.json({ message: 'Email verified successfully' });
};
