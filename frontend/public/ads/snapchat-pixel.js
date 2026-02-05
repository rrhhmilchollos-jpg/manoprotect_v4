/**
 * ManoProtect - Snapchat Ads Pixel
 * Tracking de conversiones para Snapchat Ads
 */

// Snapchat Pixel ID
const SNAPCHAT_PIXEL_ID = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'; // TODO: Reemplazar

// Inicializar Snapchat Pixel
(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
{a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
r.src=n;var u=t.getElementsByTagName(s)[0];
u.parentNode.insertBefore(r,u);})(window,document,
'https://sc-static.net/scevent.min.js');

snaptr('init', SNAPCHAT_PIXEL_ID, {
  'user_email': '__INSERT_USER_EMAIL__'
});

snaptr('track', 'PAGE_VIEW');

/**
 * Eventos de Snapchat Ads
 */
window.SnapchatAds = {
  // Registro
  trackSignUp: function(data = {}) {
    snaptr('track', 'SIGN_UP', data);
  },
  
  // Ver producto
  trackViewContent: function(plan) {
    snaptr('track', 'VIEW_CONTENT', {
      item_ids: [plan.id],
      price: plan.price,
      currency: 'EUR'
    });
  },
  
  // Añadir al carrito
  trackAddToCart: function(plan) {
    snaptr('track', 'ADD_CART', {
      item_ids: [plan.id],
      price: plan.price,
      currency: 'EUR'
    });
  },
  
  // Compra
  trackPurchase: function(transaction) {
    snaptr('track', 'PURCHASE', {
      item_ids: [transaction.plan_id],
      price: transaction.amount,
      currency: 'EUR',
      transaction_id: transaction.id
    });
  },
  
  // Instalar app
  trackAppInstall: function() {
    snaptr('track', 'APP_INSTALL');
  }
};

console.log('[Snapchat Ads] Pixel initialized');
