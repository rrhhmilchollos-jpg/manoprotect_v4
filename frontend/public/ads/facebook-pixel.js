/**
 * ManoProtect - Facebook & Instagram Ads Pixel
 * Tracking de conversiones y audiencias personalizadas
 */

// Facebook Pixel ID
const FB_PIXEL_ID = '1234567890'; // TODO: Reemplazar con tu Pixel ID

// Inicializar Facebook Pixel
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', FB_PIXEL_ID);
fbq('track', 'PageView');

/**
 * Eventos de Facebook Ads
 */
window.FacebookAds = {
  // Registro completado
  trackSignUp: function(data = {}) {
    fbq('track', 'CompleteRegistration', {
      content_name: 'ManoProtect Signup',
      status: 'completed',
      ...data
    });
  },
  
  // Ver plan/producto
  trackViewContent: function(plan) {
    fbq('track', 'ViewContent', {
      content_name: plan.name,
      content_category: 'subscription',
      content_ids: [plan.id],
      content_type: 'product',
      value: plan.price,
      currency: 'EUR'
    });
  },
  
  // Añadir al carrito
  trackAddToCart: function(plan) {
    fbq('track', 'AddToCart', {
      content_name: plan.name,
      content_ids: [plan.id],
      content_type: 'product',
      value: plan.price,
      currency: 'EUR'
    });
  },
  
  // Iniciar checkout
  trackInitiateCheckout: function(plan) {
    fbq('track', 'InitiateCheckout', {
      content_name: plan.name,
      content_ids: [plan.id],
      content_type: 'product',
      value: plan.price,
      currency: 'EUR',
      num_items: 1
    });
  },
  
  // Compra completada
  trackPurchase: function(transaction) {
    fbq('track', 'Purchase', {
      content_name: transaction.plan_name,
      content_ids: [transaction.plan_id],
      content_type: 'product',
      value: transaction.amount,
      currency: 'EUR',
      num_items: 1
    });
  },
  
  // Lead generado
  trackLead: function(data = {}) {
    fbq('track', 'Lead', {
      content_name: 'ManoProtect Lead',
      ...data
    });
  },
  
  // Contacto
  trackContact: function() {
    fbq('track', 'Contact');
  },
  
  // Evento personalizado
  trackCustom: function(eventName, data = {}) {
    fbq('trackCustom', eventName, data);
  }
};

console.log('[Facebook Ads] Pixel initialized');
