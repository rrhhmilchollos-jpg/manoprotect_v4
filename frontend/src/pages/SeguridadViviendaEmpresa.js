/**
 * ManoProtect - Alarmas Premium para Viviendas y Empresas
 * Landing principal: 3 kits top del mercado 2026
 * Supera a Securitas Direct, Prosegur y Ajax
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LandingFooter from '@/components/landing/LandingFooter';
import {
  Shield, Home, Building2, Camera, Wifi, Bell, Lock, Phone,
  Check, ArrowRight, MapPin, Eye, Zap, Radio, Smartphone,
  AlertTriangle, Clock, Star, Users, Package, ChevronDown,
  Fingerprint, Volume2, Watch, X, Sparkles, Award, Globe
} from 'lucide-react';

const IMG = {
  villaHero: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/e164cb2cf3f4f9c1c618577b32e96516dbba057689cb6c8e981cb8b78626d495.png',
  premiumKit: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/13a8f09b29ff0fec2ceadd8b852434aa2c738e869179e58e98faadeb177de21f.png',
  remotesTrio: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/f4721d2b816f8bb98503fc2adb37dfca8c7517e980a3faba23bd4a409699ce8d.png',
  businessLobby: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/849e086aebf89bbc87613eecc7dd2e68ad9829e7f3df9e73c316cb6968ad6176.png',
  apartment: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/3491f38335afcb9caf468ea266417ef144e075a365d6a5fe69e676315b6942b6.png',
  outdoorSiren: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/02324e10765dca960e91cd4c4dbacf1a487b245ad51052895887387edf5dd09f.png',
  warehouse: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/d5b3ee6bbfe8654c951190925530016926f3d28ff3b43f8772f9590a60b21930.png',
  comparison: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/df3749a5b94fa5a243e0e7b37d5619d377ad93fae43f8f5611c834cf2615ce8f.png',
  sentinelTrio: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/16e97d0972346860b882ddea3662703ffc3438f28eae4e99da63bf51db6b6e60.png',
  sentinelWatch: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/7a282e42d9edfe3137fe6fd41329b2d34711dfa503f2395b7bd399d6e13437e8.png',
  camera4k: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/8a6899331a0b3e75e77e08787983a097a23c215b55cc150a3cecb45c6af975bc.png',
  controlPanel: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/72857182df814237ec3f71996472c4b706658084f7b96563893f7a9a5b5c7b03.png',
};

const KITS = [
  {
    id: 'essential',
    name: 'ManoProtect Essential',
    badge: 'MEJOR PRECIO',
    subtitle: 'Pisos y apartamentos',
    monthly: 34.99,
    promoMonthly: 24.99,
    promoLabel: '6 primeros meses',
    color: 'sky',
    gradient: 'from-sky-600 to-blue-700',
    img: IMG.apartment,
    popular: false,
    link: '/alarmas/vivienda',
    equipment: [
      'Hub inteligente con pantalla tactil 7"',
      '2 camaras IP Full HD vision nocturna',
      '3 sensores movimiento PIR anti-mascotas',
      '2 contactos magneticos puerta/ventana',
      '1 sirena exterior 110dB con flash LED',
      '1 mando premium con LED azul',
      '1 detector de humo inteligente',
      'Conexion 4G + WiFi + Ethernet',
    ],
    services: [
      'Centro de control 24h (CRA)',
      'Verificacion por video con IA',
      'App ManoProtect (arma/desarma/camaras)',
      'Anti-inhibicion multi-frecuencia',
      'Aviso a policia y bomberos',
      'Sentinel X de REGALO',
    ],
  },
  {
    id: 'premium',
    name: 'ManoProtect Premium',
    badge: 'MAS VENDIDO',
    subtitle: 'Chalets, adosados y casas',
    monthly: 49.99,
    promoMonthly: 39.99,
    promoLabel: '6 primeros meses',
    color: 'orange',
    gradient: 'from-orange-500 to-red-600',
    img: IMG.villaHero,
    popular: true,
    link: '/alarmas/vivienda',
    equipment: [
      'Hub Pro con pantalla tactil 10" HD',
      '4 camaras IP 2K con vision nocturna e IA',
      '2 camaras PTZ exterior 360 grados',
      '6 sensores movimiento PIR anti-mascotas',
      '4 contactos magneticos puerta/ventana',
      '2 sirenas: exterior 120dB + interior',
      '2 mandos premium (negro + dorado)',
      'Teclado RFID con codigo + tarjeta',
      'Detector humo + CO2 + inundacion',
      'Conexion 4G dual SIM + WiFi + Ethernet',
    ],
    services: [
      'Centro de control 24h (CRA) Premium',
      'Verificacion por video con IA avanzada',
      'Servicio de Acuda (vigilante en 15 min)',
      'App ManoProtect Premium',
      'Anti-inhibicion 17 frecuencias',
      'Aviso policia + bomberos + ambulancia',
      'Grabacion en la nube 30 dias',
      'Mantenimiento preventivo semestral',
      '2 Sentinel X de REGALO',
    ],
  },
  {
    id: 'business',
    name: 'ManoProtect Business',
    badge: 'EMPRESAS',
    subtitle: 'Locales, naves y oficinas',
    monthly: 69.99,
    promoMonthly: 54.99,
    promoLabel: '6 primeros meses',
    color: 'emerald',
    gradient: 'from-emerald-600 to-teal-700',
    img: IMG.businessLobby,
    popular: false,
    link: '/alarmas/negocio',
    equipment: [
      'Hub Enterprise pantalla 10" + backup hub',
      '6 camaras IP 4K con IA deteccion personas',
      '4 camaras PTZ exterior 360 grados IP67',
      '10 sensores movimiento volumetricos',
      '8 contactos magneticos puertas/ventanas',
      'Control acceso biometrico (huella + RFID)',
      'Videoportero IP con reconocimiento facial',
      '2 sirenas exteriores 130dB + 2 interiores',
      'Detectores humo + CO2 + gas + inundacion',
      'Conexion 4G dual + WiFi 6 + Ethernet x2',
    ],
    services: [
      'Centro control 24h Enterprise (CRA)',
      'Verificacion video + IA + reconocimiento',
      'Servicio Acuda prioritario (10 min)',
      'App ManoProtect Business (multi-sede)',
      'Anti-inhibicion Grado 3',
      'Custodia de llaves',
      'Grabacion nube 90 dias',
      'Mantenimiento preventivo trimestral',
      '3 Sentinel X para propietarios/gerentes',
    ],
  },
];

const COMP_ROWS = [
  { f: 'Precio mensual', e: '34,99 EUR', p: '49,99 EUR', b: '69,99 EUR' },
  { f: 'Permanencia', e: 'SIN permanencia', p: 'SIN permanencia', b: 'SIN permanencia' },
  { f: 'Equipo + instalacion', e: 'GRATIS', p: 'GRATIS', b: 'GRATIS' },
  { f: 'Camaras incluidas', e: '2 Full HD', p: '4 x 2K + 2 PTZ', b: '6 x 4K + 4 PTZ' },
  { f: 'Sensores movimiento', e: '3 PIR', p: '6 PIR', b: '10 volumetricos' },
  { f: 'Sirena exterior', e: '110dB', p: '120dB', b: '130dB' },
  { f: 'Anti-inhibicion', e: true, p: true, b: 'Grado 3' },
  { f: 'Verificacion video IA', e: true, p: true, b: true },
  { f: 'Servicio de Acuda', e: false, p: '15 min', b: '10 min prioritario' },
  { f: 'Control acceso biometrico', e: false, p: 'RFID', b: 'Huella + RFID + facial' },
  { f: 'Grabacion nube', e: false, p: '30 dias', b: '90 dias' },
  { f: 'Sentinel X incluido', e: '1 unidad', p: '2 unidades', b: '3 unidades' },
  { f: 'Mantenimiento', e: 'Remoto', p: 'Semestral', b: 'Trimestral' },
  { f: 'Multi-sede', e: false, p: false, b: true },
];

const COMPETITOR_TABLE = [
  { feat: 'Precio desde', mp: '24,99 EUR/mes', sd: '39,89 EUR/mes', pg: '44,90 EUR/mes' },
  { feat: 'Permanencia', mp: 'SIN permanencia', sd: '24 meses', pg: '24-36 meses' },
  { feat: 'Equipo', mp: 'GRATIS', sd: '149 EUR', pg: 'Incluido' },
  { feat: 'Camaras en kit basico', mp: '2 Full HD', sd: '1 camara', pg: '1 camara' },
  { feat: 'App gratuita', mp: true, sd: true, pg: true },
  { feat: 'Smartwatch SOS incluido', mp: true, sd: false, pg: false },
  { feat: 'Anti-inhibicion avanzada', mp: true, sd: true, pg: true },
  { feat: 'IA en camaras', mp: true, sd: false, pg: false },
  { feat: 'Sin falsas alarmas', mp: 'Video + IA', sd: 'Basico', pg: 'Basico' },
  { feat: 'Funciona con movil apagado', mp: true, sd: false, pg: false },
];

const CVal = ({ v }) => {
  if (v === true) return <Check className="w-4 h-4 text-emerald-500 mx-auto" />;
  if (v === false) return <X className="w-4 h-4 text-red-400 mx-auto" />;
  return <span className="text-xs font-medium text-gray-700">{v}</span>;
};

const SeguridadViviendaEmpresa = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const faqItems = [
    { q: 'Por que ManoProtect es mejor que Securitas Direct?', a: 'Ofrecemos la misma monitorizacion CRA 24h pero SIN permanencia (ellos exigen 24 meses), mas camaras en el kit basico (2 vs 1), inteligencia artificial en las camaras para evitar falsas alarmas, y algo unico: un reloj Sentinel con boton SOS incluido GRATIS que funciona incluso con el movil apagado.' },
    { q: 'Hay permanencia?', a: 'NO. A diferencia de Securitas Direct (24 meses) y Prosegur (24-36 meses), nosotros NO tenemos permanencia. Puedes cancelar cuando quieras sin penalizacion.' },
    { q: 'El equipo es realmente gratis?', a: 'Si. Hub, camaras, sensores, sirenas, mandos, detectores y Sentinel SOS incluidos sin coste. Solo pagas la cuota mensual que incluye la monitorizacion 24h.' },
    { q: 'Necesito obra para instalar?', a: 'No. Sistemas 100% inalambricos. Instalacion profesional en menos de 2 horas sin cables ni taladros. El tecnico configura todo y te ensena a usar la app.' },
    { q: 'Que pasa si se va la luz o internet?', a: 'El hub tiene bateria de respaldo de 24h y conexion 4G independiente. Si se corta la luz o el WiFi, el sistema sigue operativo y conectado al centro de control.' },
    { q: 'Puedo contratar solo los relojes Sentinel sin la alarma?', a: 'Por supuesto. Los relojes Sentinel X, J y S se pueden contratar de forma independiente con su propio plan de suscripcion. Van a /productos para verlos.' },
    { q: 'Que es el servicio de Acuda?', a: 'Cuando se confirma una intrusion, ademas de avisar a la policia, enviamos un vigilante de seguridad armado a tu domicilio en 10-15 minutos. Disponible en planes Premium y Business.' },
    { q: 'Es compatible con mascotas?', a: 'Si. Los sensores PIR anti-mascotas ignoran animales de hasta 25 kg. Puedes tener perros y gatos sin falsas alarmas.' },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="seguridad-vivienda-empresa">
      <Helmet>
        <title>Alarmas para Casa y Negocio | ManoProtect - Mejor que Securitas Direct</title>
        <meta name="description" content="Alarmas para viviendas y empresas desde 24,99 EUR/mes. SIN permanencia. Equipo GRATIS. Camaras IA, centro 24h, Sentinel SOS incluido. Supera a Securitas Direct y Prosegur." />
        <link rel="canonical" href="https://manoprotect.com/seguridad-hogar-empresa" />
      </Helmet>

      {/* ═══ HEADER ═══ */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md shadow-blue-200"><Shield className="w-5 h-5 text-white" /></div>
            <span className="text-gray-900 text-lg font-extrabold tracking-tight">ManoProtect</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/alarmas/vivienda" className="text-gray-600 hover:text-blue-700 transition-colors">Viviendas</Link>
            <Link to="/alarmas/negocio" className="text-gray-600 hover:text-blue-700 transition-colors">Negocios</Link>
            <Link to="/productos" className="text-gray-600 hover:text-blue-700 transition-colors">Relojes Sentinel</Link>
            <Link to="/plans" className="text-gray-600 hover:text-blue-700 transition-colors">Planes</Link>
            <Link to="/contacto" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-full text-xs font-bold hover:shadow-lg hover:shadow-orange-200 transition-all">Pedir presupuesto</Link>
          </nav>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.villaHero} alt="Villa protegida por ManoProtect" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/70 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300 tracking-wider">N.1 EN SEGURIDAD INTELIGENTE 2026</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight" data-testid="hero-title">
              Protege lo que <br/><span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">mas importa</span>
            </h1>
            <p className="text-lg text-gray-300 mb-4 leading-relaxed max-w-xl">
              Alarmas de ultima generacion con camaras IA, centro de control 24h y el unico sistema con <strong className="text-white">reloj Sentinel SOS incluido</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="bg-red-500/20 border border-red-400/30 text-red-300 px-3 py-1 rounded-full text-xs font-bold">SIN permanencia</span>
              <span className="bg-blue-500/20 border border-blue-400/30 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">Equipo GRATIS</span>
              <span className="bg-orange-500/20 border border-orange-400/30 text-orange-300 px-3 py-1 rounded-full text-xs font-bold">Desde 24,99 EUR/mes</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#kits" className="group bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-bold text-sm transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105 flex items-center gap-2" data-testid="ver-kits-btn">
                Ver kits de alarma <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link to="/calculador" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-sm transition-all border border-white/20 backdrop-blur-sm flex items-center gap-2" data-testid="calculador-btn">
                Calcular mi precio
              </Link>
            </div>
          </div>
        </div>
        {/* Floating stats */}
        <div className="hidden lg:block absolute right-12 bottom-12 z-10">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 w-72">
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-4">POR QUE ELEGIRNOS</p>
            {[
              { icon: Award, val: 'SIN permanencia', sub: 'Ellos: 24-36 meses' },
              { icon: Camera, val: '2 camaras IA incluidas', sub: 'Ellos: 1 camara basica' },
              { icon: Watch, val: 'Sentinel SOS GRATIS', sub: 'Ellos: no incluyen' },
              { icon: Zap, val: 'Respuesta < 60 seg', sub: 'Centro de control 24h' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <s.icon className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold">{s.val}</p>
                  <p className="text-white/50 text-[10px]">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF BAR ═══ */}
      <section className="bg-gray-950 py-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 sm:gap-16">
          {[
            { val: '+3.200', label: 'Hogares protegidos' },
            { val: '+950', label: 'Empresas securizadas' },
            { val: '< 60s', label: 'Tiempo de respuesta' },
            { val: '4.9/5', label: 'Google Reviews' },
            { val: '0', label: 'Permanencia' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-white text-lg sm:text-xl font-black">{s.val}</p>
              <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CHOOSE YOUR SPACE ═══ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">Que quieres proteger?</h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">Soluciones profesionales adaptadas a tu espacio. Elige tu tipo y descubre todos los detalles.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Vivienda */}
            <Link to="/alarmas/vivienda" className="group relative overflow-hidden rounded-3xl border-2 border-transparent hover:border-blue-400 transition-all duration-300 hover:shadow-2xl" data-testid="card-vivienda">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={IMG.apartment} alt="Alarma para vivienda" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">Viviendas</span>
                </div>
                <h3 className="text-white text-xl font-bold mb-1">Pisos, chalets y casas</h3>
                <p className="text-gray-300 text-xs mb-3">Desde 24,99 EUR/mes. Equipo + instalacion GRATIS.</p>
                <span className="inline-flex items-center gap-1 text-blue-400 text-xs font-bold group-hover:gap-2 transition-all">
                  Ver detalles completos <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
            {/* Negocio */}
            <Link to="/alarmas/negocio" className="group relative overflow-hidden rounded-3xl border-2 border-transparent hover:border-emerald-400 transition-all duration-300 hover:shadow-2xl" data-testid="card-negocio">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={IMG.businessLobby} alt="Alarma para negocio" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Negocios</span>
                </div>
                <h3 className="text-white text-xl font-bold mb-1">Locales, naves y oficinas</h3>
                <p className="text-gray-300 text-xs mb-3">Desde 54,99 EUR/mes. Control acceso + camaras 4K.</p>
                <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold group-hover:gap-2 transition-all">
                  Ver detalles completos <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ COMPONENTS SHOWCASE ═══ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">Equipamiento de ultima generacion</h2>
            <p className="text-gray-500 text-sm">Componentes premium que superan a cualquier competidor del mercado.</p>
          </div>
          {/* Full-width kit image */}
          <div className="mb-10 rounded-3xl overflow-hidden shadow-2xl shadow-gray-200">
            <img src={IMG.premiumKit} alt="Kit completo ManoProtect: centralita, camaras, sensores, sirena, mandos, detectores" className="w-full object-cover" data-testid="components-hero-img" />
          </div>
          {/* Component grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Radio, img: IMG.controlPanel, name: 'Centralita Hub Pro', desc: 'Pantalla tactil HD, sirena integrada, bateria 24h, conexion 4G+WiFi+Ethernet.' },
              { icon: Camera, img: IMG.camera4k, name: 'Camaras IP 4K con IA', desc: 'Vision nocturna, deteccion inteligente, audio bidireccional, grabacion nube.' },
              { icon: Volume2, img: IMG.outdoorSiren, name: 'Sirena Exterior 130dB', desc: 'Flash LED estroboscopico, resistente IP65, disuasion maxima anti-intrusion.' },
              { icon: Watch, img: IMG.sentinelTrio, name: 'Relojes Sentinel X/J/S', desc: 'GPS, boton SOS, E-SIM integrada. Funciona sin movil. INCLUIDO en cada kit.' },
            ].map((c, i) => (
              <div key={i} className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300" data-testid={`component-${i}`}>
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <c.icon className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-gray-900 text-sm">{c.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Remote controls */}
          <div className="mt-10 grid lg:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Mandos premium con diseno exclusivo</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">Tres acabados de lujo para elegir: blanco con LED azul, negro con detalles dorados y rosa dorado con textura premium. Cada mando incluye boton de panico y activacion con un toque.</p>
              <div className="flex gap-4">
                {[
                  { color: 'bg-sky-100 text-sky-700', label: 'Blanco Hielo' },
                  { color: 'bg-gray-900 text-amber-400', label: 'Negro y Oro' },
                  { color: 'bg-rose-100 text-rose-600', label: 'Rosa Dorado' },
                ].map((m, i) => (
                  <div key={i} className={`${m.color} px-4 py-2 rounded-xl text-xs font-bold`}>{m.label}</div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img src={IMG.remotesTrio} alt="Mandos premium ManoProtect en tres colores" className="w-full object-cover" loading="lazy" data-testid="remotes-img" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3 KITS ═══ */}
      <section id="kits" className="py-20 bg-gray-950" data-testid="kits-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">Los 3 mejores kits de alarma del mercado</h2>
            <p className="text-gray-400 text-sm">Equipo GRATIS + instalacion profesional. SIN permanencia. Sentinel SOS incluido.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {KITS.map((kit) => (
              <div key={kit.id} className={`relative rounded-3xl overflow-hidden ${kit.popular ? 'ring-2 ring-orange-500 shadow-2xl shadow-orange-500/20' : 'ring-1 ring-gray-800'} bg-gray-900 transition-all hover:ring-2 hover:ring-gray-600`} data-testid={`kit-${kit.id}`}>
                {kit.popular && (
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 text-xs font-bold tracking-wider">{kit.badge}</div>
                )}
                {!kit.popular && (
                  <div className="bg-gray-800 text-gray-400 text-center py-2 text-xs font-bold tracking-wider">{kit.badge}</div>
                )}
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={kit.img} alt={kit.name} className="w-full h-full object-cover opacity-80" loading="lazy" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{kit.name}</h3>
                  <p className="text-gray-400 text-xs mb-4">{kit.subtitle}</p>
                  <div className="mb-5">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-white">{kit.promoMonthly}</span>
                      <span className="text-gray-500 text-sm mb-1">EUR/mes</span>
                    </div>
                    <p className="text-orange-400 text-xs font-bold mt-1">{kit.promoLabel} (despues {kit.monthly} EUR/mes)</p>
                    <p className="text-emerald-400 text-xs font-bold mt-0.5">Equipo e instalacion GRATIS</p>
                  </div>
                  {/* Equipment */}
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2">EQUIPO INCLUIDO</p>
                  <ul className="space-y-1.5 mb-4">
                    {kit.equipment.slice(0, 5).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" /><span>{item}</span>
                      </li>
                    ))}
                    {kit.equipment.length > 5 && <li className="text-xs text-gray-500">+ {kit.equipment.length - 5} componentes mas...</li>}
                  </ul>
                  {/* Services */}
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2">SERVICIOS INCLUIDOS</p>
                  <ul className="space-y-1.5 mb-6">
                    {kit.services.slice(0, 4).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <Star className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" /><span>{item}</span>
                      </li>
                    ))}
                    {kit.services.length > 4 && <li className="text-xs text-gray-500">+ {kit.services.length - 4} servicios mas...</li>}
                  </ul>
                  <div className="space-y-2">
                    <button onClick={() => navigate('/contacto')}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all text-white ${kit.popular ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg hover:shadow-orange-500/30' : 'bg-gray-800 hover:bg-gray-700'}`}
                      data-testid={`cta-${kit.id}`}>
                      Solicitar instalacion GRATIS
                    </button>
                    <Link to={kit.link} className="block w-full py-2.5 rounded-xl font-bold text-xs text-gray-400 hover:text-white text-center transition-colors">
                      Ver detalles completos
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VS COMPETITION ═══ */}
      <section className="py-20 bg-white" data-testid="competition-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">ManoProtect vs la competencia</h2>
            <p className="text-gray-500 text-sm">Comparanos con Securitas Direct y Prosegur. Los datos hablan.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 items-center mb-10">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img src={IMG.comparison} alt="ManoProtect vs competencia" className="w-full" loading="lazy" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Por que somos la mejor opcion</h3>
              {[
                { icon: Award, text: 'SIN permanencia vs 24-36 meses de la competencia' },
                { icon: Camera, text: '2 camaras IA incluidas vs 1 camara basica' },
                { icon: Watch, text: 'Sentinel SOS incluido - unico en el mercado' },
                { icon: Zap, text: 'Verificacion por video con IA - cero falsas alarmas' },
                { icon: Globe, text: 'Funciona con el movil apagado gracias a E-SIM' },
                { icon: Sparkles, text: 'Precio desde 24,99 EUR/mes vs 39,89 EUR competencia' },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <a.icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-sm text-gray-700 pt-1">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase w-1/4"></th>
                  <th className="text-center p-4 text-xs font-bold text-blue-700 uppercase bg-blue-50">ManoProtect</th>
                  <th className="text-center p-4 text-xs font-bold text-gray-500 uppercase">Securitas Direct</th>
                  <th className="text-center p-4 text-xs font-bold text-gray-500 uppercase">Prosegur</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITOR_TABLE.map((r, i) => (
                  <tr key={i} className={`border-t border-gray-100 ${i % 2 ? 'bg-gray-50/50' : ''}`}>
                    <td className="p-3 text-xs font-medium text-gray-700">{r.feat}</td>
                    <td className="p-3 text-center bg-blue-50/30"><CVal v={r.mp} /></td>
                    <td className="p-3 text-center"><CVal v={r.sd} /></td>
                    <td className="p-3 text-center"><CVal v={r.pg} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ SENTINEL INTEGRATION ═══ */}
      <section className="py-20 bg-gradient-to-b from-gray-950 to-blue-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-400/30 px-3 py-1.5 rounded-full mb-5">
                <Watch className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[10px] font-bold text-orange-300 tracking-wider">EXCLUSIVO MANOPROTECT</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">Sentinel SOS incluido en cada kit</h2>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Ningun competidor ofrece esto. Con cada kit de alarma, recibes relojes Sentinel con boton SOS 
                conectados al mismo centro de control 24h. GPS, E-SIM integrada, sensor cardiaco.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Boton SOS conectado al centro 24h',
                  'GPS en tiempo real',
                  'E-SIM integrada: funciona sin movil',
                  'Sensor cardiaco y alerta de caida',
                  'Funciona en segundo plano',
                  'Arma/desarma la alarma desde la muneca',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-gray-200">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/productos" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full text-xs font-bold transition-all hover:shadow-lg hover:shadow-orange-500/30 flex items-center gap-2" data-testid="ver-sentinel-btn">
                  Ver relojes Sentinel <ArrowRight className="w-3 h-3" />
                </Link>
                <p className="text-gray-500 text-xs self-center">Tambien puedes contratarlos sin la alarma</p>
              </div>
            </div>
            <div className="flex justify-center">
              <img src={IMG.sentinelTrio} alt="Relojes Sentinel X, J y S" className="rounded-3xl shadow-2xl max-w-lg w-full" data-testid="sentinel-trio-img" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PLANS COMPARISON ═══ */}
      <section className="py-20 bg-gray-50" data-testid="plans-comparison">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-10 tracking-tight">Comparativa de nuestros planes</h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase w-[30%]">Caracteristica</th>
                  <th className="text-center p-4 text-xs font-bold text-sky-700 uppercase">Essential<br/><span className="text-gray-500 font-normal">34,99 EUR</span></th>
                  <th className="text-center p-4 text-xs font-bold text-orange-600 uppercase bg-orange-50/50">Premium<br/><span className="text-gray-500 font-normal">49,99 EUR</span></th>
                  <th className="text-center p-4 text-xs font-bold text-emerald-700 uppercase">Business<br/><span className="text-gray-500 font-normal">69,99 EUR</span></th>
                </tr>
              </thead>
              <tbody>
                {COMP_ROWS.map((r, i) => (
                  <tr key={i} className={`border-t border-gray-100 ${i % 2 ? 'bg-gray-50/50' : ''}`}>
                    <td className="p-3 text-xs font-medium text-gray-700">{r.f}</td>
                    <td className="p-3 text-center"><CVal v={r.e} /></td>
                    <td className="p-3 text-center bg-orange-50/20"><CVal v={r.p} /></td>
                    <td className="p-3 text-center"><CVal v={r.b} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-10 tracking-tight">Preguntas frecuentes</h2>
          <div className="space-y-2" data-testid="faq-section">
            {faqItems.map((item, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-100 transition-colors">
                  <span className="font-bold text-gray-900 text-sm pr-4">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="py-16 bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-black mb-3 tracking-tight">Protege tu hogar o negocio hoy</h2>
          <p className="text-white/80 mb-6 text-sm">Desde 24,99 EUR/mes. SIN permanencia. Equipo GRATIS. Sentinel SOS incluido.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/contacto" className="bg-white text-red-600 px-8 py-4 rounded-full font-bold text-sm hover:bg-gray-50 transition-all hover:shadow-xl" data-testid="cta-bottom">
              Solicitar presupuesto GRATIS
            </Link>
            <a href="tel:+34601510950" className="bg-white/15 hover:bg-white/25 text-white px-8 py-4 rounded-full font-bold text-sm transition-colors border border-white/30 flex items-center gap-2">
              <Phone className="w-4 h-4" /> 601 510 950
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default SeguridadViviendaEmpresa;
