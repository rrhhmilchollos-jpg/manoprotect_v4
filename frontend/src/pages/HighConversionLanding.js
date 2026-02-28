/**
 * ManoProtect - Landing de ALTA CONVERSION
 * Target: Padres con hijos adolescentes (12-18 años)
 * Estrategia: Emoción > Dolor > Solución > Prueba social > Precio anclado > CTA
 * Una landing = Un dolor específico. Sin mezclar mensajes.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, MapPin, Phone, Bell, ChevronRight, ChevronDown,
  Check, Star, Lock, Users, AlertTriangle, Eye,
  ArrowRight, Heart, X, Smartphone, Watch, Gift
} from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';
import PhoneDemo from '@/components/PhoneDemo';
import { trackPageView, trackCTAClick, getABVariant } from '@/services/conversionTracking';

/* ── helpers ── */
const track = (name, params = {}) => {
  if (window.gtag) window.gtag('event', name, params);
  if (window.fbq) window.fbq('track', name, params);
};

const SOCIAL_NAMES = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Miguel', 'Carmen', 'David', 'Isabel', 'Lucía', 'Pablo'];
const SOCIAL_CITIES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Zaragoza', 'Alicante'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ── Scroll reveal hook ── */
const useScrollReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, visible];
};

/* ── Animated counter ── */
const AnimatedCounter = ({ target, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const [ref, visible] = useScrollReveal();

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target, duration]);

  return <span ref={ref}>{count}</span>;
};

