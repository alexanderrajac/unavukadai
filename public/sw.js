// Unavukadai High-Performance Service Worker & Offline Caching Engine
const STATIC_CACHE = 'unavukadai-static-v3';
const DATA_CACHE = 'unavukadai-data-v3';
const IMAGE_CACHE = 'unavukadai-images-v3';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/unavu-icon.svg',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching asset warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      const activeCaches = [STATIC_CACHE, DATA_CACHE, IMAGE_CACHE];
      return Promise.all(
        keys.filter((key) => !activeCaches.includes(key)).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Bypass for non-GET, SSE streams, Supabase, Railway, and mutation endpoints
  if (
    request.method !== 'GET' ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('railway.app') ||
    request.headers.get('accept')?.includes('text/event-stream') ||
    url.pathname.includes('/api/orders') ||
    url.pathname.includes('/api/auth')
  ) {
    return;
  }

  // 1. Navigation requests (HTML) -> Network First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // 2. Offline caching for Menus & Restaurants data (/api/restaurants, /api/menu)
  if (url.pathname.includes('/api/restaurants') || url.pathname.includes('/api/menu')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DATA_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Serve cached menus/restaurants when offline
          return caches.match(request);
        })
    );
    return;
  }

  // 3. Dish & Restaurant Images (Unsplash, local images, icons) -> Stale While Revalidate
  if (
    request.destination === 'image' ||
    url.hostname.includes('unsplash.com') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif)$/i)
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 4. Static scripts & CSS assets -> Stale While Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
