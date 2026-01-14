// MANO Push Notification Service Worker

self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nueva notificación de MANO',
      icon: data.icon || '/logo192.png',
      badge: data.badge || '/logo192.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'mano-notification',
      renotify: true,
      requireInteraction: data.requireInteraction || false,
      data: data.data || {},
      actions: [
        { action: 'open', title: 'Ver' },
        { action: 'dismiss', title: 'Cerrar' }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'MANO Alerta', options)
    );
  } catch (error) {
    console.error('Push notification error:', error);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const data = event.notification.data || {};
  const url = data.url || '/dashboard';
  
  if (event.action === 'dismiss') {
    return;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

self.addEventListener('install', function(event) {
  console.log('MANO Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('MANO Service Worker activated');
  event.waitUntil(clients.claim());
});
