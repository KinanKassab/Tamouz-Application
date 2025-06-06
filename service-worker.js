const CACHE_NAME = 'scout-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/Download.html',
  '/index.html',
  '/manifest.json',
  '/style.css',
  '/app.js',
  '/images/icon.png',
  '/service-worker.js',
  // أي ملفات إضافية تحتاجها
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
