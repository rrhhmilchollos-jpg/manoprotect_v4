/**
 * ManoProtect - Landing Principal
 * Estructura: Hero > Beneficios > Cómo Funciona > Productos > Comparativa > Testimonios > Urgencia > Footer
 */
import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, MapPin, Phone, Bell, ChevronRight, ChevronDown,
  Check, Star, Lock, Users, Eye, Clock,
  ArrowRight, Heart, X, Smartphone, Watch, Gift,
  Radio, History, Fingerprint
} from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';
import { trackPageView, trackCTAClick } from '@/services/conversionTracking';

const SENTINEL_X_IMG = "https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png";
const SENTINEL_J_IMG = "https://static.prod-images.emergentagent.com/jobs/d9b76ada-9994-4215-9ba1-31b4da8dc333/images/691c09d64cba84d0a069b7937e6f2e651449be714b394f349f7e64ace5198a3a.png";
const SENTINEL_S_IMG = "https://static.prod-images.emergentagent.com/jobs/70b9cc4e-5cf4-48c1-b710-585bbf769faa/images/e4d94aa4babe28ec14a789ee54b85cfc6b5cafb807d95c003d7a26f35491fa3d.png";
const HERO_FAMILY_IMG = "https://images.unsplash.com/photo-1767082090422-2e5aeeba2afe?w=900&q=80&fit=crop";

const track = (name, params = {}) => {
  if (window.gtag) window.gtag('event', name, params);
  if (window.fbq) window.fbq('track', name, params);
};

/* Scroll reveal hook */
const useScrollReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

