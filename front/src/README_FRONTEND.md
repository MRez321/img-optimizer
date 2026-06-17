# Frontend — Setup Guide

A complete Vite + React + TypeScript frontend for your img-optimizer API:
drag-and-drop batch compression with live socket.io progress, plus
email/password + Google authentication.

## What's included

- **Compression chamber**: dropzone with drag-active state, batch upload,
  per-file rows where a horizontal bar visibly shrinks from original
  width to optimized width as each file finishes (the "signature" visual)
- **Full options panel**: format pills (webp/jpeg/png/tiff/gif), quality
  slider, max-width resize, strip metadata / progressive / lossless toggles
- **Live socket.io integration**: `join-session`/`leave-session`,
  `file-processed`, `file-error`, `zip-ready`, 30s heartbeat — connection
  status indicator included
- **Auto + manual ZIP**: shows the auto-built archive banner when the
  server emits `zip-ready`; falls back to a manual "Build ZIP" button if
  socket events are missed for any reason
- **Auth**: modal with tabs for sign-in/register, Google Identity Services
  button, all requests sent with `withCredentials: true` for the httpOnly
  cookie flow from your backend
- **Account page**: profile name editing, email verification flow (request
  code → confirm code)
- **Design**: dark "darkroom" palette (charcoal + amber + mint), Space
  Grotesk/Inter/JetBrains Mono type system — not a generic admin-dashboard look

## 1. Install

Copy these files into your Vite project (or scaffold fresh with
`npm create vite@latest my-app -- --template react-ts` and copy in):

```
index.html                          -> ./index.html  (REPLACE - adds Google script tag)
src/                                 -> ./src/         (REPLACE entirely)
.env.example                         -> ./.env.example
```

Your `package.json` already has everything needed (axios, lucide-react,
react, react-dom, react-dropzone, react-router-dom, socket.io-client) —
no new packages required.

## 2. Environment variables

Copy `.env.example` to `.env` and fill in:

```
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Use the **same** Google Client ID here as `GOOGLE_CLIENT_ID` in your
backend's `.env` — they must match for token verification to succeed.

If you leave `VITE_GOOGLE_CLIENT_ID` blank, the Google button simply
doesn't render — email/password still works fully.

## 3. Backend CORS reminder

Your backend's `CORS_ORIGIN` env var must exactly match wherever this
frontend runs (e.g. `http://localhost:5173` for Vite's default dev port).
Cookies won't be set/read across origins otherwise.

## 4. Run it

```bash
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`), make sure
your backend is running on the URL in `VITE_API_BASE_URL`, and you should
see the connection indicator go green in the summary bar once you start
a batch.

## 5. How the upload flow maps to your API

| Frontend action | API call | Socket events consumed |
|---|---|---|
| Drop/select files | - (queues client-side) | - |
| Click "Compress N files" | `POST /api/start` with `totalFiles` | - |
| (loop per file) | `POST /api/upload` | `file-processed`, `file-error` |
| All files done | (automatic) | `zip-ready` |
| "Build ZIP archive" (fallback) | `GET /api/zip/:sessionId` | - |
| Every 30s while session active | - | emits `heartbeat` |

The UI marks a file "processing" right after its HTTP upload response
resolves, then flips to "done" when the matching `file-processed` socket
event arrives — matched by original filename. If a socket event never
arrives (e.g. brief disconnect), the file stays in "processing" visually;
the manual ZIP button is still available as a fallback once the expected
count is reached via HTTP responses alone.

## 6. Structure

```
src/
  components/       Header, AuthModal, Dropzone, OptionsPanel, FileRow, SummaryBar
  context/          AuthContext (global user state)
  hooks/            useOptimizerSocket, useHeartbeat
  lib/               api.ts (all backend calls), format.ts (byte/percent helpers)
  pages/            OptimizerPage (main flow), AccountPage (profile + verification)
  types/            shared TypeScript interfaces
  index.css         design tokens (colors, fonts, resets)
  components.css    all component styles
```

## 7. Things you may want to add next

- **Toast notifications** instead of console-only errors for things like
  failed Google login or network drops
- **Persisted history** once you wire `user_id` into sessions server-side —
  an "Account → Past optimizations" list using `GET /api/status/:sessionId`
  per saved session id
- **Drag-to-reorder** or per-file format override (currently format/quality
  apply to the whole batch, matching your backend's per-session options)
- **react-router** currently only has `/` and `/account` — add a 404 route
  or nested routes as the app grows
