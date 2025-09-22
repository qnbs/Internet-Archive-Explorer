const CACHE_NAME = 'internet-archive-explorer-v2';
const API_HOSTNAME = 'archive.org';

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

const THIRD_PARTY_URLS = [
  'https://cdn.tailwindcss.com?plugins=typography,aspect-ratio',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
];

const urlsToCache = [...APP_SHELL_URLS, ...THIRD_PARTY_URLS];

// Install event: Caches the app shell and third-party assets.
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

// Activate event: Cleans up old caches to ensure the user always has the latest version.
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

// Fetch event: Implements caching strategies.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests or non-http/https requests.
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Strategy for API calls (archive.org): Network first, then Cache.
  // This ensures data is fresh but provides an offline fallback.
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
  // This is fast and provides a reliable offline experience for static assets.
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
          return caches.match('/');
        }
      });
    })
  );
});