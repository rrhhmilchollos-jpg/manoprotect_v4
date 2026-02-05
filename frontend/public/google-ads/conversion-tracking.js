/**
 * ManoProtect - Google Ads / AdWords Conversion Tracking
 * Configura este archivo con tus IDs de conversión de Google Ads
 */

// Google Ads Configuration
window.GOOGLE_ADS_CONFIG = {
  // Tu ID de Google Ads (AW-XXXXXXXXX)
  conversionId: 'AW-XXXXXXXXX', // TODO: Reemplazar con tu ID
  
  // Labels de conversión
  conversionLabels: {
    // Registro completado
    signup: 'XXXX_XXXX_XXXX',
    
    // Compra plan familiar mensual
    purchaseFamilyMonthly: 'XXXX_XXXX_XXXX',
    
    // Compra plan familiar anual
    purchaseFamilyYearly: 'XXXX_XXXX_XXXX',
    
    // Añadir familiar
    addFamilyMember: 'XXXX_XXXX_XXXX',
    
    // Crear zona segura
    createSafeZone: 'XXXX_XXXX_XXXX',
    
    // Activar SOS
    activateSOS: 'XXXX_XXXX_XXXX',
    
    // Chat con soporte
    contactSupport: 'XXXX_XXXX_XXXX'
  }
};

/**
 * Envía evento de conversión a Google Ads
 * @param {string} conversionType - Tipo de conversión (signup, purchase, etc.)
 * @param {object} data - Datos adicionales de la conversión
 */
window.trackGoogleAdsConversion = function(conversionType, data = {}) {
  const config = window.GOOGLE_ADS_CONFIG;
  const label = config.conversionLabels[conversionType];
  
  if (!label || !config.conversionId) {
    console.log('[Google Ads] Conversion tracking not configured:', conversionType);
    return;
  }
  
  // Verificar que gtag esté disponible
  if (typeof gtag === 'function') {
    gtag('event', 'conversion', {
      'send_to': `${config.conversionId}/${label}`,
      'value': data.value || 0,
      'currency': data.currency || 'EUR',
      'transaction_id': data.transactionId || ''
    });
    
    console.log('[Google Ads] Conversion tracked:', conversionType, data);
  } else {
    console.warn('[Google Ads] gtag not available');
  }
};

/**
 * Remarketing - Envía evento para audiencias personalizadas
 * @param {string} eventName - Nombre del evento
 * @param {object} params - Parámetros del evento
 */
window.trackGoogleAdsRemarketing = function(eventName, params = {}) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, {
      'send_to': window.GOOGLE_ADS_CONFIG.conversionId,
      ...params
    });
  }
};

// Eventos automáticos de remarketing
document.addEventListener('DOMContentLoaded', function() {
  // Página vista
  window.trackGoogleAdsRemarketing('page_view', {
    'page_location': window.location.href,
    'page_title': document.title
  });
  
  // Usuario en pricing (alta intención)
  if (window.location.pathname === '/pricing') {
    window.trackGoogleAdsRemarketing('view_item_list', {
      'item_list_id': 'plans',
      'item_list_name': 'Planes ManoProtect'
    });
  }
});
