const CACHE_NAME = 'tamouz-scouts-v2.1';
const STATIC_CACHE = 'tamouz-static-v2.1';
const DYNAMIC_CACHE = 'tamouz-dynamic-v2.1';
const IMAGE_CACHE = 'tamouz-images-v2.1';

// الملفات الأساسية للتخزين المؤقت
const STATIC_ASSETS = [
  '/',
  '/Main.html',
  '/Main.css',
  '/Main.js',
  '/manifest.json',
  '/offline.html',
  '/pages/home.html',
  '/pages/schedule.html',
  '/pages/guide.html',
  '/pages/songs.html',
  '/pages/info.html',
  '/pages/settings.html',
  '/Logo.png',
  '/images/Profiles/Kinan.jpg'
];

// الملفات الديناميكية
const DYNAMIC_ASSETS = [
  '/api/',
  '/data/'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 تثبيت Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // تخزين الملفات الثابتة
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 تخزين الملفات الثابتة...');
        return cache.addAll(STATIC_ASSETS);
      }),
      // إجبار التفعيل الفوري
      self.skipWaiting()
    ])
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ تفعيل Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // حذف الكاش القديم
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('🗑️ حذف الكاش القديم:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // السيطرة على جميع العملاء
      self.clients.claim()
    ])
  );
});

// التعامل مع طلبات الشبكة
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل الطلبات الخارجية
  if (url.origin !== location.origin) {
    return;
  }

  // استراتيجية Cache First للملفات الثابتة
  if (STATIC_ASSETS.some(asset => url.pathname.includes(asset))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // استراتيجية Network First للصور
  if (request.destination === 'image') {
    event.respondWith(networkFirstImages(request));
    return;
  }

  // استراتيجية Network First للبيانات الديناميكية
  if (DYNAMIC_ASSETS.some(asset => url.pathname.includes(asset))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // استراتيجية Stale While Revalidate للباقي
  event.respondWith(staleWhileRevalidate(request));
});

// استراتيجية Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('خطأ في Cache First:', error);
    return await caches.match('/offline.html');
  }
}

// استراتيجية Network First للصور
async function networkFirstImages(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // إرجاع صورة افتراضية
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#e0e0e0"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#999">صورة غير متاحة</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// استراتيجية Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || await caches.match('/offline.html');
  }
}

// استراتيجية Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// التعامل مع رسائل العميل
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// إشعارات Push
self.addEventListener('push', (event) => {
  console.log('📬 تم استلام إشعار Push');
  
  const options = {
    body: event.data ? event.data.text() : 'إشعار جديد من كشافة تموز',
    icon: '/images/icon-192.png',
    badge: '/images/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'عرض التفاصيل',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: '/images/xmark.png'
      }
    ],
    requireInteraction: true,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification('كشافة تموز', options)
  );
});

// التعامل مع النقر على الإشعارات
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 تم النقر على الإشعار');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // لا حاجة لفعل شيء
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// مزامنة البيانات في الخلفية
self.addEventListener('sync', (event) => {
  console.log('🔄 مزامنة البيانات في الخلفية');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // مزامنة بيانات الحضور
    const attendanceData = await getStoredAttendanceData();
    if (attendanceData.length > 0) {
      await syncAttendanceData(attendanceData);
    }

    // مزامنة البيانات الأخرى
    console.log('✅ تمت المزامنة بنجاح');
  } catch (error) {
    console.error('❌ فشل في المزامنة:', error);
  }
}

async function getStoredAttendanceData() {
  // استرجاع بيانات الحضور المحفوظة محلياً
  return [];
}

async function syncAttendanceData(data) {
  // مزامنة بيانات الحضور مع الخادم
  console.log('مزامنة بيانات الحضور:', data);
}

// تنظيف الكاش القديم
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupOldCache());
  }
});

async function cleanupOldCache() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith('tamouz-') && name !== STATIC_CACHE && 
    name !== DYNAMIC_CACHE && name !== IMAGE_CACHE
  );
  
  await Promise.all(oldCaches.map(name => caches.delete(name)));
  console.log('🧹 تم تنظيف الكاش القديم');
}