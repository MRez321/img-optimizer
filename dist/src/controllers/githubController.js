import { findUserByEmail, findOAuthAccount, linkOAuthAccount, createUser, toPublicUser, } from '../models/userModel.js';
import { signAccessToken, signRefreshToken, REFRESH_TOKEN_TTL_MS, ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME, accessCookieOptions, refreshCookieOptions, } from '../config/jwt.js';
import { storeRefreshToken } from '../models/userModel.js';
import { v4 as uuidv4 } from 'uuid';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const CLIENT_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
// ── Step 1: redirect user to GitHub's OAuth consent page ─────────────────
export const githubRedirect = (_req, res) => {
    if (!GITHUB_CLIENT_ID) {
        return res.status(500).json({ error: 'GitHub login is not configured on the server' });
    }
    const params = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        scope: 'read:user user:email',
        // No redirect_uri here — GitHub uses the one registered in your
        // OAuth App settings. Add it explicitly if you have multiple environments.
    });
    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};
// ── Step 2: GitHub redirects back here with ?code=xxx ────────────────────
export const githubCallback = async (req, res) => {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
        return res.redirect(`${CLIENT_ORIGIN}/?auth_error=missing_code`);
    }
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        return res.redirect(`${CLIENT_ORIGIN}/?auth_error=not_configured`);
    }
    try {
        // Exchange code for access token (server-to-server, secret stays safe)
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code,
            }),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.error || !tokenData.access_token) {
            console.error('GitHub token exchange failed:', tokenData);
            return res.redirect(`${CLIENT_ORIGIN}/?auth_error=token_exchange_failed`);
        }
        const accessToken = tokenData.access_token;
        // Fetch GitHub user profile
        const profileRes = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github+json',
            },
        });
        const profile = await profileRes.json();
        if (!profile.id) {
            return res.redirect(`${CLIENT_ORIGIN}/?auth_error=profile_fetch_failed`);
        }
        // GitHub users can hide their email — fetch the verified primary one separately
        let email = profile.email || null;
        if (!email) {
            const emailsRes = await fetch('https://api.github.com/user/emails', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/vnd.github+json',
                },
            });
            const emails = await emailsRes.json();
            const primary = emails.find((e) => e.primary && e.verified);
            email = primary?.email || null;
        }
        if (!email) {
            // Extremely rare — GitHub account with no verified email at all
            return res.redirect(`${CLIENT_ORIGIN}/?auth_error=no_verified_email`);
        }
        const githubUserId = String(profile.id);
        const name = profile.name || profile.login || null;
        const avatarUrl = profile.avatar_url || null;
        // 1. Already linked? log them in
        const existingLink = await findOAuthAccount('github', githubUserId);
        let user = existingLink
            ? await import('../models/userModel.js').then(m => m.findUserById(existingLink.user_id))
            : null;
        // 2. Account exists with this email? link GitHub to it
        if (!user) {
            user = await findUserByEmail(email);
            if (user)
                await linkOAuthAccount(user.id, 'github', githubUserId);
        }
        // 3. Brand new user — create account
        if (!user) {
            user = await createUser({
                email,
                passwordHash: null,
                name,
                avatarUrl,
                emailVerified: true, // GitHub has already verified this email
            });
            await linkOAuthAccount(user.id, 'github', githubUserId);
        }
        // Issue JWT cookies (same as every other login method)
        const tokenId = uuidv4();
        const jwtAccess = signAccessToken({ userId: user.id, email: user.email, role: user.role });
        const jwtRefresh = signRefreshToken({ userId: user.id, tokenId });
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
        await storeRefreshToken(user.id, tokenId, jwtRefresh, expiresAt);
        res.cookie(ACCESS_COOKIE_NAME, jwtAccess, accessCookieOptions);
        res.cookie(REFRESH_COOKIE_NAME, jwtRefresh, refreshCookieOptions);
        // Redirect back to the frontend — cookies are set, AuthContext
        // will call /api/auth/me on load and pick up the user automatically
        res.redirect(`${CLIENT_ORIGIN}/?auth_success=github`);
    }
    catch (err) {
        console.error('GitHub OAuth callback error:', err);
        res.redirect(`${CLIENT_ORIGIN}/?auth_error=server_error`);
    }
};
//# sourceMappingURL=githubController.js.map