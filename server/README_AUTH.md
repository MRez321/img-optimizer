# Authentication - Setup Guide

## Files added / changed

| File | Action |
|---|---|
| `src/app.ts` | **Replace** - adds `cookie-parser`, CORS `credentials: true`, mounts `/api/auth` |
| `src/config/jwt.ts` | **New** - sign/verify access + refresh tokens, cookie options |
| `src/config/mailer.ts` | **New** - nodemailer setup (placeholder SMTP + console log fallback) |
| `src/models/userModel.ts` | **New** - users, oauth_accounts, refresh_tokens, email_verifications |
| `src/middleware/auth.ts` | **New** - `requireAuth`, `optionalAuth`, `requireAdmin` |
| `src/controllers/authController.ts` | **New** - register/login/google/refresh/logout/me/verify |
| `src/routes/authRoutes.ts` | **New** - all `/api/auth/*` routes with rate limiting |
| `migration_add_auth_tables.sql` | **New** - run against your DB |
| `SETUP_ENV.txt` | **New** - install commands + `.env` template |

Nothing in your existing image-optimizer routes/controllers was touched.
All current functionality stays exactly as-is and fully open/anonymous.

---

## 1. Install packages + set env vars

See `SETUP_ENV.txt` for the exact `npm install` command and `.env` template.

**Important on `CORS_ORIGIN`**: since cookies require `credentials: true`,
CORS can no longer use `origin: '*'`. Set `CORS_ORIGIN` to your actual
frontend URL (e.g. `http://localhost:5173` for Vite, `http://localhost:3000`
if frontend and backend share a port differently, etc).

---

## 2. Database migration

Run `migration_add_auth_tables.sql` against your MySQL database. It creates:

- `users` - core user table, `password_hash` nullable (Google-only accounts have none)
- `oauth_accounts` - links a user to external providers (`google`, extensible later)
- `refresh_tokens` - tracks issued refresh tokens by hash, so you can revoke them
- `email_verifications` - stores 6-digit codes with expiry
- Also adds a nullable `user_id` column to your existing `sessions` table, for later use

---

## 3. Drop-in file replacements

```
src/app.ts                          -> ./src/app.ts  (REPLACE)
src/config/jwt.ts                   -> ./src/config/jwt.ts  (NEW)
src/config/mailer.ts                -> ./src/config/mailer.ts  (NEW)
src/models/userModel.ts             -> ./src/models/userModel.ts  (NEW)
src/middleware/auth.ts              -> ./src/middleware/auth.ts  (NEW)
src/controllers/authController.ts   -> ./src/controllers/authController.ts  (NEW)
src/routes/authRoutes.ts            -> ./src/routes/authRoutes.ts  (NEW)
```

---

## 4. API reference

All routes are under `/api/auth`. All set/read httpOnly cookies automatically -
your frontend just needs `credentials: 'include'` on every fetch.

| Method | Route | Auth required | Body | Description |
|---|---|---|---|---|
| POST | `/api/auth/register` | no | `{ email, password, name? }` | Create account, auto-login, sends verification code |
| POST | `/api/auth/login` | no | `{ email, password }` | Email/password login |
| POST | `/api/auth/google` | no | `{ idToken }` | Google login (see frontend flow below) |
| POST | `/api/auth/refresh` | no (refresh cookie) | - | Rotates tokens, call when access token expires |
| POST | `/api/auth/logout` | no | - | Clears cookies, revokes current refresh token |
| POST | `/api/auth/logout-all` | yes | - | Revokes ALL refresh tokens (all devices/sessions) |
| GET | `/api/auth/me` | yes | - | Returns current user |
| PATCH | `/api/auth/profile` | yes | `{ name?, avatarUrl? }` | Update profile fields |
| POST | `/api/auth/verify-email/request` | yes | - | (Re)sends verification code |
| POST | `/api/auth/verify-email/confirm` | yes | `{ code }` | Confirms the code |

---

## 5. Google OAuth setup (frontend ID token flow)

### Google Cloud Console setup

