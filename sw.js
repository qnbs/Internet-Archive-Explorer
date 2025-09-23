const CACHE_NAME = 'internet-archive-explorer-v4';
const API_HOSTNAME = 'archive.org';

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

const THIRD_PARTY_URLS = [
  'https://cdn.tailwindcss.com?plugins=typography,aspect-ratio',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
];

const urlsToCache = [...APP_SHELL_URLS, ...THIRD_PARTY_URLS];

const offlineFallback = new Response(`
<!DOCTYPE html>
<html lang="en" style="height: 100%;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - Internet Archive Explorer</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
      background-color: #111827; 
      color: #d1d5db; 
      text-align: center; 
      padding: 50px;
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    h1 { color: #fff; }
    svg { width: 80px; height: 80px; margin-bottom: 20px; color: #06b6d4; }
  </style>
</head>
<body>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  <h1>You are offline</h1>
  <p>This page cannot be loaded right now. Please check your internet connection.</p>
  <p>Previously visited pages may still be available.</p>
</body>
</html>`, {
  headers: { 'Content-Type': 'text/html; charset=utf-8' }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching App Shell');
      return cache.addAll(urlsToCache).catch(err => {
        console.error('[SW] App shell caching failed:', err);
      });
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Strategy for API calls (archive.org): Network first, then Cache.
  if (url.hostname.includes(API_HOSTNAME)) {
    event.respondWith(
        fetch(request)
            .then(networkResponse => {
                if (networkResponse && networkResponse.ok) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(async () => {
                console.warn(`[SW] Network failed for API call to ${request.url}. Serving from cache.`);
                const cachedResponse = await caches.match(request);
                return cachedResponse || new Response(JSON.stringify({ error: 'offline' }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                });
            })
    );
    return;
  }
  
  // Strategy for all other requests (app shell, CDN assets): Cache first, then Network.
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
            });
        }
        return networkResponse;
      }).catch(error => {
        console.error('[SW] Fetch failed:', error);
        if (request.mode === 'navigate') {
          return offlineFallback;
        }
      });
    })
  );
});