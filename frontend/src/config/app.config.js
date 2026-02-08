/**
 * ManoProtect - Configuración Centralizada
 * 
 * Este archivo contiene la configuración compartida entre:
 * - Web (React)
 * - Desktop (Electron)
 * - Mobile (React Native)
 * 
 * IMPORTANTE: Al desplegar a producción, cambiar BACKEND_URL
 */

const CONFIG = {
  // URLs del Backend
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'https://security-api-suite.preview.emergentagent.com',
  
  // WebSocket para tiempo real
  WS_URL: process.env.REACT_APP_WS_URL || 'wss://manoprotect-qa.preview.emergentagent.com/ws',
  
  // Versión de la aplicación
  APP_VERSION: '1.0.0',
  
  // Nombre de la app
  APP_NAME: 'ManoProtect',
  
  // Logo URLs
  LOGO: {
    ICON: '/logo192.png',
    FULL: '/logo512.png'
  },
  
  // Endpoints de la API
  API: {
    // Autenticación
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh'
    },
    // Seguridad
    SECURITY: {
      CHECK_URL: '/api/security/check/url',
      CHECK_IP: '/api/security/check/ip',
      CHECK_CONTENT: '/api/security/check/content',
      PROVIDERS: '/api/security/providers',
      DASHBOARD: '/api/security/stats/dashboard'
    },
    // Familia
    FAMILY: {
      MEMBERS: '/api/family/members',
      ADD_MEMBER: '/api/family/link-member-phone',
      SOS_TRIGGER: '/api/family/sos/trigger'
    },
    // Fraude
    FRAUD: {
      VERIFY: '/api/fraud/public/verify-scam',
      REPORT: '/api/fraud/public/report-scam',
      STATS: '/api/fraud/public/scam-stats'
    },
    // Cuenta
    ACCOUNT: {
      DELETE_REQUEST: '/api/account/delete-request'
    }
  },
  
  // Colores de la marca
  COLORS: {
    PRIMARY: '#10b981',
    PRIMARY_DARK: '#059669',
    SECONDARY: '#3b82f6',
    DANGER: '#ef4444',
    WARNING: '#f59e0b',
    BACKGROUND: '#0f172a',
    CARD: '#1e293b'
  }
};

// Para uso en Node.js (Electron)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

// Para uso en navegador
if (typeof window !== 'undefined') {
  window.MANOPROTECT_CONFIG = CONFIG;
}
