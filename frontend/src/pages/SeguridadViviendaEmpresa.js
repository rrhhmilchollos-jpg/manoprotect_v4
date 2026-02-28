/**
 * ManoProtect - Seguridad para Viviendas y Empresas
 * Kits de alarmas profesionales con componentes reales
 * Galeria de productos: camaras, sensores, sirenas, centralitas, mandos, relojes Sentinel
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LandingFooter from '@/components/landing/LandingFooter';
import {
  Shield, Home, Building2, Camera, Wifi, Bell, Lock, Phone,
  Check, ArrowRight, MapPin, Eye, Zap, Radio, Smartphone,
  AlertTriangle, Clock, Star, Users, Package, ChevronDown,
  Play, Fingerprint, ThermometerSun, Droplets, Volume2, Watch
} from 'lucide-react';

/* ─── IMAGE CONSTANTS ─── */
const IMG = {
  heroHome: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/bace5a48fec7754b30baaf8fee91a08ff142242d88b8cdb5fb26f449d5fae055.png',
  componentsGrid: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/0dc5530d2d122b3fceaa54f05d036a86f9ce9a11bc0fef1b1916d3847b066dc8.png',
  camera4k: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/8a6899331a0b3e75e77e08787983a097a23c215b55cc150a3cecb45c6af975bc.png',
  sentinelWatch: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/7a282e42d9edfe3137fe6fd41329b2d34711dfa503f2395b7bd399d6e13437e8.png',
  outdoorSiren: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/d0e8c61e97d2c4bd6e456307c59cd83f1a0e1dd7167d51a5a3f75d725d913df0.png',
  controlPanel: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/72857182df814237ec3f71996472c4b706658084f7b96563893f7a9a5b5c7b03.png',
  businessSecurity: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/ba2cdad7c989583f708e7e41ba04ebc36b3c7a80ac18961478d486f0584564cf.png',
  sentinelTrio: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/16e97d0972346860b882ddea3662703ffc3438f28eae4e99da63bf51db6b6e60.png',
  stockCamera: 'https://images.unsplash.com/photo-1578096241494-6cc439ab21ad?w=800&q=80',
  stockKeypad: 'https://images.unsplash.com/photo-1697382608786-bcf4c113b86e?w=800&q=80',
  stockDoorSensor: 'https://images.unsplash.com/photo-1637241613318-646f2c2a854a?w=600&q=80',
};

/* ─── PRODUCT COMPONENTS ─── */
const COMPONENTS = [
  {
    name: 'Centralita Hub',
    desc: 'Panel de control con pantalla tactil, sirena 110dB integrada, conexion 4G+WiFi+Ethernet. Bateria de respaldo 24h.',
    img: IMG.controlPanel,
    icon: Radio,
  },
  {
    name: 'Camaras IP 4K',
    desc: 'Vision nocturna infrarroja, deteccion IA de personas, audio bidireccional. Grabacion en la nube.',
    img: IMG.camera4k,
    icon: Camera,
  },
  {
    name: 'Sirena Exterior',
    desc: 'Sirena disuasoria 120dB con flash LED estroboscopico. Resistente a lluvia y vandalismo (IP65).',
    img: IMG.outdoorSiren,
    icon: Volume2,
  },
  {
    name: 'Sensor de Movimiento PIR',
    desc: 'Detector volumetrico con tecnologia anti-mascotas (hasta 25kg). Cobertura 12m, 90 grados.',
    img: IMG.stockKeypad,
    icon: Eye,
  },
  {
    name: 'Contacto Magnetico',
    desc: 'Sensor para puertas y ventanas. Alerta inmediata al abrir. Ultra-fino, instalacion adhesiva.',
    img: IMG.stockDoorSensor,
    icon: Lock,
  },
  {
    name: 'Relojes Sentinel X/J/S',
    desc: 'GPS en tiempo real, boton SOS, E-SIM integrada. Conectado al mismo centro de control 24h.',
    img: IMG.sentinelTrio,
    icon: Watch,
  },
];

