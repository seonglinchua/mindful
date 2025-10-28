/**
 * Service Worker for offline support
 * Caches static assets and enables offline functionality
 */

const CACHE_NAME = 'mindful-v1';
const STATIC_CACHE = 'mindful-static-v1';
const DYNAMIC_CACHE = 'mindful-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== STATIC_CACHE && name !== DYNAMIC_CACHE;
          })
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle API requests differently (network-first)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle static assets (cache-first)
  event.respondWith(cacheFirst(request));
});

/**
 * Cache-first strategy: Check cache first, fallback to network
 * Best for static assets that don't change often
 */
async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    const response = await fetch(request);

    // Cache successful responses
    if (response && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);

    // Return cached version if available
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return offline page or error response
    return new Response('Offline - content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    });
  }
}

/**
 * Network-first strategy: Try network first, fallback to cache
 * Best for API requests that need fresh data
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Service Worker] Network request failed:', error);

    // Fallback to cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    return new Response('Offline - data not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

/**
 * Sync offline data when connection is restored
 */
async function syncOfflineData() {
  try {
    console.log('[Service Worker] Syncing offline data...');
    // Implement your sync logic here
    // For example, send queued journal entries, mood data, etc.
    return Promise.resolve();
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    return Promise.reject(error);
  }
}

// Handle push notifications (for future reminder feature)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    tag: 'mindful-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification('Mindful', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});
