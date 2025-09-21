const CACHE_NAME = 'pwa-cache-v2';

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/index.tsx',
];

const THIRD_PARTY_URLS = [
  'https://cdn.tailwindcss.com?plugins=typography,aspect-ratio',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://aistudiocdn.com/@google/genai@^1.19.0',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/jotai@^2.14.0',
  'https://aistudiocdn.com/uuid@^13.0.0',
  'https://aistudiocdn.com/react-dom@^19.1.1',
  'https://aistudiocdn.com/vite@^7.1.5',
  'https://aistudiocdn.com/path@^0.12.7',
  'https://aistudiocdn.com/@vitejs/plugin-react@^5.0.2'
];

const urlsToCache = [...APP_SHELL_URLS, ...THIRD_PARTY_URLS];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching App Shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('[Service Worker] Failed to cache resources:', error);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Use a network-first strategy for API calls.
  if (url.hostname.includes('archive.org')) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(async () => {
          // If the network fails, try the cache.
          const cachedResponse = await caches.match(request);
          return cachedResponse || new Response(JSON.stringify({ offline: true }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }
  
  // Use a cache-first strategy for all other requests.
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Return the cached response if it exists.
        if (cachedResponse) {
          return cachedResponse;
        }
        // If not, fetch from the network, cache it, and return it.
        return fetch(request).then(networkResponse => {
          if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
      .catch(error => {
        console.error('[SW] Fetch failed:', error);
        // If a navigation request fails and is not in cache, return the offline page.
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});