/**
 * ManoProtect - Seguridad para Viviendas y Empresas
 * Kits de alarmas profesionales tipo Securitas Direct
 * Centro de Control 24h conectado con botón SOS
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LandingFooter from '@/components/landing/LandingFooter';
import {
  Shield, Home, Building2, Camera, Wifi, Bell, Lock, Phone,
  Check, ArrowRight, MapPin, Eye, Zap, Radio, Smartphone,
  AlertTriangle, Clock, Star, Users, Package, ChevronDown
} from 'lucide-react';

const KITS = [
  {
    id: 'hogar-basico',
    name: 'Kit Hogar Básico',
    tagline: 'Protección esencial para tu vivienda',
    price: 0,
    monthly: 29.99,
    popular: false,
    icon: Home,
    color: 'blue',
    items: [
      'Panel de control táctil con sirena 110dB',
      '2 sensores de movimiento PIR',
      '2 contactos magnéticos puerta/ventana',
      '1 mando a distancia',
      '1 teclado inalámbrico',
      'Conexión 4G + WiFi + Ethernet',
      'App ManoProtect incluida',
      'Centro de control 24h',
    ],
  },
  {
    id: 'hogar-premium',
    name: 'Kit Hogar Premium',
    tagline: 'Máxima seguridad para tu familia',
    price: 0,
    monthly: 49.99,
    popular: true,
    icon: Shield,
    color: 'orange',
    items: [
      'Panel de control táctil HD con sirena 120dB',
      '4 sensores de movimiento PIR anti-mascotas',
      '4 contactos magnéticos puerta/ventana',
      '2 cámaras IP Full HD con visión nocturna',
      '1 sensor de humo y CO2',
      '1 sensor de inundación',
      '2 mandos a distancia',
      '1 teclado inalámbrico con lector RFID',
      'Sirena exterior disuasoria 120dB',
      'Conexión 4G + WiFi + Ethernet',
      'Grabación en la nube 30 días',
      'Centro de control 24h + verificación por vídeo',
      'Sentinel X de regalo para un familiar',
    ],
  },
  {
    id: 'empresa',
    name: 'Kit Empresa',
    tagline: 'Seguridad profesional para negocios',
    price: 0,
    monthly: 89.99,
    popular: false,
    icon: Building2,
    color: 'emerald',
    items: [
      'Panel de control empresarial con pantalla 10"',
      '8 sensores de movimiento volumétricos',
      '6 contactos magnéticos puertas/ventanas',
      '4 cámaras IP 4K con IA (detección personas)',
      '2 cámaras PTZ exteriores 360°',
      'Sensor de humo, CO2 y gas',
      'Control de acceso por huella + tarjeta RFID',
      'Sirena interior 120dB + exterior 130dB',
      'Videoportero IP con reconocimiento facial',
      'Conexión 4G + WiFi + Ethernet redundante',
      'Grabación en la nube 90 días',
      'Centro de control 24h + acuda + policía',
      'Mantenimiento preventivo trimestral',
      '2 Sentinel X para propietarios',
    ],
  },
];

const FEATURES = [
  { icon: Radio, title: 'Centro de Control 24h', desc: 'Operadores profesionales monitorizan tu alarma las 24 horas del día, los 365 días del año. Respuesta inmediata ante cualquier incidencia.' },
  { icon: Camera, title: 'Verificación por Vídeo', desc: 'Cámaras HD con IA que verifican la intrusión en tiempo real. Sin falsas alarmas. Conexión directa con policía si se confirma.' },
  { icon: Zap, title: 'Respuesta Inmediata', desc: 'Si se confirma la intrusión, avisamos a policía, bomberos o ambulancia en menos de 60 segundos. Servicio de acuda disponible.' },
  { icon: Smartphone, title: 'App ManoProtect', desc: 'Controla tu alarma desde el móvil. Arma/desarma, ve cámaras en directo, recibe alertas y gestiona usuarios. Todo desde la app.' },
  { icon: Wifi, title: 'Anti-inhibición', desc: 'Nuestros sistemas detectan inhibidores de frecuencia y activan alerta inmediata. Triple conexión: 4G + WiFi + Ethernet.' },
  { icon: Lock, title: 'Grado 2 Certificado', desc: 'Todos nuestros kits cumplen normativa europea EN 50131 Grado 2. Homologados por la Dirección General de la Policía.' },
];

const SeguridadViviendaEmpresa = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const faqItems = [
    { q: '¿Necesito obra para instalar la alarma?', a: 'No. Nuestros sistemas son 100% inalámbricos. La instalación profesional se realiza en menos de 2 horas sin obras ni cables.' },
    { q: '¿Qué pasa si se va la luz o internet?', a: 'El panel tiene batería de respaldo de 24h y conexión 4G independiente. Funciona aunque se corte la luz y el WiFi.' },
    { q: '¿Puedo ver las cámaras desde el móvil?', a: 'Sí. Con la app ManoProtect puedes ver las cámaras en directo, revisar grabaciones y recibir clips de alerta desde cualquier lugar.' },
    { q: '¿Hay permanencia?', a: 'No hay permanencia. Puedes cancelar cuando quieras. El equipo se instala gratis con tu suscripción mensual.' },
    { q: '¿Cómo funciona el centro de control?', a: 'Operadores formados reciben las señales de tu alarma 24/7. Ante una alerta, verifican por vídeo y actúan: avisan a policía, bomberos o envían servicio de acuda.' },
    { q: '¿Es compatible con el botón SOS de ManoProtect?', a: 'Sí. Tu Sentinel (X, J o S) se conecta con el mismo centro de control. Si pulsas el SOS desde el reloj, se activa la misma cadena de respuesta.' },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="seguridad-vivienda-empresa">
      <Helmet>
        <title>Alarmas para Viviendas y Empresas | ManoProtect - Centro de Control 24h</title>
        <meta name="description" content="Kits de alarma para hogar y empresa con centro de control 24h. Cámaras HD, sensores inteligentes, anti-inhibición. Instalación gratuita. Desde 29,99€/mes." />
        <link rel="canonical" href="https://manoprotect.com/seguridad-hogar-empresa" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org", "@type": "Product", "name": "ManoProtect Alarmas Hogar y Empresa",
          "description": "Sistemas de alarma profesionales para viviendas y empresas con centro de control 24h.",
          "brand": { "@type": "Brand", "name": "ManoProtect" },
          "offers": { "@type": "AggregateOffer", "priceCurrency": "EUR", "lowPrice": "29.99", "highPrice": "89.99" }
        })}</script>
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <span className="text-blue-800 text-lg font-bold">ManoProtect</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link to="/productos" className="text-gray-600 hover:text-blue-700">Relojes Sentinel</Link>
            <Link to="/servicios-sos" className="text-gray-600 hover:text-blue-700">Botón SOS</Link>
            <Link to="/plans" className="text-gray-600 hover:text-blue-700">Precios</Link>
            <Link to="/contacto" className="text-blue-700 font-semibold">Contacto</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-4 py-1.5 rounded-full mb-6">
            <Shield className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-orange-300">CENTRO DE CONTROL 24H CONECTADO CON TU BOTÓN SOS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4" data-testid="hero-title">
            Seguridad profesional para<br /><span className="text-orange-400">viviendas y empresas</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">Kits de alarma con cámaras HD, sensores inteligentes y centro de control 24h. Instalación <strong className="text-white">GRATIS</strong>. Sin permanencia.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#kits" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-full font-bold text-sm transition-colors flex items-center gap-2" data-testid="ver-kits-btn">
              Ver kits de alarma <ArrowRight className="w-4 h-4" />
            </a>
            <Link to="/contacto" className="bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-full font-bold text-sm transition-colors border border-white/20">
              Solicitar presupuesto
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Radio, label: 'Centro 24h', desc: 'Operadores reales' },
              { icon: Camera, label: 'Verificación vídeo', desc: 'Sin falsas alarmas' },
              { icon: Zap, label: 'Respuesta <60s', desc: 'Policía + acuda' },
              { icon: Lock, label: 'Grado 2', desc: 'Certificado UE' },
            ].map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <f.icon className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <p className="text-white text-xs font-bold">{f.label}</p>
                <p className="text-slate-400 text-[10px]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">Seguridad de nivel profesional</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-5 hover:shadow-md transition-shadow" data-testid={`feature-${i}`}>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kits */}
      <section id="kits" className="py-16 bg-slate-50" data-testid="kits-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Elige tu kit de alarma</h2>
            <p className="text-gray-500 text-sm">Equipo GRATIS + instalación profesional incluida. Sin permanencia.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {KITS.map((kit) => (
              <div key={kit.id} className={`bg-white rounded-2xl border-2 ${kit.popular ? 'border-orange-400 shadow-xl shadow-orange-100' : 'border-gray-200'} overflow-hidden relative`} data-testid={`kit-${kit.id}`}>
                {kit.popular && (
                  <div className="bg-orange-500 text-white text-center py-1.5 text-xs font-bold">MÁS POPULAR</div>
                )}
                <div className="p-6">
                  <div className={`w-12 h-12 ${kit.color === 'orange' ? 'bg-orange-100' : kit.color === 'emerald' ? 'bg-emerald-100' : 'bg-blue-100'} rounded-xl flex items-center justify-center mb-3`}>
                    <kit.icon className={`w-6 h-6 ${kit.color === 'orange' ? 'text-orange-600' : kit.color === 'emerald' ? 'text-emerald-600' : 'text-blue-700'}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{kit.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{kit.tagline}</p>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">{kit.monthly}€</span>
                      <span className="text-gray-500 text-sm">/mes</span>
                    </div>
                    <p className="text-xs text-emerald-600 font-semibold mt-1">Equipo e instalación GRATIS</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {kit.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <Check className={`w-3.5 h-3.5 ${kit.color === 'orange' ? 'text-orange-500' : kit.color === 'emerald' ? 'text-emerald-500' : 'text-blue-600'} flex-shrink-0 mt-0.5`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => navigate('/contacto')}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${kit.popular ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-gray-900'}`}
                    data-testid={`cta-${kit.id}`}>
                    Solicitar instalación gratis
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">¿Cómo funciona?</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Elige tu kit', desc: 'Selecciona el pack ideal para tu vivienda o empresa.' },
              { step: '2', title: 'Instalación gratis', desc: 'Un técnico profesional instala todo en menos de 2 horas.' },
              { step: '3', title: 'Centro de control', desc: 'Tu alarma queda conectada a nuestro centro 24h.' },
              { step: '4', title: 'Protección total', desc: 'Controla todo desde la app y vive tranquilo.' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">{s.step}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connection with SOS */}
      <section className="py-16 bg-gradient-to-b from-blue-900 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Conectado con tu Sentinel y botón SOS</h2>
          <p className="text-slate-300 text-sm mb-8 max-w-2xl mx-auto">Tu alarma de hogar o empresa se conecta con el mismo centro de control que tu reloj Sentinel. Si pulsas el botón SOS desde cualquier lugar, nuestro equipo responde al instante.</p>
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-3"><Home className="w-5 h-5 text-orange-400" /></div>
              <h3 className="font-bold text-sm mb-1">Alarma Hogar</h3>
              <p className="text-slate-400 text-xs">Protección 24h con sensores, cámaras y sirena</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3"><Smartphone className="w-5 h-5 text-blue-400" /></div>
              <h3 className="font-bold text-sm mb-1">Sentinel SOS</h3>
              <p className="text-slate-400 text-xs">Botón SOS en tu muñeca conectado al centro</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3"><Radio className="w-5 h-5 text-emerald-400" /></div>
              <h3 className="font-bold text-sm mb-1">Centro Control</h3>
              <p className="text-slate-400 text-xs">Operadores 24h que activan policía y acuda</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Preguntas frecuentes</h2>
          <div className="space-y-2" data-testid="faq-section">
            {faqItems.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50">
                  <span className="font-semibold text-gray-900 text-sm">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-4 pb-4 text-sm text-gray-600">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-orange-500 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">Protege tu hogar o negocio desde 29,99€/mes</h2>
          <p className="text-orange-100 mb-6 text-sm">Equipo e instalación gratis. Sin permanencia. Centro de control 24h incluido.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/contacto" className="bg-white text-orange-600 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-orange-50 transition-colors" data-testid="cta-bottom">
              Solicitar presupuesto gratis
            </Link>
            <a href="tel:+34601510950" className="bg-white/20 hover:bg-white/30 text-white px-8 py-3.5 rounded-full font-bold text-sm transition-colors border border-white/30 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Llamar ahora
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default SeguridadViviendaEmpresa;
