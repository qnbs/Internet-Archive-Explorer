// A robust, production-ready service worker for the PWA.
const CACHE_NAME = 'internet-archive-explorer-v4'; // Bump version for updates
const API_HOSTNAME = 'archive.org';
const IMAGE_HOSTNAMES = ['archive.org']; // Can add more if needed
const NETWORK_TIMEOUT_MS = 15000;

const BASE_PATH = new URL(self.registration.scope).pathname;

// App Shell: Critical assets that make the app run.
const APP_SHELL_URLS = [BASE_PATH, `${BASE_PATH}index.html`];

// Third-party assets that are critical for the app to function.
const THIRD_PARTY_URLS = [
  'https://cdn.tailwindcss.com?plugins=typography,aspect-ratio',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://aistudiocdn.com/@google/genai@^1.19.0',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/jotai@^2.14.0',
  'https://aistudiocdn.com/uuid@^13.0.0',
  'https://aistudiocdn.com/react-dom@^19.1.1',
];

const urlsToCache = [...APP_SHELL_URLS, ...THIRD_PARTY_URLS];

const timeoutFetch = async (request, timeoutMs = NETWORK_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const OFFLINE_FALLBACK_PAGE = `
<!DOCTYPE html>
<html lang="en" style="height: 100%; font-family: sans-serif; background-color: #111827; color: #d1d5db;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - Internet Archive Explorer</title>
  <style>
    body { text-align: center; padding: 2rem; margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; box-sizing: border-box;}
    h1 { color: #fff; }
    svg { width: 5rem; height: 5rem; margin-bottom: 1rem; color: #06b6d4; }
  </style>
</head>
<body>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m-2.828-2.828a5 5 0 010-7.072M7.464 7.464A5 5 0 005.636 12m1.828 4.536a5 5 0 007.072 0" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1l22 22" />
  </svg>
  <h1>You are offline</h1>
  <p>An internet connection is required to fetch new data.</p>
  <p>Previously visited pages may still be available from the cache.</p>
</body>
</html>`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error('[SW] Pre-caching failed:', err);
      }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload if it's supported.
      if ('navigationPreload' in self.registration) {
        try {
          await self.registration.navigationPreload.enable();
        } catch (e) {
          console.error('[SW] Navigation Preload could not be enabled:', e);
        }
      }

      // Clean up old caches.
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );

      await self.clients.claim();

      // Notify all clients that a new SW version is now active
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_NAME }));
    })(),
  );
});

const isImageRequest = (request) => {
  const url = new URL(request.url);
  const isImageHost = IMAGE_HOSTNAMES.includes(url.hostname);
  const isImagePath =
    url.pathname.startsWith('/services/get-item-image.php') ||
    url.pathname.startsWith('/download/');
  const isImageDestination = request.destination === 'image';
  return isImageHost && (isImagePath || isImageDestination);
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests or requests to Chrome extensions
  if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // Strategy 1: Navigation requests -> Network-First with Preload & Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }
          return await timeoutFetch(request);
        } catch {
          const cachedResponse = await caches.match(BASE_PATH);
          return (
            cachedResponse ||
            new Response(OFFLINE_FALLBACK_PAGE, { headers: { 'Content-Type': 'text/html' } })
          );
        }
      })(),
    );
    return;
  }

  // Strategy 2: API calls -> Cache-First
  if (url.hostname.includes(API_HOSTNAME) && !isImageRequest(request)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await timeoutFetch(request);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          console.error('[SW] API fetch failed and no cache was available:', error);
          return new Response(
            JSON.stringify({
              error: 'offline',
              message: 'The request could not be completed while offline.',
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
      }),
    );
    return;
  }

  // Strategy 3: Image requests -> Cache-First
  if (isImageRequest(request)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Not in cache, fetch from network and cache it
        const networkResponse = await timeoutFetch(request);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }),
    );
    return;
  }

  // Strategy 4: All other assets (static files, CDNs) -> Stale-While-Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request);

      const fetchPromise = timeoutFetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, but we might have a cached response
        });

      return cachedResponse || fetchPromise;
    }),
  );
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Full app reset: clear all caches, unregister SW, then reply so client can reload
  if (event.data && event.data.type === 'RESET_APP') {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.registration.unregister())
        .then(() => {
          if (event.source) event.source.postMessage({ type: 'RESET_APP_DONE' });
        })
        .catch((err) => console.error('[SW] RESET_APP failed:', err)),
    );
  }
});
