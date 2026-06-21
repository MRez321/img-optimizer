import { verifyAccessToken, ACCESS_COOKIE_NAME } from '../config/jwt.js';
// Use this on routes that MUST be authenticated.
// Returns 401 if no valid access token is present.
export const requireAuth = (req, res, next) => {
    const token = req.cookies?.[ACCESS_COOKIE_NAME];
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        req.user = verifyAccessToken(token);
        next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
// Use this on routes that work for both logged-in and anonymous users.
// Attaches req.user if a valid token is present, otherwise continues
// without one. Never blocks the request.
export const optionalAuth = (req, res, next) => {
    const token = req.cookies?.[ACCESS_COOKIE_NAME];
    if (!token)
        return next();
    try {
        req.user = verifyAccessToken(token);
    }
    catch {
        // Invalid/expired token on an optional route - just proceed unauthenticated
    }
    next();
};
// Use this to restrict a route to admins only. Combine with requireAuth.
export const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
//# sourceMappingURL=auth.js.map