const CACHE_NAME = 'fajarpdf-pwa-v1.4e';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js'
];

// 1. Install & cache aset awal (tanpa membuat instalasi gagal jika ada CDN yang lambat)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE.map(url => new Request(url, { mode: 'no-cors' })))
        .catch(err => console.log('Cache addAll partial error:', err));
    })
  );
  self.skipWaiting();
});

// 2. Bersihkan cache versi lama secara otomatis
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// 3. Strategi SMART FETCH: Utamakan ambil dari internet untuk update terbaru, 
// fallback ke cache jika offline.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Jika internet aktif, perbarui cache dengan file terbaru dari server/GitHub secara senyap
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Jika sedang offline, ambil dari cache penyimpanan HP
        return caches.match(event.request);
      })
  );
});
