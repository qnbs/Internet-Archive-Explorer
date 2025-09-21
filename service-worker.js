const CACHE_NAME = 'pwa-cache-v1';

// App Shell: The minimal resources needed for the app to start.
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/index.tsx',
  "data:image/svg+xml,%3csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3clinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3e%3cstop offset='0%25' style='stop-color:%2322d3ee;stop-opacity:1' /%3e%3cstop offset='100%25' style='stop-color:%230891b2;stop-opacity:1' /%3e%3c/linearGradient%3e%3c/defs%3e%3crect width='100' height='100' rx='20' fill='%23083344'/%3e%3cpath d='M 25 75 L 50 25 L 75 75' stroke='url(%23grad)' stroke-width='12' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3e%3cpath d='M 30 75 A 20 20 0 0 1 70 75' stroke='%23cffafe' stroke-width='12' stroke-linecap='round' fill='none'/%3e%3c/svg%3e"
];

// Third-party resources to cache
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

// Install event: cache the app shell and third-party resources.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching App Shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('[Service Worker] Failed to cache App Shell:', error);
      })
  );
});

// Activate event: clean up old caches.
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
    })
  );
  return self.clients.claim();
});

// Fetch event: serve from cache, falling back to network.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
      return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.status === 200 && !event.request.url.startsWith('chrome-extension://')) {
          await cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);
        if (event.request.mode === 'navigate') {
            const indexPage = await cache.match('/index.html');
            if (indexPage) return indexPage;
        }
        return new Response(null, { status: 500, statusText: "Service Worker fetch failed" });
      }
    })
  );
});