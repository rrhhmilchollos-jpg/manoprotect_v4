/**
 * ManoProtect - BigData Analytics & Event Tracking
 * Sistema centralizado de tracking para análisis de datos
 */

// DataLayer para GTM
window.dataLayer = window.dataLayer || [];

// Configuración de BigData
window.BIGDATA_CONFIG = {
  enabled: true,
  debug: false,
  
  // Eventos a trackear
  events: {
    // Autenticación
    USER_SIGNUP: 'user_signup',
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    
    // Conversiones
    PLAN_VIEW: 'plan_view',
    PLAN_SELECT: 'plan_select',
    PURCHASE_START: 'purchase_start',
    PURCHASE_COMPLETE: 'purchase_complete',
    
    // Engagement
    PAGE_VIEW: 'page_view',
    BUTTON_CLICK: 'button_click',
    FORM_SUBMIT: 'form_submit',
    SCROLL_DEPTH: 'scroll_depth',
    TIME_ON_PAGE: 'time_on_page',
    
    // Features
    SOS_ACTIVATED: 'sos_activated',
    FAMILY_ADDED: 'family_member_added',
    ZONE_CREATED: 'safe_zone_created',
    THREAT_DETECTED: 'threat_detected',
    CHAT_STARTED: 'chat_started',
    CHAT_MESSAGE: 'chat_message',
    
    // Errors
    ERROR_OCCURRED: 'error_occurred',
    API_ERROR: 'api_error'
  }
};

/**
 * Envía evento a BigData (GTM + Analytics)
 * @param {string} eventName - Nombre del evento
 * @param {object} eventData - Datos del evento
 */
window.trackBigDataEvent = function(eventName, eventData = {}) {
  const config = window.BIGDATA_CONFIG;
  
  if (!config.enabled) return;
  
  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    page_url: window.location.href,
    page_path: window.location.pathname,
    user_agent: navigator.userAgent,
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language,
    ...eventData
  };
  
  // Añadir user_id si está disponible
  const userId = localStorage.getItem('mano_user_id');
  if (userId) {
    payload.user_id = userId;
  }
  
  // Push a dataLayer (GTM)
  window.dataLayer.push(payload);
  
  // Google Analytics 4
  if (typeof gtag === 'function') {
    gtag('event', eventName, eventData);
  }
  
  // Debug mode
  if (config.debug) {
    console.log('[BigData]', eventName, payload);
  }
  
  return payload;
};

/**
 * Trackea usuario identificado
 * @param {object} user - Datos del usuario
 */
window.identifyUser = function(user) {
  if (!user) return;
  
  localStorage.setItem('mano_user_id', user.user_id || user.id);
  
  window.dataLayer.push({
    event: 'user_identified',
    user_id: user.user_id || user.id,
    user_email_hash: user.email ? btoa(user.email) : null,
    user_plan: user.plan || 'free',
    user_role: user.role || 'user'
  });
  
  // GA4 User Properties
  if (typeof gtag === 'function') {
    gtag('set', 'user_properties', {
      plan_type: user.plan || 'free',
      account_type: user.role || 'user'
    });
  }
};

/**
 * E-commerce tracking
 */
window.trackEcommerce = {
  // Vista de producto/plan
  viewItem: function(plan) {
    window.trackBigDataEvent('view_item', {
      currency: 'EUR',
      value: plan.price,
      items: [{
        item_id: plan.id,
        item_name: plan.name,
        item_category: 'subscription',
        price: plan.price
      }]
    });
  },
  
  // Añadir al carrito
  addToCart: function(plan) {
    window.trackBigDataEvent('add_to_cart', {
      currency: 'EUR',
      value: plan.price,
      items: [{
        item_id: plan.id,
        item_name: plan.name,
        price: plan.price,
        quantity: 1
      }]
    });
  },
  
  // Inicio de checkout
  beginCheckout: function(plan) {
    window.trackBigDataEvent('begin_checkout', {
      currency: 'EUR',
      value: plan.price,
      items: [{
        item_id: plan.id,
        item_name: plan.name,
        price: plan.price,
        quantity: 1
      }]
    });
  },
  
  // Compra completada
  purchase: function(transaction) {
    window.trackBigDataEvent('purchase', {
      transaction_id: transaction.id,
      currency: 'EUR',
      value: transaction.amount,
      tax: transaction.tax || 0,
      items: transaction.items || []
    });
  }
};

/**
 * Performance tracking
 */
window.trackPerformance = function() {
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    
    window.trackBigDataEvent('performance_metrics', {
      dns_lookup: timing.domainLookupEnd - timing.domainLookupStart,
      tcp_connection: timing.connectEnd - timing.connectStart,
      server_response: timing.responseStart - timing.requestStart,
      page_load: timing.loadEventEnd - timing.navigationStart,
      dom_interactive: timing.domInteractive - timing.navigationStart,
      dom_complete: timing.domComplete - timing.navigationStart
    });
  }
};

// Auto-track performance after page load
window.addEventListener('load', function() {
  setTimeout(window.trackPerformance, 0);
});

// Scroll depth tracking
let maxScroll = 0;
window.addEventListener('scroll', function() {
  const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
  
  // Track at 25%, 50%, 75%, 100%
  const milestones = [25, 50, 75, 100];
  milestones.forEach(milestone => {
    if (scrollPercent >= milestone && maxScroll < milestone) {
      window.trackBigDataEvent('scroll_depth', {
        depth_percent: milestone,
        page_path: window.location.pathname
      });
    }
  });
  
  maxScroll = Math.max(maxScroll, scrollPercent);
});

// Time on page tracking
let startTime = Date.now();
window.addEventListener('beforeunload', function() {
  const timeOnPage = Math.round((Date.now() - startTime) / 1000);
  window.trackBigDataEvent('time_on_page', {
    seconds: timeOnPage,
    page_path: window.location.pathname
  });
});

console.log('[BigData] Analytics initialized');
