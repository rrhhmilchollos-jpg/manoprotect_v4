/**
 * SEO Landing Pages - ManoProtect Authority & Backlinks
 * Long-tail keyword pages for organic traffic and domain authority
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Phone, MapPin, Heart, AlertTriangle, Lock, Wifi } from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

const SeoHeader = () => (
  <header className="bg-white border-b border-gray-100">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
        <span className="text-emerald-600 text-lg font-bold">ManoProtect</span>
      </Link>
      <nav className="hidden sm:flex items-center gap-4 text-sm">
        <Link to="/productos" className="text-gray-600 hover:text-emerald-600">Productos</Link>
        <Link to="/plans" className="text-gray-600 hover:text-emerald-600">Precios</Link>
        <Link to="/contacto" className="text-gray-600 hover:text-emerald-600">Contacto</Link>
      </nav>
    </div>
  </header>
);

const CtaBanner = ({ text }) => (
  <section className="py-12 bg-emerald-600 text-white text-center">
    <div className="max-w-3xl mx-auto px-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-3">{text}</h2>
      <p className="text-emerald-100 mb-6 text-sm">Dispositivo GRATIS con tu suscripción. Desde solo 9,99€/mes.</p>
      <Link to="/plans" className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-full font-bold text-sm hover:bg-emerald-50 transition-colors" data-testid="seo-cta-btn">
        Ver planes y precios <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  </section>
);

const InternalLinks = () => (
  <section className="py-10 bg-slate-50">
    <div className="max-w-4xl mx-auto px-4">
      <h3 className="font-bold text-gray-900 mb-4 text-center text-sm">Explora ManoProtect</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/sentinel-x', label: 'Sentinel X - Adultos' },
          { to: '/sentinel-j', label: 'Sentinel J - Niños' },
          { to: '/sentinel-s', label: 'Sentinel S - Mayores' },
          { to: '/testimonios', label: 'Opiniones reales' },
          { to: '/faq', label: 'Preguntas frecuentes' },
          { to: '/blog', label: 'Blog de seguridad' },
          { to: '/reloj-gps-mayores', label: 'Reloj GPS mayores' },
          { to: '/proteccion-fraude-online', label: 'Proteger del fraude' },
        ].map((link, i) => (
          <Link key={i} to={link.to} className="text-xs text-blue-600 hover:text-blue-800 underline">{link.label}</Link>
        ))}
      </div>
    </div>
  </section>
);

/* ═════════════ RELOJ SOS ANCIANOS ═════════════ */
export const RelojSosAncianos = () => (
  <div className="min-h-screen bg-white" data-testid="seo-reloj-sos-ancianos">
    <Helmet>
      <title>Reloj SOS para Ancianos con GPS | ManoProtect Sentinel S</title>
      <meta name="description" content="Reloj SOS para personas mayores con GPS en tiempo real, botón de emergencia, detector de caídas y sirena de 120dB. Protección 24h para ancianos en España." />
      <link rel="canonical" href="https://manoprotectt.com/reloj-sos-ancianos" />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org", "@type": "Product", "name": "ManoProtect Sentinel S - Reloj SOS Ancianos",
        "description": "Reloj SOS con GPS para personas mayores. Botón de emergencia, detector de caídas, sirena 120dB.",
        "brand": {"@type": "Brand", "name": "ManoProtect"}, "offers": {"@type": "Offer", "priceCurrency": "EUR", "price": "0", "availability": "https://schema.org/InStock", "priceValidUntil": "2026-12-31"}
      })}</script>
    </Helmet>
    <SeoHeader />
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Reloj SOS para Ancianos con GPS en Tiempo Real</h1>
        <p className="text-lg text-gray-600 mb-6">El <strong>Sentinel S de ManoProtect</strong> es el reloj de emergencia más avanzado de España para personas mayores. Con <strong>botón SOS</strong>, <strong>GPS en tiempo real</strong>, <strong>detector de caídas</strong> y <strong>sirena de 120dB</strong>.</p>
        <div className="grid sm:grid-cols-2 gap-6 my-10">
          {[
            { icon: Phone, title: 'Botón SOS de emergencia', desc: 'Un solo toque para alertar a familiares y servicios de emergencia. Funciona 24 horas al día, 7 días a la semana.' },
            { icon: MapPin, title: 'GPS en tiempo real', desc: 'Localiza a tu familiar en cualquier momento desde tu móvil. Precisión de hasta 5 metros con 4G.' },
            { icon: Heart, title: 'Detector de caídas', desc: 'Detecta automáticamente caídas y envía alertas a los contactos de emergencia configurados.' },
            { icon: AlertTriangle, title: 'Sirena de 120dB', desc: 'Alarma sonora potente para disuadir agresores y llamar la atención en situaciones de peligro.' },
          ].map((f, i) => (
            <div key={i} className="flex gap-3 p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0"><f.icon className="w-5 h-5 text-emerald-600" /></div>
              <div><h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3><p className="text-xs text-gray-500">{f.desc}</p></div>
            </div>
          ))}
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">¿Por qué elegir ManoProtect Sentinel S?</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Diseño en cerámica</strong> elegante, no parece un dispositivo médico</li>
            <li>• <strong>Sistema anti-retirada</strong> que alerta si el reloj se quita</li>
            <li>• <strong>Batería de larga duración</strong> hasta 72 horas</li>
            <li>• <strong>Resistente al agua</strong> IP67 - se puede usar en la ducha</li>
            <li>• <strong>Sin contratos</strong> - Desde 9,99€/mes, cancela cuando quieras</li>
          </ul>
        </div>
      </div>
    </section>
    <CtaBanner text="Protege a tus mayores con el Sentinel S" />
    <InternalLinks />
    <LandingFooter />
  </div>
);