/* ─── ALARM KITS ─── */
const KITS = [
  {
    id: 'hogar-basico',
    name: 'Kit Hogar Basico',
    tagline: 'Proteccion esencial para tu vivienda',
    price: 0,
    monthly: 29.99,
    popular: false,
    icon: Home,
    color: 'blue',
    img: IMG.controlPanel,
    items: [
      { text: 'Panel de control tactil con sirena 110dB', bold: true },
      { text: '2 sensores de movimiento PIR' },
      { text: '2 contactos magneticos puerta/ventana' },
      { text: '1 mando a distancia' },
      { text: '1 teclado inalambrico' },
      { text: 'Conexion 4G + WiFi + Ethernet' },
      { text: 'App ManoProtect incluida' },
      { text: 'Centro de control 24h' },
    ],
  },
  {
    id: 'hogar-premium',
    name: 'Kit Hogar Premium',
    tagline: 'Maxima seguridad para tu familia',
    price: 0,
    monthly: 49.99,
    popular: true,
    icon: Shield,
    color: 'orange',
    img: IMG.heroHome,
    items: [
      { text: 'Panel de control tactil HD con sirena 120dB', bold: true },
      { text: '4 sensores de movimiento PIR anti-mascotas' },
      { text: '4 contactos magneticos puerta/ventana' },
      { text: '2 camaras IP Full HD con vision nocturna', bold: true },
      { text: '1 sensor de humo y CO2' },
      { text: '1 sensor de inundacion' },
      { text: '2 mandos a distancia' },
      { text: '1 teclado inalambrico con lector RFID' },
      { text: 'Sirena exterior disuasoria 120dB', bold: true },
      { text: 'Conexion 4G + WiFi + Ethernet' },
      { text: 'Grabacion en la nube 30 dias' },
      { text: 'Centro de control 24h + verificacion por video' },
      { text: 'Sentinel X de REGALO para un familiar', bold: true },
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
    img: IMG.businessSecurity,
    items: [
      { text: 'Panel de control empresarial con pantalla 10"', bold: true },
      { text: '8 sensores de movimiento volumetricos' },
      { text: '6 contactos magneticos puertas/ventanas' },
      { text: '4 camaras IP 4K con IA (deteccion personas)', bold: true },
      { text: '2 camaras PTZ exteriores 360 grados' },
      { text: 'Sensor de humo, CO2 y gas' },
      { text: 'Control de acceso por huella + tarjeta RFID', bold: true },
      { text: 'Sirena interior 120dB + exterior 130dB' },
      { text: 'Videoportero IP con reconocimiento facial' },
      { text: 'Conexion 4G + WiFi + Ethernet redundante' },
      { text: 'Grabacion en la nube 90 dias' },
      { text: 'Centro de control 24h + acuda + policia' },
      { text: 'Mantenimiento preventivo trimestral' },
      { text: '2 Sentinel X para propietarios', bold: true },
    ],
  },
];

const FEATURES = [
  { icon: Radio, title: 'Centro de Control 24h', desc: 'Operadores profesionales monitorizan tu alarma las 24 horas. Respuesta inmediata ante cualquier incidencia.' },
  { icon: Camera, title: 'Verificacion por Video', desc: 'Camaras HD con IA que verifican la intrusion en tiempo real. Sin falsas alarmas. Conexion directa con policia.' },
  { icon: Zap, title: 'Respuesta Inmediata', desc: 'Si se confirma la intrusion, avisamos a policia, bomberos o ambulancia en menos de 60 segundos.' },
  { icon: Smartphone, title: 'App ManoProtect', desc: 'Controla tu alarma desde el movil. Arma/desarma, ve camaras en directo, recibe alertas push.' },
  { icon: Wifi, title: 'Anti-inhibicion', desc: 'Nuestros sistemas detectan inhibidores de frecuencia y activan alerta inmediata. Triple conexion: 4G + WiFi + Ethernet.' },
  { icon: Lock, title: 'Grado 2 Certificado', desc: 'Todos nuestros kits cumplen normativa europea EN 50131 Grado 2. Homologados por la DGP.' },
];

/* ─── COMPARISON TABLE ─── */
const COMPARISON_ROWS = [
  { feature: 'Centralita/Hub inteligente', basico: true, premium: true, empresa: true },
  { feature: 'Sensores de movimiento PIR', basico: '2', premium: '4 (anti-mascotas)', empresa: '8 volumetricos' },
  { feature: 'Contactos magneticos', basico: '2', premium: '4', empresa: '6' },
  { feature: 'Camaras IP HD/4K', basico: false, premium: '2 Full HD', empresa: '4 x 4K + 2 PTZ 360' },
  { feature: 'Sirena exterior', basico: false, premium: '120dB', empresa: '130dB + interior' },
  { feature: 'Sensor humo/CO2/gas', basico: false, premium: 'Humo + CO2', empresa: 'Humo + CO2 + Gas' },
  { feature: 'Sensor inundacion', basico: false, premium: true, empresa: true },
  { feature: 'Control acceso biometrico', basico: false, premium: 'RFID', empresa: 'Huella + RFID' },
  { feature: 'Videoportero IP', basico: false, premium: false, empresa: 'Reconocimiento facial' },
  { feature: 'Grabacion nube', basico: false, premium: '30 dias', empresa: '90 dias' },
  { feature: 'Verificacion por video', basico: false, premium: true, empresa: true },
  { feature: 'Sentinel X de regalo', basico: false, premium: '1 unidad', empresa: '2 unidades' },
  { feature: 'Mantenimiento preventivo', basico: false, premium: false, empresa: 'Trimestral' },
  { feature: 'Centro de control 24h', basico: true, premium: true, empresa: true },
  { feature: 'App ManoProtect', basico: true, premium: true, empresa: true },
  { feature: 'Anti-inhibicion', basico: true, premium: true, empresa: true },
];

const ComparisonCell = ({ value }) => {
  if (value === true) return <Check className="w-4 h-4 text-emerald-500 mx-auto" />;
  if (value === false) return <span className="text-gray-300">—</span>;
  return <span className="text-xs font-medium text-gray-700">{value}</span>;
};

const SeguridadViviendaEmpresa = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('todos');

  const faqItems = [
    { q: 'Necesito obra para instalar la alarma?', a: 'No. Nuestros sistemas son 100% inalambricos. La instalacion profesional se realiza en menos de 2 horas sin obras ni cables.' },
    { q: 'Que pasa si se va la luz o internet?', a: 'El panel tiene bateria de respaldo de 24h y conexion 4G independiente. Funciona aunque se corte la luz y el WiFi.' },
    { q: 'Puedo ver las camaras desde el movil?', a: 'Si. Con la app ManoProtect puedes ver las camaras en directo, revisar grabaciones y recibir clips de alerta desde cualquier lugar del mundo.' },
    { q: 'Hay permanencia?', a: 'No hay permanencia. Puedes cancelar cuando quieras. El equipo se instala gratis con tu suscripcion mensual.' },
    { q: 'Como funciona el centro de control?', a: 'Operadores formados reciben las senales de tu alarma 24/7. Ante una alerta, verifican por video y actuan: avisan a policia, bomberos o envian servicio de acuda.' },
    { q: 'Es compatible con el boton SOS de ManoProtect?', a: 'Si. Tu Sentinel (X, J o S) se conecta con el mismo centro de control. Si pulsas el SOS desde el reloj, se activa la misma cadena de respuesta inmediata.' },
    { q: 'Que diferencia hay con Securitas Direct?', a: 'Ofrecemos la misma monitorizacion profesional 24h pero sin permanencia, con equipo mas avanzado (anti-inhibicion, camaras 4K, IA) y la integracion unica con los relojes Sentinel SOS.' },
    { q: 'Cubren toda Espana?', a: 'Si. Servicio de instalacion y centro de control disponible en toda la peninsula, Baleares y Canarias.' },
  ];

  const filteredComponents = activeTab === 'todos' ? COMPONENTS : COMPONENTS.filter((c) => {
    if (activeTab === 'camaras') return c.name.toLowerCase().includes('camara');
    if (activeTab === 'sensores') return c.name.toLowerCase().includes('sensor') || c.name.toLowerCase().includes('contacto') || c.name.toLowerCase().includes('movimiento');
    if (activeTab === 'control') return c.name.toLowerCase().includes('central') || c.name.toLowerCase().includes('sirena');
    if (activeTab === 'sentinel') return c.name.toLowerCase().includes('sentinel');
    return true;
  });

  return (
    <div className="min-h-screen bg-white" data-testid="seguridad-vivienda-empresa">
      <Helmet>
        <title>Alarmas para Viviendas y Empresas | ManoProtect - Centro de Control 24h</title>
        <meta name="description" content="Kits de alarma para hogar y empresa con centro de control 24h. Camaras 4K, sensores inteligentes, anti-inhibicion, relojes Sentinel SOS. Instalacion gratuita. Desde 29,99 euros/mes." />
        <link rel="canonical" href="https://manoprotect.com/seguridad-hogar-empresa" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org", "@type": "Product", "name": "ManoProtect Alarmas Hogar y Empresa",
          "description": "Sistemas de alarma profesionales con camaras 4K, sensores, sirenas y relojes Sentinel SOS.",
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
            <Link to="/servicios-sos" className="text-gray-600 hover:text-blue-700">Boton SOS</Link>
            <Link to="/plans" className="text-gray-600 hover:text-blue-700">Precios</Link>
            <Link to="/contacto" className="bg-blue-700 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-800 transition-colors">Contacto</Link>
          </nav>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.heroHome} alt="Sistema de alarma ManoProtect instalado en hogar" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-4 py-1.5 rounded-full mb-6">
              <Shield className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-orange-300 tracking-wide">CENTRO DE CONTROL 24H + SENTINEL SOS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight" data-testid="hero-title">
              Alarmas profesionales para <span className="text-orange-400">viviendas y empresas</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed">
              Kits completos con camaras 4K, sensores inteligentes, sirenas y centro de control 24h. 
              Incluye integracion con relojes <strong className="text-white">Sentinel X, J y S</strong>. 
              Instalacion <strong className="text-orange-400">GRATIS</strong>. Sin permanencia.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#kits" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all hover:scale-105 flex items-center gap-2" data-testid="ver-kits-btn">
                Ver kits de alarma <ArrowRight className="w-4 h-4" />
              </a>
              <Link to="/contacto" className="bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-full font-bold text-sm transition-colors border border-white/20 backdrop-blur-sm">
                Solicitar presupuesto
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6">
              {[
                { icon: Radio, val: '24/7', label: 'Centro control' },
                { icon: Zap, val: '<60s', label: 'Respuesta' },
                { icon: Lock, val: 'Grado 2', label: 'Certificado UE' },
                { icon: Watch, val: 'Sentinel', label: 'SOS integrado' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">{s.val}</p>
                    <p className="text-slate-400 text-[10px]">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ COMPONENTS GALLERY ═══ */}
      <section className="py-16 bg-slate-50" data-testid="components-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Componentes de nuestros kits</h2>
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">Equipamiento profesional de ultima generacion. Camaras, sensores, sirenas, centralitas, mandos y los relojes Sentinel con boton SOS.</p>
          </div>

          {/* Full-width components image */}
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
            <img src={IMG.componentsGrid} alt="Componentes del kit de alarma ManoProtect: centralita, camaras, sensores, sirena, mando, detector de humo" className="w-full object-cover" data-testid="components-hero-img" />
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'camaras', label: 'Camaras' },
              { id: 'sensores', label: 'Sensores' },
              { id: 'control', label: 'Centralitas y Sirenas' },
              { id: 'sentinel', label: 'Relojes Sentinel' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-blue-700 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                data-testid={`tab-${tab.id}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Component cards grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredComponents.map((comp, i) => (
              <div key={i} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300" data-testid={`component-card-${i}`}>
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  <img src={comp.img} alt={comp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <comp.icon className="w-4 h-4 text-blue-700" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">{comp.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{comp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">Seguridad de nivel profesional</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-5 hover:shadow-md transition-shadow border border-transparent hover:border-blue-100" data-testid={`feature-${i}`}>
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

      {/* ═══ KITS ═══ */}
      <section id="kits" className="py-16 bg-slate-50" data-testid="kits-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Elige tu kit de alarma</h2>
            <p className="text-gray-500 text-sm">Equipo GRATIS + instalacion profesional incluida. Sin permanencia. Cancela cuando quieras.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {KITS.map((kit) => {
              const colors = {
                blue: { bg: 'bg-blue-100', text: 'text-blue-700', btn: 'bg-blue-700 hover:bg-blue-800', check: 'text-blue-600' },
                orange: { bg: 'bg-orange-100', text: 'text-orange-600', btn: 'bg-orange-500 hover:bg-orange-600', check: 'text-orange-500' },
                emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700', check: 'text-emerald-500' },
              }[kit.color];
              return (
                <div key={kit.id} className={`bg-white rounded-2xl border-2 ${kit.popular ? 'border-orange-400 shadow-xl shadow-orange-100/50' : 'border-gray-200 hover:border-gray-300'} overflow-hidden relative transition-all hover:shadow-lg`} data-testid={`kit-${kit.id}`}>
                  {kit.popular && (
                    <div className="bg-orange-500 text-white text-center py-1.5 text-xs font-bold tracking-wide">MAS POPULAR - RECOMENDADO</div>
                  )}
                  {/* Kit image */}
                  <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                    <img src={kit.img} alt={kit.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-6">
                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-3`}>
                      <kit.icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{kit.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{kit.tagline}</p>
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">{kit.monthly}EUR</span>
                        <span className="text-gray-500 text-sm">/mes</span>
                      </div>
                      <p className="text-xs text-emerald-600 font-semibold mt-1">Equipo e instalacion GRATIS</p>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {kit.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                          <Check className={`w-3.5 h-3.5 ${colors.check} flex-shrink-0 mt-0.5`} />
                          <span className={item.bold ? 'font-semibold text-gray-800' : ''}>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => navigate('/contacto')}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all text-white ${colors.btn} hover:shadow-md`}
                      data-testid={`cta-${kit.id}`}>
                      Solicitar instalacion gratis
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON TABLE ═══ */}
      <section className="py-16 bg-white" data-testid="comparison-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">Comparativa de kits</h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200">
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wide w-1/3">Caracteristica</th>
                  <th className="text-center p-4 text-xs font-bold text-blue-700 uppercase tracking-wide">Hogar Basico<br/><span className="text-gray-500 font-normal">29,99EUR/mes</span></th>
                  <th className="text-center p-4 text-xs font-bold text-orange-600 uppercase tracking-wide bg-orange-50/50">Hogar Premium<br/><span className="text-gray-500 font-normal">49,99EUR/mes</span></th>
                  <th className="text-center p-4 text-xs font-bold text-emerald-700 uppercase tracking-wide">Empresa<br/><span className="text-gray-500 font-normal">89,99EUR/mes</span></th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="p-3 text-xs font-medium text-gray-700">{row.feature}</td>
                    <td className="p-3 text-center"><ComparisonCell value={row.basico} /></td>
                    <td className="p-3 text-center bg-orange-50/30"><ComparisonCell value={row.premium} /></td>
                    <td className="p-3 text-center"><ComparisonCell value={row.empresa} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">Como funciona</h2>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Elige tu kit', desc: 'Selecciona el pack ideal para tu vivienda o empresa. Te asesoramos gratis.', icon: Package },
              { step: '2', title: 'Instalacion gratis', desc: 'Un tecnico profesional instala todo en menos de 2 horas sin obras.', icon: Zap },
              { step: '3', title: 'Centro de control', desc: 'Tu alarma queda conectada a nuestro centro 24h con operadores reales.', icon: Radio },
              { step: '4', title: 'Proteccion total', desc: 'Controla todo desde la app. Tu Sentinel SOS tambien conectado.', icon: Shield },
            ].map((s, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 bg-blue-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
                  <s.icon className="w-7 h-7" />
                </div>
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto -mt-8 mb-2 text-xs font-bold border-2 border-white shadow-sm">{s.step}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SENTINEL SOS CONNECTION ═══ */}
      <section className="py-16 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded-full mb-4">
                <Watch className="w-3 h-3 text-orange-400" />
                <span className="text-[10px] font-bold text-orange-300 tracking-wider">EXCLUSIVO MANOPROTECT</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Conectado con tus relojes Sentinel X, J y S</h2>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Tu alarma de hogar o empresa se conecta con el mismo centro de control que tus relojes Sentinel. 
                Si pulsas el boton SOS desde cualquier lugar del mundo, nuestro equipo responde al instante.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  'GPS en tiempo real desde el reloj',
                  'Boton SOS conectado al centro de control 24h',
                  'E-SIM integrada: funciona sin movil',
                  'Sensor cardiaco y alerta de caida',
                  'Funciona en segundo plano',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="text-sm text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/productos" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-xs font-bold transition-colors flex items-center gap-2" data-testid="ver-sentinel-btn">
                  Ver relojes Sentinel <ArrowRight className="w-3 h-3" />
                </Link>
                <Link to="/servicios-sos" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full text-xs font-bold transition-colors border border-white/20">
                  Mas sobre SOS
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <img src={IMG.sentinelTrio} alt="Relojes Sentinel X, J y S con boton SOS" className="rounded-2xl shadow-2xl max-w-md w-full" data-testid="sentinel-trio-img" />
                <div className="absolute -bottom-4 -right-4 bg-orange-500 text-white px-4 py-2 rounded-xl shadow-lg">
                  <p className="text-xs font-bold">Incluido con Kit Premium</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SENTINEL WATCH + ALARM COMBO ═══ */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="order-2 lg:order-1">
              <img src={IMG.sentinelWatch} alt="Reloj Sentinel mostrando estado de alarma del hogar y boton SOS" className="rounded-2xl shadow-xl max-w-sm w-full mx-auto" data-testid="sentinel-watch-img" />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Controla tu alarma desde la muneca</h2>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Con el reloj Sentinel, puedes armar y desarmar tu sistema de alarma, ver el estado en tiempo real 
                y activar el boton SOS de emergencia, todo desde tu muneca. Incluso con el movil apagado.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, text: 'Armar/Desarmar alarma' },
                  { icon: Camera, text: 'Ver camaras en directo' },
                  { icon: Bell, text: 'Alertas en tiempo real' },
                  { icon: MapPin, text: 'GPS familiar' },
                  { icon: AlertTriangle, text: 'SOS emergencia' },
                  { icon: Smartphone, text: 'Sin necesidad de movil' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
                    <f.icon className="w-4 h-4 text-blue-700 flex-shrink-0" />
                    <span className="text-xs text-gray-700 font-medium">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BUSINESS SECURITY ═══ */}
      <section className="py-16 bg-slate-50" data-testid="business-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 px-3 py-1 rounded-full mb-4">
                <Building2 className="w-3 h-3 text-emerald-700" />
                <span className="text-[10px] font-bold text-emerald-700 tracking-wider">SEGURIDAD EMPRESARIAL</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Proteccion integral para tu negocio</h2>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Camaras PTZ 360 grados con IA, control de acceso biometrico, videoportero con reconocimiento facial,
                sistema anti-inhibicion y centro de control con servicio de acuda. Todo lo que necesita tu empresa.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  'Camaras 4K con deteccion inteligente de personas',
                  'Camaras PTZ 360 grados con vision nocturna',
                  'Control de acceso por huella dactilar + RFID',
                  'Videoportero IP con reconocimiento facial',
                  'Deteccion de humo, CO2 y fugas de gas',
                  'Grabacion en la nube 90 dias',
                  'Mantenimiento preventivo trimestral',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/contacto')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full text-sm font-bold transition-all hover:shadow-lg" data-testid="business-cta">
                Solicitar presupuesto empresa
              </button>
            </div>
            <div>
              <img src={IMG.businessSecurity} alt="Sistema de seguridad empresarial con camaras PTZ y control de acceso" className="rounded-2xl shadow-xl w-full" data-testid="business-img" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST BADGES ═══ */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { val: '+2.500', label: 'Hogares protegidos' },
              { val: '+800', label: 'Empresas securizadas' },
              { val: '<60s', label: 'Tiempo de respuesta' },
              { val: '4.8/5', label: 'Valoracion clientes' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl sm:text-3xl font-bold text-blue-700">{s.val}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Preguntas frecuentes</h2>
          <div className="space-y-2" data-testid="faq-section">
            {faqItems.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors">
                  <span className="font-semibold text-gray-900 text-sm pr-4">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="py-14 bg-gradient-to-r from-blue-800 to-blue-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">Protege tu hogar o negocio desde 29,99EUR/mes</h2>
          <p className="text-blue-200 mb-6 text-sm">Equipo e instalacion gratis. Sin permanencia. Centro de control 24h incluido. Relojes Sentinel SOS compatibles.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/contacto" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all hover:scale-105 shadow-lg" data-testid="cta-bottom">
              Solicitar presupuesto gratis
            </Link>
            <a href="tel:+34601510950" className="bg-white/15 hover:bg-white/25 text-white px-8 py-3.5 rounded-full font-bold text-sm transition-colors border border-white/20 flex items-center gap-2">
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
