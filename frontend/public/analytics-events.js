/**
 * ManoProtect - Google Tag Manager & Analytics Events
 * Sistema completo de tracking para conversión y SEO
 * Versión 2.0 - Febrero 2026
 */

(function() {
  'use strict';
  
  // =====================================================
  // CONFIGURACIÓN GLOBAL
  // =====================================================
  
  const CONFIG = {
    GA4_MEASUREMENT_ID: 'G-8KECMQS45X',
    GTM_ID: 'GTM-MANOPROTECT',
    DEBUG_MODE: false,
    VERSION: '2.0.0'
  };
  
  // =====================================================
  // DATAAYER INITIALIZATION
  // =====================================================
  
  window.dataLayer = window.dataLayer || [];
  
  function gtag() {
    dataLayer.push(arguments);
  }
  
  // =====================================================
  // EVENTO HELPER
  // =====================================================
  
  const ManoProtectAnalytics = {
    
    // Track custom event
    trackEvent: function(eventName, params = {}) {
      const eventData = {
        event: eventName,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        page_path: window.location.pathname,
        ...params
      };
      
      if (CONFIG.DEBUG_MODE) {
        console.log('[ManoProtect Analytics]', eventName, eventData);
      }
      
      // Push to dataLayer for GTM
      dataLayer.push(eventData);
      
      // Also send to GA4 directly
      if (typeof gtag === 'function') {
        gtag('event', eventName, params);
      }
    },
    
    // =====================================================
    // EVENTOS DE PRODUCTOS - SENTINEL X & BOTÓN SOS
    // =====================================================
    
    // Vista de producto
    viewProduct: function(productData) {
      this.trackEvent('view_item', {
        currency: 'EUR',
        value: productData.price || 0,
        items: [{
          item_id: productData.id,
          item_name: productData.name,
          item_category: productData.category || 'Dispositivos SOS',
          item_variant: productData.variant || 'default',
          price: productData.price,
          quantity: 1
        }]
      });
    },
    
    // Click en Sentinel X
    clickSentinelX: function(location) {
      this.trackEvent('click_sentinel_x', {
        event_category: 'Product Interest',
        event_label: location || 'unknown',
        product_name: 'Sentinel X',
        product_id: 'SENTINEL-X-001'
      });
      
      // También como view_item
      this.viewProduct({
        id: 'SENTINEL-X-001',
        name: 'ManoProtect Sentinel X',
        category: 'Smartwatch SOS',
        price: 199.99
      });
    },
    
    // Click en Botón SOS
    clickSOSButton: function(location) {
      this.trackEvent('click_sos_button', {
        event_category: 'Product Interest',
        event_label: location || 'unknown',
        product_name: 'Botón SOS',
        product_id: 'SOS-BUTTON-001'
      });
      
      this.viewProduct({
        id: 'SOS-BUTTON-001',
        name: 'Botón SOS ManoProtect',
        category: 'Dispositivo Emergencia',
        price: 29.99
      });
    },
    
    // =====================================================
    // EVENTOS DE CARRITO Y CHECKOUT
    // =====================================================
    
    // Añadir al carrito
    addToCart: function(product, quantity = 1) {
      this.trackEvent('add_to_cart', {
        currency: 'EUR',
        value: product.price * quantity,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: quantity
        }]
      });
    },
    
    // Iniciar checkout
    beginCheckout: function(cartItems, totalValue) {
      this.trackEvent('begin_checkout', {
        currency: 'EUR',
        value: totalValue,
        items: cartItems.map(item => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity
        }))
      });
    },
    
    // Completar compra
    purchase: function(transactionData) {
      this.trackEvent('purchase', {
        transaction_id: transactionData.orderId,
        currency: 'EUR',
        value: transactionData.total,
        tax: transactionData.tax || 0,
        shipping: transactionData.shipping || 0,
        items: transactionData.items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity
        }))
      });
      
      // Google Ads conversion
      if (typeof gtag === 'function') {
        gtag('event', 'conversion', {
          'send_to': 'AW-16845584316/purchase',
          'value': transactionData.total,
          'currency': 'EUR',
          'transaction_id': transactionData.orderId
        });
      }
    },
    
    // =====================================================
    // EVENTOS DE REGISTRO Y SUSCRIPCIÓN
    // =====================================================
    
    // Inicio de registro
    startRegistration: function(planType) {
      this.trackEvent('start_registration', {
        event_category: 'Registration',
        event_label: planType,
        plan_type: planType
      });
    },
    
    // Selección de plan
    selectPlan: function(planName, planPrice, period) {
      this.trackEvent('select_plan', {
        event_category: 'Subscription',
        event_label: planName,
        plan_name: planName,
        plan_price: planPrice,
        billing_period: period
      });
    },
    
    // Registro completado
    completeRegistration: function(userData) {
      this.trackEvent('sign_up', {
        method: userData.method || 'email',
        plan_type: userData.planType,
        value: userData.planValue || 0
      });
      
      // Google Ads lead conversion
      if (typeof gtag === 'function') {
        gtag('event', 'conversion', {
          'send_to': 'AW-16845584316/lead',
          'value': userData.planValue || 0,
          'currency': 'EUR'
        });
      }
    },
    
    // =====================================================
    // EVENTOS DE ENGAGEMENT
    // =====================================================
    
    // Scroll depth
    trackScrollDepth: function(percentage) {
      this.trackEvent('scroll_depth', {
        event_category: 'Engagement',
        event_label: `${percentage}%`,
        scroll_percentage: percentage
      });
    },
    
    // Time on page
    trackTimeOnPage: function(seconds) {
      this.trackEvent('time_on_page', {
        event_category: 'Engagement',
        event_label: `${seconds}s`,
        time_seconds: seconds
      });
    },
    
    // Click en CTA
    clickCTA: function(ctaName, ctaLocation) {
      this.trackEvent('cta_click', {
        event_category: 'CTA',
        event_label: ctaName,
        cta_name: ctaName,
        cta_location: ctaLocation
      });
    },
    
    // Click WhatsApp
    clickWhatsApp: function(source) {
      this.trackEvent('click_whatsapp', {
        event_category: 'Contact',
        event_label: source,
        contact_method: 'whatsapp'
      });
    },
    
    // Click teléfono
    clickPhone: function(source) {
      this.trackEvent('click_call', {
        event_category: 'Contact',
        event_label: source,
        contact_method: 'phone'
      });
    },
    
    // =====================================================
    // EVENTOS DE BLOG Y CONTENIDO
    // =====================================================
    
    // Vista de artículo
    viewArticle: function(articleData) {
      this.trackEvent('view_article', {
        event_category: 'Content',
        event_label: articleData.title,
        article_id: articleData.id,
        article_category: articleData.category,
        article_author: articleData.author || 'ManoProtect'
      });
    },
    
    // Compartir artículo
    shareArticle: function(articleId, platform) {
      this.trackEvent('share', {
        method: platform,
        content_type: 'article',
        item_id: articleId
      });
    },
    
    // =====================================================
    // EVENTOS DE VIDEO
    // =====================================================
    
    videoStart: function(videoId, videoTitle) {
      this.trackEvent('video_start', {
        event_category: 'Video',
        event_label: videoTitle,
        video_id: videoId
      });
    },
    
    videoComplete: function(videoId, videoTitle) {
      this.trackEvent('video_complete', {
        event_category: 'Video',
        event_label: videoTitle,
        video_id: videoId
      });
    },
    
    // =====================================================
    // EVENTOS DE ERROR Y FORMULARIOS
    // =====================================================
    
    formSubmit: function(formName, success) {
      this.trackEvent('form_submit', {
        event_category: 'Form',
        event_label: formName,
        form_name: formName,
        success: success
      });
    },
    
    formError: function(formName, errorMessage) {
      this.trackEvent('form_error', {
        event_category: 'Form Error',
        event_label: errorMessage,
        form_name: formName,
        error_message: errorMessage
      });
    },
    
    // =====================================================
    // ECOMMERCE ENHANCED
    // =====================================================
    
    // Impresión de lista de productos
    viewItemList: function(listName, items) {
      this.trackEvent('view_item_list', {
        item_list_id: listName,
        item_list_name: listName,
        items: items.map((item, index) => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          index: index
        }))
      });
    },
    
    // Click en producto de lista
    selectItem: function(listName, item, position) {
      this.trackEvent('select_item', {
        item_list_id: listName,
        item_list_name: listName,
        items: [{
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          index: position
        }]
      });
    }
  };
  
  // =====================================================
  // AUTO-TRACKING SETUP
  // =====================================================
  
  // Scroll depth tracking
  let scrollMarks = [25, 50, 75, 90, 100];
  let scrollTracked = {};
  
  function checkScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);
    
    scrollMarks.forEach(mark => {
      if (scrollPercent >= mark && !scrollTracked[mark]) {
        scrollTracked[mark] = true;
        ManoProtectAnalytics.trackScrollDepth(mark);
      }
    });
  }
  
  // Time on page tracking
  let pageStartTime = Date.now();
  let timeMarks = [30, 60, 120, 300];
  let timeTracked = {};
  
  function checkTimeOnPage() {
    const elapsed = Math.round((Date.now() - pageStartTime) / 1000);
    
    timeMarks.forEach(mark => {
      if (elapsed >= mark && !timeTracked[mark]) {
        timeTracked[mark] = true;
        ManoProtectAnalytics.trackTimeOnPage(mark);
      }
    });
  }
  
  // Initialize auto-tracking
  document.addEventListener('DOMContentLoaded', function() {
    // Scroll tracking
    window.addEventListener('scroll', checkScrollDepth, { passive: true });
    
    // Time tracking
    setInterval(checkTimeOnPage, 5000);
    
    // Auto-track CTA clicks
    document.querySelectorAll('[data-track-cta]').forEach(el => {
      el.addEventListener('click', function() {
        const ctaName = this.getAttribute('data-track-cta');
        const ctaLocation = this.getAttribute('data-track-location') || 'unknown';
        ManoProtectAnalytics.clickCTA(ctaName, ctaLocation);
      });
    });
    
    // Auto-track WhatsApp clicks
    document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]').forEach(el => {
      el.addEventListener('click', function() {
        ManoProtectAnalytics.clickWhatsApp(window.location.pathname);
      });
    });
    
    // Auto-track phone clicks
    document.querySelectorAll('a[href^="tel:"]').forEach(el => {
      el.addEventListener('click', function() {
        ManoProtectAnalytics.clickPhone(window.location.pathname);
      });
    });
    
    console.log('[ManoProtect Analytics] v' + CONFIG.VERSION + ' initialized');
  });
  
  // Expose to global scope
  window.ManoProtectAnalytics = ManoProtectAnalytics;
  
})();
