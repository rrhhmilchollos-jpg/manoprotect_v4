/**
 * ManoProtect - Google Ads / AdWords Conversion Tracking
 * IMPORTANTE: Configurar con tus IDs de conversión reales de Google Ads
 * 
 * Para obtener tus IDs:
 * 1. Ve a Google Ads (ads.google.com)
 * 2. Herramientas → Conversiones → Nueva conversión
 * 3. Copia el Conversion ID (AW-XXXXXXXXX) y los Labels
 */

// Cargar gtag si no está cargado
(function() {
  if (typeof gtag === 'undefined') {
    // Crear gtag si no existe
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { dataLayer.push(arguments); };
    gtag('js', new Date());
    
    // Cargar el script de Google Ads
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-16845584316';
    document.head.appendChild(script);
    
    // Configurar Google Ads
    gtag('config', 'AW-16845584316');
  }
})();

// Google Ads Configuration
window.GOOGLE_ADS_CONFIG = {
  // ID de Google Ads - CONFIGURAR CON EL REAL
  // Obtener desde: Google Ads → Herramientas → Conversiones
  conversionId: 'AW-16845584316',
  
  // Labels de conversión - CONFIGURAR CADA UNO EN GOOGLE ADS
  conversionLabels: {
    // Registro completado (lead)
    signup: 'signup',
    
    // Inicio de prueba gratuita
    free_trial: 'free_trial',
    
    // Compra completada
    purchase: 'purchase',
    
    // Plan Personal Mensual
    purchasePersonalMonthly: 'personal_monthly',
    
    // Plan Personal Anual
    purchasePersonalYearly: 'personal_yearly',
    
    // Plan Familiar Mensual
    purchaseFamilyMonthly: 'family_monthly',
    
    // Plan Familiar Anual
    purchaseFamilyYearly: 'family_yearly',
    
    // Click en CTA principal
    ctaClick: 'cta_click',
    
    // Ver página de precios
    viewPricing: 'view_pricing',
    
    // Contacto con soporte
    contactSupport: 'contact_support',
    
    // Descargar app
    downloadApp: 'download_app'
  }
};

/**
 * Envía evento de conversión a Google Ads
 * @param {string} conversionType - Tipo de conversión
 * @param {object} data - Datos adicionales
 */
window.trackGoogleAdsConversion = function(conversionType, data = {}) {
  const config = window.GOOGLE_ADS_CONFIG;
  const label = config.conversionLabels[conversionType];
  
  if (!config.conversionId || config.conversionId === 'AW-XXXXXXXXX') {
    console.log('[Google Ads] Configura tu Conversion ID en google-ads/conversion-tracking.js');
    return;
  }
  
  // Verificar que gtag esté disponible
  if (typeof gtag === 'function') {
    // Enviar conversión
    gtag('event', 'conversion', {
      'send_to': `${config.conversionId}/${label}`,
      'value': data.value || 0,
      'currency': data.currency || 'EUR',
      'transaction_id': data.transactionId || Date.now().toString()
    });
    
    // También enviar a GA4 si está configurado
    gtag('event', conversionType, {
      'event_category': 'conversion',
      'event_label': label,
      'value': data.value || 0
    });
    
    console.log('[Google Ads] Conversión registrada:', conversionType, data);
  }
};

/**
 * Track enhanced conversions (para mejor atribución)
 */
window.trackEnhancedConversion = function(userData, conversionType, data = {}) {
  if (typeof gtag !== 'function') return;
  
  const config = window.GOOGLE_ADS_CONFIG;
  
  // Enviar datos de usuario hasheados para enhanced conversions
  gtag('set', 'user_data', {
    'email': userData.email || '',
    'phone_number': userData.phone || ''
  });
  
  // Enviar conversión
  window.trackGoogleAdsConversion(conversionType, data);
};

/**
 * Remarketing - Audiencias personalizadas
 */
window.trackGoogleAdsRemarketing = function(eventName, params = {}) {
  if (typeof gtag !== 'function') return;
  
  gtag('event', eventName, {
    'send_to': window.GOOGLE_ADS_CONFIG.conversionId,
    ...params
  });
};

/**
 * Smart Goals - Track eventos importantes para ML de Google
 */
window.trackSmartGoal = function(eventName, eventValue = 1) {
  if (typeof gtag !== 'function') return;
  
  gtag('event', eventName, {
    'event_category': 'engagement',
    'event_label': eventName,
    'value': eventValue
  });
};

// ====================================
// EVENTOS AUTOMÁTICOS
// ====================================
document.addEventListener('DOMContentLoaded', function() {
  
  // 1. Page View con detalles
  window.trackGoogleAdsRemarketing('page_view', {
    'page_location': window.location.href,
    'page_title': document.title,
    'page_path': window.location.pathname
  });
  
  // 2. Detectar página de pricing (alta intención)
  if (window.location.pathname.includes('precio') || 
      window.location.pathname.includes('pricing') ||
      window.location.pathname.includes('planes')) {
    window.trackGoogleAdsConversion('viewPricing', { value: 1 });
    window.trackSmartGoal('view_pricing_page', 5);
  }
  
  // 3. Detectar página de registro
  if (window.location.pathname.includes('signup') || 
      window.location.pathname.includes('registro')) {
    window.trackSmartGoal('view_signup_page', 3);
  }
  
  // 4. Scroll depth tracking (engagement)
  let scrollDepths = [25, 50, 75, 90];
  let scrolledDepths = new Set();
  
  window.addEventListener('scroll', function() {
    const scrollPercent = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    
    scrollDepths.forEach(depth => {
      if (scrollPercent >= depth && !scrolledDepths.has(depth)) {
        scrolledDepths.add(depth);
        window.trackSmartGoal(`scroll_${depth}`, depth === 90 ? 2 : 1);
      }
    });
  });
  
  // 5. Time on page tracking
  let timeOnPage = 0;
  const timeInterval = setInterval(function() {
    timeOnPage += 30;
    
    if (timeOnPage === 30) {
      window.trackSmartGoal('engaged_30s', 1);
    } else if (timeOnPage === 60) {
      window.trackSmartGoal('engaged_60s', 2);
    } else if (timeOnPage === 120) {
      window.trackSmartGoal('engaged_2min', 3);
      clearInterval(timeInterval);
    }
  }, 30000);
  
  // 6. Track CTA clicks
  document.querySelectorAll('[data-cta], .cta-button, [href*="signup"], [href*="registro"]').forEach(el => {
    el.addEventListener('click', function(e) {
      window.trackGoogleAdsConversion('ctaClick', { value: 5 });
      window.trackSmartGoal('cta_click', 5);
    });
  });
  
  // 7. Track phone clicks
  document.querySelectorAll('a[href^="tel:"]').forEach(el => {
    el.addEventListener('click', function() {
      window.trackGoogleAdsConversion('contactSupport', { value: 10 });
    });
  });
  
  // 8. Track WhatsApp clicks
  document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]').forEach(el => {
    el.addEventListener('click', function() {
      window.trackGoogleAdsConversion('contactSupport', { value: 10 });
    });
  });
  
});

// ====================================
// EXPORTAR PARA USO EN REACT
// ====================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    trackGoogleAdsConversion: window.trackGoogleAdsConversion,
    trackEnhancedConversion: window.trackEnhancedConversion,
    trackGoogleAdsRemarketing: window.trackGoogleAdsRemarketing,
    trackSmartGoal: window.trackSmartGoal
  };
}

console.log('[ManoProtect] Google Ads Conversion Tracking cargado');
