const CACHE_NAME = 'husti-cache-v2';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=4',
  './script.js',
  './supabase-config.js',
  './icon.svg?v=4',
  './manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
