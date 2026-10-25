// KisanMandi Service Worker for Mobile PWA Installation
const CACHE_NAME = 'kisanmandi-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/icon.svg'
      ]).catch(() => {
        // Cache failures during development should not break install
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network requests pass through normally
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
