import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MessageSquare, Users, Building2, Check, ArrowRight, LogIn, Shield, Star, Quote, X, Award, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import SEO from '@/components/SEO';
import AlertSubscription from '@/components/AlertSubscription';
import LanguageSelector from '@/components/LanguageSelector';
import { useI18n } from '@/i18n/I18nContext';
import { useMemo, lazy, Suspense, useEffect, useState, useRef } from 'react';

// Lazy load ALL conversion components (non-critical for initial render)
const ExitIntentPopup = lazy(() => import('@/components/conversion/ExitIntentPopup'));
const SavingsCalculator = lazy(() => import('@/components/conversion/SavingsCalculator'));
const TrustBadges = lazy(() => import('@/components/conversion/TrustBadges'));
const PlanQuiz = lazy(() => import('@/components/conversion/PlanQuiz'));
const ComparisonTable = lazy(() => import('@/components/conversion/ComparisonTable'));
const StickyMobileCTA = lazy(() => import('@/components/conversion/StickyMobileCTA'));
const ProactiveChat = lazy(() => import('@/components/conversion/ProactiveChat'));

// Lazy load trust components
const LiveChatWidget = lazy(() => import('@/components/trust/LiveChatWidget'));

// Brand assets - Use optimized WebP for performance (6KB vs 124KB PNG)
const LOGO_URL = '/manoprotect_logo.webp';
const ALERT_IMAGE_URL = process.env.REACT_APP_ALERT_IMAGE_URL || '/manoprotect_alert.png';

