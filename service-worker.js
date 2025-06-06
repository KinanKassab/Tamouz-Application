const CACHE_NAME = 'tamouz-cache-v1';
const urlsToCache = [
  '/Tamouz-Application/',
  '/Tamouz-Application/download.html',
  '/Tamouz-Application/app.js',
  '/Tamouz-Application/manifest.json',
  '/Tamouz-Application/style.css',
  '/Tamouz-Application/index.html',
  '/Tamouz-Application/images/Logo.png',
  '/Tamouz-Application/images/icon.png',
  '/Tamouz-Application/Home.html',
  '/Tamouz-Application/offline.html'
];

// تثبيت الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// تفعيل وتحديث الكاش
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🧹 حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

// التعامل مع الطلبات
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() =>
          // في حال عدم وجود إنترنت
          caches.match('/Tamouz-Application/offline.html')
        )
      );
    })
  );
});
