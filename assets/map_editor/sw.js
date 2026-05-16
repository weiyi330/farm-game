// Service Worker - 游戏地图编辑器
const CACHE_NAME = 'map-editor-v6';
const ASSETS = [
  '/farm-game/assets/map_editor/map_editor.html',
  '/farm-game/assets/map_editor/manifest.json',
  '/farm-game/assets/map_editor/icons/icon-192.png',
  '/farm-game/assets/map_editor/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
