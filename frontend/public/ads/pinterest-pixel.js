/**
 * ManoProtect - Pinterest Tag
 * Tracking de conversiones para Pinterest Ads
 */

// Pinterest Tag ID
const PINTEREST_TAG_ID = '1234567890'; // TODO: Reemplazar

// Inicializar Pinterest Tag
!function(e){if(!window.pintrk){window.pintrk = function () {
window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
  n=window.pintrk;n.queue=[],n.version="3.0";var
  t=document.createElement("script");t.async=!0,t.src=e;var
  r=document.getElementsByTagName("script")[0];
  r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");

pintrk('load', PINTEREST_TAG_ID);
pintrk('page');

/**
 * Eventos de Pinterest Ads
 */
window.PinterestAds = {
  // Registro
  trackSignUp: function() {
    pintrk('track', 'signup');
  },
  
  // Ver producto
  trackViewContent: function(plan) {
    pintrk('track', 'pagevisit', {
      product_id: plan.id,
      product_name: plan.name,
      product_price: plan.price,
      product_category: 'subscription'
    });
  },
  
  // Añadir al carrito
  trackAddToCart: function(plan) {
    pintrk('track', 'addtocart', {
      product_id: plan.id,
      product_name: plan.name,
      product_price: plan.price,
      product_quantity: 1
    });
  },
  
  // Checkout
  trackCheckout: function(plan) {
    pintrk('track', 'checkout', {
      value: plan.price,
      currency: 'EUR',
      line_items: [{
        product_id: plan.id,
        product_name: plan.name,
        product_price: plan.price,
        product_quantity: 1
      }]
    });
  },
  
  // Lead
  trackLead: function() {
    pintrk('track', 'lead');
  }
};

console.log('[Pinterest Ads] Tag initialized');
