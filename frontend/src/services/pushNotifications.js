// Push Notifications Service for MANO
const API = process.env.REACT_APP_BACKEND_URL + '/api';

// Convert base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const pushNotificationService = {
  // Check if push notifications are supported
  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  },

  // Check current permission status
  getPermissionStatus() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  },

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported()) {
      throw new Error('Push notifications not supported');
    }
    
    const permission = await Notification.requestPermission();
    return permission;
  },

  // Get VAPID public key from server
  async getVapidPublicKey() {
    const response = await fetch(`${API}/push/vapid-public-key`, {
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error('Failed to get VAPID key');
    
    const data = await response.json();
    return data.public_key;
  },

  // Register service worker and subscribe to push
  async subscribe() {
    if (!this.isSupported()) {
      throw new Error('Push notifications not supported');
    }

    // Check permission
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Get VAPID key
      const vapidKey = await this.getVapidPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(vapidKey);

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });

      // Send subscription to server
      const response = await fetch(`${API}/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
          }
        })
      });

      if (!response.ok) throw new Error('Failed to save subscription');

      return subscription;
    } catch (error) {
      console.error('Push subscription error:', error);
      throw error;
    }
  },

  // Unsubscribe from push notifications
  async unsubscribe() {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      // Notify server
      await fetch(`${API}/push/unsubscribe`, {
        method: 'DELETE',
        credentials: 'include'
      });

      return true;
    } catch (error) {
      console.error('Push unsubscribe error:', error);
      throw error;
    }
  },

  // Check if currently subscribed
  async isSubscribed() {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;

      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      return false;
    }
  }
};

export default pushNotificationService;
