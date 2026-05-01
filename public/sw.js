/**
 * Internet Archive Explorer — Service Worker
 * Multi-cache LRU (≤50 MiB per cache, ≤200 MiB total), stale-while-revalidate for IA API,
 * Background Sync tag `ia-library-sync` notifies clients to reconcile offline library state.
 */
const CACHE_VERSION = 'v6';
const CACHE_SHELL = `ia-explorer-shell-${CACHE_VERSION}`;
const CACHE_API = `ia-explorer-api-${CACHE_VERSION}`;
const CACHE_IMAGES = `ia-explorer-images-${CACHE_VERSION}`;
const CACHE_STATIC = `ia-explorer-static-${CACHE_VERSION}`;
const API_HOSTNAME = 'archive.org';
const IMAGE_HOSTNAMES = ['archive.org'];
const NETWORK_TIMEOUT_MS = 15000;

const MAX_PER_CACHE_BYTES = 50 * 1024 * 1024;
const MAX_TOTAL_BYTES = 200 * 1024 * 1024;

const BASE_PATH = new URL(self.registration.scope).pathname;

const APP_SHELL_URLS = [BASE_PATH, `${BASE_PATH}index.html`];

/** Keep precache small and reliable (matches `index.html`); app bundles ship via Vite. */
const THIRD_PARTY_URLS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
];

const urlsToPrecache = [...APP_SHELL_URLS, ...THIRD_PARTY_URLS];

/** @type {Map<string, number>} url → last access epoch ms */
const urlAccessMs = new Map();

function touch(url) {
  urlAccessMs.set(url, Date.now());
}

const timeoutFetch = async (request, timeoutMs = NETWORK_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

async function measureResponseBytes(response) {
  const len = response.headers.get('Content-Length');
  if (len) {
    const n = Number.parseInt(len, 10);
    if (!Number.isNaN(n)) return n;
  }
  const buf = await response.clone().arrayBuffer();
  return buf.byteLength;
}

async function evictLRUFromCache(cacheName, maxBytes) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const entries = [];
  for (const req of keys) {
    const res = await cache.match(req);
    if (!res) continue;
    const size = await measureResponseBytes(res);
    const u = req.url;
    entries.push({ req, u, size, last: urlAccessMs.get(u) || 0 });
  }
  let total = entries.reduce((s, e) => s + e.size, 0);
  entries.sort((a, b) => a.last - b.last);
  let i = 0;
  while (total > maxBytes && i < entries.length) {
    const e = entries[i++];
    await cache.delete(e.req);
    urlAccessMs.delete(e.u);
    total -= e.size;
  }
}

async function evictGlobalLRU(maxTotalBytes) {
  const cacheNames = [CACHE_SHELL, CACHE_API, CACHE_IMAGES, CACHE_STATIC];
  const all = [];
  for (const cn of cacheNames) {
    const cache = await caches.open(cn);
    const keys = await cache.keys();
    for (const req of keys) {
      const res = await cache.match(req);
      if (!res) continue;
      const size = await measureResponseBytes(res);
      const u = req.url;
      all.push({ cn, req, u, size, last: urlAccessMs.get(u) || 0 });
    }
  }
  let total = all.reduce((s, e) => s + e.size, 0);
  all.sort((a, b) => a.last - b.last);
  let i = 0;
  while (total > maxTotalBytes && i < all.length) {
    const e = all[i++];
    const cache = await caches.open(e.cn);
    await cache.delete(e.req);
    urlAccessMs.delete(e.u);
    total -= e.size;
  }
}

async function enforceBudgetsAfterPut(cacheName) {
  await evictLRUFromCache(cacheName, MAX_PER_CACHE_BYTES);
  await evictGlobalLRU(MAX_TOTAL_BYTES);
}

const OFFLINE_FALLBACK_PAGE = `<!DOCTYPE html>
<html lang="en" style="height:100%;font-family:system-ui,sans-serif;background:#111827;color:#e5e7eb">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline — Internet Archive Explorer</title>
<style>
body{margin:0;min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center;box-sizing:border-box}
h1{color:#fff;font-size:1.25rem}
p{color:#9ca3af;max-width:28rem;line-height:1.5}
svg{width:4rem;height:4rem;color:#06b6d4;margin-bottom:1rem}
</style>
</head>
<body>
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m-2.828-2.828a5 5 0 010-7.072M7.464 7.464A5 5 0 005.636 12m1.828 4.536a5 5 0 007.072 0"/>
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1l22 22"/></svg>
<h1>You’re offline</h1>
<p>Open the app again when you’re online to load new content from the Internet Archive. Saved Library items and cached Explore data may still be available inside the app.</p>
</body>
</html>`;

