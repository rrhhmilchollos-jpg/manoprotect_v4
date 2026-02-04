// ManoProtect - Progressive Web App Service Worker
// Version 4.0 - PWABuilder Optimized
// Cumple con todos los requisitos de PWABuilder para stores

const CACHE_VERSION = 'v4';
const CACHE_NAME = `manoprotect-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';
const OFFLINE_IMAGE = '/icons/offline-image.svg';

// Caches especializados
const CACHES = {
  static: `manoprotect-static-${CACHE_VERSION}`,
  images: `manoprotect-images-${CACHE_VERSION}`,
  api: `manoprotect-api-${CACHE_VERSION}`,
  fonts: `manoprotect-fonts-${CACHE_VERSION}`
};

// Assets críticos para precache (offline first)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/manoprotect_logo.png',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Rutas que deben funcionar offline
const OFFLINE_ROUTES = [
  '/dashboard',
  '/sos-quick',
  '/contacts',
  '/profile'
];

// ============================================
// INSTALL EVENT - Precache critical assets
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing ManoProtect Service Worker v4...');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHES.static);
      
      // Precache assets con manejo de errores individual
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (url) => {
          try {
            await cache.add(url);
            console.log(`[SW] Cached: ${url}`);
          } catch (error) {
            console.warn(`[SW] Failed to cache: ${url}`, error);
          }
        })
      );
      
      // Forzar activación inmediata
      await self.skipWaiting();
      console.log('[SW] Installation complete');
    })()
  );
});

// ============================================
// ACTIVATE EVENT - Clean old caches
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating ManoProtect Service Worker v4...');
  
  event.waitUntil(
    (async () => {
      // Limpiar caches antiguos
      const cacheNames = await caches.keys();
      const validCaches = Object.values(CACHES);
      
      await Promise.all(
        cacheNames
          .filter(name => name.startsWith('manoprotect-') && !validCaches.includes(name))
          .map(name => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
      
      // Tomar control de todas las páginas abiertas
      await self.clients.claim();
      console.log('[SW] Activation complete');
    })()
  );
});

// ============================================
// FETCH EVENT - Smart caching strategies
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar requests de extensiones del navegador
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Estrategia según tipo de recurso
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isFontRequest(request)) {
    event.respondWith(handleFontRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// ============================================
// NAVIGATION HANDLER - Network first, offline fallback
// ============================================
async function handleNavigationRequest(request) {
  try {
    // Intentar red primero
    const networkResponse = await fetch(request);
    
    // Cachear respuesta exitosa
    if (networkResponse.ok) {
      const cache = await caches.open(CACHES.static);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation offline, checking cache...');
    
    // Buscar en cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Devolver página offline
    const offlinePage = await caches.match(OFFLINE_URL);
    if (offlinePage) {
      return offlinePage;
    }
    
    // Fallback HTML básico
    return new Response(
      `<!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ManoProtect - Sin conexión</title>
        <style>
          body { font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          h1 { color: #6366f1; }
          p { color: #666; }
          button { background: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>📱 ManoProtect</h1>
        <p>No hay conexión a internet.</p>
        <p>Verifica tu conexión e intenta de nuevo.</p>
        <button onclick="location.reload()">Reintentar</button>
      </body>
      </html>`,
      { 
        status: 200, 
        headers: { 'Content-Type': 'text/html; charset=utf-8' } 
      }
    );
  }
}

// ============================================
// API HANDLER - Network first with cache fallback
// ============================================
async function handleApiRequest(request) {
  const cache = await caches.open(CACHES.api);
  
  try {
    const networkResponse = await fetch(request, {
      credentials: 'include'
    });
    
    // Cachear solo respuestas exitosas de GET
    if (networkResponse.ok && request.method === 'GET') {
      // Clonar antes de cachear
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] API offline, checking cache...');
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      // Añadir header para indicar que es cached
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Cache-Status', 'HIT');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers
      });
    }
    
    // Respuesta offline para APIs
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'Sin conexión. Datos no disponibles.',
        offline: true
      }),
      {
        status: 503,
        headers: { 
          'Content-Type': 'application/json',
          'X-Cache-Status': 'OFFLINE'
        }
      }
    );
  }
}

// ============================================
// IMAGE HANDLER - Cache first, network refresh
// ============================================
async function handleImageRequest(request) {
  const cache = await caches.open(CACHES.images);
  
  // Buscar en cache primero
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Refrescar en background
    refreshCache(request, cache);
    return cachedResponse;
  }
  
  // Si no está en cache, fetch
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Devolver placeholder para imágenes fallidas
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect fill="#f0f0f0" width="200" height="200"/>
        <text fill="#999" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle">
          Sin conexión
        </text>
      </svg>`,
      { 
        headers: { 'Content-Type': 'image/svg+xml' } 
      }
    );
  }
}

// ============================================
// FONT HANDLER - Cache first (fonts rarely change)
// ============================================
async function handleFontRequest(request) {
  const cache = await caches.open(CACHES.fonts);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('', { status: 404 });
  }
}

// ============================================
// STATIC HANDLER - Stale while revalidate
// ============================================
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHES.static);
  
  const cachedResponse = await cache.match(request);
  
  // Fetch en background para refrescar
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);
  
  // Devolver cached inmediatamente o esperar fetch
  return cachedResponse || fetchPromise;
}