/* ═════════════ RELOJ GPS MAYORES ═════════════ */
export const RelojGpsMayores = () => (
  <div className="min-h-screen bg-white" data-testid="seo-reloj-gps-mayores">
    <Helmet>
      <title>Reloj GPS para Mayores 2026 | Localización en Tiempo Real | ManoProtect</title>
      <meta name="description" content="Reloj con GPS para personas mayores en España. Localización en tiempo real, zonas seguras, alertas a familiares. Sentinel S desde 9,99€/mes." />
      <link rel="canonical" href="https://manoprotectt.com/reloj-gps-mayores" />
    </Helmet>
    <SeoHeader />
    <section className="py-16 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Reloj GPS para Personas Mayores – Localización en Tiempo Real</h1>
        <p className="text-lg text-gray-600 mb-8">Saber dónde están tus seres queridos en todo momento. El <strong>Sentinel S</strong> ofrece <strong>localización GPS precisa</strong>, <strong>zonas seguras configurables</strong> y <strong>alertas automáticas</strong> cuando tu familiar sale de zonas preestablecidas.</p>
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { title: 'GPS 4G Preciso', desc: 'Precisión de 5m con red 4G. Funciona en interiores y exteriores.' },
            { title: 'Zonas Seguras', desc: 'Configura zonas y recibe alerta si sale de ellas.' },
            { title: 'Historial de Rutas', desc: 'Consulta por dónde ha caminado durante el día.' },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">¿Cómo funciona el reloj GPS para mayores?</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 mb-8">
          <li><strong>Suscríbete</strong> a un plan ManoProtect (desde 9,99€/mes)</li>
          <li><strong>Recibe tu Sentinel S</strong> gratis en tu domicilio en 24-48h</li>
          <li><strong>Descarga la app</strong> en tu móvil y vincula el reloj</li>
          <li><strong>Localiza en tiempo real</strong> a tu familiar desde cualquier lugar</li>
        </ol>
      </div>
    </section>
    <CtaBanner text="Empieza a localizar a tus mayores hoy" />
    <InternalLinks />
    <LandingFooter />
  </div>
);