function offlineApiResponse() {
  return new Response(
    JSON.stringify({
      error: 'offline',
      message: 'The request could not be completed while offline.',
    }),
    { status: 503, headers: { 'Content-Type': 'application/json' } },
  );
}

const isImageRequest = (request) => {
  const url = new URL(request.url);
  const isImageHost = IMAGE_HOSTNAMES.includes(url.hostname);
  const isImagePath =
    url.pathname.startsWith('/services/get-item-image.php') ||
    url.pathname.startsWith('/download/');
  const isImageDestination = request.destination === 'image';
  return isImageHost && (isImagePath || isImageDestination);
};

async function putInCache(cacheName, request, response) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  touch(request.url);
  await enforceBudgetsAfterPut(cacheName);
}

/** Stale-while-revalidate for IA JSON/API responses */
function handleApiStaleWhileRevalidate(event, request) {
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_API);
      const cached = await cache.match(request);

      const networkPromise = timeoutFetch(request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            await putInCache(CACHE_API, request, networkResponse);
          }
          return networkResponse;
        })
        .catch(() => null);

      if (cached) {
        touch(request.url);
        event.waitUntil(networkPromise.then(() => undefined));
        return cached;
      }

      const fresh = await networkPromise;
      if (fresh && fresh.ok) return fresh;
      return offlineApiResponse();
    })(),
  );
}

/** Cache-first + background refresh for thumbnails */
function handleImageCacheFirst(event, request) {
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_IMAGES);
      const hit = await cache.match(request);
      if (hit) {
        touch(request.url);
        event.waitUntil(
          timeoutFetch(request)
            .then(async (res) => {
              if (res && res.ok) await putInCache(CACHE_IMAGES, request, res);
            })
            .catch(() => undefined),
        );
        return hit;
      }
      try {
        const networkResponse = await timeoutFetch(request);
        if (networkResponse && networkResponse.ok) {
          await putInCache(CACHE_IMAGES, request, networkResponse);
        }
        return networkResponse;
      } catch (e) {
        console.error('[SW] Image fetch failed:', e);
        return Response.error();
      }
    })(),
  );
}

/** Stale-while-revalidate for static / CDN assets */
function handleStaticStaleWhileRevalidate(event, request) {
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_STATIC);
      const cached = await cache.match(request);
      const fetchPromise = timeoutFetch(request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            await putInCache(CACHE_STATIC, request, networkResponse);
          }
          return networkResponse;
        })
        .catch(() => undefined);

      if (cached) {
        touch(request.url);
        event.waitUntil(fetchPromise.then(() => undefined));
        return cached;
      }
      const net = await fetchPromise;
      return net || Response.error();
    })(),
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_SHELL)
      .then((cache) => cache.addAll(urlsToPrecache))
      .catch((err) => console.error('[SW] Pre-cache failed:', err)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if ('navigationPreload' in self.registration) {
        try {
          await self.registration.navigationPreload.enable();
        } catch (e) {
          console.error('[SW] Navigation preload:', e);
        }
      }

      const keys = await caches.keys();
      const keep = new Set([CACHE_SHELL, CACHE_API, CACHE_IMAGES, CACHE_STATIC]);
      await Promise.all(
        keys.map((name) => {
          if (!keep.has(name)) {
            return caches.delete(name);
          }
        }),
      );

      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) return preloadResponse;
          return await timeoutFetch(request);
        } catch {
          const cachedResponse = await caches.open(CACHE_SHELL).then((c) => c.match(BASE_PATH));
          touch(BASE_PATH);
          return (
            cachedResponse ||
            new Response(OFFLINE_FALLBACK_PAGE, { headers: { 'Content-Type': 'text/html' } })
          );
        }
      })(),
    );
    return;
  }

  if (url.hostname.includes(API_HOSTNAME) && !isImageRequest(request)) {
    handleApiStaleWhileRevalidate(event, request);
    return;
  }

  if (isImageRequest(request)) {
    handleImageCacheFirst(event, request);
    return;
  }

  handleStaticStaleWhileRevalidate(event, request);
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'ia-library-sync') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          client.postMessage({ type: 'IA_LIBRARY_BACKGROUND_SYNC' });
        }
      }),
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
