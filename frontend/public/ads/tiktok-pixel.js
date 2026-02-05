/**
 * ManoProtect - TikTok Ads Pixel
 * Tracking de conversiones para TikTok For Business
 */

// TikTok Pixel ID
const TIKTOK_PIXEL_ID = 'XXXXXXXXXX'; // TODO: Reemplazar con tu Pixel ID

// Inicializar TikTok Pixel
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};

  ttq.load(TIKTOK_PIXEL_ID);
  ttq.page();
}(window, document, 'ttq');

/**
 * Eventos de TikTok Ads
 */
window.TikTokAds = {
  // Registro completado
  trackSignUp: function(data = {}) {
    ttq.track('CompleteRegistration', {
      content_name: 'ManoProtect Signup',
      ...data
    });
  },
  
  // Ver producto/plan
  trackViewContent: function(plan) {
    ttq.track('ViewContent', {
      content_id: plan.id,
      content_name: plan.name,
      content_category: 'subscription',
      content_type: 'product',
      price: plan.price,
      currency: 'EUR'
    });
  },
  
  // Añadir al carrito
  trackAddToCart: function(plan) {
    ttq.track('AddToCart', {
      content_id: plan.id,
      content_name: plan.name,
      content_type: 'product',
      price: plan.price,
      currency: 'EUR',
      quantity: 1
    });
  },
  
  // Iniciar checkout
  trackInitiateCheckout: function(plan) {
    ttq.track('InitiateCheckout', {
      content_id: plan.id,
      content_name: plan.name,
      content_type: 'product',
      value: plan.price,
      currency: 'EUR'
    });
  },
  
  // Compra completada
  trackPurchase: function(transaction) {
    ttq.track('CompletePayment', {
      content_id: transaction.plan_id,
      content_name: transaction.plan_name,
      content_type: 'product',
      value: transaction.amount,
      currency: 'EUR',
      quantity: 1
    });
  },
  
  // Descargar app
  trackDownload: function() {
    ttq.track('Download', {
      content_name: 'ManoProtect App'
    });
  },
  
  // Contacto/Lead
  trackContact: function() {
    ttq.track('Contact');
  },
  
  // Evento personalizado
  trackCustom: function(eventName, data = {}) {
    ttq.track(eventName, data);
  }
};

console.log('[TikTok Ads] Pixel initialized');
