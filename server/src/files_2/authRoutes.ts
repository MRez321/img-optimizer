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

const router = Router();

// Stricter limits on auth endpoints to slow down brute-force / abuse.
// Adjust windowMs/max to taste once you have real traffic patterns.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleLogin);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/logout-all', requireAuth, logoutAll);

router.get('/me', requireAuth, me);
router.patch('/profile', requireAuth, updateProfile);

router.post('/verify-email/request', requireAuth, authLimiter, requestEmailVerification);
router.post('/verify-email/confirm', requireAuth, verifyEmail);

export default router;
