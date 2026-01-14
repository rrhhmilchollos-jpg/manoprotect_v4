/**
 * Firebase Configuration
 * Instructions for setting up Firebase Cloud Messaging (FCM)
 * 
 * SETUP STEPS:
 * 
 * 1. Go to Firebase Console: https://console.firebase.google.com/
 * 
 * 2. Create a new project or select existing one
 * 
 * 3. Add iOS App:
 *    - iOS bundle ID: com.manoprotect.app
 *    - Download GoogleService-Info.plist
 *    - Place in: ios/MANOProtect/GoogleService-Info.plist
 * 
 * 4. Add Android App:
 *    - Android package name: com.manoprotect.app
 *    - Download google-services.json
 *    - Place in: android/app/google-services.json
 * 
 * 5. Enable Cloud Messaging in Firebase Console
 * 
 * 6. For iOS, upload APNs key:
 *    - Go to Apple Developer Portal > Keys
 *    - Create a new key with APNs enabled
 *    - Download the .p8 file
 *    - Upload to Firebase: Project Settings > Cloud Messaging > iOS app config
 * 
 * IMPORTANT: Never commit google-services.json or GoogleService-Info.plist to git!
 * Add them to .gitignore
 */

export const FIREBASE_CONFIG = {
  // These values come from your Firebase project settings
  // They are safe to include in the app as they don't expose sensitive data
  
  // Web API Key (optional, for web push notifications)
  // apiKey: 'YOUR_WEB_API_KEY',
  
  // Project configuration
  projectId: 'mano-protect', // Update with your Firebase project ID
  
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
