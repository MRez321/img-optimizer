import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';
import {
    register,
    login,
    googleLogin,
    refresh,
    logout,
    logoutAll,
    me,
    updateProfile,
    requestEmailVerification,
    verifyEmail,
} from '../controllers/authController.js';
import { githubRedirect, githubCallback } from '../controllers/githubController.js';

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
});

router.post('/register',  authLimiter, register);
router.post('/login',     authLimiter, login);
router.post('/google',    authLimiter, googleLogin);
router.post('/refresh',   refresh);
router.post('/logout',    logout);
router.post('/logout-all', requireAuth, logoutAll);

// GitHub OAuth — these are GET routes because they involve browser redirects,
// not JSON API calls. No rate limit on /github since GitHub already rate-limits
// the OAuth flow on their end.
router.get('/github',          githubRedirect);
router.get('/github/callback', githubCallback);

router.get('/me',      requireAuth, me);
router.patch('/profile', requireAuth, updateProfile);

router.post('/verify-email/request', requireAuth, authLimiter, requestEmailVerification);
router.post('/verify-email/confirm', requireAuth, verifyEmail);

export default router;
