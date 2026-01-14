/**
 * Firebase Configuration
 * Production configuration for MANO Protect app
 * 
 * Project ID: manoprotect-f889b
 * Project Number: 97231251022
 */

export const FIREBASE_CONFIG = {
  // Firebase project settings
  projectId: 'manoprotect-f889b',
  projectNumber: '97231251022',
  storageBucket: 'manoprotect-f889b.firebasestorage.app',
  authDomain: 'manoprotect-f889b.firebaseapp.com',
  
  // Web app config
  web: {
    apiKey: 'AIzaSyAV5UQluzgvXfVlnu6hc-nWMVQecQ7Y6uE',
    appId: '1:97231251022:web:04e039505ef8a3ed61451f',
    measurementId: 'G-8KECMQS45X',
  },
  
  // Android configuration
  android: {
    packageName: 'com.Manoprotect.Mano',
    appId: '1:97231251022:android:54053179f6dfb05d61451f',
  },
  
  // iOS configuration (add when available)
  ios: {
    bundleId: 'com.Manoprotect.Mano',
    appId: '', // Add iOS app ID from Firebase Console
  },
  
  // Notification channels for Android
  channels: {
    threats: {
      id: 'mano-threats',
      name: 'Alertas de Amenazas',
      description: 'Notificaciones sobre amenazas detectadas',
    },
    family: {
      id: 'mano-family',
      name: 'Alertas Familiares',
      description: 'Notificaciones sobre miembros de la familia',
    },
    banking: {
      id: 'mano-banking',
      name: 'Alertas Bancarias',
      description: 'Notificaciones sobre actividad bancaria sospechosa',
    },
    system: {
      id: 'mano-system',
      name: 'Sistema',
      description: 'Notificaciones del sistema',
    },
  },
};

/**
 * Notification topics for subscribing users
 */
export const NOTIFICATION_TOPICS = {
  ALL_USERS: 'all_users',
  PREMIUM_USERS: 'premium_users',
  FAMILY_USERS: 'family_users',
  ENTERPRISE_USERS: 'enterprise_users',
  THREAT_ALERTS: 'threat_alerts',
  SECURITY_UPDATES: 'security_updates',
};

export default FIREBASE_CONFIG;
