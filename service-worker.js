/**
 * Service Worker for Color Palette Generator
 * Enables offline functionality
 */

const CACHE_NAME = 'color-palette-cache-v1.2';

// Get the base URL for relative paths
const getScope = () => {
  return self.registration.scope;
};

// Create a function to normalize URLs
const normalizeUrl = (url) => {
  // If the URL is already absolute, return it
  if (url.startsWith('http')) {
    return url;
  }
  
  // If the URL starts with a slash, make it relative to the scope
  if (url.startsWith('/')) {
    const baseUrl = new URL(getScope());
    return new URL(url.substring(1), baseUrl).href;
  }
  
  // Otherwise, it's already relative to the scope
  return new URL(url, getScope()).href;
};

// Assets to cache - using relative paths
const RELATIVE_ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './css/palette-generator.css',
  './css/saved-palettes.css',
  './css/camera-capture.css',
  './js/app.js',
  './js/utils/color-converter.js',
  './js/utils/harmony-generator.js',
  './js/utils/image-color-extractor.js',
  './js/services/storage-service.js',
  './js/components/camera-capture.js',
  './js/components/palette-generator.js',
  './js/components/saved-palettes.js',
  './lib/dexie.min.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    self.registration.scope.then(scope => {
      // Convert relative paths to absolute URLs based on the scope
      const assetsToCache = RELATIVE_ASSETS_TO_CACHE.map(url => normalizeUrl(url));
      
      return caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Opened cache');
          return cache.addAll(assetsToCache);
        })
        .then(() => self.skipWaiting());
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        // Make network request and cache the response
        return fetch(fetchRequest).then(response => {
          // Don't cache if not a valid response or not a GET request
          if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== 'GET') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Open cache and store response
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});
