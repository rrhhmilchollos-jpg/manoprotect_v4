/**
 * ManoProtect - Unified Ads Manager
 * Gestiona todos los píxeles de publicidad desde un solo lugar
 * Soporta: Facebook, TikTok, Twitter/X, LinkedIn, Snapchat, Pinterest, Google Ads
 */

window.ManoAds = {
  // Configuración
  config: {
    debug: false,
    enabledPlatforms: ['facebook', 'tiktok', 'google', 'twitter', 'linkedin', 'snapchat', 'pinterest'],
    
    // IDs de píxeles (configurar antes de usar)
    pixels: {
      facebook: '1234567890',        // TODO: Tu Facebook Pixel ID
      tiktok: 'XXXXXXXXXX',          // TODO: Tu TikTok Pixel ID
      google: 'AW-XXXXXXXXX',        // TODO: Tu Google Ads ID
      twitter: 'XXXXXX',             // TODO: Tu Twitter Pixel ID
      linkedin: '1234567',           // TODO: Tu LinkedIn Partner ID
      snapchat: 'XXXXXXXX-XXXX',     // TODO: Tu Snapchat Pixel ID
      pinterest: '1234567890'        // TODO: Tu Pinterest Tag ID
    }
  },
  
  /**
   * Inicializa todos los píxeles habilitados
   */
  init: function() {
    console.log('[ManoAds] Initializing unified ads manager...');
    this._loadPixels();
  },
  
  /**
   * Carga dinámicamente los scripts de píxeles
   */
  _loadPixels: function() {
    const pixelScripts = {
      facebook: '/ads/facebook-pixel.js',
      tiktok: '/ads/tiktok-pixel.js',
      twitter: '/ads/twitter-pixel.js',
      linkedin: '/ads/linkedin-pixel.js',
      snapchat: '/ads/snapchat-pixel.js',
      pinterest: '/ads/pinterest-pixel.js'
    };
    
    this.config.enabledPlatforms.forEach(platform => {
      if (pixelScripts[platform]) {
        const script = document.createElement('script');
        script.src = pixelScripts[platform];
        script.async = true;
        document.head.appendChild(script);
      }
    });
  },
  
  /**
   * Log para debug
   */
  _log: function(event, data) {
    if (this.config.debug) {
      console.log(`[ManoAds] ${event}`, data);
    }
  },
  
  // ==========================================
  // EVENTOS UNIFICADOS
  // ==========================================
  
  /**
   * Tracking de página vista
   */
  trackPageView: function(pageName) {
    this._log('PageView', pageName);
    
    // Google Analytics
    if (typeof gtag === 'function') {
      gtag('event', 'page_view', { page_title: pageName });
    }
    
    // DataLayer para GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'pageview',
      page_name: pageName,
      page_url: window.location.href
    });
  },
  
  /**
   * Registro de usuario completado
   */
  trackSignUp: function(userData = {}) {
    this._log('SignUp', userData);
    
    // Facebook
    if (window.FacebookAds) window.FacebookAds.trackSignUp(userData);
    
    // TikTok
    if (window.TikTokAds) window.TikTokAds.trackSignUp(userData);
    
    // Twitter
    if (window.TwitterAds) window.TwitterAds.trackSignUp();
    
    // LinkedIn
    if (window.LinkedInAds) window.LinkedInAds.trackSignUp();
    
    // Snapchat
    if (window.SnapchatAds) window.SnapchatAds.trackSignUp(userData);
    
    // Pinterest
    if (window.PinterestAds) window.PinterestAds.trackSignUp();
    
    // Google Ads
    if (window.trackGoogleAdsConversion) {
      window.trackGoogleAdsConversion('signup', userData);
    }
    
    // BigData
    if (window.trackBigDataEvent) {
      window.trackBigDataEvent('user_signup', userData);
    }
  },
  
  /**
   * Ver producto/plan
   */
  trackViewContent: function(plan) {
    this._log('ViewContent', plan);
    
    if (window.FacebookAds) window.FacebookAds.trackViewContent(plan);
    if (window.TikTokAds) window.TikTokAds.trackViewContent(plan);
    if (window.SnapchatAds) window.SnapchatAds.trackViewContent(plan);
    if (window.PinterestAds) window.PinterestAds.trackViewContent(plan);
    
    if (window.trackEcommerce) {
      window.trackEcommerce.viewItem(plan);
    }
  },
  
  /**
   * Añadir al carrito
   */
  trackAddToCart: function(plan) {
    this._log('AddToCart', plan);
    
    if (window.FacebookAds) window.FacebookAds.trackAddToCart(plan);
    if (window.TikTokAds) window.TikTokAds.trackAddToCart(plan);
    if (window.SnapchatAds) window.SnapchatAds.trackAddToCart(plan);
    if (window.PinterestAds) window.PinterestAds.trackAddToCart(plan);
    
    if (window.trackEcommerce) {
      window.trackEcommerce.addToCart(plan);
    }
  },
  
  /**
   * Iniciar checkout
   */
  trackInitiateCheckout: function(plan) {
    this._log('InitiateCheckout', plan);
    
    if (window.FacebookAds) window.FacebookAds.trackInitiateCheckout(plan);
    if (window.TikTokAds) window.TikTokAds.trackInitiateCheckout(plan);
    if (window.PinterestAds) window.PinterestAds.trackCheckout(plan);
    
    if (window.trackEcommerce) {
      window.trackEcommerce.beginCheckout(plan);
    }
  },
  
  /**
   * Compra completada
   */
  trackPurchase: function(transaction) {
    this._log('Purchase', transaction);
    
    if (window.FacebookAds) window.FacebookAds.trackPurchase(transaction);
    if (window.TikTokAds) window.TikTokAds.trackPurchase(transaction);
    if (window.TwitterAds) window.TwitterAds.trackPurchase(transaction);
    if (window.LinkedInAds) window.LinkedInAds.trackPurchase();
    if (window.SnapchatAds) window.SnapchatAds.trackPurchase(transaction);
    
    if (window.trackGoogleAdsConversion) {
      window.trackGoogleAdsConversion('purchaseFamilyMonthly', {
        value: transaction.amount,
        currency: 'EUR',
        transactionId: transaction.id
      });
    }
    
    if (window.trackEcommerce) {
      window.trackEcommerce.purchase(transaction);
    }
  },
  
  /**
   * Lead generado
   */
  trackLead: function(data = {}) {
    this._log('Lead', data);
    
    if (window.FacebookAds) window.FacebookAds.trackLead(data);
    if (window.TwitterAds) window.TwitterAds.trackLead();
    if (window.LinkedInAds) window.LinkedInAds.trackB2BLead();
    if (window.PinterestAds) window.PinterestAds.trackLead();
    
    if (window.trackBigDataEvent) {
      window.trackBigDataEvent('lead_generated', data);
    }
  },
  
  /**
   * Contacto iniciado
   */
  trackContact: function() {
    this._log('Contact', {});
    
    if (window.FacebookAds) window.FacebookAds.trackContact();
    if (window.TikTokAds) window.TikTokAds.trackContact();
    
    if (window.trackBigDataEvent) {
      window.trackBigDataEvent('contact_initiated', {});
    }
  },
  
  /**
   * Descarga de app
   */
  trackAppDownload: function() {
    this._log('AppDownload', {});
    
    if (window.TikTokAds) window.TikTokAds.trackDownload();
    if (window.TwitterAds) window.TwitterAds.trackDownload();
    if (window.SnapchatAds) window.SnapchatAds.trackAppInstall();
    
    if (window.trackBigDataEvent) {
      window.trackBigDataEvent('app_download', {});
    }
  },
  
  /**
   * Activación de SOS (evento personalizado importante)
   */
  trackSOSActivated: function(data = {}) {
    this._log('SOSActivated', data);
    
    if (window.FacebookAds) window.FacebookAds.trackCustom('SOSActivated', data);
    if (window.TikTokAds) window.TikTokAds.trackCustom('SOSActivated', data);
    
    if (window.trackBigDataEvent) {
      window.trackBigDataEvent('sos_activated', data);
    }
  },
  
  /**
   * Zona segura creada
   */
  trackSafeZoneCreated: function(zone) {
    this._log('SafeZoneCreated', zone);
    
    if (window.FacebookAds) window.FacebookAds.trackCustom('SafeZoneCreated', zone);
    if (window.TikTokAds) window.TikTokAds.trackCustom('SafeZoneCreated', zone);
    
    if (window.trackGoogleAdsConversion) {
      window.trackGoogleAdsConversion('createSafeZone', zone);
    }
    
    if (window.trackBigDataEvent) {
      window.trackBigDataEvent('safe_zone_created', zone);
    }
  },
  
  /**
   * Familiar añadido
   */
  trackFamilyMemberAdded: function(member) {
    this._log('FamilyMemberAdded', member);
    
    if (window.FacebookAds) window.FacebookAds.trackCustom('FamilyMemberAdded', member);
    if (window.TikTokAds) window.TikTokAds.trackCustom('FamilyMemberAdded', member);
    
    if (window.trackGoogleAdsConversion) {
      window.trackGoogleAdsConversion('addFamilyMember', member);
    }
    
    if (window.trackBigDataEvent) {
      window.trackBigDataEvent('family_member_added', member);
    }
  },
  
  /**
   * Chat con soporte iniciado
   */
  trackChatStarted: function() {
    this._log('ChatStarted', {});
    
    if (window.FacebookAds) window.FacebookAds.trackCustom('ChatStarted', {});
    
    if (window.trackGoogleAdsConversion) {
      window.trackGoogleAdsConversion('contactSupport', {});
    }
    
    if (window.trackBigDataEvent) {
      window.trackBigDataEvent('chat_started', {});
    }
  }
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.ManoAds.init();
});

console.log('[ManoAds] Unified Ads Manager loaded');