1. Go to console.cloud.google.com → create/select a project
2. APIs & Services → OAuth consent screen → configure (External, add your email as test user while in testing mode)
3. APIs & Services → Credentials → Create Credentials → OAuth Client ID → type **Web application**
4. Add your frontend origin to "Authorized JavaScript origins" (e.g. `http://localhost:5173`)
5. Copy the **Client ID** → put it in `.env` as `GOOGLE_CLIENT_ID` (same value used on frontend)

### Frontend flow

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>

<div id="g_id_onload"
     data-client_id="YOUR_GOOGLE_CLIENT_ID"
     data-callback="handleGoogleLogin">
</div>
<div class="g_id_signin"></div>

<script>
async function handleGoogleLogin(response) {
  // response.credential is the ID token
  const res = await fetch('http://localhost:3000/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // REQUIRED so cookies get set
    body: JSON.stringify({ idToken: response.credential })
  });
  const data = await res.json();
  console.log('Logged in as', data.user);
}
</script>
```

The backend verifies the ID token server-side via `google-auth-library`,
matches/creates the user, and issues your own JWT cookies — same as
email/password login from that point on.

---

## 6. How multiple login methods coexist

A user is matched by **email**, regardless of how they sign in:

- Sign up with email/password → `password_hash` set, no oauth_accounts row
- Later log in with Google using the same email → automatically links a new
  `oauth_accounts` row to that same existing user (no duplicate account)
- Sign up with Google directly (new email) → new user created with
  `password_hash = NULL`, `email_verified = TRUE` (Google already verified it)

This means a user can end up with both a password AND a linked Google
account, and either method logs them into the same account.

---

## 7. Email verification flow

1. On register, a 6-digit code is generated and "sent" (logged to console,
   and emailed if SMTP is configured)
2. Frontend calls `/api/auth/verify-email/confirm` with `{ code }`
3. On success, `email_verified` flips to `true`

This is **not required to log in or use the app** — it's purely informational
for now, per your decision. You can later gate features behind
`req.user && user.email_verified` if you want to require it for something.

To test without real SMTP: just watch your server console for lines like:
```
📧 [email-verification] to=user@example.com code=482913
```

To wire up real SMTP later: fill in `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in
`.env`. Works with any SMTP provider (Resend, Gmail app passwords, Mailgun,
SendGrid SMTP relay, etc) — no code changes needed.

---

## 8. Using auth on your existing routes (when you're ready)

Right now NOTHING is gated. When you want to lock a feature to logged-in
users, import the middleware and add it to that one route:

```ts
import { requireAuth, optionalAuth } from '../middleware/auth.js';

// Fully gated - 401 if not logged in
router.post('/some-premium-feature', requireAuth, someController);

// Works for both, but req.user is populated if logged in
router.post('/start', optionalAuth, startSession);
```

Inside a controller, once `optionalAuth` or `requireAuth` has run, you get:
```ts
req.user // { userId, email, role } or undefined
```

A natural first step later: in `startSession`, if `req.user` exists, pass
`req.user.userId` into `createSession()` to populate the new `user_id`
column on `sessions` — instantly gets you "my upload history" for logged-in
users while anonymous flow is untouched.

---

## 9. Security notes

- Passwords hashed with bcrypt (10 rounds) — never stored in plaintext
- Refresh tokens stored as SHA-256 hashes in DB, never the raw token —
  if your DB leaked, stored hashes alone can't be replayed
- Refresh token rotation: every `/refresh` call revokes the old token and
  issues a new one — limits the damage window if one is stolen
- Access token cookie path is `/` (sent on every request); refresh token
  cookie path is scoped to `/api/auth` only (sent only when needed)
- Rate limiting (20 req / 15 min) on register, login, google, and
  verification-request endpoints
- Generic "Invalid email or password" error on login - doesn't reveal
  whether the email exists

## 10. Not included (possible next steps)

- Forgot/reset password flow (would reuse the same code-generation pattern
  as email verification)
- Account deletion endpoint
- "Sign in with GitHub" or other providers — same `oauth_accounts` pattern
  extends easily, just add another provider string + verification method
- Admin panel/routes (the `role` field and `requireAdmin` middleware exist
  and are ready, just no routes use them yet)
