import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAV5UQluzgvXfVlnu6hc-nWMVQecQ7Y6uE",
  authDomain: "manoprotect-f889b.firebaseapp.com",
  projectId: "manoprotect-f889b",
  storageBucket: "manoprotect-f889b.firebasestorage.app",
  messagingSenderId: "97231251022",
  appId: "1:97231251022:web:04e039505ef8a3ed61451f",
  measurementId: "G-8KECMQS45X"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let messagingInstance = null;
try {
  messagingInstance = getMessaging(app);
} catch (e) {
  console.log('FCM not supported in this browser');
}

export { app, messagingInstance };

export async function requestNotificationPermission(userId, backendUrl) {
  if (!messagingInstance) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const token = await getToken(messagingInstance, {
      vapidKey: undefined, // Will use default FCM key
    });

    if (token && userId) {
      await fetch(`${backendUrl}/api/notifications/register-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, user_id: userId }),
      });
    }

    return token;
  } catch (err) {
    console.error('FCM token error:', err);
    return null;
  }
}

export function onForegroundMessage(callback) {
  if (!messagingInstance) return () => {};
  return onMessage(messagingInstance, (payload) => {
    callback(payload);
  });
}
