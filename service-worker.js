const CACHE_NAME = 'calc-tools-v1';
const urlsToCache = [
  '/',
  '/keisan/index.html',
  '/keisan/bunsuu/index.html',
  '/keisan/sisokuenzan/index.html',
  '/keisan/manifest.json',
  '/keisan/icons/icon-192.png',
  '/keisan/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
