/**
 * ManoProtect - Conversion Tracking Service
 * Tracks funnel events: page_view → cta_click → begin_checkout → purchase_complete
 * Also handles A/B test variant assignment
 */

const API = process.env.REACT_APP_BACKEND_URL;

/* ── Visitor ID (persistent across sessions) ── */
const getVisitorId = () => {
  let id = localStorage.getItem('mp_visitor_id');
  if (!id) {
    id = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('mp_visitor_id', id);
  }
  return id;
};

/* ── Track conversion event ── */
export const trackConversion = async (eventType, metadata = {}) => {
  try {
    const variant = localStorage.getItem('mp_ab_variant') || null;
    const testId = localStorage.getItem('mp_ab_test_id') || null;

    await fetch(`${API}/api/cro/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        page: window.location.pathname,
        variant,
        test_id: testId,
        metadata
      })
    });

    // Also fire GA4 event
    if (window.gtag) {
      window.gtag('event', eventType, { ...metadata, page_path: window.location.pathname });
    }
    // Fire Meta Pixel event
    if (window.fbq) {
      const pixelMap = {
        page_view: 'PageView',
        cta_click: 'Lead',
        begin_checkout: 'InitiateCheckout',
        purchase_complete: 'Purchase'
      };
      if (pixelMap[eventType]) {
        window.fbq('track', pixelMap[eventType], metadata);
      }
    }
  } catch {
    // Silent fail - don't block UX
  }
};

/* ── A/B Test variant assignment ── */
export const getABVariant = async (testId) => {
  try {
    const cached = localStorage.getItem(`mp_ab_${testId}`);
    if (cached) return JSON.parse(cached);

    const res = await fetch(`${API}/api/cro/ab-test/${testId}`);
    if (!res.ok) return null;

    const data = await res.json();
    localStorage.setItem(`mp_ab_${testId}`, JSON.stringify(data));
    localStorage.setItem('mp_ab_variant', data.variant);
    localStorage.setItem('mp_ab_test_id', testId);

    return data;
  } catch {
    return null;
  }
};

/* ── Start email sequence for non-converting user ── */
export const startEmailSequence = async (email, name = '', source = 'landing') => {
  try {
    await fetch(`${API}/api/cro/email-sequence/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, source })
    });
  } catch {
    // Silent fail
  }
};

/* ── Stop email sequence (user converted) ── */
export const stopEmailSequence = async (email) => {
  try {
    await fetch(`${API}/api/cro/email-sequence/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  } catch {
    // Silent fail
  }
};

/* ── Convenience shortcuts ── */
export const trackPageView = (page) => trackConversion('page_view', { page });
export const trackCTAClick = (location, label) => trackConversion('cta_click', { location, label });
export const trackCheckoutStart = (plan) => trackConversion('begin_checkout', { plan });
export const trackPurchase = (plan, amount) => trackConversion('purchase_complete', { plan, amount });
