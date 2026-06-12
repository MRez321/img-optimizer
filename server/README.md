# img-optimizer

> Real-time image compression and conversion API — inspired by [Compressor.io](https://compressor.io)

Built with **Node.js · TypeScript · MySQL**

---

## Features

- Upload up to **20 files** at once (50 MB each)
- Real-time per-file processing — each file is compressed immediately on upload
- Supported formats: `JPEG` `PNG` `WebP` `TIFF` `GIF` `SVG`
- Compression quality control (1–100) with **lossless / lossy** modes
- Format conversion, resize with aspect ratio preservation
- Strip EXIF / metadata
- Progressive JPEG support
- Individual file downloads + full **ZIP** batch download
- Rich savings metadata per file (size, dimensions, percentage saved)
- MySQL persistence with **auto-cleanup**
- Concurrent user support via session isolation
- Production-ready validation, error handling, and logging

---

## Project Structure

```
project-root/
├── data/
│   ├── uploads/           # Original uploaded files
│   └── optimized/         # Processed files + ZIPs
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   └── db.ts
│   ├── controllers/
│   ├── middleware/
│   ├── models/            # Optional ORM layer
│   ├── routes/
│   ├── services/
│   ├── types/
│   └── utils/
├── public/                # Optional frontend
├── README.md
└── package.json
```

---

## Setup

### 1. Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=image_optimizer
```

### 2. Database

```sql
CREATE DATABASE IF NOT EXISTS image_optimizer;
USE image_optimizer;

CREATE TABLE sessions (
    id                   VARCHAR(36)   PRIMARY KEY,
    folder_name          VARCHAR(255)  NOT NULL,
    upload_path          VARCHAR(500)  NOT NULL,
    optimized_path       VARCHAR(500)  NOT NULL,
    total_files          INT           DEFAULT 0,
    total_original_size  BIGINT        DEFAULT 0,
    total_optimized_size BIGINT        DEFAULT 0,
    status               ENUM('processing', 'completed', 'failed') DEFAULT 'processing',
    options              JSON          NOT NULL,
    created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    last_active          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at           TIMESTAMP     NULL
);

CREATE TABLE images (
    id                 VARCHAR(36)    PRIMARY KEY,
    session_id         VARCHAR(36)    NOT NULL,
    original_name      VARCHAR(255)   NOT NULL,
    original_size      BIGINT         NOT NULL,
    optimized_name     VARCHAR(255)   NOT NULL,
    optimized_size     BIGINT,
    format             VARCHAR(10)    NOT NULL,
    optimized_format   VARCHAR(10)    NOT NULL,
    savings_percentage DECIMAL(5,2)   DEFAULT 0.00,
    width              INT,
    height             INT,
    status             ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    created_at         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Auto-cleanup: removes expired sessions every hour
CREATE EVENT IF NOT EXISTS cleanup_old_sessions
ON SCHEDULE EVERY 1 HOUR
DO DELETE FROM sessions WHERE expires_at < NOW();
```

### 3. Install & Run

```bash
npm install
npm run build
npm start
```

**Development (with hot reload):**

```bash
npm run dev
```

---

## API Reference

### Start a Session

```
POST /api/optimize/start
```

**Request body:**

```json
{
  "quality": 80,
  "format": "webp",
  "stripMetadata": true,
  "progressive": true,
  "lossless": false,
  "resize": {
    "width": 1200,
    "height": 800,
    "fit": "inside"
  }
}
```

**Response:**

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "folderName": "550e8400-e29b-41d4-a716-446655440000 - 20260611 135024"
}
```

---

### Upload & Process a File

```
POST /api/optimize/upload
```

Multipart form data:

| Field       | Type   | Description              |
|-------------|--------|--------------------------|
| `image`     | file   | The image to upload      |
| `sessionId` | string | Session ID from `/start` |

**Response:**

```json
{
  "success": true,
  "image": {
    "originalName": "photo.jpg",
    "optimizedName": "a1b2c3d4-e5f6-....webp",
    "originalSize": 2456789,
    "optimizedSize": 987654,
    "savings": 59.82,
    "downloadUrl": "/data/optimized/{folderName}/a1b2c3d4-e5f6-....webp"
  }
}
```

---

### Get Session Status

```
GET /api/optimize/status/:sessionId
```

**Response:**

```json
{
  "session": { "..." },
  "images": [ "..." ],
  "isComplete": true
}
```

---

### Download ZIP

```
GET /api/optimize/zip/:sessionId
```

**Response:**

```json
{
  "zipUrl": "/data/optimized/{folderName}/folder-name.zip",
  "totalOriginalSize": 12456789,
  "totalOptimizedSize": 4567890,
  "totalSavings": "63.35"
}
```

---

## Frontend Usage (Vanilla JS)

```javascript
let sessionId = null;

// Step 1: Start a session
async function startSession(options) {
  const res = await fetch('/api/optimize/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
  });
  const data = await res.json();
  sessionId = data.sessionId;
  return data;
}

// Step 2: Upload files one by one
async function uploadFile(file) {
  const form = new FormData();
  form.append('image', file);
  form.append('sessionId', sessionId);

  const res = await fetch('/api/optimize/upload', {
    method: 'POST',
    body: form
  });
  return await res.json();
}

// Step 3: Download the full batch as ZIP
async function downloadAll() {
  const res = await fetch(`/api/optimize/zip/${sessionId}`);
  const data = await res.json();
  window.location.href = data.zipUrl;
}
```

---

## Data Retention

| Item               | Retention                          |
|--------------------|------------------------------------|
| Files on disk      | 1 hour after last activity         |
| Database records   | 3 days (`expires_at`)              |
| Cleanup frequency  | Every hour via `node-cron`         |

---

## Security & Validation

- MIME type + extension validation on every upload
- 50 MB per-file limit, 20 files per session
- Static files served with cache headers
- Centralized error handling middleware
- Session UUIDs ensure concurrent user isolation
- Upload folders created automatically and safely