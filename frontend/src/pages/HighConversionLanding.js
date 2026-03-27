/**
 * ManoProtect - Landing Principal v2
 * Colores: emerald (confianza) | Familias españolas | CTA "Probar 7 días gratis"
 * Hero > Beneficios > Cómo funciona > Productos > Comparativa > Testimonios > Urgencia > FAQ > Footer
 */
import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, MapPin, Phone, Bell, ChevronDown,
  Check, Star, Lock, Eye, Users,
  ArrowRight, X, Smartphone, Watch, Gift,
  History, Fingerprint, Wifi, Battery, Clock, Truck,
  Download
} from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';
import { trackPageView, trackCTAClick } from '@/services/conversionTracking';

/* ── Images (WebP optimized, local) ── */
const HERO_FAMILY = "/images/optimized/hero-family.webp";
const IMG_CHILD_SCHOOL = "/images/optimized/step-child.webp";
const IMG_ELDERLY = "/images/optimized/step-elderly.webp";
const IMG_TEENAGER = "/images/optimized/step-teenager.webp";
const SENTINEL_X_IMG = "/images/optimized/sentinel-x.webp";
const SENTINEL_J_IMG = "/images/optimized/sentinel-j.webp";
const SENTINEL_S_IMG = "/images/optimized/sentinel-s.webp";

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.manoprotect.www.twa';