const RevealSection = ({ children, className = '', delay = 0 }) => {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const HighConversionLanding = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => { trackPageView('/'); }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const ctaClick = (loc) => {
    track('cta_click', { location: loc });
    trackCTAClick(loc, 'probar_gratis');
    navigate('/registro');
  };

  return (
    <div className="min-h-screen bg-white" data-testid="high-conversion-landing">
      <Helmet>
        <title>ManoProtect – Protege a tu familia donde quiera que estén | Sentinel X, J y S</title>
        <meta name="description" content="Localización en tiempo real y alertas SOS con Sentinel X, J y S. Protege a niños, adolescentes y mayores. Prueba 7 días gratis." />
        <link rel="canonical" href="https://manoprotect.com/" />
      </Helmet>

      {/* ═══════ HEADER ═══════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'}`}
        data-testid="main-header"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-emerald-600 text-lg font-bold tracking-tight">ManoProtect</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-gray-500">
            <a href="#beneficios" className="hover:text-emerald-600 transition-colors" data-testid="nav-beneficios">Beneficios</a>
            <a href="#como-funciona" className="hover:text-emerald-600 transition-colors" data-testid="nav-como-funciona">Cómo funciona</a>
            <a href="#productos" className="hover:text-emerald-600 transition-colors" data-testid="nav-productos">Productos</a>
            <Link to="/faq" className="hover:text-emerald-600 transition-colors" data-testid="nav-faq">FAQ</Link>
            <Link to="/contacto" className="hover:text-emerald-600 transition-colors" data-testid="nav-contacto">Contacto</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block text-[13px] font-semibold text-gray-600 hover:text-emerald-600 transition-colors" data-testid="nav-login">
              Mi Cuenta
            </Link>
            <button
              onClick={() => ctaClick('header')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold px-4 py-2 rounded-lg transition-colors"
              data-testid="header-cta"
            >
              Probar 7 días gratis
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-gray-500 hover:text-emerald-600" data-testid="mobile-menu-toggle">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenu ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3" data-testid="mobile-menu">
            <a href="#beneficios" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 hover:text-emerald-600">Beneficios</a>
            <a href="#como-funciona" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 hover:text-emerald-600">Cómo funciona</a>
            <a href="#productos" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 hover:text-emerald-600">Productos</a>
            <Link to="/faq" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 hover:text-emerald-600">FAQ</Link>
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
                <button
                  onClick={() => ctaClick('hero')}
                  className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-400 transition-all text-base shadow-xl shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0"
                  data-testid="hero-cta-main"
                >
                  <Shield className="w-5 h-5" /> Probar 7 días gratis
                </button>
                <a href="#productos" className="inline-flex items-center gap-2 border-2 border-white/20 text-white font-semibold px-6 py-4 rounded-xl hover:border-emerald-400 hover:text-emerald-400 transition-all text-base" data-testid="hero-cta-secondary">
                  Ver productos <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-400 justify-center lg:justify-start" data-testid="hero-microcopy">
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Sin compromiso</span>
                <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-400" /> Protección segura y privada</span>
                <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> Garantía de 7 días</span>
              </div>
            </div>

            {/* Hero Image - Family + Products */}
            <div className="relative flex justify-center">
              <div className="relative">
                <img src={HERO_FAMILY_IMG} alt="Familia protegida con ManoProtect" className="rounded-2xl shadow-2xl w-full max-w-md object-cover aspect-[4/3]" loading="eager" data-testid="hero-family-image" />
                {/* Product overlays */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-2 flex items-center gap-2">
                  <img src={SENTINEL_X_IMG} alt="Sentinel X" className="w-12 h-12 object-contain" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium">Sentinel X</p>
                    <p className="text-xs font-bold text-gray-900">Adultos</p>
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 bg-white rounded-xl shadow-xl p-2 flex items-center gap-2">
                  <img src={SENTINEL_J_IMG} alt="Sentinel J" className="w-12 h-12 object-contain" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium">Sentinel J</p>
                    <p className="text-xs font-bold text-gray-900">Niños</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl p-2 flex items-center gap-2">
                  <img src={SENTINEL_S_IMG} alt="Sentinel S" className="w-12 h-12 object-contain" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium">Sentinel S</p>
                    <p className="text-xs font-bold text-gray-900">Mayores</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ BENEFICIOS DESTACADOS ═══════ */}
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
              <RevealSection key={i} delay={i * 100}>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 h-full" data-testid={`benefit-card-${i}`}>
                  <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center ${item.text} mb-4`}>
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CÓMO FUNCIONA – 3 PASOS ═══════ */}
      <section className="py-16 sm:py-20 bg-slate-50" id="como-funciona" data-testid="how-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Cómo funciona</h2>
            <p className="text-gray-500">3 pasos simples. Sin complicaciones.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: <Watch className="w-8 h-8" />, title: 'Coloca el reloj en el familiar', desc: 'Fácil y rápido. Sentinel X para adultos, J para niños, S para mayores.' },
              { step: '2', icon: <Smartphone className="w-8 h-8" />, title: 'Activa el seguimiento seguro', desc: 'Todo desde la app móvil. Configura zonas seguras y contactos de emergencia.' },
              { step: '3', icon: <Bell className="w-8 h-8" />, title: 'Recibe alertas y ubicación al instante', desc: 'Tranquilidad garantizada. GPS en tiempo real y notificaciones SOS inmediatas.' },
            ].map((item, i) => (
              <RevealSection key={i} delay={i * 150}>
                <div className="relative text-center group" data-testid={`step-${i}`}>
                  {i < 2 && <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-emerald-200" />}
                  <div className="relative inline-block mb-5">
                    <div className="w-20 h-20 bg-white border-2 border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto group-hover:border-emerald-400 group-hover:bg-emerald-50 transition-all duration-300 shadow-sm">
                      {item.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">{item.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => ctaClick('how_works')}
              className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-0.5"
              data-testid="how-cta"
            >
              Probar 7 días gratis <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════ PRODUCTOS DESTACADOS ═══════ */}
      <section className="py-16 sm:py-20 bg-white" id="productos" data-testid="products-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Productos destacados</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Dispositivos de seguridad para toda la familia. Incluido GRATIS con tu suscripción.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Sentinel X */}
            <RevealSection delay={0}>
              <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl overflow-hidden border border-gray-800 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 group" data-testid="product-sentinel-x">
                <div className="p-6 text-center">
                  <span className="inline-block text-xs font-bold bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full mb-4">ADULTOS</span>
                  <img src={SENTINEL_X_IMG} alt="Sentinel X" className="w-40 h-40 object-contain mx-auto mb-4 group-hover:scale-105 transition-transform" loading="lazy" />
                  <h3 className="text-2xl font-bold text-white mb-2">Sentinel X</h3>
                  <p className="text-sm text-gray-400 mb-4">Para adultos y adolescentes</p>
                  <ul className="text-left space-y-2 text-sm text-gray-300 mb-6">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> GPS en tiempo real</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Botón SOS invisible</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Batería 5 días</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Resistente al agua</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Conectividad 4G</li>
                  </ul>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-emerald-400">GRATIS</span>
                    <span className="text-sm text-gray-500 line-through">249€</span>
                  </div>
                  <Link to="/sentinel-x" className="block w-full text-center py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors" data-testid="cta-sentinel-x">
                    Comprar Sentinel X
                  </Link>
                </div>
              </div>
            </RevealSection>

            {/* Sentinel J */}
            <RevealSection delay={150}>
              <div className="bg-white rounded-2xl overflow-hidden border-2 border-pink-200 hover:border-pink-400 transition-all duration-300 hover:shadow-xl group relative" data-testid="product-sentinel-j">
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-pink-500 to-violet-500 text-white text-center py-1 text-xs font-bold">
                  PARA NIÑOS Y ADOLESCENTES
                </div>
                <div className="p-6 pt-10 text-center">
                  <span className="inline-block text-xs font-bold bg-pink-100 text-pink-600 px-3 py-1 rounded-full mb-4">3-12 AÑOS</span>
                  <img src={SENTINEL_J_IMG} alt="Sentinel J" className="w-40 h-40 object-contain mx-auto mb-4 group-hover:scale-105 transition-transform" loading="lazy" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Sentinel J</h3>
                  <p className="text-sm text-gray-500 mb-4">Para niños y adolescentes</p>
                  <ul className="text-left space-y-2 text-sm text-gray-600 mb-6">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-pink-500 flex-shrink-0" /> GPS en tiempo real</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-pink-500 flex-shrink-0" /> Botón SOS grande</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-pink-500 flex-shrink-0" /> Batería 4 días</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-pink-500 flex-shrink-0" /> Resistente al agua</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-pink-500 flex-shrink-0" /> 8 correas de colores</li>
                  </ul>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-emerald-500">GRATIS</span>
                    <span className="text-sm text-gray-400 line-through">99€</span>
                  </div>
                  <Link to="/sentinel-j" className="block w-full text-center py-3 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white font-bold rounded-xl transition-colors" data-testid="cta-sentinel-j">
                    Comprar Sentinel J
                  </Link>
                </div>
              </div>
            </RevealSection>

            {/* Sentinel S */}
            <RevealSection delay={300}>
              <div className="bg-gradient-to-b from-[#FAFAF8] to-white rounded-2xl overflow-hidden border-2 border-[#B4A7D6]/30 hover:border-[#B4A7D6] transition-all duration-300 hover:shadow-xl group" data-testid="product-sentinel-s">
                <div className="p-6 text-center">
                  <span className="inline-block text-xs font-bold bg-[#B4A7D6]/20 text-[#8B7CB8] px-3 py-1 rounded-full mb-4">ADULTOS Y MAYORES</span>
                  <img src={SENTINEL_S_IMG} alt="Sentinel S" className="w-40 h-40 object-contain mx-auto mb-4 group-hover:scale-105 transition-transform" loading="lazy" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Sentinel S</h3>
                  <p className="text-sm text-gray-500 mb-4">Para adultos y mayores</p>
                  <ul className="text-left space-y-2 text-sm text-gray-600 mb-6">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#B4A7D6] flex-shrink-0" /> GPS en tiempo real</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#B4A7D6] flex-shrink-0" /> Botón SOS silencioso</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#B4A7D6] flex-shrink-0" /> Monitoreo discreto</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#B4A7D6] flex-shrink-0" /> Batería extendida</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#B4A7D6] flex-shrink-0" /> Alerta anti-retirada</li>
                  </ul>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-emerald-500">GRATIS</span>
                    <span className="text-sm text-gray-400 line-through">129€</span>
                  </div>
                  <Link to="/sentinel-s" className="block w-full text-center py-3 bg-[#2D2A33] hover:bg-[#3D3A43] text-white font-bold rounded-xl transition-colors" data-testid="cta-sentinel-s">
                    Comprar Sentinel S
                  </Link>
                </div>
              </div>
            </RevealSection>
          </div>
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
                  <th className="p-4 text-center text-sm font-bold text-emerald-600 border-b">Sentinel X</th>
                  <th className="p-4 text-center text-sm font-bold text-pink-600 border-b">Sentinel J</th>
                  <th className="p-4 text-center text-sm font-bold text-[#8B7CB8] border-b">Sentinel S</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ['GPS en tiempo real', true, true, true],
                  ['Botón SOS', true, true, true],
                  ['Batería extendida', true, true, true],
                  ['Resistente al agua', true, true, true],
                  ['Conectividad 4G', true, true, true],
                  ['SOS invisible', true, false, true],
                  ['Correas intercambiables', false, true, true],
                  ['Alerta anti-retirada', false, false, true],
                  ['Sirena 120dB', false, false, true],
                  ['Grabación en la nube', true, false, false],
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

      {/* ═══════ TESTIMONIOS ═══════ */}
      <section className="py-16 sm:py-20 bg-white" data-testid="testimonials-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Lo que dicen nuestros clientes</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { text: 'Gracias a ManoProtect, mi hijo estaba seguro durante su excursión. Recibí su ubicación en tiempo real y pude estar tranquila todo el día.', name: 'Ana', role: 'Madre', city: 'Madrid', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face' },
              { text: 'Puedo cuidar de mi padre y saber que está protegido todo el día. La alerta anti-retirada del Sentinel S me da una tranquilidad que no tiene precio.', name: 'Carlos', role: 'Hijo', city: 'Barcelona', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face' },
              { text: 'Mi hija lleva el Sentinel J al cole y las zonas seguras me avisan cuando llega. Sin cámara ni internet. Solo seguridad. Es perfecto.', name: 'Laura M.', role: 'Madre', city: 'Valencia', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face' },
              { text: 'El botón SOS funciona incluso con la pantalla bloqueada. Lo probamos el primer día y la notificación llegó al instante. Muy recomendable.', name: 'Roberto P.', role: 'Padre', city: 'Sevilla', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face' },
            ].map((t, i) => (
              <RevealSection key={i} delay={i * 100}>
                <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow" data-testid={`testimonial-${i}`}>
                  <div className="flex gap-0.5 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-gray-600 mb-5 leading-relaxed italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{t.name} – {t.role}</p>
                      <p className="text-xs text-gray-400">{t.city}</p>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA URGENCIA ═══════ */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-emerald-600 to-emerald-500" data-testid="urgency-section">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Gift className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Stock limitado – Obtén tu Sentinel hoy y prueba gratis 7 días
          </h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Sin compromiso. Cancela cuando quieras. Garantía de devolución de 14 días.
          </p>
          <button
            onClick={() => ctaClick('urgency')}
            className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold px-10 py-5 rounded-xl hover:bg-emerald-50 transition-all text-lg shadow-xl hover:scale-105 hover:-translate-y-0.5"
            data-testid="urgency-cta"
          >
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

          <div className="text-center mt-10">
            <Link to="/faq" className="text-emerald-600 font-semibold hover:underline text-sm" data-testid="faq-more-link">
              Ver todas las preguntas frecuentes <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ CONFIANZA FOOTER ═══════ */}
      <section className="py-8 bg-slate-50 border-t border-gray-200" data-testid="trust-bar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-gray-400">
            <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-emerald-500" /><span className="font-semibold">SSL Seguro</span></div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500" /><span className="font-semibold">Cloudflare WAF</span></div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-violet-500" /><span className="font-semibold">Garantía 14 días</span></div>
            <div className="flex items-center gap-2 font-semibold">
              <span className="bg-[#1A1F71] text-white text-[10px] px-2 py-0.5 rounded font-bold">VISA</span>
              <span className="bg-[#EB001B] text-white text-[10px] px-2 py-0.5 rounded font-bold">MC</span>
              <span className="bg-[#003087] text-white text-[10px] px-2 py-0.5 rounded font-bold">PayPal</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <LandingFooter />

      {/* ═══════ WHATSAPP BUTTON ═══════ */}
      <a
        href="https://wa.me/34601510950"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl z-30 hover:scale-110 transition-transform"
        data-testid="whatsapp-btn"
        aria-label="Contactar por WhatsApp"
      >
        <Phone className="w-6 h-6 text-white" />
      </a>

      {/* ═══════ MOBILE STICKY CTA ═══════ */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 p-3" data-testid="mobile-sticky-cta">
        <button
          onClick={() => ctaClick('mobile_sticky')}
          className="flex items-center justify-center gap-2 w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg active:bg-emerald-600"
        >
          <Shield className="w-5 h-5" /> Probar 7 días gratis
        </button>
      </div>
    </div>
  );
};

export default HighConversionLanding;
