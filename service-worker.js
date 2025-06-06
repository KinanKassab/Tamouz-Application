const CACHE_NAME = 'tamouz-cache-v1';
const urlsToCache = [
  '/',
  '/download.html',
  '/app.js',
  '/manifest.json',
  '/style.css',
  '/index.html',
  '/images/Logo.png',
  '/images/icon.png',
  '/Home.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
