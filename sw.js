const CACHE_NAME = 'internet-archive-explorer-v5';
const API_HOSTNAME = 'archive.org';
const CDN_HOSTNAME = 'aistudiocdn.com';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://cdn.tailwindcss.com?plugins=typography,aspect-ratio',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1',
  'https://aistudiocdn.com/jotai@^2.14.0',
  'https://aistudiocdn.com/@google/genai@^1.19.0'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Opened cache');
      return Promise.all(
        STATIC_ASSETS.map(url => cache.add(url).catch(err => console.warn(`[SW] Failed to cache ${url}:`, err)))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  // Navigation strategy: Network First, then Cache for the app shell.
  // This is the most important change to fix the "stale app" problem.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        // Serve the cached app shell if offline
        return caches.match('/'); 
      })
    );
    return;
  }

  // API strategy: Network First, then Cache.
  if (url.hostname.includes(API_HOSTNAME)) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response(null, { status: 503, statusText: 'Service Unavailable' });
          });
        })
    );
    return;
  }

  // Static assets strategy (JS, CSS, CDN, etc.): Cache First, then Network.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});