// ============================================
// HELPER: Refresh cache in background
// ============================================
async function refreshCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response);
    }
  } catch (error) {
    // Silently fail - we have cached version
  }
}

// ============================================
// HELPER: Check if image request
// ============================================
function isImageRequest(request) {
  const url = request.url;
  const accept = request.headers.get('Accept') || '';
  
  return accept.includes('image/') || 
         /\.(jpg|jpeg|png|gif|webp|svg|ico|avif)(\?.*)?$/i.test(url) ||
         url.includes('images.unsplash.com');
}

// ============================================
// HELPER: Check if font request
// ============================================
function isFontRequest(request) {
  const url = request.url;
  return /\.(woff|woff2|ttf|otf|eot)(\?.*)?$/i.test(url) ||
         url.includes('fonts.googleapis.com') ||
         url.includes('fonts.gstatic.com');
}

// ============================================
// PUSH NOTIFICATIONS - SOS Alerts
// ============================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  // Default notification data
  let data = {
    title: 'ManoProtect',
    body: 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'manoprotect-notification',
    data: {}
  };
  
  // Parse push payload
  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      console.warn('[SW] Failed to parse push data');
      data.body = event.data.text() || data.body;
    }
  }
  
  // Check if SOS alert
  const isSOSAlert = data.data?.type === 'sos_alert' || 
                     data.tag?.includes('sos') ||
                     data.title?.includes('SOS') ||
                     data.title?.includes('EMERGENCIA');
  
  // Notification options
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    requireInteraction: isSOSAlert,
    vibrate: isSOSAlert 
      ? [500, 200, 500, 200, 500, 200, 500] // Patrón de emergencia
      : [200, 100, 200],
    actions: isSOSAlert ? [
      { action: 'view', title: '🚨 Ver Alerta' },
      { action: 'call', title: '📞 Llamar' }
    ] : [
      { action: 'view', title: 'Ver' },
      { action: 'dismiss', title: 'Cerrar' }
    ],
    renotify: isSOSAlert,
    silent: false
  };
  
  event.waitUntil(
    (async () => {
      // Show notification
      await self.registration.showNotification(data.title, options);
      
      // For SOS alerts, try to open alert page
      if (isSOSAlert) {
        const alertUrl = data.data?.url || `/sos-alert?id=${data.data?.alert_id || ''}`;
        
        const clients = await self.clients.matchAll({ type: 'window' });
        
        // If app is open, send message to navigate
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            client.postMessage({
              type: 'SOS_ALERT',
              url: alertUrl,
              data: data.data
            });
            await client.focus();
            return;
          }
        }
        
        // Otherwise open new window
        if (self.clients.openWindow) {
          await self.clients.openWindow(alertUrl);
        }
      }
    })()
  );
});

// ============================================
// NOTIFICATION CLICK HANDLER
// ============================================
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  const data = event.notification.data || {};
  const isSOSAlert = data.type === 'sos_alert';
  
  // Determine URL
  let urlToOpen = '/dashboard';
  
  if (event.action === 'call' && data.phone) {
    urlToOpen = `tel:${data.phone}`;
  } else if (event.action === 'dismiss') {
    return; // Just close
  } else if (isSOSAlert) {
    urlToOpen = `/sos-alert?id=${data.alert_id || ''}`;
  } else if (data.url) {
    urlToOpen = data.url;
  }
  
  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({ type: 'window' });
      
      // Focus existing window if available
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          await client.navigate(urlToOpen);
          return client.focus();
        }
      }
      
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })()
  );
});

// ============================================
// NOTIFICATION CLOSE HANDLER
// ============================================
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
  // Analytics tracking could go here
});

// ============================================
// BACKGROUND SYNC - Offline actions queue
// ============================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-reports') {
    event.waitUntil(syncPendingReports());
  } else if (event.tag === 'sync-sos') {
    event.waitUntil(syncPendingSOS());
  }
});

async function syncPendingReports() {
  console.log('[SW] Syncing pending reports...');
  // Implementar sincronización de reportes pendientes
}

async function syncPendingSOS() {
  console.log('[SW] Syncing pending SOS alerts...');
  // Implementar sincronización de alertas SOS pendientes
}

// ============================================
// PERIODIC BACKGROUND SYNC
// ============================================
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'check-alerts') {
    event.waitUntil(checkForNewAlerts());
  }
});

async function checkForNewAlerts() {
  try {
    const response = await fetch('/api/community/alerts/recent');
    const alerts = await response.json();
    
    if (alerts && alerts.length > 0) {
      await self.registration.showNotification('Nuevas Alertas', {
        body: `${alerts.length} nuevas alertas de seguridad`,
        icon: '/icons/icon-192x192.png',
        tag: 'community-alerts'
      });
    }
  } catch (error) {
    console.warn('[SW] Failed to check alerts:', error);
  }
}

// ============================================
// MESSAGE HANDLER - Communication with app
// ============================================
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data?.type === 'CACHE_URLS') {
    cacheUrls(event.data.urls);
  } else if (event.data?.type === 'CLEAR_CACHE') {
    clearAllCaches();
  }
});

async function cacheUrls(urls) {
  const cache = await caches.open(CACHES.static);
  await cache.addAll(urls);
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
}

// ============================================
// INITIALIZATION LOG
// ============================================
console.log('[SW] ManoProtect Service Worker v4 loaded');
console.log('[SW] Caches:', Object.keys(CACHES));
