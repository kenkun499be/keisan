const CACHE_NAME = 'calc-tools-v0.2.6';
const urlsToCache = [
  '/keisan/',
  '/keisan/index.html',
  '/keisan/bunsuu/index.html',
  '/keisan/sisokuenzan/index.html',
  '/keisan/manifest.json',
  '/keisan/icons/icon-192.png',
  '/keisan/icons/icon-512.png'
];

console.log('Service Worker version: v0.2.4');

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

// fetch時の stale-while-revalidate パターン
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // 成功時はキャッシュを更新
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            event.request.method === 'GET' &&
            !event.request.url.includes('chrome-extension')
          ) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // オフライン時
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return cache.match('/keisan/index.html');
          }
        });

        // キャッシュがあれば即返す、なければネットワーク
        return cachedResponse || fetchPromise;
      });
    })
  );
});
