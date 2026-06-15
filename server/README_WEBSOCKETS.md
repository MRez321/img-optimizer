# WebSocket Integration - Setup Guide

## Files changed / added

| File | Action |
|---|---|
| `server.ts` | **Replace** - now creates raw `http.Server`, attaches socket.io |
| `src/services/socketService.ts` | **New** - socket.io init, rooms, heartbeat, `emitToSession()` helper |
| `src/models/optimizeModel.ts` | **Replace** - added `expected_files` param + `incrementAndGetSession()` |
| `src/controllers/optimizeController.ts` | **Replace** - emits socket events, auto-zip on completion |
| `src/controllers/downloadController.ts` | **Replace** - minor: kept as manual fallback, `isComplete` check updated |
| `CLIENT_USAGE_EXAMPLE.ts` | **New** - frontend reference (not part of backend) |
| `migration_add_expected_files.sql` | **New** - run against your DB |

`src/services/cleanupService.ts`, `src/routes/optimizeRoutes.ts`, `src/models/sessionModel.ts`,
`src/middleware/*`, `src/utils/*`, `src/app.ts`, `src/config/db.ts` are **unchanged**.

---

## 1. Database migration

You need ONE new column on the `sessions` table: `expected_files`.

Run this:

```sql
ALTER TABLE sessions
  ADD COLUMN expected_files INT NOT NULL DEFAULT 0 AFTER options;
```

That's it. Everything else (`total_files`, `last_active`, `expires_at`) already exists
and is reused:

- `total_files` = "completed files so far" (already incremented per image)
- `expected_files` = "how many files the client said it would upload" (new)
- `last_active` = updated on every upload AND now also on socket heartbeat

---

## 2. Drop-in file replacements

Copy these into your project at the matching paths:

```
server.ts                              -> ./server.ts
src/services/socketService.ts          -> ./src/services/socketService.ts  (NEW FILE)
src/models/optimizeModel.ts            -> ./src/models/optimizeModel.ts
src/controllers/optimizeController.ts  -> ./src/controllers/optimizeController.ts
src/controllers/downloadController.ts  -> ./src/controllers/downloadController.ts
```

No changes needed to `optimizeRoutes.ts`, `app.ts`, or anything else.

---

## 3. What changed in the request flow

### `/api/start` (POST)

New optional body field: `totalFiles` (number).

```json
{
  "quality": 80,
  "format": "webp",
  "totalFiles": 12
}
```

If you don't send `totalFiles`, it defaults to `0`, which means "unknown" -
auto-zip won't trigger and you fall back to the manual `/api/zip/:sessionId`
endpoint (still works exactly as before).

### `/api/upload` (POST) - unchanged request, but now ALSO emits sockets

Same single-file upload as before. In addition to the HTTP JSON response,
it now emits to the session's socket room:

- `file-processed` - `{ image: {...}, progress: { completed, expected } }`
- `file-error` - `{ stage, originalName?, message }` (on failure, also returns HTTP 500 as before)
- `zip-ready` - `{ zipUrl, folderName, totalOriginalSize, totalOptimizedSize, totalSavings }` (only when `completed === expected`)

---

## 4. Socket events reference

### Client to Server

| Event | Payload | Purpose |
|---|---|---|
| `join-session` | `sessionId: string` | Join the room for this session, to receive its events |
| `leave-session` | `sessionId: string` | Leave the room (optional cleanup) |
| `heartbeat` | `sessionId: string` | Updates `last_active`, send every ~30s while tab is open |

### Server to Client

| Event | Payload | When |
|---|---|---|
| `file-processed` | `{ image, progress: { completed, expected } }` | After each successful upload+process |
| `file-error` | `{ stage: 'processing' \| 'zip', originalName?, message }` | On a processing or zip failure |
| `zip-ready` | `{ zipUrl, folderName, totalOriginalSize, totalOptimizedSize, totalSavings }` | When `completed >= expected` (auto) |

---

## 5. Frontend integration

See `CLIENT_USAGE_EXAMPLE.ts` for the full pattern. Summary:

1. Connect socket: `const socket = io('http://localhost:3000')`
2. Call `/api/start` with `totalFiles`, get `sessionId`
3. `socket.emit('join-session', sessionId)`
4. Attach listeners for `file-processed`, `file-error`, `zip-ready`
5. Loop through files calling `/api/upload` for each (same as before)
6. Optionally `setInterval` a `heartbeat` emit every 30s

---

## 6. Edge cases handled

- **`expected_files = 0`** (client didn't send `totalFiles`): auto-zip never
  triggers; everything else (progress events, errors) still works. Use
  `/api/zip/:sessionId` manually as before.
- **A file fails processing**: `file-error` emitted, HTTP still returns 500
  for that specific upload, batch continues - completed count just won't
  reach expected, so no auto-zip (use manual `/zip` endpoint as fallback).
- **Socket not connected when upload happens**: `emitToSession` just logs
  a warning and does nothing - HTTP response still works normally.

---

## 7. Things NOT included (possible next steps)

- Sharp progress events for per-file percentage (sharp doesn't expose
  granular byte-level progress easily; would need a different approach
  like chunked resize stages)
- Abandoned-session early cleanup based on heartbeat timeout (cleanup
  cron currently only checks `expires_at`; could add a separate check
  for `last_active < NOW() - INTERVAL 10 MINUTE` for active-but-abandoned
  sessions)
- Multi-tab dedup (if the same sessionId is joined from 2 tabs, both
  receive all events - usually fine, but worth knowing)
