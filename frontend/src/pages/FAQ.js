/**
 * ManoProtect - FAQ Completa
 * Preguntas frecuentes optimizadas SEO + CTA
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ChevronDown, ArrowRight, Search } from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

const faqs = [
  {
    category: 'Funcionamiento',
    items: [
      { q: '¿Cómo funciona el seguimiento en segundo plano?', a: 'ManoProtect utiliza GPS optimizado que funciona incluso con la app cerrada y el móvil bloqueado. El reloj Sentinel envía la ubicación cada pocos segundos al servidor seguro. Los padres o familiares pueden consultar la ubicación en tiempo real desde la app. El consumo de batería es mínimo: menos del 3% al día.' },
      { q: '¿Qué pasa si la batería se agota?', a: 'Antes de agotarse, el reloj envía la última ubicación conocida y una alerta automática a todos los contactos configurados. La batería del Sentinel X dura 5 días, el Sentinel J 4 días y el Sentinel S 3 días con uso normal. La carga completa se realiza en aproximadamente 90 minutos.' },
      { q: '¿Cómo funcionan las alertas SOS?', a: 'Cuando se pulsa el botón SOS en el reloj, se envía una notificación instantánea a todos los contactos de emergencia configurados con la ubicación GPS exacta. En los modelos 4G, también se activa la grabación de audio y se puede realizar una llamada directa. Todo funciona en menos de 3 segundos.' },
      { q: '¿Funciona sin conexión a internet?', a: 'Los modelos con 4G (Sentinel X Fundadores/Premium y Sentinel S) funcionan de forma independiente sin necesidad de un móvil cerca. El Sentinel X Basic funciona vía Bluetooth y necesita el móvil dentro del alcance. El Sentinel J funciona con 4G LTE.' },
    ]
  },
  {
    category: 'Privacidad y seguridad',
    items: [
      { q: '¿Los datos son privados?', a: 'Sí. Todos los datos están cifrados con AES-256 de extremo a extremo. Cumplimos con RGPD (Reglamento General de Protección de Datos) de la UE. Solo tú y los contactos que autorices pueden ver las ubicaciones. No vendemos ni compartimos datos con terceros bajo ninguna circunstancia.' },
      { q: '¿Es legal rastrear a mi familiar?', a: 'Sí. Como padre o tutor legal de un menor, tienes derecho a supervisar su ubicación. Para adultos y mayores, siempre se requiere consentimiento explícito del usuario. ManoProtect incluye un sistema de consentimiento integrado.' },
      { q: '¿Pueden hackear los datos?', a: 'Utilizamos los mismos estándares de seguridad que los bancos: cifrado AES-256, SSL/TLS 1.3, servidores protegidos por Cloudflare WAF, y autenticación de dos factores. Los datos se almacenan en servidores europeos certificados ISO 27001.' },
    ]
  },
  {
    category: 'Compatibilidad',
    items: [
      { q: '¿Es compatible con iOS y Android?', a: 'Sí. La app ManoProtect funciona en iPhone (iOS 14 o superior) y Android (8.0 o superior). Los relojes Sentinel se conectan vía Bluetooth 5.0 o 4G LTE, según el modelo.' },
      { q: '¿Funciona fuera de España?', a: 'Sí. Los modelos con 4G funcionan en toda Europa con cobertura LTE. El GPS funciona en cualquier lugar del mundo. La app está disponible globalmente.' },
      { q: '¿Necesito una tarjeta SIM para el reloj?', a: 'Los modelos 4G (Sentinel X Fundadores/Premium, Sentinel J y Sentinel S) incluyen una eSIM preconfigurada. No necesitas comprar ni configurar ninguna tarjeta SIM adicional. El servicio de datos está incluido en tu suscripción.' },
    ]
  },
  {
    category: 'Compra y envío',
    items: [
      { q: '¿El dispositivo es realmente gratis?', a: 'Sí. Con tu suscripción, recibes el dispositivo Sentinel GRATIS. Solo pagas los gastos de envío (desde 4,95€). Es nuestra campaña de lanzamiento hasta el 30 de Marzo 2026.' },
      { q: '¿Cuánto tarda el envío?', a: 'El envío estándar en España peninsular tarda 24-48 horas laborables. Para Baleares y Canarias, 3-5 días. Envíos a Europa: 5-7 días laborables. Recibirás un número de seguimiento por email.' },
      { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí. Sin permanencia ni penalización. Cancela tu suscripción desde la app cuando quieras. Si no te convence en los primeros 7 días, te devolvemos el 100% del dinero sin preguntas.' },
      { q: '¿Qué incluye la suscripción?', a: 'La suscripción incluye: localización GPS en tiempo real, alertas SOS ilimitadas, zonas seguras, historial de ubicaciones, notificaciones push, soporte 24/7 y todas las actualizaciones de la app. Plan mensual: 9,99€/mes. Plan anual: 99,99€/año (ahorra 20€).' },
    ]
  },
];

const FAQ = () => {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggle = (key) => setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));

  const filteredFaqs = searchTerm
    ? faqs.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
          item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(cat => cat.items.length > 0)
    : faqs;

  const schemaFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.flatMap(cat => cat.items.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    })))
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Preguntas Frecuentes | ManoProtect – Sentinel X, J y S</title>
        <meta name="description" content="Encuentra respuestas a las preguntas más frecuentes sobre ManoProtect, los relojes Sentinel X, J y S, seguimiento GPS, privacidad, envíos y suscripciones." />
        <link rel="canonical" href="https://manoprotectt.com/faq" />
        <script type="application/ld+json">{JSON.stringify(schemaFAQ)}</script>
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <span className="text-emerald-600 text-lg font-bold">ManoProtect</span>
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-emerald-600">Volver al inicio</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3" data-testid="faq-title">Preguntas frecuentes</h1>
          <p className="text-gray-500 mb-6">Todo lo que necesitas saber sobre ManoProtect y los relojes Sentinel.</p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar pregunta..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              data-testid="faq-search"
            />
          </div>
        </div>

        {filteredFaqs.map((cat, ci) => (
          <div key={ci} className="mb-8" data-testid={`faq-category-${ci}`}>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
              {cat.category}
            </h2>
            <div className="space-y-0 divide-y divide-gray-200 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
              {cat.items.map((faq, i) => {
                const key = `${ci}-${i}`;
                return (
                  <div key={key}>
                    <button onClick={() => toggle(key)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-100 transition-colors" data-testid={`faq-item-${ci}-${i}`}>
                      <span className="font-medium text-gray-900 text-[15px] pr-4">{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openItems[key] ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openItems[key] ? 'max-h-60 pb-5 px-5' : 'max-h-0'}`}>
                      <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div className="text-center mt-12 bg-emerald-50 border border-emerald-200 rounded-2xl p-8" data-testid="faq-cta">
          <h3 className="text-xl font-bold text-gray-900 mb-2">¿No encuentras tu respuesta?</h3>
          <p className="text-gray-500 mb-6">Nuestro equipo está disponible 24/7 para ayudarte.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => navigate('/registro')} className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors" data-testid="faq-cta-trial">
              Probar 7 días gratis <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/contacto" className="inline-flex items-center gap-2 border-2 border-emerald-500 text-emerald-600 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors" data-testid="faq-cta-contact">
              Contactar soporte
            </Link>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
};

export default FAQ;
