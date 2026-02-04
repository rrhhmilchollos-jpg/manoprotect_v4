// Firebase Cloud Messaging Service Worker
// ManoProtect - Emergency SOS Notifications with Siren

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAV5UQluzgvXfVlnu6hc-nWMVQecQ7Y6uE",
  authDomain: "manoprotect-f889b.firebaseapp.com",
  projectId: "manoprotect-f889b",
  storageBucket: "manoprotect-f889b.firebasestorage.app",
  messagingSenderId: "97231251022",
  appId: "1:97231251022:web:04e039505ef8a3ed61451f"
});

const messaging = firebase.messaging();

// SOS Alert sound URL
const SOS_SIREN_URL = '/sounds/sos-siren.mp3';

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Background message:', payload);
  
  const data = payload.data || {};
  const notification = payload.notification || {};
  
  // Check if this is an SOS alert
  const isSOS = data.type === 'sos_alert' || data.type === 'location_request';
  
  let notificationTitle = notification.title || 'ManoProtect';
  let notificationBody = notification.body || 'Nueva notificación';
  let notificationIcon = '/manoprotect_logo.png';
  let notificationTag = data.tag || 'mano-notification';
  let requireInteraction = false;
  let vibrationPattern = [200, 100, 200];
  
  // Special handling for SOS alerts
  if (isSOS) {
    notificationTitle = '🆘 ALERTA SOS - ' + (data.sender_name || 'Emergencia');
    notificationBody = notification.body || `${data.sender_name || 'Un familiar'} necesita ayuda urgente. ¡Pulsa para ver ubicación!`;
    notificationIcon = '/manoprotect_alert.png';
    notificationTag = 'sos-emergency-' + (data.alert_id || Date.now());
    requireInteraction = true;
    vibrationPattern = [500, 200, 500, 200, 500, 200, 500]; // Urgent pattern
    
    // Try to play siren sound (may not work in all browsers for SW)
    // The main app will handle the siren when opened
  }
  
  const notificationOptions = {
    body: notificationBody,
    icon: notificationIcon,
    badge: '/manoprotect_logo.png',
    tag: notificationTag,
    data: {
      ...data,
      url: data.url || (isSOS ? `/sos-alert?alert=${data.alert_id}` : '/dashboard'),
      isSOS: isSOS
    },
    vibrate: vibrationPattern,
    requireInteraction: requireInteraction,
    actions: isSOS ? [
      { action: 'view_location', title: '📍 Ver Ubicación' },
      { action: 'call_112', title: '📞 Llamar 112' }
    ] : [
      { action: 'open', title: 'Ver' },
      { action: 'dismiss', title: 'Cerrar' }
    ],
    // For Android - high priority
    priority: isSOS ? 'high' : 'default',
    // Timestamp
    timestamp: Date.now()
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM SW] Notification click:', event.action, event.notification.data);
  event.notification.close();

  const data = event.notification.data || {};
  const action = event.action;

  // Handle call 112 action
  if (action === 'call_112') {
    clients.openWindow('tel:112');
    return;
  }

  // Handle dismiss
  if (action === 'dismiss') {
    return;
  }

  // Default: open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Build URL to open
      let url = '/dashboard';
      
      if (data.isSOS && data.alert_id) {
        url = `/sos-alert?alert=${data.alert_id}`;
      } else if (data.url) {
        url = data.url;
      }
      
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            data: data
          });
          return client.focus();
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  console.log('[FCM SW] Message from app:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[FCM SW] Firebase Messaging Service Worker loaded');