/* ═════════════ BOTON SOS SENIOR ═════════════ */
export const BotonSosSenior = () => (
  <div className="min-h-screen bg-white" data-testid="seo-boton-sos-senior">
    <Helmet>
      <title>Botón SOS para Personas Mayores | Emergencia 24h | ManoProtect</title>
      <meta name="description" content="Botón de emergencia SOS para personas mayores con alerta instantánea a familiares. GPS integrado, detector de caídas. Desde 9,99€/mes." />
      <link rel="canonical" href="https://manoprotectt.com/boton-sos-senior" />
    </Helmet>
    <SeoHeader />
    <section className="py-16 bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Botón SOS para Personas Mayores – Emergencia 24 Horas</h1>
        <p className="text-lg text-gray-600 mb-8">El <strong>botón SOS del Sentinel S</strong> permite a las personas mayores pedir ayuda con un solo toque. <strong>Alerta instantánea</strong> a hasta 5 contactos de emergencia con la ubicación GPS exacta.</p>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-red-800 mb-3">¿Cómo funciona el botón SOS?</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2"><span className="text-2xl font-bold text-red-600">1</span></div><p className="text-sm text-gray-700 font-semibold">Pulsa el botón</p><p className="text-xs text-gray-500">Un solo toque durante 3 segundos</p></div>
            <div className="text-center"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2"><span className="text-2xl font-bold text-red-600">2</span></div><p className="text-sm text-gray-700 font-semibold">Alerta enviada</p><p className="text-xs text-gray-500">SMS + notificación con ubicación GPS</p></div>
            <div className="text-center"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2"><span className="text-2xl font-bold text-red-600">3</span></div><p className="text-sm text-gray-700 font-semibold">Ayuda en camino</p><p className="text-xs text-gray-500">Familiares localizan y llegan rápido</p></div>
          </div>
        </div>
      </div>
    </section>
    <CtaBanner text="Dale tranquilidad a tu familia con el botón SOS" />
    <InternalLinks />
    <LandingFooter />
  </div>
);

