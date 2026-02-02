/**
 * ManoProtect - Firebase Configuration
 * Real push notifications with Firebase Cloud Messaging
 */
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (singleton pattern)
let app = null;
let messaging = null;

export function getFirebaseApp() {
  if (!app && getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else if (!app) {
    app = getApps()[0];
  }
  return app;
}

export function getFirebaseMessaging() {
  if (!messaging) {
    const firebaseApp = getFirebaseApp();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        messaging = getMessaging(firebaseApp);
      } catch (error) {
        console.error('Error initializing Firebase Messaging:', error);
      }
    }
  }
  return messaging;
}

/**
 * Request permission and get FCM token
 */
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    const fcmMessaging = getFirebaseMessaging();
    if (!fcmMessaging) {
      console.error('Firebase Messaging not available');
      return null;
    }

    // Get FCM token
    const token = await getToken(fcmMessaging, {
      vapidKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
    });

    console.log('FCM Token obtained:', token?.substring(0, 20) + '...');
    return token;

  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Subscribe to foreground messages
 */
export function onForegroundMessage(callback) {
  const fcmMessaging = getFirebaseMessaging();
  if (!fcmMessaging) return null;

  return onMessage(fcmMessaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
}

/**
 * Register FCM token with backend
 */
export async function registerFCMTokenWithBackend(token, userId) {
  try {
    const API = process.env.REACT_APP_BACKEND_URL + '/api';
    
    const response = await fetch(`${API}/push/register-fcm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        fcm_token: token,
        user_id: userId,
        platform: 'web'
      })
    });

    if (response.ok) {
      console.log('FCM token registered with backend');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return false;
  }
}

/**
 * Full push notification setup
 */
export async function setupPushNotifications(userId) {
  // Check if notifications are supported
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return { success: false, reason: 'not_supported' };
  }

  // Check current permission
  if (Notification.permission === 'denied') {
    return { success: false, reason: 'denied' };
  }

  // Request permission and get token
  const token = await requestNotificationPermission();
  if (!token) {
    return { success: false, reason: 'no_token' };
  }

  // Register with backend
  const registered = await registerFCMTokenWithBackend(token, userId);
  
  return { 
    success: registered, 
    token: token,
    reason: registered ? 'success' : 'backend_error'
  };
}

export default {
  getFirebaseApp,
  getFirebaseMessaging,
  requestNotificationPermission,
  onForegroundMessage,
  registerFCMTokenWithBackend,
  setupPushNotifications
};
