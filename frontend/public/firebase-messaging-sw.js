/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAV5UQluzgvXfVlnu6hc-nWMVQecQ7Y6uE",
  authDomain: "manoprotect-f889b.firebaseapp.com",
  projectId: "manoprotect-f889b",
  storageBucket: "manoprotect-f889b.firebasestorage.app",
  messagingSenderId: "97231251022",
  appId: "1:97231251022:web:04e039505ef8a3ed61451f",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'ManoProtect';
  const body = payload.notification?.body || 'Nueva notificacion';
  const isCritical = payload.data?.critical === 'true';

  const options = {
    body: body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: isCritical ? [200, 100, 200, 100, 200] : [200],
    requireInteraction: isCritical,
    tag: payload.data?.type || 'general',
    data: payload.data,
    actions: isCritical ? [
      { action: 'view', title: 'Ver Alerta' },
      { action: 'dismiss', title: 'Descartar' },
    ] : [],
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/app-cliente') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/app-cliente');
    })
  );
});
