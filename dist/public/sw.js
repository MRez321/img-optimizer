// PixelStar Service Worker
// Caches the app shell so it loads instantly on repeat visits,
// and satisfies the browser's service worker requirement for PWA install prompts.

const CACHE_NAME = 'pixelstar-v1';

// App shell files to cache on install — Vite hashes these filenames,
// so we use a broad match strategy instead of listing exact filenames.
const STATIC_EXTENSIONS = ['.js', '.css', '.png', '.svg', '.ico', '.webmanifest', '.woff2'];

// ── Install: pre-cache the main page ─────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add('/');
    })
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

// ── Activate: clean up old caches ────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first for static assets, network-first for API ──────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept API, socket.io, or auth requests —
  // these must always go to the network
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/socket.io/') ||
    url.pathname.startsWith('/data/')
  ) {
    return; // let the browser handle it normally
  }

  // For static assets (JS, CSS, images) use cache-first
  const isStatic = STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));

  if (isStatic) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          // Cache a copy of the response
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // For navigation requests (HTML pages) use network-first with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
  }
});
