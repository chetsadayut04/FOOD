// Service Worker สำหรับ PWA (Offline Support & Caching)
const CACHE_NAME = 'meal-planner-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './data.js',
  './planner.js',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon.svg'
];

// ติดตั้ง Service Worker และบันทึกไฟล์แคช
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// เปิดใช้งาน Service Worker และล้างแคชเก่าที่หมดอายุ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// จัดการการดึงข้อมูล (Network-first with Cache fallback)
self.addEventListener('fetch', (event) => {
  // ข้าม request ที่ไม่ใช่ GET หรือมาจาก chrome-extension
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // เมื่อดึงข้อมูลจากเน็ตสำเร็จ อัปเดตไฟล์ในแคชด้วย
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // เมื่อออฟไลน์ ไม่มีเน็ต ดึงไฟล์จากแคชมาแสดงแทน
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // ถ้าเป็นหน้า HTML ให้คืน index.html
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});

