/**
 * App Configuration
 * Central configuration for the MANO mobile app
 */

// API Configuration
export const API_CONFIG = {
  // Development/Preview URL (Emergent platform)
  DEV_URL: 'https://threatshield-62.preview.emergentagent.com/api',
  
  // Production URL (update when deploying to production)
  PROD_URL: 'https://mano-protect.com/api',
  
  // Timeout in milliseconds
  TIMEOUT: 30000,
};

// App Metadata
export const APP_CONFIG = {
  NAME: 'MANO Protect',
  VERSION: '1.0.0',
  BUILD_NUMBER: 1,
  
  // Bundle identifiers (matching Firebase config)
  IOS_BUNDLE_ID: 'com.Manoprotect.Mano',
  ANDROID_PACKAGE: 'com.Manoprotect.Mano',
  
  // Firebase Project
  FIREBASE_PROJECT_ID: 'manoprotect-f889b',
  
  // Deep linking scheme
  URL_SCHEME: 'manoprotect',
};

// Feature Flags
export const FEATURES = {
  BIOMETRIC_AUTH: true,
  PUSH_NOTIFICATIONS: true,
  QR_SCANNER: true,
  BANKING_INTEGRATION: true,
  FAMILY_PROTECTION: true,
  SENIOR_MODE: true,
};

// Theme Colors
export const COLORS = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  secondary: '#8b5cf6',
  
  background: '#1a1a2e',
  surface: '#16162a',
  border: '#2d2d4a',
  
  text: '#ffffff',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

// Subscription Plans
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Gratis',
    price: 0,
    features: ['Análisis básico', 'Alertas limitadas'],
  },
  PERSONAL: {
    id: 'personal',
    name: 'Personal',
    price: 9.99,
    features: ['Análisis ilimitado', 'Alertas en tiempo real', 'Soporte prioritario'],
  },
  FAMILY: {
    id: 'family',
    name: 'Familiar',
    price: 19.99,
    features: ['Todo de Personal', 'Hasta 5 miembros', 'Modo simplificado para mayores'],
  },
  BUSINESS: {
    id: 'business',
    name: 'Business',
    price: 49.99,
    features: ['Protección empresarial', 'Dashboard de amenazas', 'API de integración'],
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199.99,
    features: ['Todo incluido', 'Soporte dedicado', 'Personalización completa'],
  },
};

export default {
  API_CONFIG,
  APP_CONFIG,
  FEATURES,
  COLORS,
  PLANS,
};
