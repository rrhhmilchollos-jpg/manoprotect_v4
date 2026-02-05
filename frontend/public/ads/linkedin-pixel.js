/**
 * ManoProtect - LinkedIn Insight Tag
 * Tracking de conversiones para LinkedIn Ads
 */

// LinkedIn Partner ID
const LINKEDIN_PARTNER_ID = '1234567'; // TODO: Reemplazar con tu Partner ID

// Inicializar LinkedIn Insight Tag
_linkedin_partner_id = LINKEDIN_PARTNER_ID;
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);

(function(l) {
  if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
  window.lintrk.q=[]}
  var s = document.getElementsByTagName("script")[0];
  var b = document.createElement("script");
  b.type = "text/javascript";b.async = true;
  b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
  s.parentNode.insertBefore(b, s);
})(window.lintrk);

/**
 * Eventos de LinkedIn Ads
 */
window.LinkedInAds = {
  // Conversión genérica
  trackConversion: function(conversionId) {
    window.lintrk('track', { conversion_id: conversionId });
  },
  
  // Registro
  trackSignUp: function() {
    window.lintrk('track', { conversion_id: 'signup' });
  },
  
  // Compra
  trackPurchase: function() {
    window.lintrk('track', { conversion_id: 'purchase' });
  },
  
  // Lead B2B
  trackB2BLead: function() {
    window.lintrk('track', { conversion_id: 'b2b_lead' });
  }
};

console.log('[LinkedIn Ads] Insight Tag initialized');
