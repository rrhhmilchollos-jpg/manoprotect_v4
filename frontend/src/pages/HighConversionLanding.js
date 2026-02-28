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
  Check, Star, Lock, Eye,
  ArrowRight, X, Smartphone, Watch, Gift,
  History, Fingerprint
} from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';
import { trackPageView, trackCTAClick } from '@/services/conversionTracking';

/* ── Images ── */
const HERO_FAMILY = "https://static.prod-images.emergentagent.com/jobs/9da3b4c4-c09a-415b-8aa7-bb34b82ca31e/images/87b9c67e566b3df4d280471b26a2215bd603777003e860a14633f20318652e92.png";
const IMG_CHILD_SCHOOL = "https://static.prod-images.emergentagent.com/jobs/9da3b4c4-c09a-415b-8aa7-bb34b82ca31e/images/910a9c2ec4bd34474c8f1f73a4011a40e480c1a6c2227fd17299b6a14e326ad7.png";
const IMG_ELDERLY = "https://static.prod-images.emergentagent.com/jobs/9da3b4c4-c09a-415b-8aa7-bb34b82ca31e/images/7ad5d961d432cd41064d5a0c5ad6a516bc92a9e6d960fca3881e0e8fc7f2b06a.png";
const IMG_TEENAGER = "https://static.prod-images.emergentagent.com/jobs/9da3b4c4-c09a-415b-8aa7-bb34b82ca31e/images/b49eca79b0e4d85e473edb0b4a8e4e645f3d8e9df5d387da0cb1466ec672cf39.png";
const SENTINEL_X_IMG = "https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png";
const SENTINEL_J_IMG = "https://static.prod-images.emergentagent.com/jobs/d9b76ada-9994-4215-9ba1-31b4da8dc333/images/691c09d64cba84d0a069b7937e6f2e651449be714b394f349f7e64ace5198a3a.png";
const SENTINEL_S_IMG = "https://static.prod-images.emergentagent.com/jobs/70b9cc4e-5cf4-48c1-b710-585bbf769faa/images/e4d94aa4babe28ec14a789ee54b85cfc6b5cafb807d95c003d7a26f35491fa3d.png";

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

  useEffect(() => { trackPageView('/'); }, []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const cta = (loc) => {
    track('cta_click', { location: loc });
    trackCTAClick(loc, 'probar_gratis');
    nav('/registro');
  };

  return (
    <div className="min-h-screen bg-white" data-testid="high-conversion-landing">
      <Helmet>
        <title>ManoProtect – Protege a tu familia donde quiera que estén | Sentinel X, J y S</title>
        <meta name="description" content="Localización en tiempo real y alertas SOS con Sentinel X, J y S. Protege a niños, adolescentes y mayores. Prueba 7 días gratis sin compromiso." />
        <link rel="canonical" href="https://manoprotect.com/" />
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
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-gray-500 hover:text-emerald-600" data-testid="mobile-menu-toggle">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenu ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3" data-testid="mobile-menu">
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
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900" data-testid="hero-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-5" data-testid="hero-title">
                Protege a tu familia donde quiera que estén
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed" data-testid="hero-subtitle">
                Localización en tiempo real y alertas SOS con <strong className="text-emerald-400">Sentinel X, J y S</strong>
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-6">
                <button onClick={() => cta('hero')} className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-400 transition-all text-base shadow-xl shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0" data-testid="hero-cta-main">
                  <Shield className="w-5 h-5" /> Probar 7 días gratis
                </button>
                <Link to="/productos" className="inline-flex items-center gap-2 border-2 border-white/20 text-white font-semibold px-6 py-4 rounded-xl hover:border-emerald-400 hover:text-emerald-400 transition-all text-base" data-testid="hero-cta-secondary">
                  Ver productos <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-400 justify-center lg:justify-start" data-testid="hero-microcopy">
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Sin compromiso</span>
                <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-400" /> Protección segura y privada</span>
                <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> Garantía de 7 días</span>
              </div>
            </div>

            {/* Hero: Familia española con Sentinel overlays */}
            <div className="relative flex justify-center">
              <div className="relative">
                <img src={HERO_FAMILY} alt="Familia española protegida con relojes Sentinel" className="rounded-2xl shadow-2xl w-full max-w-lg object-cover aspect-[3/2]" loading="eager" data-testid="hero-family-image" />
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-2 flex items-center gap-2 animate-pulse">
                  <img src={SENTINEL_X_IMG} alt="Sentinel X" className="w-10 h-10 object-contain" />
                  <div><p className="text-[10px] text-gray-500 font-medium">Sentinel X</p><p className="text-xs font-bold text-gray-900">Adultos</p></div>
                </div>
                <div className="absolute -top-3 -right-3 bg-white rounded-xl shadow-xl p-2 flex items-center gap-2 animate-pulse" style={{ animationDelay: '500ms' }}>
                  <img src={SENTINEL_J_IMG} alt="Sentinel J" className="w-10 h-10 object-contain" />
                  <div><p className="text-[10px] text-gray-500 font-medium">Sentinel J</p><p className="text-xs font-bold text-gray-900">Niños</p></div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl p-2 flex items-center gap-2 animate-pulse" style={{ animationDelay: '1000ms' }}>
                  <img src={SENTINEL_S_IMG} alt="Sentinel S" className="w-10 h-10 object-contain" />
                  <div><p className="text-[10px] text-gray-500 font-medium">Sentinel S</p><p className="text-xs font-bold text-gray-900">Mayores</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ BENEFICIOS ═══════ */}
      <section className="py-16 sm:py-20 bg-white" id="beneficios" data-testid="benefits-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Beneficios destacados</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Todo lo que necesitas para proteger a tu familia con un solo dispositivo.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <MapPin className="w-7 h-7" />, bg: 'bg-emerald-50', text: 'text-emerald-600', title: 'Localización instantánea', desc: 'Ve la ubicación de tus familiares en tiempo real con precisión GPS.' },
              { icon: <Bell className="w-7 h-7" />, bg: 'bg-red-50', text: 'text-red-500', title: 'Alertas SOS automáticas', desc: 'Cada vez que se active un botón de emergencia, recibirás notificación inmediata.' },
              { icon: <History className="w-7 h-7" />, bg: 'bg-blue-50', text: 'text-blue-500', title: 'Historial de ubicaciones seguro', desc: 'Revisa dónde han estado tus familiares, sin comprometer la privacidad.' },
              { icon: <Watch className="w-7 h-7" />, bg: 'bg-violet-50', text: 'text-violet-500', title: 'Compatible con Sentinel X, J y S', desc: 'Relojes fáciles de usar para todas las edades.' },
              { icon: <Fingerprint className="w-7 h-7" />, bg: 'bg-amber-50', text: 'text-amber-500', title: 'Privacidad y seguridad total', desc: 'Tus datos cifrados y protegidos 24/7.' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 h-full" data-testid={`benefit-card-${i}`}>
                  <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center ${item.text} mb-4`}>{item.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CÓMO FUNCIONA ═══════ */}
      <section className="py-16 sm:py-20 bg-slate-50" id="como-funciona" data-testid="how-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Cómo funciona</h2>
            <p className="text-gray-500">3 pasos simples. Sin complicaciones.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: <Watch className="w-8 h-8" />, img: IMG_CHILD_SCHOOL, title: 'Coloca el reloj en el familiar', desc: 'Fácil y rápido. Sentinel X para adultos, J para niños, S para mayores.' },
              { step: '2', icon: <Smartphone className="w-8 h-8" />, img: IMG_TEENAGER, title: 'Activa el seguimiento seguro', desc: 'Todo desde la app móvil. Configura zonas seguras y contactos de emergencia.' },
              { step: '3', icon: <Bell className="w-8 h-8" />, img: IMG_ELDERLY, title: 'Recibe alertas y ubicación al instante', desc: 'Tranquilidad garantizada. GPS en tiempo real y notificaciones SOS inmediatas.' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="relative text-center group" data-testid={`step-${i}`}>
                  {i < 2 && <div className="hidden md:block absolute top-24 left-[60%] w-[80%] h-[2px] bg-emerald-200" />}
                  <div className="relative mb-4 rounded-2xl overflow-hidden shadow-md">
                    <img src={item.img} alt={item.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute top-3 right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">{item.step}</div>
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
      <section className="py-16 sm:py-20 bg-white" id="productos" data-testid="products-section">
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
                  <img src={SENTINEL_X_IMG} alt="Sentinel X" className="w-40 h-40 object-contain mx-auto mb-4 group-hover:scale-105 transition-transform" loading="lazy" />
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
                  <img src={SENTINEL_J_IMG} alt="Sentinel J" className="w-40 h-40 object-contain mx-auto mb-4 group-hover:scale-105 transition-transform" loading="lazy" />
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
                  <img src={SENTINEL_S_IMG} alt="Sentinel S" className="w-40 h-40 object-contain mx-auto mb-4 group-hover:scale-105 transition-transform" loading="lazy" />
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
                  <th className="p-4 text-center text-sm font-bold text-emerald-600 border-b">Sentinel X-J</th>
                  <th className="p-4 text-center text-sm font-bold text-[#8B7CB8] border-b">Sentinel S</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ['GPS en tiempo real', true, true],
                  ['Botón SOS', true, true],
                  ['Batería extendida', true, true],
                  ['Resistente al agua', true, true],
                  ['Conectividad 4G', true, false],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-medium text-gray-900 border-b border-gray-100">{row[0]}</td>
                    <td className="p-3 text-center border-b border-gray-100">{row[1] ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}</td>
                    <td className="p-3 text-center border-b border-gray-100">{row[2] ? <Check className="w-5 h-5 text-[#B4A7D6] mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

          {/* Google rating summary */}
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-3 bg-slate-50 border border-gray-200 rounded-full px-6 py-3">
              <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
              <span className="text-sm font-bold text-gray-700">4.9 de 5</span>
              <span className="text-xs text-gray-400">basado en 127 reseñas en Google</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CTA URGENCIA ═══════ */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-emerald-600 to-emerald-500" data-testid="urgency-section">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Gift className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3" data-testid="urgency-title">
            Stock limitado – Obtén tu Sentinel hoy y prueba gratis 7 días
          </h2>
          <p className="text-emerald-100 mb-8 text-lg">Sin compromiso. Cancela cuando quieras. Garantía de devolución de 14 días.</p>
          <button onClick={() => cta('urgency')} className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold px-10 py-5 rounded-xl hover:bg-emerald-50 transition-all text-lg shadow-xl hover:scale-105 hover:-translate-y-0.5" data-testid="urgency-cta">
            Probar 7 días gratis <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* ═══════ FAQ RÁPIDO ═══════ */}
      <section className="py-16 sm:py-20 bg-white" id="faq" data-testid="faq-section">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">Preguntas frecuentes</h2>
          {[
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
      <a href="https://wa.me/34601510950" target="_blank" rel="noopener noreferrer" className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl z-30 hover:scale-110 transition-transform" data-testid="whatsapp-btn" aria-label="WhatsApp">
        <Phone className="w-6 h-6 text-white" />
      </a>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 p-3" data-testid="mobile-sticky-cta">
        <button onClick={() => cta('mobile_sticky')} className="flex items-center justify-center gap-2 w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg active:bg-emerald-600">
          <Shield className="w-5 h-5" /> Probar 7 días gratis
        </button>
      </div>
    </div>
  );
};

export default HighConversionLanding;
