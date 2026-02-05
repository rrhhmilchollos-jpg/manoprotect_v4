/**
 * ManoProtect - Twitter/X Ads Pixel
 * Tracking de conversiones para Twitter Ads
 */

// Twitter Pixel ID
const TWITTER_PIXEL_ID = 'XXXXXX'; // TODO: Reemplazar con tu Pixel ID

// Inicializar Twitter Pixel
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');

twq('config', TWITTER_PIXEL_ID);

/**
 * Eventos de Twitter Ads
 */
window.TwitterAds = {
  // Registro
  trackSignUp: function() {
    twq('event', 'tw-XXXXX-XXXXX', {
      conversion_id: 'signup'
    });
  },
  
  // Compra
  trackPurchase: function(transaction) {
    twq('event', 'tw-XXXXX-XXXXX', {
      conversion_id: 'purchase',
      value: transaction.amount,
      currency: 'EUR'
    });
  },
  
  // Descarga
  trackDownload: function() {
    twq('event', 'tw-XXXXX-XXXXX', {
      conversion_id: 'download'
    });
  },
  
  // Lead
  trackLead: function() {
    twq('event', 'tw-XXXXX-XXXXX', {
      conversion_id: 'lead'
    });
  }
};

console.log('[Twitter/X Ads] Pixel initialized');
