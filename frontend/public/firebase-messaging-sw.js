// Firebase Cloud Messaging Service Worker
// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyAV5UQluzgvXfVlnu6hc-nWMVQecQ7Y6uE",
  authDomain: "manoprotect-f889b.firebaseapp.com",
  projectId: "manoprotect-f889b",
  storageBucket: "manoprotect-f889b.firebasestorage.app",
  messagingSenderId: "97231251022",
  appId: "1:97231251022:web:04e039505ef8a3ed61451f"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'MANO Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'Nueva notificación',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: payload.data?.tag || 'mano-notification',
    data: payload.data,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Ver' },
      { action: 'dismiss', title: 'Cerrar' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        const url = event.notification.data?.url || '/dashboard';
        return clients.openWindow(url);
      }
    })
  );
});
