/**
 * Firebase Configuration for MANO Web App
 * Project: manoprotect-f889b
 */
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Cloud Messaging (only in browser with service worker support)
let messaging = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Firebase Messaging not supported:', error);
  }
}

/**
 * Log analytics event
 */
export const logAnalyticsEvent = (eventName, eventParams = {}) => {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
};

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async () => {
  if (!messaging) {
    console.log('Messaging not available');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
      });
      console.log('FCM Token:', token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onForegroundMessage = (callback) => {
  if (!messaging) return () => {};
  
  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
};

// Pre-defined analytics events
export const AnalyticsEvents = {
  // User events
  LOGIN: 'login',
  SIGNUP: 'sign_up',
  LOGOUT: 'logout',
  
  // Feature usage
  THREAT_ANALYZED: 'threat_analyzed',
  THREAT_BLOCKED: 'threat_blocked',
  QR_SCANNED: 'qr_scanned',
  
  // Family
  FAMILY_MEMBER_ADDED: 'family_member_added',
  SOS_ALERT_SENT: 'sos_alert_sent',
  
  // Banking
  BANK_CONNECTED: 'bank_connected',
  TRANSACTION_REVIEWED: 'transaction_reviewed',
  
  // Subscription
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  
  // Navigation
  PAGE_VIEW: 'page_view',
  SCREEN_VIEW: 'screen_view',
};

export { app, analytics, messaging };
export default app;