/* ── RevealCard - scroll-triggered animation ── */
const RevealCard = ({ children, delay = 0, testId }) => {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 reveal-up ${delay > 0 ? `reveal-up-delay-${delay}` : ''} ${visible ? 'visible' : ''}`}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
const HighConversionLanding = () => {
  const navigate = useNavigate();
  const [activeUsers] = useState(() => 1847 + Math.floor(Math.random() * 200));
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitShown, setExitShown] = useState(false);
  const [socialProof, setSocialProof] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const heroRef = useRef(null);
  const [abHero, setAbHero] = useState(null);
  const [abCta, setAbCta] = useState(null);

  /* A/B test assignment */
  useEffect(() => {
    getABVariant('hero_headline').then(data => { if (data) setAbHero(data); });
    getABVariant('cta_text').then(data => { if (data) setAbCta(data); });
    trackPageView('/');
  }, []);

  /* scroll header */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* social proof pop */
  useEffect(() => {
    const show = () => {
      setSocialProof({ name: pick(SOCIAL_NAMES), city: pick(SOCIAL_CITIES) });
      setTimeout(() => setSocialProof(null), 5000);
    };
    const t = setTimeout(show, 8000);
    const i = setInterval(show, 30000 + Math.random() * 15000);
    return () => { clearTimeout(t); clearInterval(i); };
  }, []);

  /* exit intent */
  useEffect(() => {
    const fn = (e) => { if (e.clientY <= 0 && !exitShown) { setShowExitPopup(true); setExitShown(true); } };
    document.addEventListener('mouseleave', fn);
    return () => document.removeEventListener('mouseleave', fn);
  }, [exitShown]);

  const ctaClick = (loc) => {
    track('cta_click', { location: loc, label: 'proteger_hijo' });
    trackCTAClick(loc, 'proteger_hijo');
    navigate('/registro');
  };

  return (
    <div className="min-h-screen bg-white" data-testid="high-conversion-landing">
      <Helmet>
        <title>ManoProtect - Localiza a tu hijo en segundos en caso de emergencia</title>
        <meta name="description" content="La app que permite localizar a tu familia en segundos en caso de emergencia. GPS en segundo plano + Alertas SOS. Prueba 7 días gratis." />
      </Helmet>

      {/* ═══════ HEADER SIMPLIFICADO ═══════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
        }`}
        data-testid="main-header"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-emerald-600 text-lg font-bold tracking-tight">ManoProtect</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-gray-500">
            <a href="#como-funciona" className="hover:text-emerald-600 transition-colors" data-testid="nav-como-funciona">{"C\u00f3mo funciona"}</a>
            <a href="#dispositivos" className="hover:text-emerald-600 transition-colors" data-testid="nav-dispositivos">Dispositivos</a>
            <a href="#precios" className="hover:text-emerald-600 transition-colors" data-testid="nav-precios">Precios</a>
            <a href="#seguridad" className="hover:text-emerald-600 transition-colors" data-testid="nav-seguridad">Seguridad</a>
            <a href="https://wa.me/34601510950" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors" data-testid="nav-contacto">Contacto</a>
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
              Prueba Gratis
            </button>
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden text-gray-500 hover:text-emerald-600"
              data-testid="mobile-menu-toggle"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenu ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3" data-testid="mobile-menu">
            <a href="#como-funciona" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 hover:text-emerald-600">{"C\u00f3mo funciona"}</a>
            <a href="#dispositivos" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 hover:text-emerald-600">Dispositivos</a>
            <a href="#precios" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 hover:text-emerald-600">Precios</a>
            <a href="#seguridad" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 hover:text-emerald-600">Seguridad</a>
            <a href="https://wa.me/34601510950" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-600 hover:text-emerald-600">Contacto</a>
            <Link to="/login" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 hover:text-emerald-600">Mi Cuenta</Link>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-14" />

      {/* ═══════ HERO — IMPACTO EMOCIONAL INMEDIATO ═══════ */}
      <section ref={heroRef} className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 md:pt-16 md:pb-20">
          <div className="max-w-2xl">
            {/* Social proof badge */}
            <div className="flex flex-wrap items-center gap-3 mb-6" data-testid="hero-badges">
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700">{activeUsers.toLocaleString()} familias protegidas</span>
              </div>
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                <span className="text-xs text-gray-500 ml-1">4.8/5</span>
              </div>
            </div>

            {/* Main headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.08] tracking-tight text-gray-900 mb-5"
              data-testid="hero-title"
            >
              {abHero?.config?.headline ? (
                <>{abHero.config.headline}</>
              ) : (
                <>
                  {"¿Y si tu hijo no responde al m\u00f3vil durante "}
                  <span className="text-emerald-500">40 minutos</span>?
                </>
              )}
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 mb-4 max-w-xl leading-relaxed" data-testid="hero-subtitle">
              {abHero?.config?.subtitle || (
                <>
                  {"ManoProtect te permite "}
                  <strong className="text-gray-800">{"localizar a tu hijo en segundos"}</strong>
                  {" y recibir alertas SOS en caso de emergencia, incluso con la app cerrada."}
                </>
              )}
            </p>

            <p className="text-base text-emerald-600 font-semibold mb-8" data-testid="hero-trial">
              {"Prueba gratis 7 d\u00edas"}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => ctaClick('hero')}
                className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-600 transition-all text-base shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 active:translate-y-0"
                data-testid="hero-cta-main"
              >
                <Shield className="w-5 h-5" /> {abCta?.config?.text || 'Proteger a Mi Hijo Ahora'}
              </button>
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold px-6 py-4 rounded-xl hover:border-emerald-400 hover:text-emerald-600 transition-all text-base"
                data-testid="hero-cta-secondary"
              >
                {"C\u00f3mo funciona"} <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Micro-benefits */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500" data-testid="hero-benefits">
              <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /><span>{"Prueba gratuita 7 d\u00edas"}</span></div>
              <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /><span>{"Cancelaci\u00f3n en cualquier momento"}</span></div>
              <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /><span>{"Protecci\u00f3n 24/7"}</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TRUST BAR — Señales de confianza ═══════ */}
      <section className="bg-white py-4 border-y border-gray-100" data-testid="trust-bar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-400">
          <div className="flex items-center gap-2"><Lock className="w-4 h-4" /><span className="font-semibold">Pago 100% seguro</span></div>
          <span className="hidden sm:block text-gray-200">|</span>
          <div className="flex items-center gap-2 font-semibold">
            <span className="bg-[#1A1F71] text-white text-[10px] px-2 py-0.5 rounded font-bold">VISA</span>
            <span className="bg-[#EB001B] text-white text-[10px] px-2 py-0.5 rounded font-bold">MC</span>
            <span className="bg-[#003087] text-white text-[10px] px-2 py-0.5 rounded font-bold">PayPal</span>
          </div>
          <span className="hidden sm:block text-gray-200">|</span>
          <div className="flex items-center gap-2"><Shield className="w-4 h-4" /><span className="font-semibold">{"Garant\u00eda 14 d\u00edas"}</span></div>
          <span className="hidden sm:block text-gray-200">|</span>
          <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span className="font-semibold">Soporte 24/7</span></div>
          <span className="hidden sm:block text-gray-200">|</span>
          <div className="flex items-center gap-2">
            <Link to="/privacy-policy" className="font-semibold hover:text-emerald-500 transition-colors">{"Pol\u00edtica de privacidad"}</Link>
          </div>
        </div>
      </section>

      {/* ═══════ ACTIVACIÓN EMOCIONAL ═══════ */}
      <section className="py-14 sm:py-16 bg-white" data-testid="emotional-activation">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-5xl sm:text-6xl font-extrabold text-emerald-500 mb-3" data-testid="stat-number"><AnimatedCounter target={78} />%</p>
          <p className="text-lg sm:text-xl text-gray-800 font-semibold mb-3" data-testid="stat-text">
            {"de los padres ha sentido angustia al no saber d\u00f3nde estaba su hijo durante m\u00e1s de 30 minutos."}
          </p>
          <p className="text-base text-gray-500 max-w-lg mx-auto">
            {"No se trata de control. "}<strong className="text-gray-800">Se trata de tranquilidad.</strong>
          </p>
        </div>
      </section>

      {/* ═══════ POR QUÉ NECESITAS MANOPROTECT ═══════ */}
      <section className="py-14 sm:py-16 bg-slate-50" id="seguridad" data-testid="why-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            {"¿Por qu\u00e9 necesitas ManoProtect?"}
          </h2>
          <p className="text-center text-gray-500 mb-10 max-w-xl mx-auto">
            Estas son las situaciones reales que puedes evitar con ManoProtect.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <AlertTriangle className="w-6 h-6" />, bg: 'bg-red-50', text: 'text-red-500', title: 'Emergencias familiares', desc: 'Un accidente, una ca\u00edda, un problema de salud. Cada segundo cuenta cuando no sabes d\u00f3nde est\u00e1 tu hijo.' },
              { icon: <Eye className="w-6 h-6" />, bg: 'bg-amber-50', text: 'text-amber-500', title: 'Desapariciones temporales', desc: 'Sale del colegio y no llega a casa. No contesta al m\u00f3vil. 40 minutos de angustia que puedes evitar.' },
              { icon: <Lock className="w-6 h-6" />, bg: 'bg-blue-50', text: 'text-blue-500', title: 'Estafas digitales', desc: 'Los menores son el objetivo principal de fraudes online. Protege su identidad digital y la de tu familia.' },
              { icon: <Shield className="w-6 h-6" />, bg: 'bg-emerald-50', text: 'text-emerald-500', title: 'Tranquilidad real', desc: 'Localiza en segundos, recibe alertas si necesita ayuda. Duerme tranquilo. Eso es ManoProtect.' },
            ].map((item, i) => (
              <RevealCard key={i} delay={i} testId={`why-card-${i}`}>
                <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center ${item.text} mb-4`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-[15px]">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CÓMO FUNCIONA — 3 PASOS ═══════ */}
      <section className="py-14 sm:py-16 bg-white" id="como-funciona" data-testid="how-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">{"C\u00f3mo funciona"}</h2>
          <p className="text-center text-gray-500 mb-12">En 3 pasos simples. Sin complicaciones.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: <Smartphone className="w-7 h-7" />, title: 'Instala la app', desc: 'Instala ManoProtect en tu m\u00f3vil y en el de tu hijo. Solo lleva 2 minutos.' },
              { step: '2', icon: <MapPin className="w-7 h-7" />, title: 'Activa el seguimiento seguro', desc: 'Activa el GPS en segundo plano. Funciona incluso con la app cerrada y el m\u00f3vil bloqueado.' },
              { step: '3', icon: <Bell className="w-7 h-7" />, title: 'Protecci\u00f3n activa 24/7', desc: 'Solicita ubicaci\u00f3n en cualquier momento. Recibe alertas SOS instant\u00e1neas si necesita ayuda.' },
            ].map((item, i) => (
              <div key={i} className="relative text-center group" data-testid={`step-${i}`}>
                {/* Connector line */}
                {i < 2 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-emerald-100" />}
                <div className="relative inline-block mb-5">
                  <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto group-hover:border-emerald-400 group-hover:bg-emerald-100 transition-all duration-300">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => ctaClick('how_works')}
              className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-0.5"
              data-testid="how-cta"
            >
              {"Activar Protecci\u00f3n Familiar"} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════ DEMO VISUAL — MOMENTO WOW ═══════ */}
      <section className="py-14 sm:py-16 bg-slate-50" id="demo" data-testid="demo-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">{"M\u00edralo en acci\u00f3n"}</h2>
          <p className="text-center text-gray-500 mb-10 max-w-lg mx-auto">
            {"As\u00ed de f\u00e1cil es localizar a tu hijo en caso de emergencia. En segundos."}
          </p>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Phone animation */}
            <div className="flex justify-center">
              <PhoneDemo />
            </div>

            {/* Description steps */}
            <div className="space-y-6">
              {[
                { num: '1', title: 'Pulsa "Solicitar ubicaci\u00f3n"', desc: 'Desde tu m\u00f3vil, con un solo toque.' },
                { num: '2', title: 'GPS localiza en segundos', desc: 'Funciona en segundo plano, incluso con el m\u00f3vil bloqueado.' },
                { num: '3', title: 'Ves su ubicaci\u00f3n exacta', desc: 'Direcci\u00f3n, precisi\u00f3n y hora. Todo en tiempo real.' },
                { num: '4', title: 'Recibes notificaci\u00f3n', desc: '"Alejandro est\u00e1 en Calle Mayor 12". Tranquilidad instant\u00e1nea.' },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-4" data-testid={`demo-step-${i}`}>
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                    {s.num}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{s.title}</h3>
                    <p className="text-sm text-gray-500">{s.desc}</p>
                  </div>
                </div>
              ))}

              <button
                onClick={() => ctaClick('demo')}
                className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-0.5 mt-2"
                data-testid="demo-cta"
              >
                <Shield className="w-5 h-5" /> {"Activar protecci\u00f3n ahora"} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ DISPOSITIVOS SENTINEL ═══════ */}
      <section className="py-14 sm:py-16 bg-white" id="dispositivos" data-testid="sentinel-products-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-3">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full mb-4">
              <Gift className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 tracking-wide">DISPOSITIVO GRATIS CON TU SUSCRIPCIÓN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Protección física + digital</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Cada suscripción incluye un dispositivo Sentinel GRATIS. Elige el que mejor se adapte a tu familia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {/* Sentinel X */}
            <Link to="/sentinel-x" className="group bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-6 border border-gray-800 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1" data-testid="sentinel-x-card">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">ADULTOS</span>
                <span className="text-xs font-bold bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full">4G / BT</span>
              </div>
              <img
                src="https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png"
                alt="Sentinel X"
                className="w-32 h-32 object-contain mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              <h3 className="text-xl font-bold text-white mb-1">SENTINEL X</h3>
              <p className="text-sm text-gray-400 mb-3">SOS invisible, GPS, grabación en la nube. Versión Basic GRATIS.</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-emerald-400">GRATIS</span>
                  <span className="text-xs text-gray-500 ml-2 line-through">249€</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            {/* Sentinel J */}
            <Link to="/sentinel-j" className="group bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-pink-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1" data-testid="sentinel-j-card">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold bg-pink-100 text-pink-600 px-3 py-1 rounded-full">3-12 AÑOS</span>
                <span className="text-xs font-bold bg-violet-100 text-violet-600 px-3 py-1 rounded-full">8 COLORES</span>
              </div>
              <img
                src="https://static.prod-images.emergentagent.com/jobs/d9b76ada-9994-4215-9ba1-31b4da8dc333/images/691c09d64cba84d0a069b7937e6f2e651449be714b394f349f7e64ace5198a3a.png"
                alt="Sentinel J"
                className="w-32 h-32 object-contain mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              <h3 className="text-xl font-bold text-gray-900 mb-1">SENTINEL J</h3>
              <p className="text-sm text-gray-500 mb-3">Correas intercambiables, GPS, botón SOS. Sin cámara ni internet.</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-emerald-500">GRATIS</span>
                  <span className="text-xs text-gray-400 ml-2 line-through">99€</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            {/* Sentinel S */}
            <Link to="/sentinel-s" className="group bg-gradient-to-b from-[#FAFAF8] to-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#B4A7D6] transition-all duration-300 hover:shadow-xl hover:-translate-y-1" data-testid="sentinel-s-card">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold bg-[#B4A7D6]/20 text-[#8B7CB8] px-3 py-1 rounded-full">6-14 AÑOS</span>
                <span className="text-xs font-bold bg-[#E8B4B8]/30 text-[#C4868C] px-3 py-1 rounded-full">PREMIUM</span>
              </div>
              <img
                src="https://static.prod-images.emergentagent.com/jobs/70b9cc4e-5cf4-48c1-b710-585bbf769faa/images/e4d94aa4babe28ec14a789ee54b85cfc6b5cafb807d95c003d7a26f35491fa3d.png"
                alt="Sentinel S"
                className="w-32 h-32 object-contain mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              <h3 className="text-xl font-bold text-gray-900 mb-1">SENTINEL S</h3>
              <p className="text-sm text-gray-500 mb-3">Cerámica + rose gold. Anti-retirada, sirena 120dB, GPS.</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-emerald-500">GRATIS</span>
                  <span className="text-xs text-gray-400 ml-2 line-through">129€</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#B4A7D6] group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Solo pagas envío (desde 4,95€). Dispositivo 100% gratis con tu plan de suscripción.
          </p>
        </div>
      </section>

      {/* ═══════ ELIMINAR OBJECIONES (FAQ RAPIDO) ═══════ */}
      <section className="py-14 sm:py-16 bg-slate-50" data-testid="faq-section">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">Preguntas frecuentes</h2>
          {[
            { q: '\u00bfConsume bater\u00eda?', a: 'No. ManoProtect est\u00e1 optimizado para bajo consumo. El GPS en segundo plano usa menos del 3% de bater\u00eda al d\u00eda.' },
            { q: '\u00bfEs legal rastrear a mi hijo?', a: 'S\u00ed. Como padre o tutor legal, tienes derecho a supervisar la ubicaci\u00f3n de tu hijo menor. ManoProtect siempre requiere consentimiento expl\u00edcito.' },
            { q: '\u00bfEsp\u00eda conversaciones?', a: 'No. Solo localiza la ubicaci\u00f3n en caso de emergencia. No accede a mensajes, llamadas ni datos personales.' },
            { q: '\u00bfMi hijo puede desactivarlo?', a: 'No. Los permisos se bloquean autom\u00e1ticamente despu\u00e9s de la configuraci\u00f3n inicial. Solo se pueden modificar verificando identidad con DNI.' },
            { q: '\u00bfPuedo cancelar en cualquier momento?', a: 'S\u00ed. Cancela tu suscripci\u00f3n cuando quieras. Si no te convence en 14 d\u00edas, te devolvemos el dinero.' },
          ].map((faq, i) => (
            <div key={i} className="border-b border-gray-200" data-testid={`faq-${i}`}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left"
              >
                <span className="font-semibold text-gray-900 text-[15px] pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 pb-5' : 'max-h-0'}`}>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ PRUEBA SOCIAL — TESTIMONIOS ═══════ */}
      <section className="py-14 sm:py-16 bg-white" data-testid="testimonials-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">Lo que dicen las familias</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Laura M.', city: 'Madrid', text: 'Gracias a ManoProtect localic\u00e9 a mi hijo cuando perdi\u00f3 el autob\u00fas. En 10 segundos supe d\u00f3nde estaba. No tiene precio.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face' },
              { name: 'Carlos R.', city: 'Barcelona', text: 'Me da una tranquilidad incre\u00edble cuando mi hija sale por la noche. S\u00e9 que si pasa algo, el SOS me llega al instante.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face' },
              { name: 'Marta G.', city: 'Valencia', text: 'Funciona incluso con la pantalla bloqueada. Mi hijo ni se entera y yo duermo tranquila. Lo recomiendo a todas las madres.', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face' },
            ].map((t, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow" data-testid={`testimonial-${i}`}>
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-gray-600 mb-5 leading-relaxed italic">{`"${t.text}"`}</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PRECIO ANCLADO CORRECTAMENTE ═══════ */}
      <section className="py-14 sm:py-16 bg-slate-50" id="precios" data-testid="pricing-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Price anchoring */}
          <div className="text-center mb-3">
            <p className="text-sm text-gray-500 mb-2" data-testid="price-anchor-text">
              {"Una estafa digital media cuesta m\u00e1s de "}<strong className="text-red-500">{"600\u20ac"}</strong>{". Una denuncia falsa puede costar miles."}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {"La tranquilidad empieza desde "}<span className="text-emerald-500">{"9,99\u20ac/mes"}</span>
            </h2>
          </div>
          <p className="text-center text-gray-500 mb-10 text-sm">{"9,99\u20ac es menos que una cena familiar. Y protege a todos."}</p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Monthly Plan */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow" data-testid="plan-mensual">
              <h3 className="font-bold text-gray-900 text-lg mb-1">Plan Mensual</h3>
              <p className="text-gray-500 text-sm mb-4">Cancela cuando quieras</p>
              <div className="mb-4">
                <span className="text-4xl font-extrabold text-gray-900">{"9,99\u20ac"}</span>
                <span className="text-gray-400">/mes</span>
              </div>
              <ul className="space-y-2.5 mb-6 text-sm text-gray-600">
                {['GPS en segundo plano 24/7', 'Alertas SOS instant\u00e1neas', 'Hasta 5 familiares', 'Zonas seguras', 'Notificaciones push'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <button
                onClick={() => { track('cta_click', { location: 'pricing', plan: 'mensual' }); navigate('/registro'); }}
                className="block w-full text-center py-3.5 border-2 border-emerald-500 text-emerald-600 font-bold rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                data-testid="plan-mensual-cta"
              >
                Empezar ahora
              </button>
            </div>

            {/* Annual Plan — RECOMMENDED */}
            <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 relative shadow-lg shadow-emerald-100" data-testid="plan-anual">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                {"M\u00c1S POPULAR \u00b7 Ahorra 20\u20ac"}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Plan Anual</h3>
              <p className="text-gray-500 text-sm mb-4">{"El m\u00e1s elegido por las familias"}</p>
              <div className="mb-1">
                <span className="text-4xl font-extrabold text-gray-900">{"99,99\u20ac"}</span>
                <span className="text-gray-400">{"/a\u00f1o"}</span>
              </div>
              <p className="text-xs text-emerald-600 font-semibold mb-4">{"Solo 8,33\u20ac/mes \u00b7 Ahorra 19,89\u20ac al a\u00f1o"}</p>
              <ul className="space-y-2.5 mb-6 text-sm text-gray-600">
                {['Todo del Plan Mensual', 'GPS en segundo plano 24/7', 'Prioridad en soporte', 'Alertas por WhatsApp', 'Dispositivo GRATIS incluido'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <button
                onClick={() => { track('cta_click', { location: 'pricing', plan: 'anual' }); navigate('/registro'); }}
                className="block w-full text-center py-3.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all"
                data-testid="plan-anual-cta"
              >
                {"Empezar ahora \u00b7 Mejor precio"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ GARANTÍA FUERTE ═══════ */}
      <section className="py-12 bg-emerald-50 border-y border-emerald-100" data-testid="guarantee-section">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{"Garant\u00eda de tranquilidad"}</h2>
          <p className="text-gray-600 mb-6">
            {"Si en 7 d\u00edas no sientes m\u00e1s tranquilidad, "}<strong>{"cancela sin compromiso y te devolvemos el dinero."}</strong>{" Sin preguntas. Sin letras peque\u00f1as."}
          </p>
          <button
            onClick={() => ctaClick('guarantee')}
            className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-0.5"
            data-testid="guarantee-cta"
          >
            Proteger a Mi Familia Ahora <Heart className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ═══════ CTA FINAL — SECCIÓN POTENTE ═══════ */}
      <section className="py-16 sm:py-20 bg-gray-900" data-testid="final-cta">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" data-testid="final-cta-title">
            La tranquilidad no tiene precio.
          </h2>
          <p className="text-gray-400 text-lg mb-8">{"Pero hoy empieza con 7 d\u00edas gratis."}</p>
          <button
            onClick={() => ctaClick('final')}
            className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-10 py-5 rounded-xl hover:bg-emerald-600 transition-all text-lg shadow-xl shadow-emerald-500/20 hover:scale-105 hover:-translate-y-0.5"
            data-testid="final-cta-btn"
          >
            Proteger a Mi Familia Ahora <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-gray-500 text-sm mt-5">{"Sin compromiso \u00b7 Cancela cuando quieras \u00b7 14 d\u00edas de garant\u00eda"}</p>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <LandingFooter />

      {/* ═══════ EXIT INTENT POPUP ═══════ */}
      {showExitPopup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" data-testid="exit-popup">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowExitPopup(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowExitPopup(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" data-testid="exit-popup-close">
              <X className="w-6 h-6" />
            </button>
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Antes de irte...</h3>
            <p className="text-gray-500 mb-6">
              {"Prueba ManoProtect "}<strong className="text-emerald-500">{"7 d\u00edas completamente gratis"}</strong>{". Sin tarjeta. Sin compromiso."}
            </p>
            <button
              onClick={() => { setShowExitPopup(false); ctaClick('exit_popup'); }}
              className="block w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition-all mb-3"
              data-testid="exit-popup-cta"
            >
              {"Probar 7 d\u00edas gratis"}
            </button>
            <button onClick={() => setShowExitPopup(false)} className="text-sm text-gray-400 hover:text-gray-600">
              No gracias, prefiero no proteger a mi familia
            </button>
          </div>
        </div>
      )}

      {/* ═══════ SOCIAL PROOF NOTIFICATION ═══════ */}
      {socialProof && (
        <div className="fixed bottom-20 left-4 z-40 sm:bottom-6 sm:left-6 animate-in slide-in-from-left duration-500" data-testid="social-proof-notification">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-3 max-w-xs flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-800"><strong>{socialProof.name}</strong> de {socialProof.city}</p>
              <p className="text-[11px] text-gray-500">{"acaba de activar "}<span className="text-emerald-500 font-semibold">ManoProtect</span></p>
            </div>
            <button onClick={() => setSocialProof(null)} className="text-gray-300 hover:text-gray-500">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════ BOTÓN FLOTANTE FIJO MÓVIL ═══════ */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 p-3" data-testid="mobile-sticky-cta">
        <button
          onClick={() => ctaClick('mobile_sticky')}
          className="flex items-center justify-center gap-2 w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg active:bg-emerald-600"
        >
          <Shield className="w-5 h-5" /> Proteger Ahora
        </button>
      </div>

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
    </div>
  );
};

export default HighConversionLanding;