/* ═════════════ PROTECCION PHISHING ═════════════ */
export const ProteccionPhishing = () => (
  <div className="min-h-screen bg-white" data-testid="seo-proteccion-phishing">
    <Helmet>
      <title>Protección contra Phishing y Estafas Online | ManoProtect</title>
      <meta name="description" content="Protege a tu familia del phishing, smishing y estafas digitales. ManoProtect: alertas en tiempo real, formación y dispositivos de seguridad." />
      <link rel="canonical" href="https://manoprotectt.com/proteccion-phishing" />
    </Helmet>
    <SeoHeader />
    <section className="py-16 bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Protección contra Phishing y Estafas Digitales</h1>
        <p className="text-lg text-gray-600 mb-8">En España, <strong>el 80% de los ciberataques</strong> empiezan con un email de phishing. ManoProtect protege a tu familia contra <strong>phishing, smishing (SMS), vishing (llamadas)</strong> y todo tipo de <strong>estafas digitales</strong>.</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {[
            { icon: Lock, title: 'Alertas anti-phishing', desc: 'Notificaciones cuando detectamos intentos de phishing dirigidos a tu familia.' },
            { icon: Wifi, title: 'Protección de red', desc: 'Monitorización de conexiones WiFi y alertas de redes inseguras.' },
            { icon: Shield, title: 'Formación de seguridad', desc: 'Guías y consejos para que toda la familia sepa identificar estafas.' },
            { icon: AlertTriangle, title: 'Alertas de fraude bancario', desc: 'Avisos sobre campañas de fraude activas en España.' },
          ].map((f, i) => (
            <div key={i} className="flex gap-3 p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0"><f.icon className="w-5 h-5 text-amber-600" /></div>
              <div><h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3><p className="text-xs text-gray-500">{f.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
    <CtaBanner text="Protege a tu familia del fraude digital" />
    <InternalLinks />
    <LandingFooter />
  </div>
);

/* ═════════════ PROTECCION FRAUDE ONLINE ═════════════ */
export const ProteccionFraudeOnline = () => (
  <div className="min-h-screen bg-white" data-testid="seo-proteccion-fraude">
    <Helmet>
      <title>Protección contra Fraude Online en España | ManoProtect 2026</title>
      <meta name="description" content="Protección completa contra fraude online para familias españolas. Alertas en tiempo real, monitorización 24h, formación anti-estafas. Desde 9,99€/mes." />
      <link rel="canonical" href="https://manoprotectt.com/proteccion-fraude-online" />
    </Helmet>
    <SeoHeader />
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Protección contra Fraude Online para Familias Españolas</h1>
        <p className="text-lg text-gray-600 mb-8">Las estafas online en España aumentaron un <strong>35% en 2025</strong>. ManoProtect ofrece protección integral: <strong>alertas de fraude</strong>, <strong>monitorización 24h</strong> y <strong>dispositivos de seguridad</strong> para toda la familia.</p>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Tipos de fraude que prevenimos</h2>
        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          {['Phishing por email', 'Smishing por SMS', 'Vishing por teléfono', 'Fraude bancario', 'Estafas en marketplace', 'Robo de identidad'].map((t, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-sm font-semibold text-gray-700">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
    <CtaBanner text="Protégete del fraude online desde 9,99€/mes" />
    <InternalLinks />
    <LandingFooter />
  </div>
);

/* ═════════════ SEGURIDAD DIGITAL FAMILIAR ═════════════ */
export const SeguridadDigitalFamiliar = () => (
  <div className="min-h-screen bg-white" data-testid="seo-seguridad-digital">
    <Helmet>
      <title>Seguridad Digital Familiar en España | ManoProtect 2026</title>
      <meta name="description" content="Plataforma de seguridad digital para familias españolas. GPS, SOS, anti-phishing, protección de menores y mayores. Todo en un plan desde 9,99€/mes." />
      <link rel="canonical" href="https://manoprotectt.com/seguridad-digital-familiar" />
    </Helmet>
    <SeoHeader />
    <section className="py-16 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Seguridad Digital Familiar: Protección Completa en 2026</h1>
        <p className="text-lg text-gray-600 mb-8">ManoProtect es la <strong>plataforma de seguridad digital líder en España</strong> diseñada específicamente para familias. Combinamos <strong>dispositivos físicos</strong> (relojes GPS Sentinel) con <strong>protección digital</strong> contra fraudes y estafas.</p>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">¿Qué incluye ManoProtect?</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Reloj GPS Sentinel para cada miembro', 'Localización en tiempo real 24/7',
              'Botón SOS con alerta a familiares', 'Detector de caídas automático',
              'Alertas anti-phishing y smishing', 'Zonas seguras configurables',
              'App móvil para toda la familia', 'Soporte técnico en español 24h',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2"><div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0"><ArrowRight className="w-3 h-3 text-emerald-600" /></div><p className="text-sm text-gray-700">{f}</p></div>
            ))}
          </div>
        </div>
      </div>
    </section>
    <CtaBanner text="Descubre la seguridad digital para familias" />
    <InternalLinks />
    <LandingFooter />
  </div>
);

/* ═════════════ SEGURIDAD MAYORES ═════════════ */
export const SeguridadMayores = () => (
  <div className="min-h-screen bg-white" data-testid="seo-seguridad-mayores">
    <Helmet>
      <title>Seguridad para Personas Mayores | GPS + SOS + Caídas | ManoProtect</title>
      <meta name="description" content="Sistema de seguridad para mayores: reloj GPS, botón SOS, detector de caídas, sirena 120dB. Protección 24h para ancianos. Desde 9,99€/mes en España." />
      <link rel="canonical" href="https://manoprotectt.com/seguridad-mayores" />
    </Helmet>
    <SeoHeader />
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Seguridad para Personas Mayores: GPS, SOS y Detector de Caídas</h1>
        <p className="text-lg text-gray-600 mb-8">ManoProtect ofrece la <strong>solución de seguridad más completa para personas mayores</strong> en España. Con el <strong>Sentinel S</strong>, tus seres queridos están protegidos las 24 horas del día con tecnología de última generación.</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-3">Para los mayores</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Botón SOS fácil de usar</li>
              <li>• Diseño elegante en cerámica</li>
              <li>• Resistente al agua</li>
              <li>• Batería de 72 horas</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-3">Para la familia</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Localización GPS en tiempo real</li>
              <li>• Alertas automáticas de caídas</li>
              <li>• Zonas seguras configurables</li>
              <li>• Historial de rutas</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
    <CtaBanner text="Protege a tus mayores desde 9,99€/mes" />
    <InternalLinks />
    <LandingFooter />
  </div>
);
