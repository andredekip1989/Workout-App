const CACHE = 'workout-v1';
const FILES = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Navigation requests (HTML pages) should fall back to index.html when offline
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(response => {
        // If we get a valid response, return it and also update the cache
        return caches.open(CACHE).then(cache => {
          cache.put(e.request, response.clone());
          return response;
        });
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For other requests, try cache first then network
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
