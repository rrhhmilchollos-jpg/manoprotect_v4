// MANO - Progressive Web App Service Worker
// Version 3.0 - Optimized caching for performance

const CACHE_NAME = 'mano-pwa-v3';
const OFFLINE_URL = '/offline.html';

// Cache duration for different asset types (in seconds)
const CACHE_DURATIONS = {
  images: 30 * 24 * 60 * 60, // 30 days
  fonts: 365 * 24 * 60 * 60, // 1 year
  styles: 7 * 24 * 60 * 60,  // 7 days
  scripts: 7 * 24 * 60 * 60, // 7 days
  api: 5 * 60,               // 5 minutes
};

// Assets to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json'
];

// Image domains to cache aggressively
const IMAGE_DOMAINS = [
  'static.prod-images.emergentagent.com',
  'customer-assets.emergentagent.com',
  'images.unsplash.com',
  'upload.wikimedia.org'
];

// Dynamic cache for API responses
const API_CACHE = 'mano-api-cache-v1';
const IMAGE_CACHE = 'mano-images-v1';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing MANO PWA Service Worker v3...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] MANO PWA Service Worker v3 activated');
  
  const currentCaches = [CACHE_NAME, API_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Check if URL is an image from known domains
function isImageFromKnownDomain(url) {
  try {
    const urlObj = new URL(url);
    return IMAGE_DOMAINS.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

// Check if request is for an image
function isImageRequest(request) {
  const url = request.url;
  const acceptHeader = request.headers.get('Accept') || '';
  return acceptHeader.includes('image/') || 
         /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?.*)?$/i.test(url);
}

// Check if request is for a font
function isFontRequest(request) {
  const url = request.url;
  return /\.(woff|woff2|ttf|otf|eot)(\?.*)?$/i.test(url) ||
         url.includes('fonts.googleapis.com') ||
         url.includes('fonts.gstatic.com');
}

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle images with aggressive caching
  if (isImageRequest(request) || isImageFromKnownDomain(request.url)) {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle fonts with long-term caching
  if (isFontRequest(request)) {
    event.respondWith(handleFontRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static assets - stale-while-revalidate
  event.respondWith(handleStaticRequest(request));
});

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    // Return cached immediately, refresh in background
    refreshImageCache(request, cache);
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return placeholder for failed image loads
    return new Response('', { status: 404 });
  }
}

// Refresh image cache in background
async function refreshImageCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
  } catch (error) {
    // Silently fail - we have cached version
  }
}

// Handle font requests with cache-first strategy (long-term)
async function handleFontRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('', { status: 404 });
  }
}

// Handle static requests with stale-while-revalidate
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);
    
    // Cache GET requests
    if (request.method === 'GET' && response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Try to return cached response for GET requests
    if (request.method === 'GET') {
      const cached = await caches.match(request);
      if (cached) {
        console.log('[SW] Returning cached API response');
        return cached;
      }
    }
    
    // Return offline JSON response
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'No hay conexión a internet. Algunas funciones no están disponibles.'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return caches.match(OFFLINE_URL);
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {
    title: 'MANO - Alerta de Seguridad',
    body: 'Nueva notificación de seguridad',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'mano-notification',
    data: {}
  };
  
  try {
    if (event.data) {
      const payload = event.data.json();
      data = { ...data, ...payload };
    }
  } catch (e) {
    console.error('[SW] Error parsing push data:', e);
  }
  
  // Check if this is an SOS alert - needs urgent handling
  const isSOSAlert = data.data?.type === 'sos_alert' || data.tag?.startsWith('sos-');
  
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    tag: data.tag || 'mano-notification',
    data: data.data || {},
    vibrate: isSOSAlert ? [500, 200, 500, 200, 500, 200, 500, 200, 500] : [200, 100, 200],
    requireInteraction: isSOSAlert ? true : (data.requireInteraction || false),
    actions: data.actions || [
      { action: 'view', title: 'Ver detalles' },
      { action: 'dismiss', title: 'Descartar' }
    ],
    // Make SOS alerts more urgent
    urgent: isSOSAlert,
    renotify: isSOSAlert,
    silent: false
  };
  
  // For SOS alerts, try to open the alert page immediately
  if (isSOSAlert) {
    const alertUrl = data.data?.url || `/sos-alert?alert=${data.data?.alert_id || ''}`;
    
    event.waitUntil(
      Promise.all([
        // Show the notification
        self.registration.showNotification(data.title, options),
        // Try to open or focus a window with the alert
        clients.matchAll({ type: 'window', includeUncontrolled: true })
          .then((windowClients) => {
            // If there's already an open window, navigate it to the alert
            for (const client of windowClients) {
              if (client.url.includes(self.location.origin) && 'focus' in client) {
                client.postMessage({
                  type: 'SOS_ALERT',
                  data: data.data,
                  url: alertUrl
                });
                return client.focus();
              }
            }
            // Otherwise, open a new window
            if (clients.openWindow) {
              return clients.openWindow(alertUrl);
            }
          })
      ])
    );
  } else {
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing window if available
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-threat-reports') {
    event.waitUntil(syncThreatReports());
  }
});

async function syncThreatReports() {
  // Get queued reports from IndexedDB
  const db = await openDB();
  const reports = await db.getAll('pending-reports');
  
  for (const report of reports) {
    try {
      await fetch('/api/threats/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      await db.delete('pending-reports', report.id);
    } catch (error) {
      console.error('[SW] Failed to sync report:', error);
    }
  }
}

// Periodic background sync for checking threats
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-threats') {
    event.waitUntil(checkForNewThreats());
  }
});

async function checkForNewThreats() {
  try {
    const response = await fetch('/api/community/alerts/recent');
    const alerts = await response.json();
    
    if (alerts.length > 0) {
      await self.registration.showNotification('Nuevas Amenazas Detectadas', {
        body: `Se han detectado ${alerts.length} nuevas amenazas en tu zona`,
        icon: '/icons/icon-192x192.png',
        tag: 'community-alert'
      });
    }
  } catch (error) {
    console.error('[SW] Failed to check threats:', error);
  }
}

// Simple IndexedDB wrapper for offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('mano-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      resolve({
        getAll: (store) => new Promise((res, rej) => {
          const tx = db.transaction(store, 'readonly');
          const req = tx.objectStore(store).getAll();
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        }),
        delete: (store, key) => new Promise((res, rej) => {
          const tx = db.transaction(store, 'readwrite');
          const req = tx.objectStore(store).delete(key);
          req.onsuccess = () => res();
          req.onerror = () => rej(req.error);
        })
      });
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pending-reports')) {
        db.createObjectStore('pending-reports', { keyPath: 'id' });
      }
    };
  });
}

console.log('[SW] MANO PWA Service Worker loaded');
