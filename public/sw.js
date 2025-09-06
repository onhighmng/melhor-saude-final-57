const CACHE_NAME = 'melhor-saude-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Critical resources to cache immediately
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico'
];

// Cache strategies for different resource types
const cacheStrategies = {
  images: { strategy: 'cache-first', cacheName: STATIC_CACHE },
  api: { strategy: 'network-first', cacheName: DYNAMIC_CACHE },
  static: { strategy: 'cache-first', cacheName: STATIC_CACHE },
  pages: { strategy: 'stale-while-revalidate', cacheName: DYNAMIC_CACHE }
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('SW: Installing and caching critical resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('SW: Skip waiting on install');
        return self.skipWaiting();
      })
  );
});

// Helper function to get cache strategy based on request
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // Images (including uploads)
  if (request.destination === 'image' || url.pathname.includes('/lovable-uploads/')) {
    return cacheStrategies.images;
  }
  
  // API calls
  if (url.pathname.includes('/functions/') || url.hostname.includes('supabase')) {
    return cacheStrategies.api;
  }
  
  // Static assets
  if (request.destination === 'script' || request.destination === 'style' || 
      url.pathname.includes('/assets/') || url.pathname.includes('.js') || url.pathname.includes('.css')) {
    return cacheStrategies.static;
  }
  
  // Pages and navigation
  return cacheStrategies.pages;
}

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('SW: Network failed, no cached version available');
    throw error;
  }
}

// Network-first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('SW: Network failed, trying cache');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Fetch event with intelligent caching strategies
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  const strategy = getCacheStrategy(event.request);
  
  event.respondWith(
    (async () => {
      try {
        switch (strategy.strategy) {
          case 'cache-first':
            return await cacheFirst(event.request, strategy.cacheName);
          case 'network-first':
            return await networkFirst(event.request, strategy.cacheName);
          case 'stale-while-revalidate':
            return await staleWhileRevalidate(event.request, strategy.cacheName);
          default:
            return fetch(event.request);
        }
      } catch (error) {
        console.log('SW: Fetch failed:', error);
        // Fallback for navigation requests
        if (event.request.destination === 'document') {
          const cachedIndex = await caches.match('/');
          if (cachedIndex) {
            return cachedIndex;
          }
        }
        throw error;
      }
    })()
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('SW: Background sync triggered');
    // Add background sync logic here if needed
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    };
    
    event.waitUntil(
      self.registration.showNotification('Melhor Saúde', options)
    );
  }
});