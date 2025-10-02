// Very small, cache-first SW for offline demo
const CACHE_NAME = 'pt-pdf-filler-v1';

// List routes you need offline: app shell + your templates
const APP_SHELL = [
  '/',                    // Vite preview serves index here
  '/index.html',          // safety
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// If you have fixed template names, list them here to pre-cache:
const TEMPLATE_FILES = [
  '/templates/GirlingTemplate.pdf',
  '/templates/OASIS_Discharge.pdf',
  '/templates/AmericareInfiniteTemplate.pdf',
  '/templates/ExtendedTemplate.pdf',
  '/templates/OASIS.pdf',
  '/templates/RevivalTemplate.pdf',
  '/templates/YourChoiceTemplate.pdf',
  // add more templates here…
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([...APP_SHELL, ...TEMPLATE_FILES])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Cache-first for GET requests (good enough for demo)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        // put a copy in cache (best-effort)
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
