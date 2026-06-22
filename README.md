<div align="center">

<img src="https://pixelstar.ir/logo-512.png" width="120" alt="PixelStar logo" />

# PixelStar

**Shrink images. Keep the detail.**

Drag in your images, pick a format, and watch every file compress in real time —
no installs, no sign-up required.

[![Live Preview](https://img.shields.io/badge/Live%20Preview-pixelstar.ir-ff8a3d?style=for-the-badge&logo=globe&logoColor=white)](https://pixelstar.ir/)
![Free to use](https://img.shields.io/badge/Free%20to%20use-no%20limits-5eead4?style=for-the-badge)
![Formats](https://img.shields.io/badge/Formats-WebP%20%7C%20JPEG%20%7C%20PNG%20%7C%20TIFF%20%7C%20GIF-383c47?style=for-the-badge)

</div>

---

## What is PixelStar?

PixelStar is a free, browser-based image optimization tool. You drop in your images,
choose how you want them compressed, and get back smaller files — instantly, with no
software to install and nothing to sign up for.

It supports batch processing with **live per-file progress**, so you see each image
shrink in real time rather than staring at a spinner waiting for the whole batch to finish.

---

## Features

### Compression & conversion
- **Output format selection** — convert to WebP, JPEG, PNG, TIFF, or GIF in one click
- **Quality control** — fine-tune the quality/size tradeoff with a slider (1–100)
- **Lossless mode** — compress without any quality loss (WebP and PNG)
- **Progressive encoding** — makes JPEGs load top-to-bottom progressively in the browser
- **Metadata stripping** — removes EXIF data (camera info, GPS location, timestamps)
- **Resize on compress** — set a max width and images are scaled down proportionally

### Batch processing
- Drop in up to **20 images at once** (up to 50MB each)
- Files are processed one by one with a **live shrinking progress bar** per file
- See original size → optimized size → savings percentage for each file as it finishes
- Download individual files the moment they're ready, or wait for the full **ZIP archive**

### Real-time updates
- Progress is pushed to your browser via **WebSocket** — no page polling, no refreshing
- The ZIP is built automatically when all files finish and the download link appears instantly

### Account (optional)
- Create an account to save your session history
- **Sign in with Google** or email + password
- Email verification support
- Accounts are completely optional — the optimizer works fully without one

---

## How to use it

**1. Open the app**

Go to [pixelstar.ir](https://pixelstar.ir/)

**2. Drop your images**

Drag and drop images onto the compression chamber, or click it to browse your files.
Supported formats: JPEG, PNG, WebP, TIFF, GIF.

**3. Pick your settings**

In the settings panel on the right:

| Setting | What it does |
|---|---|
| Output format | What format your compressed files will be saved as |
| Quality | Lower = smaller file, higher = better image (ignored in lossless mode) |
| Max width | Resizes the image down to this width while keeping aspect ratio |
| Strip metadata | Removes hidden camera/GPS data from the file |
| Progressive | JPEG only — makes images load gradually in older browsers |
| Lossless | Compresses without losing any image quality |

**4. Compress**

Click **Compress N files**. Each file shows a bar that shrinks to its actual compressed size as it finishes. You'll see:
- Original size → optimized size
- Savings percentage
- Final dimensions

**5. Download**

- Click **Download** next to any individual file to save it immediately
- Once all files are done, a **Download ZIP** banner appears with a single archive containing everything

---

## Supported formats

| Format | Best for | Notes |
|---|---|---|
| **WebP** | Web images (photos + graphics) | Best compression ratio, supported by all modern browsers. Recommended default. |
| **JPEG** | Photos | Lossy compression, very widely supported |
| **PNG** | Screenshots, logos, transparency | Lossless by nature, larger files than WebP |
| **TIFF** | Print / archival use | High quality, large files |
| **GIF** | Animated images | Limited to 256 colors |

> **Tip:** If you're optimizing images for a website, WebP at quality 80 is almost always
> the right choice — it gives you the smallest files with the least visible quality loss.

---

## Tips for best results

- **For web use**: choose WebP, quality 75–85, strip metadata on
- **For photos you want to keep**: choose JPEG or PNG, quality 90+, lossless off
- **For logos / icons**: PNG or WebP with lossless on
- **Large batch?** Drop everything in at once — files upload and process sequentially
  so you don't overwhelm the server, and you can already download finished files while
  the rest are still processing
- **Mobile**: the app works on phones and tablets — use the share sheet to send images
  directly from your camera roll

---

## Privacy

- Uploaded files are stored temporarily on the server and **automatically deleted**
  after your session ends or within 3 days if you downloaded your files
- If you close the tab mid-session, files are cleaned up within a few minutes
- Metadata stripping (enabled by default) removes GPS location and camera info from
  your images before you download them
- No images are ever shared, sold, or used for any purpose other than processing your request

---

## Live preview

**[→ Try it at pixelstar.ir](https://pixelstar.ir/)**

---

<div align="center">

Made with ❤️ by [MRez321](https://github.com/MRez321)

</div>
