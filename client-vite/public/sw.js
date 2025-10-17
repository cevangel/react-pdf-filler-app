// Robust PWA Service Worker for PDF Filler App
// CHANGED: Updated cache name from v1 to v2 to force cache refresh
const CACHE_NAME = 'pt-pdf-filler-v5';

// App shell files that should be cached
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
];

// Template PDF files found in /public/templates
// CHANGED: Updated list with actual files found in directory (removed OASIS_Discharge.pdf, added OASISprev.pdf and TestTemplate.pdf)
const TEMPLATE_FILES = [
  '/templates/AmericareInfiniteTemplate.pdf',
  '/templates/ExtendedTemplate.pdf',
  '/templates/GirlingTemplate.pdf',
  '/templates/OASIS.pdf',
  '/templates/OASISprev.pdf',
  '/templates/RevivalTemplate.pdf',
  '/templates/TestTemplate.pdf',
  '/templates/YourChoiceTemplate.pdf',
  '/templates/YourChoiceTx.pdf',
  '/templates/RevivalTx.pdf',
];

// CHANGED: Added comprehensive console logging for debugging
console.log('SW: Installing with cache name:', CACHE_NAME);
console.log('SW: Template files to cache:', TEMPLATE_FILES);

// Install event - cache app shell and templates
self.addEventListener('install', (event) => {
  console.log('SW: Install event triggered');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('SW: Opened cache:', CACHE_NAME);
      
      // Cache app shell files
      const allFiles = [...APP_SHELL, ...TEMPLATE_FILES];
      console.log('SW: Attempting to cache', allFiles.length, 'files');
      
      // CHANGED: Replaced cache.addAll() with individual fetch/put to prevent single failure from breaking entire cache
      for (const url of allFiles) {
        try {
          console.log('SW: Fetching:', url);
          const response = await fetch(url, { cache: 'reload' });
          
          if (response.ok) {
            await cache.put(url, response.clone());
            console.log('SW: Successfully cached:', url);
          } else {
            console.warn('SW: Failed to cache (not ok):', url, response.status);
          }
        } catch (error) {
          console.warn('SW: Failed to cache (network error):', url, error.message);
        }
      }
      
      console.log('SW: Install completed');
    })
  );
  
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activate event triggered');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('SW: Found caches:', cacheNames);
      
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // CHANGED: Added clients.claim() to immediately take control of all clients
      console.log('SW: Activation completed, claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // CHANGED: Ignore chrome-extension and other non-http(s) requests
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  
  // CHANGED: Added specific handling for navigation requests (SPA routing)
  if (request.mode === 'navigate') {
    console.log('SW: Handling navigation request:', url.pathname);
    
    event.respondWith(
      caches.match('/index.html').then((cachedResponse) => {
        if (cachedResponse) {
          console.log('SW: Serving cached index.html for navigation');
          return cachedResponse;
        }
        
        // Fallback to network
        return fetch(request).catch(() => {
          console.log('SW: Network failed for navigation, serving index.html');
          return caches.match('/index.html');
        });
      })
    );
    return;
  }
  
  // CHANGED: Completely rewrote fetch handler with cache-first strategy and smart fallbacks
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('SW: Cache hit for:', url.pathname);
        return cachedResponse;
      }
      
      console.log('SW: Cache miss, fetching from network:', url.pathname);
      
      return fetch(request).then((response) => {
        // Only cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
            console.log('SW: Cached network response:', url.pathname);
          });
        }
        
        return response;
      }).catch((error) => {
        console.log('SW: Network failed for:', url.pathname, error.message);
        
        // CHANGED: Special handling for template requests - return 503 instead of SPA fallback
        if (url.pathname.startsWith('/templates/')) {
          console.log('SW: Template not available offline:', url.pathname);
          return new Response('Template not available offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        }
        
        // For other requests, try to serve index.html as fallback
        return caches.match('/index.html');
      });
    })
  );
});

console.log('SW: Service worker script loaded');