const PlayStoreRating = ({ variant = 'dark', size = 'md' }) => {
  const isDark = variant === 'dark';
  const isSm = size === 'sm';
  return (
    <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer"
      className={`group inline-flex items-center gap-3 ${isSm ? 'px-3 py-2' : 'px-4 py-3'} ${isDark ? 'bg-white/10 hover:bg-white/20 border-white/20' : 'bg-slate-900 hover:bg-slate-800 border-slate-700'} border rounded-xl transition-all duration-300 hover:scale-[1.02]`}
      data-testid="play-store-rating"
      onClick={() => { if (window.gtag) window.gtag('event', 'play_store_click', { location: variant }); }}>
      <svg viewBox="0 0 24 24" className={`${isSm ? 'w-6 h-6' : 'w-8 h-8'} flex-shrink-0`}>
        <path d="M3.61 1.814L13.793 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.61-.92z" fill="#4285F4"/>
        <path d="M16.296 9.497l-2.503 2.503 2.503 2.503 3.236-1.87a1 1 0 000-1.732l-3.236-1.404z" fill="#FBBC04"/>
        <path d="M3.61 1.814L10.525 8.73l2.503-2.503L6.843.345A1 1 0 005.44.14L3.61 1.814z" fill="#EA4335"/>
        <path d="M3.61 22.186L5.44 23.86a1 1 0 001.403-.205l6.185-5.882-2.503-2.503L3.61 22.186z" fill="#34A853"/>
      </svg>
      <div>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(s => <Star key={s} className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${s <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-amber-400/60 text-amber-400/60'}`} />)}
          <span className={`${isSm ? 'text-xs' : 'text-sm'} font-bold ${isDark ? 'text-white' : 'text-white'} ml-1`}>4.8</span>
        </div>
        <p className={`${isSm ? 'text-[10px]' : 'text-xs'} ${isDark ? 'text-white/60' : 'text-slate-400'} font-medium`}>Google Play</p>
      </div>
      <div className={`ml-1 ${isSm ? 'hidden' : 'block'}`}>
        <Download className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-400'} group-hover:animate-bounce`} />
      </div>
    </a>
  );
};

const track = (n, p = {}) => {
  if (window.gtag) window.gtag('event', n, p);
  if (window.fbq) window.fbq('track', n, p);
};

/* Scroll reveal */
const useReveal = () => {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, v];
};

const Reveal = ({ children, className = '', delay = 0 }) => {
  const [ref, v] = useReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const HighConversionLanding = () => {
  const nav = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [promoData, setPromoData] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const API = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => { trackPageView('/'); }, []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => {
    fetch(`${API}/api/promo/sentinel-s/status`).then(r => r.json()).then(d => setPromoData(d)).catch(() => {});
  }, [API]);

  // Auto-scroll to #promo-sentinel when coming from TikTok link
  useEffect(() => {
    if (window.location.hash === '#promo-sentinel') {
      setTimeout(() => {
        const el = document.getElementById('promo-sentinel');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 800);
    }
  }, []);

  const handlePromoCheckout = async (planType) => {
    setPromoLoading(true);
    try {
      const res = await fetch(`${API}/api/promo/sentinel-s/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_type: planType, origin_url: window.location.origin })
      });
      const data = await res.json();
      if (res.ok && data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert(data.detail || 'Error al procesar');
      }
    } catch { alert('Error de conexión'); }
    finally { setPromoLoading(false); }
  };

  const cta = (loc) => {
    track('cta_click', { location: loc });
    trackCTAClick(loc, 'probar_gratis');
    nav('/registro');
  };

  return (
    <div className="min-h-screen bg-white" data-testid="high-conversion-landing">
      <Helmet>
        <title>Protección digital y alerta SOS familiar | ManoProtect</title>
        <meta name="description" content="ManoProtect protege a tu familia frente a emergencias y fraudes digitales. Activa alertas SOS, monitoreo GPS y asistencia inmediata. Prueba 7 días gratis." />
        <link rel="canonical" href="https://manoprotectt.com/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {"@type": "Question", "name": "¿Qué hace ManoProtect?", "acceptedAnswer": {"@type": "Answer", "text": "ManoProtect es un sistema de protección familiar digital con alertas SOS, localización GPS en tiempo real y protección contra estafas digitales. Protege a niños, adultos y mayores con los dispositivos Sentinel X, J y S."}},
            {"@type": "Question", "name": "¿Cómo funciona la alerta SOS?", "acceptedAnswer": {"@type": "Answer", "text": "Al pulsar el botón SOS del dispositivo Sentinel durante 3 segundos, se envía una alerta inmediata con localización GPS a todos los contactos de emergencia configurados. También se activa una llamada directa al contacto principal."}},
            {"@type": "Question", "name": "¿Protege contra estafas online?", "acceptedAnswer": {"@type": "Answer", "text": "Sí. ManoProtect detecta amenazas digitales como phishing, smishing y fraudes bancarios, y alerta al usuario y su familia en tiempo real. Ofrece protección contra las estafas online más comunes en España."}},
            {"@type": "Question", "name": "¿Cómo funciona el seguimiento GPS?", "acceptedAnswer": {"@type": "Answer", "text": "ManoProtect utiliza GPS optimizado que funciona incluso con la app cerrada y el móvil bloqueado. Consume menos del 3% de batería al día y ofrece localización en tiempo real."}},
            {"@type": "Question", "name": "¿Los datos son privados?", "acceptedAnswer": {"@type": "Answer", "text": "Sí. Todos los datos están cifrados con AES-256. Cumplimos con el RGPD. Solo tú y tus contactos autorizados pueden ver las ubicaciones."}}
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "ManoProtect",
          "url": "https://manoprotectt.com",
          "logo": "https://manoprotectt.com/manoprotect_logo.png",
          "description": "Sistema integral de protección familiar digital con alertas SOS, localización GPS y protección contra estafas online.",
          "address": {"@type": "PostalAddress", "addressCountry": "ES"},
          "sameAs": ["https://www.tiktok.com/@manoprotect"],
          "contactPoint": {"@type": "ContactPoint", "contactType": "customer service", "availableLanguage": "Spanish"}
        })}</script>
      </Helmet>

      {/* ═══════ HEADER ═══════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'}`} data-testid="main-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <span className="text-emerald-600 text-lg font-bold tracking-tight">ManoProtect</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-gray-500">
            <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({top:0,behavior:'smooth'}); }} className="hover:text-emerald-600 transition-colors" data-testid="nav-home">Home</a>
            <Link to="/alarmas-hogar" className="text-red-600 font-bold hover:text-red-700 transition-colors" data-testid="nav-alarmas">Alarmas</Link>
            <Link to="/escudo-vecinal" className="text-blue-500 font-bold hover:text-blue-600 transition-colors" data-testid="nav-escudo">Escudo Vecinal</Link>
            <Link to="/productos" className="hover:text-emerald-600 transition-colors" data-testid="nav-productos">Productos</Link>
            <Link to="/plans" className="hover:text-emerald-600 transition-colors" data-testid="nav-precios">Precios</Link>
            <Link to="/testimonios" className="hover:text-emerald-600 transition-colors" data-testid="nav-testimonios">Testimonios</Link>
            <Link to="/blog" className="hover:text-emerald-600 transition-colors" data-testid="nav-blog">Blog</Link>
            <Link to="/contacto" className="hover:text-emerald-600 transition-colors" data-testid="nav-contacto">Contacto</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block text-[13px] font-semibold text-gray-600 hover:text-emerald-600 transition-colors" data-testid="nav-login">Mi Cuenta</Link>
            <button onClick={() => cta('header')} className="bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold px-4 py-2 rounded-lg transition-colors" data-testid="header-cta">
              Probar 7 días gratis
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-gray-500 hover:text-emerald-600" data-testid="mobile-menu-toggle" aria-label="Menu de navegacion">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenu ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3" data-testid="mobile-menu">
            <Link to="/alarmas-hogar" onClick={() => setMobileMenu(false)} className="block text-sm text-red-600 font-bold hover:text-red-700" data-testid="mobile-nav-alarmas">Alarmas Hogar y Empresa</Link>
            <Link to="/escudo-vecinal" onClick={() => setMobileMenu(false)} className="block text-sm text-blue-500 font-bold hover:text-blue-600" data-testid="mobile-nav-escudo">Escudo Vecinal</Link>
            <Link to="/productos" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 hover:text-emerald-600">Productos</Link>
            <Link to="/plans" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 hover:text-emerald-600">Precios</Link>
            <Link to="/testimonios" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 hover:text-emerald-600">Testimonios</Link>
            <Link to="/blog" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 hover:text-emerald-600">Blog</Link>
            <Link to="/contacto" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 hover:text-emerald-600">Contacto</Link>
            <Link to="/login" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 hover:text-emerald-600">Mi Cuenta</Link>
          </div>
        )}
      </header>
      <div className="h-14" />

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 min-h-[600px]" data-testid="hero-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-5" data-testid="hero-title">
                Protege a tu familia frente a emergencias y estafas digitales
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed" data-testid="hero-subtitle">
                ManoProtect activa alertas SOS, monitoriza amenazas online y te ayuda cuando más lo necesitas.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-6">
                <button onClick={() => cta('hero')} className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-400 transition-all text-base shadow-xl shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0" data-testid="hero-cta-main">
                  <Shield className="w-5 h-5" /> Activar protección
                </button>
                <button onClick={() => cta('hero_trial')} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold px-6 py-4 rounded-xl hover:bg-white/20 transition-all text-base" data-testid="hero-cta-trial">
                  Probar 7 días gratis <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-400 justify-center lg:justify-start" data-testid="hero-microcopy">
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Sin compromiso</span>
                <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-400" /> Protección segura y privada</span>
                <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> Garantía de 7 días</span>
              </div>
              {/* Google Play Badge in Hero */}
              <div className="mt-5 flex justify-center lg:justify-start" data-testid="hero-play-store">
                <PlayStoreRating variant="dark" />
              </div>
            </div>

            {/* Hero: Familia española con Sentinel overlays */}
            <div className="relative flex justify-center">
              <div className="relative">
                <img src={HERO_FAMILY} alt="Familia española protegida con relojes Sentinel" className="rounded-2xl shadow-2xl w-full max-w-lg object-cover" style={{ aspectRatio: '3/2' }} loading="eager" fetchpriority="high" width="600" height="400" data-testid="hero-family-image" />
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-2 flex items-center gap-2 animate-pulse">
                  <img src={SENTINEL_X_IMG} alt="Sentinel X" className="w-10 h-10 object-contain" width="40" height="40" />
                  <div><p className="text-[10px] text-gray-500 font-medium">Sentinel X</p><p className="text-xs font-bold text-gray-900">Adultos</p></div>
                </div>
                <div className="absolute -top-3 -right-3 bg-white rounded-xl shadow-xl p-2 flex items-center gap-2 animate-pulse" style={{ animationDelay: '500ms' }}>
                  <img src={SENTINEL_J_IMG} alt="Sentinel J" className="w-10 h-10 object-contain" width="40" height="40" />
                  <div><p className="text-[10px] text-gray-500 font-medium">Sentinel J</p><p className="text-xs font-bold text-gray-900">Niños</p></div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl p-2 flex items-center gap-2 animate-pulse" style={{ animationDelay: '1000ms' }}>
                  <img src={SENTINEL_S_IMG} alt="Sentinel S" className="w-10 h-10 object-contain" width="40" height="40" />
                  <div><p className="text-[10px] text-gray-500 font-medium">Sentinel S</p><p className="text-xs font-bold text-gray-900">Mayores</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ PROMO SENTINEL S — TIKTOK CAMPAIGN ═══════ */}
      {promoData && promoData.active && (
        <section className="relative overflow-hidden" id="promo-sentinel" data-testid="promo-sentinel-section">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)' }} />
          
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/30 backdrop-blur-sm border border-white/30 rounded-full text-white text-xs font-bold mb-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" /> EXCLUSIVO TIKTOK
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-bold mb-4 animate-pulse ml-2">
                  <Gift className="w-4 h-4" />
                  OFERTA LIMITADA — Solo {promoData.remaining} unidades
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4" data-testid="promo-title">
                  Sentinel S
                  <span className="block text-yellow-200">GRATIS</span>
                  <span className="block text-xl sm:text-2xl font-bold mt-1 text-white/90">con tu suscripcion ManoProtect</span>
                </h2>
                
                <p className="text-white/80 text-base mb-6 max-w-md mx-auto lg:mx-0">
                  Suscribete a ManoProtect por <strong className="text-yellow-200">49,99 EUR/mes</strong> y llevate un <strong className="text-white">Sentinel S valorado en 149 EUR</strong> completamente gratis. Solo para los primeros 100 suscriptores de TikTok.
                </p>

                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 mb-6 max-w-md mx-auto lg:mx-0" data-testid="promo-counter">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/70">Unidades restantes</span>
                    <span className="text-yellow-300 font-bold">{promoData.remaining}/{promoData.total}</span>
                  </div>
                  <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-red-500 rounded-full transition-all duration-1000" style={{ width: `${Math.max(5, (promoData.claimed / promoData.total) * 100)}%` }} />
                  </div>
                  <p className="text-xs text-white/60 mt-2 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Envio garantizado a los primeros 100 suscriptores
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-6 max-w-md mx-auto lg:mx-0">
                  <p className="text-white font-bold text-sm mb-2 flex items-center gap-2"><Check className="w-4 h-4 text-yellow-300" /> Lo que recibes:</p>
                  <ul className="text-white/80 text-sm space-y-1.5">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Suscripcion ManoProtect: 49,99 EUR/mes</li>
                    <li className="flex items-center gap-2"><Gift className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" /> Sentinel S GRATIS (valor 149 EUR) — solo primeros 100</li>
                    <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" /> Acceso completo a todos los beneficios ManoProtect</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                  <button onClick={() => handlePromoCheckout('sentinel-promo-monthly')} disabled={promoLoading}
                    className="flex-1 bg-white text-red-600 font-extrabold py-4 px-6 rounded-xl hover:bg-yellow-50 transition-all hover:scale-[1.02] shadow-xl text-center disabled:opacity-50"
                    data-testid="promo-cta-monthly">
                    {promoLoading ? 'Procesando...' : <><span className="text-lg">Suscribirme y recibir mi Sentinel S</span><br /><span className="text-xs font-semibold text-red-400">49,99 EUR/mes + Sentinel S GRATIS</span></>}
                  </button>
                </div>
                <div className="mt-3 max-w-md mx-auto lg:mx-0">
                  <button onClick={() => handlePromoCheckout('sentinel-promo-yearly')} disabled={promoLoading}
                    className="w-full bg-yellow-400 text-black font-extrabold py-3 px-6 rounded-xl hover:bg-yellow-300 transition-all hover:scale-[1.02] shadow-xl text-center relative disabled:opacity-50"
                    data-testid="promo-cta-yearly">
                    <span className="absolute -top-2.5 right-3 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">AHORRA 100 EUR</span>
                    {promoLoading ? 'Procesando...' : <><span className="text-sm">O paga anual: 499,99 EUR/ano + Sentinel S GRATIS</span></>}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-4 text-xs text-white/70">
                  <span className="flex items-center gap-1"><Check className="w-3 h-3" /> 1 por usuario</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Sin permanencia</span>
                  <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Pago seguro Stripe</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Se agotan rapido</span>
                </div>
              </div>

              <div className="flex justify-center order-first lg:order-last">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full scale-75" />
                  <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center">
                    <div className="absolute -top-4 -right-4 bg-red-500 text-white font-black text-sm px-4 py-2 rounded-xl rotate-6 shadow-lg">
                      GRATIS
                    </div>
                    {SENTINEL_S_IMG ? (
                      <img src={SENTINEL_S_IMG} alt="Sentinel S" className="w-32 h-32 object-contain mx-auto mb-4 drop-shadow-2xl" />
                    ) : (
                      <Watch className="w-32 h-32 text-white/90 mx-auto mb-4 drop-shadow-2xl" />
                    )}
                    <h3 className="text-white font-bold text-xl mb-1">SENTINEL S</h3>
                    <p className="text-white/60 text-sm mb-3">Reloj GPS + SOS para mayores</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-black text-yellow-300">0€</span>
                      <span className="text-white/40 line-through text-lg">149€</span>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-white/70 text-left">
                      <div className="flex items-center gap-2"><Check className="w-3 h-3 text-yellow-300 flex-shrink-0" /> GPS en tiempo real</div>
                      <div className="flex items-center gap-2"><Check className="w-3 h-3 text-yellow-300 flex-shrink-0" /> Botón SOS de emergencia</div>
                      <div className="flex items-center gap-2"><Check className="w-3 h-3 text-yellow-300 flex-shrink-0" /> Detector de caídas</div>
                      <div className="flex items-center gap-2"><Check className="w-3 h-3 text-yellow-300 flex-shrink-0" /> Llamada directa</div>
                      <div className="flex items-center gap-2"><Check className="w-3 h-3 text-yellow-300 flex-shrink-0" /> Resistente al agua</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ BENEFICIOS VISUALES ═══════ */}
      <section className="py-16 sm:py-20 bg-white" id="beneficios" data-testid="benefits-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Todo lo que necesitas para proteger a tu familia</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Un solo sistema, protección completa para todos.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Bell className="w-10 h-10" />, bg: 'bg-red-50', ring: 'ring-red-100', text: 'text-red-500', title: 'Botón SOS inmediato', desc: 'Envía una señal de emergencia en segundos con ubicación GPS exacta a todos tus contactos.' },
              { icon: <Shield className="w-10 h-10" />, bg: 'bg-emerald-50', ring: 'ring-emerald-100', text: 'text-emerald-600', title: 'Protección contra estafas online', desc: 'Detecta amenazas digitales como phishing, smishing y fraudes bancarios en tiempo real.' },
              { icon: <MapPin className="w-10 h-10" />, bg: 'bg-blue-50', ring: 'ring-blue-100', text: 'text-blue-500', title: 'Localización en emergencias', desc: 'Saber dónde están tus seres queridos cuando más importa, con GPS de alta precisión.' },
              { icon: <Users className="w-10 h-10" />, bg: 'bg-violet-50', ring: 'ring-violet-100', text: 'text-violet-500', title: 'Seguridad familiar completa', desc: 'Protege a niños, adultos y mayores con un solo sistema. Toda la familia conectada.' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 h-full group" data-testid={`benefit-card-${i}`}>
                  <div className={`w-20 h-20 ${item.bg} ring-8 ${item.ring} rounded-2xl flex items-center justify-center ${item.text} mx-auto mb-5 group-hover:scale-110 transition-transform`}>{item.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => cta('benefits')} className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-0.5" data-testid="benefits-cta">
              Activar protección ahora <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════ CÓMO FUNCIONA ═══════ */}
      <section className="py-16 sm:py-20 bg-slate-50" id="como-funciona" data-testid="how-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Cómo funciona ManoProtect</h2>
            <p className="text-gray-500">Activa tu protección en 3 simples pasos.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Activa tu cuenta en menos de 1 minuto', desc: 'Regístrate, elige tu plan y configura los contactos de emergencia. Sin complicaciones.', color: 'from-emerald-500 to-emerald-600' },
              { step: '2', title: 'Protege a todos los miembros de tu familia', desc: 'Añade a niños, adultos y mayores. Cada uno con su dispositivo Sentinel adaptado.', color: 'from-blue-500 to-blue-600' },
              { step: '3', title: 'Recibe alertas y asistencia inmediata', desc: 'Botón SOS, localización GPS, protección digital y notificaciones en tiempo real. 24/7.', color: 'from-violet-500 to-violet-600' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="relative text-center" data-testid={`step-${i}`}>
                  {i < 2 && <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-gray-300 to-transparent" />}
                  <div className={`w-24 h-24 bg-gradient-to-br ${item.color} rounded-3xl flex items-center justify-center text-white text-4xl font-black mx-auto mb-6 shadow-lg`}>
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={() => cta('how_works')} className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-0.5" data-testid="how-cta">
              Probar 7 días gratis <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════ PRODUCTOS DESTACADOS ═══════ */}
      <section className="py-16 sm:py-20 bg-white" id="productos" data-testid="products-section" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 900px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Productos destacados</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Elige el Sentinel perfecto para tu familia.</p>
          </div>
          {/* Promo banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl p-4 text-center mb-8" data-testid="promo-banner">
            <p className="text-white font-bold text-sm">OFERTA LANZAMIENTO: <span className="bg-white/20 px-2 py-0.5 rounded">-20% para los primeros 200 suscriptores</span> en planes de pago</p>
            <p className="text-emerald-100 text-xs mt-1">Sentinel X Basic GRATIS (solo 50 unidades) con plan Basic</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Sentinel X */}
            <Reveal delay={0}>
              <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl overflow-hidden border border-gray-800 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 group relative" data-testid="product-sentinel-x">
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-center py-1 text-[11px] font-bold">SOLO 50 UNIDADES BASIC GRATIS</div>
                <div className="p-6 pt-10 text-center">
                  <span className="inline-block text-xs font-bold bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full mb-4">ADULTOS Y ADOLESCENTES</span>
                  <img src={SENTINEL_X_IMG} alt="Sentinel X" className="w-40 h-40 object-contain mx-auto mb-4 group-hover:scale-105 transition-transform" loading="lazy" decoding="async" width="160" height="160" />
                  <h3 className="text-2xl font-bold text-white mb-2">Sentinel X</h3>
                  <p className="text-sm text-gray-400 mb-4">GPS, SOS, batería larga, resistente al agua</p>
                  <ul className="text-left space-y-2 text-sm text-gray-300 mb-4">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> GPS en tiempo real</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Botón SOS invisible</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Batería 5 días</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Resistente al agua · 4G</li>
                  </ul>
                  <div className="bg-white/5 rounded-xl p-3 mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Basic (50 uds):</span>
                      <span className="text-lg font-bold text-emerald-400">GRATIS*</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Fundadores:</span>
                      <div><span className="text-lg font-bold text-white">199€</span> <span className="text-xs text-gray-500 line-through">249€</span></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Premium:</span>
                      <div><span className="text-lg font-bold text-white">279€</span> <span className="text-xs text-gray-500 line-through">349€</span></div>
                    </div>
                    <p className="text-[10px] text-gray-500 text-center">*Con suscripción Plan Basic (9,99€/mes)</p>
                  </div>
                  <Link to="/sentinel-x" className="block w-full text-center py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors" data-testid="cta-sentinel-x">
                    Comprar ahora
                  </Link>
                </div>
              </div>
            </Reveal>

            {/* Sentinel J */}
            <Reveal delay={150}>
              <div className="bg-white rounded-2xl overflow-hidden border-2 border-pink-200 hover:border-pink-400 transition-all duration-300 hover:shadow-xl group relative" data-testid="product-sentinel-j">
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-pink-500 to-violet-500 text-white text-center py-1 text-xs font-bold">PARA NIÑOS – 8 COLORES</div>
                <div className="p-6 pt-10 text-center">
                  <span className="inline-block text-xs font-bold bg-pink-100 text-pink-600 px-3 py-1 rounded-full mb-4">3-12 AÑOS</span>
                  <img src={SENTINEL_J_IMG} alt="Sentinel J" className="w-40 h-40 object-contain mx-auto mb-4 group-hover:scale-105 transition-transform" loading="lazy" decoding="async" width="160" height="160" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Sentinel J</h3>
                  <p className="text-sm text-gray-500 mb-4">GPS, SOS, batería larga, resistente al agua</p>
                  <ul className="text-left space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-pink-500 flex-shrink-0" /> GPS en tiempo real</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-pink-500 flex-shrink-0" /> Botón SOS grande</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-pink-500 flex-shrink-0" /> Batería 4 días</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-pink-500 flex-shrink-0" /> 8 correas de colores</li>
                  </ul>
                  <div className="bg-pink-50 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold text-pink-600">79€</span>
                      <span className="text-sm text-gray-400 line-through">99€</span>
                      <span className="bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-20%</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Precio promo primeros 200 suscriptores</p>
                  </div>
                  <Link to="/sentinel-j" className="block w-full text-center py-3 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white font-bold rounded-xl transition-colors" data-testid="cta-sentinel-j">
                    Comprar ahora
                  </Link>
                </div>
              </div>
            </Reveal>

            {/* Sentinel S */}
            <Reveal delay={300}>
              <div className="bg-gradient-to-b from-[#FAFAF8] to-white rounded-2xl overflow-hidden border-2 border-[#B4A7D6]/30 hover:border-[#B4A7D6] transition-all duration-300 hover:shadow-xl group" data-testid="product-sentinel-s">
                <div className="p-6 text-center">
                  <span className="inline-block text-xs font-bold bg-[#B4A7D6]/20 text-[#8B7CB8] px-3 py-1 rounded-full mb-4">ADULTOS Y MAYORES</span>
                  <img src={SENTINEL_S_IMG} alt="Sentinel S" className="w-40 h-40 object-contain mx-auto mb-4 group-hover:scale-105 transition-transform" loading="lazy" decoding="async" width="160" height="160" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Sentinel S</h3>
                  <p className="text-sm text-gray-500 mb-4">GPS, SOS, monitoreo discreto, batería extendida</p>
                  <ul className="text-left space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#B4A7D6] flex-shrink-0" /> GPS + SOS silencioso</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#B4A7D6] flex-shrink-0" /> Alerta anti-retirada</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#B4A7D6] flex-shrink-0" /> Sirena 120dB</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#B4A7D6] flex-shrink-0" /> Cerámica + rose gold</li>
                  </ul>
                  <div className="bg-[#B4A7D6]/10 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold text-[#8B7CB8]">103€</span>
                      <span className="text-sm text-gray-400 line-through">129€</span>
                      <span className="bg-[#B4A7D6] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-20%</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Precio promo primeros 200 suscriptores</p>
                  </div>
                  <Link to="/sentinel-s" className="block w-full text-center py-3 bg-[#2D2A33] hover:bg-[#3D3A43] text-white font-bold rounded-xl transition-colors" data-testid="cta-sentinel-s">
                    Comprar ahora
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Microcopy */}
          <p className="text-center text-xs text-gray-400 mt-8">Precios con descuento -20% válido para los primeros 200 suscriptores. Envío desde 4,95€. Compatible con iOS 14+ / Android 8.0+</p>
        </div>
      </section>

      {/* ═══════ TABLA COMPARATIVA ═══════ */}
      <section className="py-16 sm:py-20 bg-slate-50" data-testid="comparison-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Tabla comparativa</h2>
            <p className="text-gray-500">Elige el Sentinel perfecto para cada miembro de tu familia.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm" data-testid="comparison-table">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left text-sm font-bold text-gray-900 border-b">Función</th>
                  <th className="p-4 text-center text-sm font-bold border-b"><span className="text-emerald-600">X</span><span className="text-gray-500 text-xs block">Sentinel X</span></th>
                  <th className="p-4 text-center text-sm font-bold border-b"><span className="text-pink-500">J</span><span className="text-gray-500 text-xs block">Sentinel J</span></th>
                  <th className="p-4 text-center text-sm font-bold border-b"><span className="text-[#8B7CB8]">S</span><span className="text-gray-500 text-xs block">Sentinel S</span></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ['GPS en tiempo real', true, true, true],
                  ['Botón SOS', true, true, true],
                  ['Resistente al agua', true, true, true],
                  ['Conectividad 4G', true, true, true],
                  ['Bluetooth 5.0', true, true, true],
                  ['SOS invisible', true, true, true],
                  ['Grabación en la nube', true, true, true],
                  ['Correas intercambiables', true, true, true],
                  ['Alerta anti-retirada', true, true, true],
                  ['Sirena 120dB', true, true, true],
                  ['E-SIM integrada', true, true, true],
                  ['Con cámara y con internet', true, true, true],
                  ['Sensor cardíaco', true, true, true],
                  ['Funciona en segundo plano', true, true, true],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-medium text-gray-900 border-b border-gray-100">{row[0]}</td>
                    <td className="p-3 text-center border-b border-gray-100">{row[1] ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}</td>
                    <td className="p-3 text-center border-b border-gray-100">{row[2] ? <Check className="w-5 h-5 text-pink-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}</td>
                    <td className="p-3 text-center border-b border-gray-100">{row[3] ? <Check className="w-5 h-5 text-[#B4A7D6] mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════ SIMULACIÓN SOS INTERACTIVA ═══════ */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-red-900" data-testid="sos-demo-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Mira cómo funciona el botón SOS</h2>
            <p className="text-gray-400">Así de rápido actúa ManoProtect en una emergencia real.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* SOS Button */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="relative w-36 h-36 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30 ring-8 ring-red-500/20 cursor-pointer hover:scale-105 transition-transform" data-testid="sos-demo-button">
                    <span className="text-white font-black text-3xl tracking-wider">SOS</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-4">Pulsa 3 segundos para activar</p>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {[
                  { num: '1', text: 'Se envía tu ubicación GPS exacta', time: '0.5s', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
                  { num: '2', text: 'Se avisa a tu familia inmediatamente', time: '1s', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                  { num: '3', text: 'Se activa grabación de audio en la nube', time: '1.5s', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                  { num: '4', text: 'Se abre alerta en la central CRA', time: '2s', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                ].map((s, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${s.color} transition-all`} data-testid={`sos-step-${i}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${s.color}`}>{s.num}</div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{s.text}</p>
                      <p className="text-xs text-gray-500">En {s.time}</p>
                    </div>
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <button onClick={() => cta('sos_demo')} className="inline-flex items-center gap-2 bg-red-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 hover:-translate-y-0.5" data-testid="sos-demo-cta">
              Activar protección SOS <Shield className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════ CONFÍAN EN MANOPROTECT (TRUST STATS) ═══════ */}
      <section className="py-16 sm:py-20 bg-white" data-testid="trust-stats-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Confían en ManoProtect</h2>
            <p className="text-gray-500">Miles de familias españolas ya se sienten más seguras.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '+2.400', label: 'Familias protegidas', color: 'text-emerald-600' },
              { value: '24/7', label: 'Soporte y monitorización', color: 'text-blue-600' },
              { value: '99.9%', label: 'Disponibilidad del servicio', color: 'text-violet-600' },
              { value: '<2s', label: 'Tiempo de alerta SOS', color: 'text-red-500' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="text-center p-6 bg-gray-50 rounded-2xl" data-testid={`trust-stat-${i}`}>
                  <p className={`text-3xl sm:text-4xl font-black ${s.color} mb-1`}>{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Trust Seals */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-8 border-t border-gray-100">
            {[
              { icon: <Lock className="w-5 h-5 text-emerald-500" />, text: 'SSL Seguro' },
              { icon: <Shield className="w-5 h-5 text-blue-500" />, text: 'Cifrado AES-256' },
              { icon: <Check className="w-5 h-5 text-violet-500" />, text: 'Cumple RGPD' },
              { icon: <MapPin className="w-5 h-5 text-red-500" />, text: 'Servidores en Europa' },
              { icon: <Lock className="w-5 h-5 text-amber-500" />, text: 'Pagos seguros Stripe' },
            ].map((seal, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full" data-testid={`trust-seal-${i}`}>
                {seal.icon} {seal.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIOS – RESEÑAS GOOGLE ═══════ */}
      <section className="py-16 sm:py-20 bg-white" data-testid="testimonials-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-full mb-4">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
              <span className="text-xs font-bold text-gray-700">4.9/5 en Google</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Familias españolas que ya confían en nosotros</h2>
            <p className="text-gray-500">Reseñas verificadas en Google Maps</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { text: 'Lo compramos para nuestro hijo de 9 años cuando empezó a ir solo al cole. La primera semana ya nos avisó que había llegado a casa de su abuela sin problemas. La app es muy fácil de usar y el reloj le encanta, no se lo quita. Lo mejor: la tranquilidad que nos da como padres.', name: 'Patricia Navarro', role: 'Madre', city: 'Getafe, Madrid', time: 'Hace 2 semanas', stars: 5, product: 'Sentinel J' },
              { text: 'Mi padre tiene principio de Alzheimer y se sale a caminar solo sin avisar. Desde que le pusimos el Sentinel S, sabemos exactamente dónde está. El otro día se desorientó volviendo del mercado y con el GPS pudimos ir a buscarle en 5 minutos. Una inversión que vale cada céntimo.', name: 'Alejandro Ruiz', role: 'Hijo', city: 'Hospitalet, Barcelona', time: 'Hace 1 mes', stars: 5, product: 'Sentinel S' },
              { text: 'Tenemos 3 hijos y cada uno lleva su Sentinel J con un color diferente. Las zonas seguras funcionan genial: nos avisa cuando llegan al cole, a las extraescolares y cuando salen. Mi marido y yo podemos ver todo desde nuestros móviles. El soporte por WhatsApp es rapidísimo.', name: 'Marta Jiménez', role: 'Madre', city: 'Torrent, Valencia', time: 'Hace 3 semanas', stars: 5, product: 'Sentinel J' },
              { text: 'Soy monitor de campamentos y recomendé ManoProtect a varios padres. Es la única solución que funciona en zonas de montaña con 4G. Durante la última acampada en los Pirineos, todos los padres podían ver la ubicación de sus hijos en tiempo real. Impresionante.', name: 'David Fernández', role: 'Monitor de tiempo libre', city: 'Huesca, Aragón', time: 'Hace 1 mes', stars: 5, product: 'Sentinel X' },
              { text: 'Mi madre vive sola en el pueblo y tiene 82 años. Desde que le puse el Sentinel S está más tranquila ella y nosotros. La semana pasada se cayó haciendo la compra y pulsó el botón SOS. Nos llegó la notificación al instante con su ubicación exacta. Llegamos en minutos. Gracias ManoProtect.', name: 'Carmen López', role: 'Hija', city: 'Córdoba, Andalucía', time: 'Hace 2 meses', stars: 5, product: 'Sentinel S' },
              { text: 'Mi hija de 14 años va en transporte público al instituto. Con el Sentinel X puedo ver que llega bien sin tener que llamarla cada día. Ella está contenta porque el reloj es bonito y no parece "de control". A mí me da paz. Relación calidad-precio espectacular con el plan anual.', name: 'Francisco García', role: 'Padre', city: 'Málaga, Andalucía', time: 'Hace 3 semanas', stars: 5, product: 'Sentinel X' },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition-all duration-300 h-full flex flex-col" data-testid={`testimonial-${i}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5">{Array.from({length: t.stars}).map((_, s) => <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 opacity-40" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <p className="text-[13px] text-gray-600 mb-4 leading-relaxed flex-1">"{t.text}"</p>
                  <div className="mt-auto">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">{t.name.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.role} · {t.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded">{t.product}</span>
                      <span className="text-[10px] text-gray-400">{t.time}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Google rating summary + Play Store */}
          <div className="text-center mt-8 space-y-3">
            <div className="inline-flex items-center gap-3 bg-slate-50 border border-gray-200 rounded-full px-6 py-3">
              <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
              <span className="text-sm font-bold text-gray-700">4.9 de 5</span>
              <span className="text-xs text-gray-400">basado en 127 reseñas en Google</span>
            </div>
            <div className="flex justify-center">
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm shadow-md hover:shadow-lg"
                data-testid="testimonials-play-store">
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                  <path d="M3.61 1.814L13.793 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.61-.92z" fill="#4285F4"/>
                  <path d="M16.296 9.497l-2.503 2.503 2.503 2.503 3.236-1.87a1 1 0 000-1.732l-3.236-1.404z" fill="#FBBC04"/>
                  <path d="M3.61 1.814L10.525 8.73l2.503-2.503L6.843.345A1 1 0 005.44.14L3.61 1.814z" fill="#EA4335"/>
                  <path d="M3.61 22.186L5.44 23.86a1 1 0 001.403-.205l6.185-5.882-2.503-2.503L3.61 22.186z" fill="#34A853"/>
                </svg>
                <span>Descargar en Google Play</span>
                <div className="flex gap-0.5 ml-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-amber-400/50 text-amber-400/50'}`} />)}
                </div>
                <span className="text-emerald-400 font-bold text-xs">4.8</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ REFERRAL - INVITA A TU FAMILIA ═══════ */}
      <section className="py-12 bg-gradient-to-r from-violet-600 to-indigo-600" data-testid="referral-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Invita a 3 familiares y obtén 1 mes gratis</h2>
              <p className="text-violet-200 text-sm">Comparte ManoProtect con tu familia. Cada familiar que se suscriba te da un mes de regalo.</p>
            </div>
            <button onClick={() => cta('referral')} className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-violet-600 font-bold px-6 py-3 rounded-xl hover:bg-violet-50 transition-all shadow-lg" data-testid="referral-cta">
              <Users className="w-5 h-5" /> Invitar ahora
            </button>
          </div>
        </div>
      </section>

      {/* ═══════ CTA URGENCIA ═══════ */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-emerald-600 to-emerald-500" data-testid="urgency-section" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Gift className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3" data-testid="urgency-title">
            Stock limitado – Obtén tu Sentinel hoy y prueba gratis 7 días
          </h2>
          <p className="text-emerald-100 mb-8 text-lg">Sin compromiso. Cancela cuando quieras. Garantía de devolución de 14 días.</p>
          <button onClick={() => cta('urgency')} className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold px-10 py-5 rounded-xl hover:bg-emerald-50 transition-all text-lg shadow-xl hover:scale-105 hover:-translate-y-0.5" data-testid="urgency-cta">
            Probar 7 días gratis <ArrowRight className="w-6 h-6" />
          </button>
          <div className="mt-6 flex justify-center">
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl px-5 py-2.5 transition-all"
              data-testid="urgency-play-store">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-amber-400/60 text-amber-400/60'}`} />)}
              </div>
              <span className="text-white font-bold text-sm">4.8 en Google Play</span>
              <span className="text-emerald-200 text-xs">Descargar</span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════ FAQ RÁPIDO ═══════ */}
      <section className="py-16 sm:py-20 bg-white" id="faq" data-testid="faq-section" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">Preguntas frecuentes</h2>
          {[
            { q: '¿Qué hace ManoProtect?', a: 'ManoProtect es un sistema de protección familiar digital con alertas SOS, localización GPS en tiempo real y protección contra estafas digitales. Protege a niños, adultos y mayores con los dispositivos Sentinel X, J y S.' },
            { q: '¿Cómo funciona la alerta SOS?', a: 'Al pulsar el botón SOS del dispositivo Sentinel durante 3 segundos, se envía una alerta inmediata con localización GPS a todos los contactos de emergencia configurados. También se activa una llamada directa al contacto principal.' },
            { q: '¿Protege contra estafas online?', a: 'Sí. ManoProtect detecta amenazas digitales como phishing, smishing y fraudes bancarios, y alerta al usuario y su familia en tiempo real.' },
            { q: '¿Cómo funciona el seguimiento en segundo plano?', a: 'ManoProtect utiliza GPS optimizado que funciona incluso con la app cerrada y el móvil bloqueado. Consume menos del 3% de batería al día.' },
            { q: '¿Qué pasa si la batería se agota?', a: 'Antes de agotarse, el reloj envía la última ubicación conocida y una alerta a los contactos configurados. La batería dura entre 3 y 5 días según el modelo.' },
            { q: '¿Los datos son privados?', a: 'Sí. Todos los datos están cifrados con AES-256. Cumplimos con RGPD. Solo tú y tus contactos autorizados pueden ver las ubicaciones.' },
            { q: '¿Es compatible con iOS y Android?', a: 'Sí. La app ManoProtect funciona en iPhone (iOS 14+) y Android (8.0+). Los relojes Sentinel se conectan vía Bluetooth o 4G.' },
            { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí. Sin permanencia. Cancela desde la app cuando quieras. Si no te convence en 7 días, te devolvemos el dinero.' },
          ].map((faq, i) => (
            <div key={i} className="border-b border-gray-200" data-testid={`faq-${i}`}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-5 text-left">
                <span className="font-semibold text-gray-900 text-[15px] pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 pb-5' : 'max-h-0'}`}>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
          <div className="text-center mt-8">
            <Link to="/faq" className="text-emerald-600 font-semibold hover:underline text-sm" data-testid="faq-more-link">
              Ver todas las preguntas <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ VIDEOS DE MARKETING ═══════ */}
      <section className="py-16 bg-white" data-testid="marketing-videos">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Así protege ManoProtect a las familias españolas</h2>
              <p className="text-gray-500 text-sm sm:text-base">Historias reales de familias que confían en nosotros cada día</p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { img: "/images/optimized/gallery-garcia.webp", title: "La familia García", desc: "Toda la familia protegida con Sentinel X" },
              { img: "/images/optimized/gallery-school.webp", title: "Vuelta al cole segura", desc: "Sentinel J: tranquilidad para los padres" },
              { video: "/videos/sentinel_s_senior.mp4", img: "/images/optimized/gallery-senior.webp", title: "Independencia senior", desc: "Sentinel S: seguridad para nuestros mayores" },
              { img: "/images/optimized/gallery-adventure.webp", title: "Aventura sin miedo", desc: "Adolescentes protegidos en cada excursión" },
            ].map((v, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer" data-testid={`video-card-${i}`}
                  onClick={() => { if (v.video) { const el = document.getElementById(`vid-${i}`); if (el) { if (el.paused) el.play(); else el.pause(); } } }}>
                  {v.video ? (
                    <video id={`vid-${i}`} src={v.video} poster={v.img} className="w-full aspect-video object-cover" muted loop playsInline preload="metadata" data-testid={`real-video-${i}`} />
                  ) : (
                    <img src={v.img} alt={v.title} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" style={{ aspectRatio: '16/9' }} loading="lazy" decoding="async" width="640" height="360" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <ArrowRight className="w-5 h-5 text-emerald-600 ml-0.5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {v.video && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">VIDEO</span>}
                      <h3 className="text-white font-bold text-sm">{v.title}</h3>
                    </div>
                    <p className="text-white/80 text-xs">{v.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SEGUNDO PLANO & E-SIM ═══════ */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-800" data-testid="background-mode-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full mb-4">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">SIEMPRE CONECTADO</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Funciona con el móvil apagado o bloqueado</h2>
              <p className="text-slate-400 text-sm max-w-2xl mx-auto">Gracias a la <strong className="text-white">E-SIM integrada</strong> y el <strong className="text-white">modo segundo plano</strong>, tu Sentinel envía la ubicación GPS y recibe alertas SOS incluso cuando el teléfono está bloqueado, en modo avión o apagado.</p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-4">
            <Reveal delay={0}>
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-bold text-white text-sm mb-2">Móvil Bloqueado</h3>
                <p className="text-slate-400 text-xs">El Sentinel funciona de forma independiente. No necesita que el móvil esté desbloqueado para enviar la ubicación o activar el SOS.</p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Wifi className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-bold text-white text-sm mb-2">E-SIM Integrada</h3>
                <p className="text-slate-400 text-xs">Cada Sentinel tiene su propia E-SIM con conectividad 4G independiente. Funciona sin depender del WiFi ni del móvil del usuario.</p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Battery className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="font-bold text-white text-sm mb-2">Segundo Plano</h3>
                <p className="text-slate-400 text-xs">La app solicita permisos de ubicación en segundo plano (Android/iOS) para seguir rastreando aunque la app esté cerrada o el móvil apagado.</p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={300}>
            <div className="mt-8 bg-slate-800/30 border border-slate-700 rounded-2xl p-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Android: Permiso ACCESS_BACKGROUND_LOCATION</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> iOS: Background Modes → Location updates</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Popup informativo al usuario</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Botón directo a ajustes</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ DESCARGA LA APP — GOOGLE PLAY PROMINENTE ═══════ */}
      <section className="py-14 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 relative overflow-hidden" data-testid="download-app-section">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1.5 rounded-full text-white text-sm font-bold mb-4">
                <Smartphone className="w-4 h-4" /> App disponible
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Descarga ManoProtect en tu móvil
              </h2>
              <p className="text-emerald-100 text-sm mb-6 max-w-md">
                Controla la seguridad de toda tu familia desde tu smartphone. Alertas SOS, localización GPS y protección digital — todo en una app.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start items-center">
                <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                  data-testid="download-play-badge"
                  onClick={() => { if (window.gtag) window.gtag('event', 'play_store_click', { location: 'download_section' }); }}>
                  <img
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/es_badge_web_generic.png"
                    alt="Disponible en Google Play"
                    className="h-14 w-auto"
                    loading="lazy"
                  />
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-xs w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-white font-bold">ManoProtect</p>
                    <p className="text-emerald-200 text-xs">Seguridad familiar</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-amber-400/60 text-amber-400/60'}`} />)}
                  </div>
                  <span className="text-white font-bold text-sm">4.8</span>
                  <span className="text-white/50 text-xs">(234 reseñas)</span>
                </div>
                <div className="space-y-2 text-xs text-white/70">
                  <div className="flex items-center justify-between">
                    <span>Categoría</span>
                    <span className="text-white font-medium">Seguridad</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Descargas</span>
                    <span className="text-white font-medium">+5.000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Clasificación</span>
                    <span className="text-white font-medium">PEGI 3</span>
                  </div>
                </div>
                <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer"
                  className="mt-4 block w-full text-center bg-white text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-50 transition-colors text-sm"
                  data-testid="download-app-cta">
                  <Download className="w-4 h-4 inline mr-2" />Instalar gratis
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TRUST BAR ═══════ */}
      <section className="py-8 bg-slate-50 border-t border-gray-200" data-testid="trust-bar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-gray-400">
            <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-emerald-500" /><span className="font-semibold">SSL Seguro</span></div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500" /><span className="font-semibold">Cloudflare WAF</span></div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-violet-500" /><span className="font-semibold">Garantía devolución</span></div>
            <div className="flex items-center gap-2 font-semibold">
              <span className="bg-[#1A1F71] text-white text-[10px] px-2 py-0.5 rounded font-bold">VISA</span>
              <span className="bg-[#EB001B] text-white text-[10px] px-2 py-0.5 rounded font-bold">MC</span>
              <span className="bg-[#003087] text-white text-[10px] px-2 py-0.5 rounded font-bold">PayPal</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">Compra segura – Garantía de devolución – Stripe 3D Secure</p>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <LandingFooter />

      {/* WhatsApp Button */}
      <a href="https://wa.me/34601510950" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 left-6 w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl z-30 hover:scale-110 transition-transform" data-testid="whatsapp-btn" aria-label="WhatsApp">
        <Phone className="w-6 h-6 text-white" />
      </a>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 p-3" data-testid="mobile-sticky-cta">
        <div className="flex gap-2">
          <button onClick={() => cta('mobile_sticky')} className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg active:bg-emerald-600">
            <Shield className="w-5 h-5" /> Probar gratis
          </button>
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-slate-900 text-white font-bold px-4 py-3.5 rounded-xl shadow-lg active:bg-slate-800"
            data-testid="mobile-sticky-play-store">
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="text-xs">App</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HighConversionLanding;
