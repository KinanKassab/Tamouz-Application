const CACHE_NAME = "scout-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/landing.html",
  "/index.html",
  "/landing-style.css",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/images/icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