// Hook for lazy loading sections when they come into view
const useLazySection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return { ref, isVisible };
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { t } = useI18n();

  // Memoize testimonials to prevent unnecessary re-renders
  const testimonials = useMemo(() => [
    {
      id: 1,
      name: "Selomit",
      location: "España",
      plan: "Usuario verificado",
      date: "Reseña de Google - Febrero 2025",
      rating: 5,
      text: "Llevo tiempo utilizándola, estoy tranquila. Tengo dos adolescentes y las tengo controladas, sé dónde están. Y sé que si necesitan ayuda me pueden conectar y ir al sitio donde están. Muy útil y me gusta mucho. Os lo recomiendo.",
      saved: "Tranquilidad familiar",
      color: "indigo"
    },
    {
      id: 2,
      name: "María Deseada Solas Sanchis",
      location: "España",
      plan: "Usuario verificado",
      date: "Reseña de Google - Febrero 2025",
      rating: 5,
      text: "Muy útil!!!! Con mi madre de 78 años para saber dónde está en todo momento y tener controlado en caso de caída o incidente.",
      saved: "Cuidado de mayores",
      color: "emerald"
    }
  ], []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <SEO 
        title="ManoProtect - Protección Digital para tu Familia | Anti-Estafas España"
        description="Protege a tu familia contra estafas online, fraudes telefónicos y amenazas digitales. Detección de estafas en tiempo real. 7 días GRATIS."
        keywords="protección digital, anti estafas, seguridad online, protección familiar, fraudes online, ciberseguridad, España, detectar estafas, phishing"
        canonical="https://manoprotect.com"
      />
      
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4" role="banner">
        <nav className="max-w-7xl mx-auto flex items-center justify-between" aria-label="Navegación principal">
          <div className="flex items-center gap-3">
              <img 
                src={LOGO_URL}
                alt="ManoProtect - Protección contra fraudes digitales" 
                className="h-10 w-auto"
                width="40"
                height="40"
                loading="eager"
              />
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector className="mr-2" />
            {/* Botón de Precios DESTACADO - Improved contrast */}
            <Button
              data-testid="header-pricing-btn"
              onClick={() => navigate('/plans')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg px-5 h-10 font-semibold shadow-sm"
            >
              💰 Ver Precios
            </Button>
            <Button
              data-testid="header-investors-btn"
              onClick={() => navigate('/investor/register')}
              variant="ghost"
              className="text-zinc-700 hover:text-indigo-600 rounded-lg px-4 h-10"
            >
              Inversores
            </Button>
            {isAuthenticated ? (
              <Button
                data-testid="header-dashboard-btn"
                onClick={() => navigate('/dashboard')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 h-12 shadow-sm hover:shadow-md active:scale-95 transition-all"
              >
                {t('nav.dashboard')}
              </Button>
            ) : (
              <>
                <Button
                  data-testid="header-login-btn"
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-lg px-4 h-10"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('nav.login')}
                </Button>
                <Button
                  data-testid="header-register-btn"
                  onClick={() => navigate('/register')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 h-12 shadow-sm hover:shadow-md active:scale-95 transition-all"
                >
                  {t('nav.register')}
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Trust Bar - Garantías visibles - Improved contrast */}
      <div className="bg-emerald-800 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-sm font-medium">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            7 días GRATIS
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Sin permanencia
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Cancela cuando quieras
          </span>
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Pago seguro
          </span>
        </div>
      </div>

      {/* Hero Section - Main Content */}
      <main id="main-content" role="main">
      <section className="relative px-6 py-12 overflow-hidden">
        <div className="grain absolute inset-0 pointer-events-none" aria-hidden="true" />
        <div className="max-w-7xl mx-auto">
          
          {/* Main Headline + CTA Button */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
              Protección completa para tu familia
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600 max-w-3xl mx-auto mb-8">
              ManoProtect es una <strong>herramienta de apoyo</strong> para proteger a tu familia: 
              botón SOS para emergencias y detección de estafas digitales.
            </p>
            
            {/* CTA Principal - Visible sin scroll */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button 
                size="lg" 
                onClick={() => navigate('/register')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Prueba ManoProtect gratis 7 días
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/login')}
                className="text-lg px-6 py-6 rounded-xl border-2"
              >
                Ya tengo cuenta
              </Button>
            </div>
            
            <p className="text-sm text-zinc-500">
              Sin tarjeta de crédito · Cancela cuando quieras · Sin compromiso
            </p>
          </div>

          {/* Mini testimonios - Primeros usuarios */}
          <div className="bg-zinc-50 rounded-2xl p-6 mb-12 border border-zinc-200">
            <p className="text-center text-zinc-600 mb-4">
              <span className="font-semibold text-zinc-800">Familias como la tuya</span> ya usan ManoProtect para estar más tranquilas
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <span>Primeros usuarios protegiendo a sus familias</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <span>Herramienta de apoyo contra fraudes</span>
              </div>
            </div>
          </div>

          {/* Disclaimer visible */}
          <div className="text-center mb-12">
            <p className="text-xs text-zinc-400 max-w-2xl mx-auto">
              ManoProtect es una herramienta de apoyo familiar. No sustituye a los servicios de emergencia (112) 
              ni garantiza protección absoluta. Ante una emergencia real, llama siempre al 112.
            </p>
          </div>

          {/* Two Main Features - Separated */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            
            {/* Feature 1: Family Protection / SOS */}
            <div className="relative bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-3xl p-8 hover:shadow-xl transition-all">
              <div className="absolute top-4 right-4 bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                EMERGENCIAS
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900">Protección Familiar</h2>
                  <p className="text-red-600 font-medium">Botón SOS + Ubicación en vivo</p>
                </div>
              </div>
              
              <p className="text-zinc-600 mb-6">
                Cuando un familiar pulse el <strong>botón SOS</strong>, recibirás una alerta instantánea 
                con su <strong>ubicación exacta en tiempo real</strong>. Ideal para emergencias, accidentes o situaciones de peligro.
              </p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-zinc-700">Botón SOS con cuenta atrás de 3 segundos</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-zinc-700">GPS en tiempo real con dirección exacta</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-zinc-700">Notificación push + SMS de emergencia</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-zinc-700">Sirena de alerta en el móvil del familiar</span>
                </li>
              </ul>

              <Button
                onClick={() => navigate('/sos-quick')}
                className="w-full bg-red-700 hover:bg-red-800 text-white rounded-xl h-12 text-lg font-bold"
              >
                Ver Botón SOS
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Feature 2: Fraud Protection */}
            <div className="relative bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-3xl p-8 hover:shadow-xl transition-all">
              <div className="absolute top-4 right-4 bg-indigo-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                ESTAFAS
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900">Protección Anti-Estafas</h2>
                  <p className="text-indigo-600 font-medium">Detección con IA en tiempo real</p>
                </div>
              </div>
              
              <p className="text-zinc-600 mb-6">
                Detectamos <strong>automáticamente</strong> llamadas fraudulentas, SMS falsos, 
                emails de phishing y estafas por WhatsApp <strong>antes de que caigas</strong>.
              </p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-zinc-700">Detección de phishing (emails falsos)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-zinc-700">Detección de smishing (SMS fraudulentos)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-zinc-700">Bloqueo de llamadas de vishing</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-zinc-700">Verificador de enlaces sospechosos</span>
                </li>
              </ul>

              <Button
                onClick={() => navigate('/verificar-estafa')}
                className="w-full bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl h-12 text-lg font-bold"
              >
                Verificar una Estafa
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                onClick={() => navigate('/voice-shield')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl h-12 text-lg font-bold mt-3"
                data-testid="voice-shield-btn"
              >
                <Phone className="w-5 h-5 mr-2" />
                AI Voice Shield - Llamadas
              </Button>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-zinc-900 rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Empieza a proteger a tu familia hoy
            </h3>
            <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
              7 días gratis, sin tarjeta de crédito. Cancela cuando quieras.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                data-testid="hero-download-btn"
                onClick={() => navigate('/register')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8 h-14 text-lg font-bold shadow-lg"
              >
                Crear Cuenta Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                data-testid="hero-pricing-btn"
                onClick={() => navigate('/plans')}
                variant="outline"
                className="border-2 border-zinc-600 text-white hover:bg-zinc-800 rounded-xl px-8 h-14 text-lg font-semibold"
              >
                Ver Planes y Precios
              </Button>
            </div>
            
            {/* Features - Real capabilities only */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-10 pt-8 border-t border-zinc-700">
              <div>
                <div className="text-3xl font-bold text-emerald-400">IA</div>
                <div className="text-sm text-zinc-500">Análisis Inteligente</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-400">24/7</div>
                <div className="text-sm text-zinc-500">Protección continua</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-400">SMS</div>
                <div className="text-sm text-zinc-500">Alertas Instantáneas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-400">GPS</div>
                <div className="text-sm text-zinc-500">Localización Familiar</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Threat Types */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('landing.features.title')}</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              {t('landing.hero.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Phone, label: 'Vishing', desc: 'Llamadas fraudulentas' },
              { icon: MessageSquare, label: 'Smishing', desc: 'SMS maliciosos' },
              { icon: Mail, label: 'Phishing', desc: 'Correos engañosos' },
              { icon: Users, label: 'Suplantación', desc: 'Identidad falsa' }
            ].map((item, idx) => (
              <div
                key={idx}
                data-testid={`threat-type-${item.label.toLowerCase()}`}
                className="card-hover p-6 rounded-xl bg-zinc-50 border border-zinc-200 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.label}</h3>
                <p className="text-sm text-zinc-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Partners - Technology Stack */}
      <section className="px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Tecnología de Última Generación</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Protección Multi-Capa con los Líderes del Mercado
            </h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              Integramos las APIs de ciberseguridad más avanzadas del mundo para ofrecerte 
              detección de amenazas en tiempo real. Sin promesas falsas, solo tecnología probada.
            </p>
          </div>

          {/* Security Layers */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Google Safe Browsing */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-emerald-500/50 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-8 h-8">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Google Safe Browsing</h3>
                  <p className="text-xs text-emerald-400">API v5 - Activo</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Protección contra phishing y malware. Escanea más de 5 mil millones de dispositivos diariamente.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>99.9% detección de phishing</span>
              </div>
            </div>

            {/* VirusTotal */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.09 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">VirusTotal</h3>
                  <p className="text-xs text-blue-400">API v3 - Activo</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Análisis con más de 70 motores antivirus. Propiedad de Google Chronicle Security.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>70+ motores de análisis</span>
              </div>
            </div>

            {/* Cloudflare */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-orange-500/50 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
                    <path d="M16.5 8.5c-.3-1.2-1.5-2-3-1.8l-7.7.8c-.2 0-.3.1-.3.2-.1.1-.1.2 0 .3.1.1.2.2.4.2l7.8-.1c.6 0 1.2.2 1.5.7.3.4.4 1 .2 1.5-.1.4-.4.8-.8 1l-9.1 1.9c-.2 0-.3.1-.4.3-.1.2-.1.3 0 .5.1.1.2.2.4.2l9.2-.1h.1c1.2-.3 2.1-1.3 2.3-2.5.1-.8-.1-1.6-.6-2.1z"/>
                    <path d="M19.8 11.2c-.1-.5-.5-.8-1-.7l-1.3.2c-.1 0-.2.1-.2.2s0 .2.1.3c.1.1.2.1.3.1l1.3-.1c.2 0 .4.1.5.3.1.2.1.4 0 .5l-3.3 2.2c-.1.1-.2.1-.2.2s0 .2.1.3c.1.1.2.1.3.1l3.3-2.2c.5-.3.8-.8.6-1.4z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Cloudflare</h3>
                  <p className="text-xs text-orange-400">WAF - Activo</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                WAF, protección contra bots y DDoS. Líder en Forrester Wave WAF 2025.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span>20% del tráfico web mundial</span>
              </div>
            </div>

            {/* AbuseIPDB */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-red-500/50 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AbuseIPDB</h3>
                  <p className="text-xs text-red-400">API v2 - Activo</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Base de datos colaborativa de IPs maliciosas reportadas por la comunidad global.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Millones de IPs verificadas</span>
              </div>
            </div>
          </div>

          {/* Premium Partners Row */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* AlienVault OTX */}
            <div className="bg-gradient-to-br from-purple-900/50 to-slate-800/50 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">AlienVault OTX</h3>
                  <p className="text-xs text-purple-400">Threat Intelligence</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Open Threat Exchange con más de 200.000 contribuidores compartiendo inteligencia de amenazas.
              </p>
            </div>

            {/* CrowdStrike */}
            <div className="bg-gradient-to-br from-red-900/50 to-slate-800/50 border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                    <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83V6.31l6-2.25 6 2.25v4.78z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">CrowdStrike Falcon</h3>
                  <p className="text-xs text-red-400">Premium - Enterprise</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Threat Intelligence líder mundial. Top 3 en plataformas TI 2025. Detección de amenazas avanzadas.
              </p>
            </div>

            {/* Recorded Future */}
            <div className="bg-gradient-to-br from-cyan-900/50 to-slate-800/50 border border-cyan-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Recorded Future</h3>
                  <p className="text-xs text-cyan-400">AI Intelligence</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Plataforma #1 de inteligencia AI. Intelligence Graph para análisis predictivo de amenazas.
              </p>
            </div>
          </div>

          {/* AI Voice Shield Highlight */}
          <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border border-indigo-500/40 rounded-2xl p-8 mb-12">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full">NUEVO</span>
                  <span className="bg-green-500/20 text-green-300 text-xs font-semibold px-3 py-1 rounded-full">EN VIVO</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">AI Voice Shield</h3>
                <p className="text-slate-300 mb-4">
                  Detecta estafas telefonicas en tiempo real usando IA. Analiza conversaciones 
                  y te alerta de tacticas de manipulacion, presion financiera y suplantacion de identidad.
                </p>
                <button
                  onClick={() => navigate('/voice-shield')}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                  data-testid="voice-shield-cta-btn"
                >
                  Probar AI Voice Shield
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center md:text-right">
                <div className="text-4xl font-bold text-indigo-400">100%</div>
                <div className="text-sm text-slate-400">Deteccion de Vishing</div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-emerald-400">8</div>
                <div className="text-sm text-slate-400">Capas de Protección</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">70+</div>
                <div className="text-sm text-slate-400">Motores Antivirus</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-400">24/7</div>
                <div className="text-sm text-slate-400">Monitoreo Activo</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">AI</div>
                <div className="text-sm text-slate-400">Detección Inteligente</div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-slate-500 mt-8">
            Los logos y marcas pertenecen a sus respectivos propietarios. ManoProtect integra sus APIs públicas 
            para ofrecer protección multi-capa. No garantizamos protección absoluta contra todas las amenazas.
          </p>
        </div>
      </section>

      {/* Segments - Bento Grid */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Protección para todos</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Desde personas hasta grandes empresas, ManoProtect se adapta a tus necesidades
            </p>
          </div>

          <div className="bento-grid">
            {/* Personal */}
            <div className="bento-large card-hover p-8 rounded-2xl bg-white border border-zinc-200">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <img 
                    src={LOGO_URL}
                    alt="ManoProtect" 
                    className="h-10 w-auto mb-4"
                    width="40"
                    height="40"
                    loading="lazy"
                  />
                  <h3 className="text-2xl font-bold mb-3">Para Personas</h3>
                  <p className="text-zinc-600 mb-6">
                    Detección automática de amenazas en llamadas, SMS, WhatsApp y correos. Bloqueo inteligente y alertas en tiempo real.
                  </p>
                  <ul className="space-y-2">
                    {['Análisis en tiempo real', 'Bloqueo automático', 'Historial de amenazas'].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="w-48 h-48 rounded-xl overflow-hidden hidden lg:block">
                  <img
                    src={ALERT_IMAGE_URL}
                    alt="Alertas de seguridad ManoProtect"
                    className="w-full h-full object-cover"
                    width="192"
                    height="192"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>

            {/* Family */}
            <div className="bento-medium card-hover p-0 rounded-2xl bg-white border border-emerald-200 overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1758686254056-6cd980b9aaee?w=300&q=50&fm=webp&fit=crop"
                  alt="Personas mayores protegidas con ManoProtect"
                  className="w-full h-full object-cover"
                  width="300"
                  height="192"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="p-6">
                <Users className="w-10 h-10 text-emerald-600 mb-3" />
                <h3 className="text-2xl font-bold mb-3">Modo Familiar</h3>
                <p className="text-zinc-600 mb-4">
                  Protección especial para personas mayores con botón SOS y notificaciones a familiares.
                </p>
                <Button
                  data-testid="family-learn-more-btn"
                  onClick={() => navigate('/family-mode')}
                  variant="outline"
                  className="border-emerald-300 hover:bg-emerald-50 rounded-lg active:scale-95 transition-all"
                >
                  Saber más
                </Button>
              </div>
            </div>

            {/* Business */}
            <div className="bento-small card-hover p-0 rounded-2xl bg-white border border-indigo-200 overflow-hidden">
              <div className="h-32 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1709715357520-5e1047a2b691?w=250&q=50&fm=webp&fit=crop"
                  alt="Equipo empresarial protegido con ManoProtect Enterprise"
                  className="w-full h-full object-cover"
                  width="250"
                  height="128"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="p-6">
                <Building2 className="w-10 h-10 text-indigo-600 mb-3" />
                <h3 className="text-xl font-bold mb-2">Empresas</h3>
                <p className="text-sm text-zinc-600">
                  Panel empresarial con estadísticas y protección para todos tus empleados.
                </p>
              </div>
            </div>

            <div className="bento-small card-hover p-8 rounded-2xl bg-zinc-900 text-white">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-zinc-300">
                Monitoreo continuo y actualizaciones de amenazas en tiempo real
              </p>
            </div>

            <div className="bento-small card-hover p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-white border border-orange-200">
              <div className="text-3xl font-bold text-orange-600 mb-2">Freemium</div>
              <p className="text-sm text-zinc-600">
                Protección básica gratis. Premium con funciones avanzadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1752652011717-f06f7ed3927a?w=400&q=50&fm=webp&fit=crop"
                alt="Familia española protegida contra fraudes digitales con ManoProtect"
                className="w-full rounded-2xl shadow-2xl"
                width="400"
                height="267"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Protege a toda tu familia
              </h2>
              <p className="text-lg text-zinc-600">
                ManoProtect no solo protege a personas individuales. Protege a familias completas, 
                especialmente a los más vulnerables: nuestros mayores.
              </p>
              <div className="space-y-4">
                {[
                  { stat: 'IA', label: 'Análisis inteligente' },
                  { stat: 'SMS', label: 'Alertas instantáneas' },
                  { stat: '7 días', label: 'Prueba gratuita' },
                  { stat: '24/7', label: 'Protección continua' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                    <div>
                      <span className="font-bold text-2xl text-indigo-600">{item.stat}</span>
                      <span className="text-zinc-600 ml-2">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="px-6 py-20 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Protégete ahora. Es gratis.
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Empieza a proteger a tu familia con ManoProtect
          </p>
          <Button
            data-testid="final-cta-btn"
            onClick={() => navigate('/dashboard')}
            className="bg-white text-indigo-600 hover:bg-zinc-50 rounded-lg px-10 h-14 text-lg font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            Comenzar Ahora
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* 🔥 Conversion: Sección de Herramientas de Conversión */}
      <section className="px-6 py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Por qué elegir ManoProtect?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Descubre cuánto dinero estás poniendo en riesgo y encuentra el plan perfecto para ti
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Calculadora de Ahorro */}
            <SavingsCalculator />
            
            {/* Quiz de Plan */}
            <PlanQuiz />
          </div>
          
          {/* Tabla Comparativa */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Sin protección vs Con ManoProtect
            </h3>
            <ComparisonTable />
          </div>
          
          {/* Trust Badges */}
          <TrustBadges />
        </div>
      </section>

      {/* Testimonials Section - Clientes Reales */}
      <section className="px-6 py-20 bg-white" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 id="testimonials-heading" className="text-3xl font-bold text-zinc-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Reseñas reales de Google Play
            </p>
          </div>

          {/* Grid de Testimonios - Solo los reales */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
            {testimonials.slice(0, 2).map((testimonial) => (
              <article 
                key={testimonial.id}
                className={`bg-gradient-to-br from-${testimonial.color}-50 to-white p-6 rounded-2xl border border-${testimonial.color}-100 shadow-sm hover:shadow-lg transition-all duration-300 relative`}
              >
                {/* Badge de ahorro */}
                {testimonial.saved && (
                  <div className="absolute -top-3 -right-3 bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {testimonial.saved}
                  </div>
                )}
                
                {/* Estrellas - Use role="img" for star rating */}
                <div className="flex items-center gap-1 mb-3" role="img" aria-label={`Valoración: ${testimonial.rating} de 5 estrellas`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                  ))}
                </div>
                
                {/* Quote */}
                <Quote className={`w-8 h-8 text-${testimonial.color}-200 mb-2`} aria-hidden="true" />
                
                {/* Texto del testimonio */}
                <blockquote className="text-zinc-700 mb-4 text-sm leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
                
                {/* Autor */}
                <footer className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                  <div className={`w-12 h-12 bg-${testimonial.color}-100 rounded-full flex items-center justify-center text-${testimonial.color}-600 font-bold text-sm`}>
                    {testimonial.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1">
                    <cite className="font-medium text-zinc-900 not-italic block">{testimonial.name}</cite>
                    <p className="text-xs text-zinc-500">{testimonial.location} • {testimonial.plan}</p>
                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                      <Check className="w-3 h-3" aria-hidden="true" />
                      {testimonial.date}
                    </p>
                  </div>
                </footer>
              </article>
            ))}
          </div>

          {/* CTA después de testimonios - CLARO Y DIRECTO */}
          <div className="text-center mt-10 p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">¿Listo para proteger a tu familia?</h3>
            <p className="text-indigo-100 mb-6">Protege a tu familia de estafas digitales hoy mismo</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                data-testid="testimonials-cta-btn"
                onClick={() => navigate('/register')}
                className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl px-8 h-14 text-lg font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all"
                aria-label="Comenzar prueba gratuita de ManoProtect"
              >
                🛡️ Crear Cuenta Gratis
                <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
              </Button>
              <Button
                data-testid="testimonials-pricing-btn"
                onClick={() => navigate('/plans')}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 rounded-xl px-8 h-14 text-lg font-semibold active:scale-95 transition-all"
              >
                Ver Planes y Precios
              </Button>
            </div>
            <p className="text-indigo-200 text-sm mt-4">✓ 7 días gratis · ✓ Sin tarjeta · ✓ Cancela cuando quieras</p>
          </div>

          {/* Security Features - Only verifiable claims */}
          <div className="mt-16 pt-12 border-t border-zinc-200">
            <p className="text-center text-sm text-zinc-500 mb-8">CARACTERÍSTICAS DE SEGURIDAD</p>
            
            <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-lg">
                <Shield className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                <span className="text-sm font-medium text-zinc-700">Conexión SSL Segura</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-lg">
                <Check className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                <span className="text-sm font-medium text-zinc-700">RGPD Compliant</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" aria-hidden="true" />
                <span className="text-sm font-medium text-zinc-700">Pagos con Stripe</span>
              </div>
            </div>
            
            {/* Features - No statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">IA</div>
                <p className="text-sm text-zinc-600 mt-1">Análisis Inteligente</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">24/7</div>
                <p className="text-sm text-zinc-600 mt-1">Protección Continua</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">7</div>
                <p className="text-sm text-zinc-600 mt-1">Días Prueba Gratis</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">SMS</div>
                <p className="text-sm text-zinc-600 mt-1">Alertas Instantáneas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alert Subscription Section */}
      <section className="px-6 py-16 bg-zinc-100" aria-labelledby="subscription-heading">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 id="subscription-heading" className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
                Mantente informado sobre las últimas estafas
              </h2>
              <p className="text-zinc-600 mb-4">
                Suscríbete gratis a nuestras alertas de seguridad y recibe notificaciones cuando detectemos nuevas amenazas activas en España.
              </p>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Alertas de phishing y emails fraudulentos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  SMS y llamadas sospechosas (smishing/vishing)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Suplantación de bancos y empresas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Totalmente gratis, sin compromiso
                </li>
              </ul>
            </div>
            <AlertSubscription variant="default" />
          </div>
        </div>
      </section>
      </main>

      {/* Transparency Section - Honestidad que genera confianza */}
      <section className="px-6 py-16 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Transparencia Total</h2>
            <p className="text-zinc-600">Queremos que sepas exactamente qué es ManoProtect</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Lo que SÍ somos */}
            <div className="bg-white rounded-xl p-6 border border-emerald-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-emerald-700">Lo que SÍ somos</h3>
              </div>
              <ul className="space-y-3 text-sm text-zinc-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Sistema <strong>privado</strong> de avisos entre familiares</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Herramienta de <strong>prevención</strong> contra estafas digitales</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Empresa española registrada (CIF: B19427723)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Cumplimos con <strong>RGPD</strong> y normativa europea</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Tus datos <strong>nunca se venden</strong> a terceros</span>
                </li>
              </ul>
            </div>
            
            {/* Lo que NO somos */}
            <div className="bg-white rounded-xl p-6 border border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-red-700">Lo que NO somos</h3>
              </div>
              <ul className="space-y-3 text-sm text-zinc-600">
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong>NO</strong> sustituimos al 112 ni servicios de emergencia</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong>NO</strong> somos un organismo oficial ni gubernamental</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong>NO</strong> garantizamos detección al 100%</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong>NO</strong> accedemos a tus cuentas bancarias</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong>NO</strong> hay permanencia ni penalizaciones</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Garantías */}
          <div className="mt-10 bg-indigo-50 rounded-xl p-6 border border-indigo-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Shield className="w-12 h-12 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-indigo-900">Nuestras Garantías</h3>
                  <p className="text-sm text-indigo-700">Sin letra pequeña, sin sorpresas</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="bg-white px-4 py-2 rounded-full border border-indigo-200 text-indigo-700">
                  ✓ 7 días gratis
                </span>
                <span className="bg-white px-4 py-2 rounded-full border border-indigo-200 text-indigo-700">
                  ✓ Cancela cuando quieras
                </span>
                <span className="bg-white px-4 py-2 rounded-full border border-indigo-200 text-indigo-700">
                  ✓ Sin permanencia
                </span>
                <span className="bg-white px-4 py-2 rounded-full border border-indigo-200 text-indigo-700">
                  ✓ Pago seguro con Stripe
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Improved contrast */}
      <footer className="px-6 py-12 bg-zinc-900 text-zinc-300" role="contentinfo">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo y descripción */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={LOGO_URL}
                  alt="ManoProtect - Tu escudo digital contra fraudes" 
                  className="h-8 w-auto"
                  width="32"
                  height="32"
                  loading="lazy"
                />
              </div>
              <p className="text-sm text-zinc-400 max-w-md">
                ManoProtect es tu escudo digital contra fraudes. Protegemos a personas, familias y empresas con tecnología de inteligencia artificial avanzada.
              </p>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => navigate('/how-it-works')} className="hover:text-white transition-colors" aria-label="Descubre cómo funciona ManoProtect">
                    Cómo Funciona
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors" aria-label="Ver planes y precios de ManoProtect">
                    Precios
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/family-mode')} className="hover:text-white transition-colors" aria-label="Conoce el modo familiar de ManoProtect">
                    Modo Familiar
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/investor/register')} className="hover:text-white transition-colors" aria-label="Información para inversores de ManoProtect">
                    Inversores
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => navigate('/privacy-policy')} className="hover:text-white transition-colors" aria-label="Leer la política de privacidad de ManoProtect">
                    Política de Privacidad
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/terms-of-service')} className="hover:text-white transition-colors" aria-label="Leer los términos y condiciones de ManoProtect">
                    Términos y Condiciones
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/refund-policy')} className="hover:text-white transition-colors" aria-label="Ver la política de reembolsos de ManoProtect">
                    Política de Reembolsos
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/legal-notice')} className="hover:text-white transition-colors" aria-label="Leer el aviso legal de ManoProtect">
                    Aviso Legal
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/solicitar-eliminacion')} className="hover:text-white transition-colors" aria-label="Solicitar eliminación de cuenta">
                    Eliminar mi Cuenta
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Sede y Contacto */}
          <div className="border-t border-zinc-800 pt-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Sede Central</p>
                  <p className="text-sm text-zinc-400">C/ Sor Isabel de Villena 80 bajo</p>
                  <p className="text-sm text-zinc-400">Novetlè, Valencia, España</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Soporte</p>
                  <a href="mailto:soporte@manoprotect.es" className="text-sm text-indigo-400 hover:text-indigo-300">soporte@manoprotect.es</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Email</p>
                  <a href="mailto:info@manoprotect.com" className="text-sm text-indigo-400 hover:text-indigo-300" aria-label="Enviar email a ManoProtect a info@manoprotect.com">info@manoprotect.com</a>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Seal / Sello de Confianza */}
          <div className="border-t border-zinc-800 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border border-emerald-700/50 rounded-xl">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">Sello de Confianza</p>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xs text-emerald-300">Sitio Verificado y Protegido</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 px-5 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Empresa Española</p>
                  <p className="text-xs text-zinc-400">CIF: B19427723 · RGPD Compliant</p>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-zinc-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-400">
              © 2025 ManoProtect S.L. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4 text-sm text-zinc-400">
              <span>CIF: B19427723</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Conversion: Componentes Globales - Lazy loaded */}
      <Suspense fallback={null}>
        <ExitIntentPopup />
      </Suspense>
      <Suspense fallback={null}>
        <StickyMobileCTA />
      </Suspense>
      <Suspense fallback={null}>
        <ProactiveChat delaySeconds={30} />
      </Suspense>
      
      {/* Chat con Persona Real - Lazy loaded */}
      <Suspense fallback={null}>
        <LiveChatWidget />
      </Suspense>
    </div>
  );
};

export default LandingPage;