const CACHE_NAME = 'calc-tools-v0.2.2';
const urlsToCache = [
  '/keisan/',
  '/keisan/index.html',
  '/keisan/bunsuu/index.html',
  '/keisan/sisokuenzan/index.html',
  '/keisan/manifest.json',
  '/keisan/icons/icon-192.png',
  '/keisan/icons/icon-512.png'
];

// インストール時にキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // 即時有効化
});

// アクティブ化（古いキャッシュの削除）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim(); // クライアントを即座に制御
});

// fetch時のキャッシュ優先 ＋ フォールバック対応
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // キャッシュにあれば返す
      }

      return fetch(event.request).catch(() => {
        // ナビゲーション時は index.html を返す（オフライン対策）
        if (event.request.mode === 'navigate') {
          return caches.match('/keisan/index.html');
        }
      });
    })
  );
});

console.log('Service Worker version: v0.2.2');
