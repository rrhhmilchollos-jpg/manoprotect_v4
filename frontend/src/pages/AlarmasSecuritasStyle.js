/**
 * ManoProtect - Pagina de Alarmas estilo Securitas Direct
 * Funnel de ventas profesional: Hero -> Calculadora -> Producto -> Como funciona -> Tipos vivienda -> App -> FAQ -> CTA
 * Ruta principal: /alarmas-hogar
 */
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LandingFooter from '@/components/landing/LandingFooter';
import {
  Shield, Home, Building2, Camera, Wifi, Bell, Lock, Phone,
  Check, ArrowRight, MapPin, Eye, Zap, Radio, Smartphone,
  AlertTriangle, Clock, Star, Users, Package, ChevronDown,
  Volume2, Watch, X, Sparkles, Award, Globe, Play, ChevronRight,
  Fingerprint, Signal, ShieldCheck, Siren, CircleDot, Monitor
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

/* ─── IMAGENES ─── */
const IMG = {
  familySafe: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/d6192fd70ff51f0e5a680be08c4a4719cc05b1f6887df792834026731fb67ce4.png',
  panelTouch: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/72f3963ebdccf94c580a62ba8f35553c7f85f200bdbaecaf1e551b33001d99eb.png',
  threeTypes: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/496255eb54127fb17d425975ec7fbe08b85aa95639979c028a668cae0f6d9510.png',
  appMockup: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/96750b843f73fc1629557fdcc2b51c3a506fd162fb027a9c48a7c50146593b5a.png',
  howItWorks: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/11db0fde98e1d8f3623f6490c9854eadec0c5c58ad64c999f9e9a7ad6f620231.png',
  technician: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/06c0578988dd38e5e39f422916bf83271a5a098afb187ea7349632b648b84ae7.png',
  villaHero: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/e164cb2cf3f4f9c1c618577b32e96516dbba057689cb6c8e981cb8b78626d495.png',
  apartment: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/3491f38335afcb9caf468ea266417ef144e075a365d6a5fe69e676315b6942b6.png',
  businessLobby: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/849e086aebf89bbc87613eecc7dd2e68ad9829e7f3df9e73c316cb6968ad6176.png',
  warehouse: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/d5b3ee6bbfe8654c951190925530016926f3d28ff3b43f8772f9590a60b21930.png',
  premiumKit: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/13a8f09b29ff0fec2ceadd8b852434aa2c738e869179e58e98faadeb177de21f.png',
  remotesTrio: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/f4721d2b816f8bb98503fc2adb37dfca8c7517e980a3faba23bd4a409699ce8d.png',
  camera4k: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/8a6899331a0b3e75e77e08787983a097a23c215b55cc150a3cecb45c6af975bc.png',
  controlPanel: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/72857182df814237ec3f71996472c4b706658084f7b96563893f7a9a5b5c7b03.png',
  outdoorSiren: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/02324e10765dca960e91cd4c4dbacf1a487b245ad51052895887387edf5dd09f.png',
  sentinelTrio: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/16e97d0972346860b882ddea3662703ffc3438f28eae4e99da63bf51db6b6e60.png',
  sentinelWatch: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/7a282e42d9edfe3137fe6fd41329b2d34711dfa503f2395b7bd399d6e13437e8.png',
  comparison: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/df3749a5b94fa5a243e0e7b37d5619d377ad93fae43f8f5611c834cf2615ce8f.png',
};

const AlarmasSecuritasStyle = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeProperty, setActiveProperty] = useState('piso');
  const [miniCalcType, setMiniCalcType] = useState('');

  const faqs = [
    { q: 'Avisais a la Policia?', a: 'Si. Ante una intrusion confirmada por video con IA, nuestro centro de control avisa directamente a Policia Nacional, Guardia Civil o Mossos en menos de 60 segundos. Tambien despachamos bomberos o ambulancia si es necesario.' },
    { q: 'Cuanto cuesta la alarma de ManoProtect?', a: 'Desde 24,99 EUR/mes (precio promocional 6 meses). Equipo e instalacion GRATIS. Sin entrada. Sin permanencia. Cancela cuando quieras sin penalizacion.' },
    { q: 'Que diferencia hay con Securitas Direct?', a: 'Sin permanencia (ellos exigen 24 meses), mas camaras incluidas (2 vs 1 en el kit basico), camaras con IA para evitar falsas alarmas, y un reloj Sentinel SOS incluido de REGALO que funciona sin movil.' },
    { q: 'La alarma es inalambrica?', a: 'Si. 100% inalambrica. Instalacion sin obras ni cables en menos de 2 horas. Comunicacion via 4G + WiFi + Ethernet.' },
    { q: 'Puedo controlar la alarma desde el movil?', a: 'Si. Con la app ManoProtect puedes armar/desarmar, ver camaras en directo, revisar grabaciones, recibir alertas push y gestionar usuarios. Tambien puedes controlarlo desde tu reloj Sentinel.' },
    { q: 'Funciona si se va la luz o internet?', a: 'Si. El panel tiene bateria de respaldo de 24h y conexion 4G independiente. Aunque se corte la electricidad e internet, tu alarma sigue conectada al centro de control.' },
    { q: 'Detecta los inhibidores de frecuencia?', a: 'Si. Nuestro sistema anti-inhibicion detecta intentos de bloquear la senal y activa una alerta silenciosa inmediata al centro de control. Triple redundancia: 4G + WiFi + Ethernet.' },
    { q: 'Hay que pagar algo por el equipo?', a: 'No. Todo el equipo (panel, camaras, sensores, sirenas, mandos, detectores y reloj Sentinel) se instala GRATIS. Solo pagas la cuota mensual que incluye la monitorizacion 24h.' },
    { q: 'Se puede anadir mas equipamiento despues?', a: 'Si. El sistema es modular. Puedes anadir camaras, sensores, sirenas o detectores en cualquier momento. Hasta 100 dispositivos conectados al mismo hub.' },
    { q: 'Tengo mascotas, saltara la alarma?', a: 'No. Los sensores PIR anti-mascotas ignoran animales de hasta 25 kg. Ademas, las camaras con IA distinguen personas de mascotas para evitar falsas alarmas.' },
  ];

  const propertyTypes = {
    piso: {
      title: 'Alarma para pisos y apartamentos',
      desc: 'Proteccion completa para tu piso con sensores en accesos principales, camaras interiores y conexion 24h. Anti-inhibicion incluida.',
      img: IMG.apartment,
      price: '24,99',
      items: ['Panel tactil con sirena 110dB', '2 camaras Full HD con IA', '3 sensores PIR anti-mascotas', '2 contactos magneticos', 'Mando premium', 'Sentinel SOS de regalo'],
    },
    chalet: {
      title: 'Alarma para chalets y casas',
      desc: 'Cobertura total con camaras exteriores PTZ 360, sirena perimetral, sensores en todas las plantas y servicio de Acuda con vigilante.',
      img: IMG.villaHero,
      price: '39,99',
      items: ['Panel Pro tactil 10"', '4 camaras 2K + 2 PTZ exteriores', '6 sensores PIR anti-mascotas', 'Sirena exterior 120dB + interior', 'Detectores humo/CO2/inundacion', '2 mandos premium', '2 Sentinel SOS de regalo'],
    },
    negocio: {
      title: 'Alarma para negocios',
      desc: 'Seguridad empresarial con camaras 4K, control de acceso biometrico, videoportero facial y servicio Acuda prioritario en 10 minutos.',
      img: IMG.businessLobby,
      price: '54,99',
      items: ['Hub Enterprise + hub backup', '6 camaras 4K IA + 4 PTZ exteriores', 'Control acceso huella + RFID', 'Videoportero reconocimiento facial', 'Grabacion nube 90 dias', '3 Sentinel SOS para propietarios'],
    },
    nave: {
      title: 'Alarma para naves y almacenes',
      desc: 'Proteccion industrial con camaras PTZ de largo alcance, sensores perimetrales, anti-sabotaje y monitorizacion remota multi-sede.',
      img: IMG.warehouse,
      price: '54,99',
      items: ['Hub Enterprise redundante', '6 camaras 4K + 4 PTZ IP67', '10 sensores volumetricos', 'Sirenas 130dB exteriores', 'Detectores humo + gas + CO2', 'Anti-inhibicion Grado 3', '3 Sentinel SOS'],
    },
  };

  const currentProp = propertyTypes[activeProperty];

  return (
    <div className="min-h-screen bg-white" data-testid="alarmas-securitas-style">
      <Helmet>
        <title>Alarmas para Hogar y Negocio | ManoProtect 2026 - Desde 24,99 EUR/mes</title>
        <meta name="description" content="Alarma inteligente para casa y empresa. Camaras IA, centro 24h, aviso a Policia, anti-inhibicion. SIN permanencia. Equipo GRATIS. Sentinel SOS incluido. Desde 24,99 EUR/mes." />
        <link rel="canonical" href="https://manoprotect.com/alarmas-hogar" />
      </Helmet>

      {/* ═══ STICKY HEADER ═══ */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md shadow-blue-200"><Shield className="w-5 h-5 text-white" /></div>
              <span className="text-gray-900 text-lg font-extrabold tracking-tight">ManoProtect</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
              <a href="#alarma" className="text-gray-600 hover:text-blue-700 transition-colors">Nuestra alarma</a>
              <a href="#tipos" className="text-gray-600 hover:text-blue-700 transition-colors">Tipos de vivienda</a>
              <a href="#como-funciona" className="text-gray-600 hover:text-blue-700 transition-colors">Como funciona</a>
              <a href="#app" className="text-gray-600 hover:text-blue-700 transition-colors">App</a>
              <a href="#precios" className="text-gray-600 hover:text-blue-700 transition-colors">Precios</a>
              <a href="#faq" className="text-gray-600 hover:text-blue-700 transition-colors">FAQ</a>
            </nav>
            <div className="flex items-center gap-2">
              <a href="tel:+34601510950" className="hidden sm:flex items-center gap-1.5 text-blue-700 font-bold text-sm"><Phone className="w-4 h-4" /> 601 510 950</a>
              <Link to="/calculador" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-full text-xs font-bold hover:shadow-lg hover:shadow-orange-200 transition-all" data-testid="header-calc-btn">
                Calcular mi alarma
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ HERO PRINCIPAL ═══ */}
      <section className="relative overflow-hidden bg-gray-950">
        <div className="absolute inset-0">
          <img src={IMG.familySafe} alt="Familia espanola protegida por ManoProtect" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/80 to-gray-950" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Texto */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">N.1 SEGURIDAD INTELIGENTE 2026</span>
                <span className="bg-orange-500/15 border border-orange-400/30 text-orange-300 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">AVISO A POLICIA 24/7</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 leading-[1.05] tracking-tight" data-testid="hero-title">
                Protege lo que <br className="hidden sm:block" /><span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">mas te importa</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-300 mb-6 max-w-xl leading-relaxed">
                Alarma inteligente con <strong className="text-white">camaras IA</strong>, centro de control 24h, 
                anti-inhibicion y <strong className="text-white">reloj Sentinel SOS incluido</strong>. 
                Sin permanencia. Equipo GRATIS.
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-8">
                {[
                  { icon: ShieldCheck, text: 'Centro 24h' },
                  { icon: Camera, text: 'Camaras IA' },
                  { icon: Signal, text: 'Anti-inhibicion' },
                  { icon: Watch, text: 'Sentinel SOS' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <b.icon className="w-4 h-4 text-orange-400" />
                    <span className="text-white text-xs font-bold">{b.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/calculador" className="group bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-bold text-sm transition-all hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-105 flex items-center gap-2" data-testid="hero-calc-btn">
                  Calcula tu alarma online <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="tel:+34601510950" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-sm border border-white/20 flex items-center gap-2 transition-all">
                  <Phone className="w-4 h-4" /> Llama gratis
                </a>
              </div>
            </div>
            {/* Mini calculadora inline */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 lg:p-8" data-testid="mini-calculator">
              <h3 className="text-white font-bold text-lg mb-1">Calcula tu alarma en 30 segundos</h3>
              <p className="text-gray-400 text-xs mb-5">Que tipo de propiedad quieres proteger?</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { id: 'piso', label: 'Piso', icon: Home },
                  { id: 'chalet', label: 'Chalet / Casa', icon: Home },
                  { id: 'negocio', label: 'Local / Oficina', icon: Building2 },
                  { id: 'nave', label: 'Nave / Almacen', icon: Building2 },
                ].map(t => (
                  <button key={t.id} onClick={() => setMiniCalcType(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2 ${miniCalcType === t.id ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-white/10 text-gray-400 hover:border-white/30'}`}
                    data-testid={`mini-type-${t.id}`}>
                    <t.icon className="w-4 h-4" />
                    <span className="text-xs font-bold">{t.label}</span>
                  </button>
                ))}
              </div>
              {miniCalcType && (
                <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                  <p className="text-orange-400 text-xs font-bold mb-1">Tu precio desde</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-white">{propertyTypes[miniCalcType]?.price || '24,99'}</span>
                    <span className="text-gray-400 text-sm mb-0.5">EUR/mes</span>
                  </div>
                  <p className="text-emerald-400 text-xs font-bold mt-1">Equipo + instalacion GRATIS</p>
                </div>
              )}
              <Link to="/calculador" className="block w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-sm text-center hover:shadow-lg transition-all" data-testid="mini-calc-cta">
                {miniCalcType ? 'Personalizar mi presupuesto' : 'Calcular precio exacto'}
              </Link>
              <p className="text-gray-500 text-[10px] text-center mt-3">Sin compromiso. Sin permanencia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section className="bg-blue-700 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-6 sm:gap-12">
          {[
            { val: '+3.200', label: 'Hogares' },
            { val: '+950', label: 'Empresas' },
            { val: '<60s', label: 'Respuesta' },
            { val: '4.9/5', label: 'Valoracion' },
            { val: '0', label: 'Permanencia' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-white text-lg font-black">{s.val}</p>
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ NUESTRA ALARMA ═══ */}
      <section id="alarma" className="py-20 bg-white" data-testid="nuestra-alarma">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">La alarma mas inteligente del mercado</h2>
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">Tecnologia que Securitas Direct y Prosegur no ofrecen. Camaras con IA, anti-inhibicion avanzada, reloj SOS integrado y sin permanencia.</p>
          </div>

          {/* Panel de control */}
          <div className="grid lg:grid-cols-2 gap-10 items-center mb-20">
            <div>
              <span className="text-orange-500 text-xs font-bold uppercase tracking-widest">PANEL DE CONTROL</span>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 mb-4 tracking-tight">El cerebro de tu seguridad</h3>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Pantalla tactil HD, sirena 110-120dB integrada, bateria de respaldo 24h y triple conexion 
                (4G + WiFi + Ethernet). Sistema anti-inhibicion que detecta intentos de sabotaje.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Monitor, text: 'Pantalla tactil HD' },
                  { icon: Volume2, text: 'Sirena integrada 120dB' },
                  { icon: Signal, text: 'Anti-inhibicion' },
                  { icon: Zap, text: 'Bateria backup 24h' },
                  { icon: Wifi, text: '4G + WiFi + Ethernet' },
                  { icon: Lock, text: 'Codigo + RFID + mando' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <f.icon className="w-4 h-4 text-blue-700 flex-shrink-0" />
                    <span className="text-xs font-bold text-gray-700">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-gray-200">
              <img src={IMG.panelTouch} alt="Panel de control tactil ManoProtect" className="w-full" loading="lazy" />
            </div>
          </div>

          {/* Camaras */}
          <div className="grid lg:grid-cols-2 gap-10 items-center mb-20">
            <div className="order-2 lg:order-1 rounded-3xl overflow-hidden shadow-2xl shadow-gray-200">
              <img src={IMG.camera4k} alt="Camara IP 4K con IA ManoProtect" className="w-full" loading="lazy" />
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-orange-500 text-xs font-bold uppercase tracking-widest">CAMARAS CON IA</span>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 mb-4 tracking-tight">Verificacion por video inteligente</h3>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Nuestras camaras con inteligencia artificial distinguen personas de mascotas o sombras. 
                Cero falsas alarmas. Vision nocturna, audio bidireccional y grabacion en la nube.
              </p>
              <div className="space-y-3">
                {[
                  'Deteccion inteligente de personas (no mascotas)',
                  'Vision nocturna infrarroja hasta 30 metros',
                  'Audio bidireccional (habla-escucha)',
                  'Grabacion en la nube hasta 90 dias',
                  'PTZ 360 grados disponibles (planes Premium)',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kit completo */}
          <div className="rounded-3xl overflow-hidden shadow-2xl shadow-gray-200 mb-10">
            <img src={IMG.premiumKit} alt="Kit completo alarma ManoProtect" className="w-full" loading="lazy" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { img: IMG.controlPanel, name: 'Centralita Hub', desc: 'Pantalla tactil, sirena, bateria 24h.' },
              { img: IMG.outdoorSiren, name: 'Sirena Exterior', desc: 'Hasta 130dB con flash LED. IP65.' },
              { img: IMG.remotesTrio, name: 'Mandos Premium', desc: 'Tres colores. Boton de panico.' },
              { img: IMG.sentinelTrio, name: 'Sentinel SOS', desc: 'GPS, E-SIM, boton SOS. INCLUIDO.' },
            ].map((c, i) => (
              <div key={i} className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-900 text-sm">{c.name}</h4>
                  <p className="text-xs text-gray-500">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMO FUNCIONA ═══ */}
      <section id="como-funciona" className="py-20 bg-gray-950 text-white" data-testid="como-funciona">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-14 tracking-tight">Como protegemos tu hogar</h2>
          <div className="grid lg:grid-cols-2 gap-10 items-center mb-14">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img src={IMG.howItWorks} alt="Como funciona alarma ManoProtect" className="w-full" loading="lazy" />
            </div>
            <div className="space-y-6">
              {[
                { n: '1', icon: Eye, title: 'Deteccion', desc: 'Los sensores detectan movimiento o apertura. Las camaras con IA verifican si es una persona real.', color: 'text-red-400' },
                { n: '2', icon: Camera, title: 'Verificacion por video', desc: 'Nuestro centro de control recibe las imagenes en tiempo real. Un operador confirma la intrusion en segundos.', color: 'text-orange-400' },
                { n: '3', icon: Radio, title: 'Alerta inmediata', desc: 'Si se confirma, activamos la sirena, te avisamos por app/SMS y contactamos a Policia/bomberos.', color: 'text-yellow-400' },
                { n: '4', icon: Shield, title: 'Respuesta <60 seg', desc: 'La Policia recibe el aviso con video en menos de 60 segundos. En planes Premium, enviamos vigilante (Acuda).', color: 'text-emerald-400' },
              ].map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                    <span className={`text-lg font-black ${s.color}`}>{s.n}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-0.5">{s.title}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Instalacion */}
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">INSTALACION PROFESIONAL</span>
              <h3 className="text-2xl font-black text-white mt-2 mb-4 tracking-tight">Instalacion GRATIS en menos de 2 horas</h3>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Un tecnico certificado instala todo el equipo sin obras ni cables. Configura tu app, 
                te ensena a usar el sistema y deja tu hogar protegido y conectado al centro 24h.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Sin obras', 'Sin cables', 'Menos de 2h', 'Tecnico certificado', 'Config app incluida'].map((t, i) => (
                  <span key={i} className="bg-white/5 border border-white/10 text-white px-3 py-1.5 rounded-full text-xs font-bold">{t}</span>
                ))}
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img src={IMG.technician} alt="Tecnico ManoProtect instalando alarma" className="w-full" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TIPOS DE VIVIENDA ═══ */}
      <section id="tipos" className="py-20 bg-gray-50" data-testid="tipos-vivienda">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">Alarma adaptada a tu espacio</h2>
            <p className="text-gray-500 text-sm">Selecciona tu tipo de propiedad y descubre tu kit personalizado</p>
          </div>
          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { id: 'piso', label: 'Piso / Apartamento', icon: Home },
              { id: 'chalet', label: 'Chalet / Casa', icon: Home },
              { id: 'negocio', label: 'Local / Oficina', icon: Building2 },
              { id: 'nave', label: 'Nave / Almacen', icon: Building2 },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveProperty(t.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold transition-all ${activeProperty === t.id ? 'bg-blue-700 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                data-testid={`prop-tab-${t.id}`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
          {/* Content */}
          <div className="grid lg:grid-cols-2 gap-8 items-center bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg">
            <div className="aspect-[16/10] lg:aspect-auto lg:h-full overflow-hidden">
              <img src={currentProp.img} alt={currentProp.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="p-6 lg:p-8">
              <h3 className="text-xl font-black text-gray-900 mb-2">{currentProp.title}</h3>
              <p className="text-gray-600 text-sm mb-5 leading-relaxed">{currentProp.desc}</p>
              <div className="mb-5">
                <span className="text-gray-400 text-xs font-bold">DESDE</span>
                <div className="flex items-end gap-1 mt-0.5">
                  <span className="text-4xl font-black text-gray-900">{currentProp.price}</span>
                  <span className="text-gray-500 text-sm mb-1">EUR/mes</span>
                </div>
                <p className="text-emerald-600 text-xs font-bold mt-0.5">Equipo + instalacion GRATIS</p>
                <p className="text-orange-500 text-xs font-bold">SIN permanencia</p>
              </div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">INCLUIDO EN TU KIT</p>
              <ul className="space-y-2 mb-6">
                {currentProp.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" /><span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Link to="/calculador" className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-xs text-center hover:shadow-lg transition-all" data-testid={`cta-prop-${activeProperty}`}>
                  Calcular precio exacto
                </Link>
                <Link to="/contacto" className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs text-center hover:bg-gray-800 transition-colors">
                  Pedir presupuesto
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ APP ═══ */}
      <section id="app" className="py-20 bg-white" data-testid="app-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-orange-500 text-xs font-bold uppercase tracking-widest">APP MANOPROTECT</span>
              <h2 className="text-3xl font-black text-gray-900 mt-2 mb-4 tracking-tight">Tu alarma en el bolsillo</h2>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Controla tu alarma desde cualquier lugar del mundo. Arma, desarma, ve las camaras en directo, 
                recibe alertas push, revisa grabaciones y gestiona usuarios. Todo desde tu movil.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { icon: Lock, text: 'Armar y desarmar desde cualquier lugar' },
                  { icon: Camera, text: 'Ver camaras en directo y grabaciones' },
                  { icon: Bell, text: 'Alertas push instantaneas con foto' },
                  { icon: Users, text: 'Gestionar usuarios y permisos' },
                  { icon: MapPin, text: 'GPS de relojes Sentinel en tiempo real' },
                  { icon: Watch, text: 'Compatible con Sentinel X, J y S' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-4 h-4 text-blue-700" />
                    </div>
                    <span className="text-sm text-gray-700">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <img src={IMG.appMockup} alt="App ManoProtect" className="max-w-xs w-full rounded-3xl shadow-2xl" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SENTINEL SOS ═══ */}
      <section className="py-20 bg-gradient-to-b from-gray-950 to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">EXCLUSIVO MANOPROTECT</span>
              <h2 className="text-3xl font-black text-white mt-2 mb-4 tracking-tight">Reloj Sentinel SOS incluido</h2>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Ningun competidor incluye esto. Con cada kit recibes relojes Sentinel con GPS, boton SOS 
                y E-SIM integrada. Funciona sin movil. Conectado al mismo centro de control 24h.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {['Boton SOS 24h', 'GPS tiempo real', 'E-SIM integrada', 'Sensor cardiaco', 'Alerta caida', 'Arma/desarma alarma'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
                    <Check className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                    <span className="text-xs text-white font-medium">{f}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Link to="/productos" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full text-xs font-bold hover:shadow-lg transition-all flex items-center gap-2" data-testid="ver-sentinel-link">
                  Ver relojes Sentinel <ArrowRight className="w-3 h-3" />
                </Link>
                <span className="text-gray-500 text-xs self-center">Tambien sin alarma</span>
              </div>
            </div>
            <img src={IMG.sentinelTrio} alt="Relojes Sentinel X, J y S" className="rounded-3xl shadow-2xl max-w-lg w-full mx-auto" loading="lazy" />
          </div>
        </div>
      </section>

      {/* ═══ PRECIOS ═══ */}
      <section id="precios" className="py-20 bg-gray-50" data-testid="precios-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">Precios transparentes</h2>
            <p className="text-gray-500 text-sm">Sin letra pequena. Sin sorpresas. Equipo e instalacion GRATIS.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Essential', sub: 'Pisos', promo: '24,99', regular: '34,99', color: 'sky', link: '/alarmas/vivienda', items: ['2 camaras Full HD', '3 sensores PIR', '1 sirena exterior', '1 Sentinel SOS'] },
              { name: 'Premium', sub: 'Chalets y casas', promo: '39,99', regular: '49,99', color: 'orange', popular: true, link: '/alarmas/vivienda', items: ['6 camaras 2K + PTZ', '6 sensores PIR', 'Sirena 120dB + interior', 'Servicio de Acuda', '2 Sentinel SOS'] },
              { name: 'Business', sub: 'Negocios', promo: '54,99', regular: '69,99', color: 'emerald', link: '/alarmas/negocio', items: ['10 camaras 4K + PTZ', 'Control acceso biometrico', 'Grabacion 90 dias', 'Acuda prioritario', '3 Sentinel SOS'] },
            ].map((p, i) => (
              <div key={i} className={`bg-white rounded-3xl border-2 ${p.popular ? 'border-orange-400 shadow-xl' : 'border-gray-200'} overflow-hidden relative`} data-testid={`price-${p.name.toLowerCase()}`}>
                {p.popular && <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 text-xs font-bold tracking-wider">MAS VENDIDO</div>}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                  <p className="text-gray-400 text-xs mb-3">{p.sub}</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black text-gray-900">{p.promo}</span>
                    <span className="text-gray-500 text-sm mb-1">EUR/mes</span>
                  </div>
                  <p className="text-orange-500 text-xs font-bold">6 primeros meses (despues {p.regular} EUR)</p>
                  <p className="text-emerald-600 text-xs font-bold mb-4">Equipo + instalacion GRATIS</p>
                  <ul className="space-y-2 mb-5">
                    {p.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-gray-700">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/calculador" className={`block w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all text-white ${p.popular ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg' : 'bg-gray-900 hover:bg-gray-800'}`}>
                    Calcular mi precio
                  </Link>
                  <Link to={p.link} className="block text-center text-xs text-gray-400 hover:text-blue-600 font-bold mt-2">Ver detalles</Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-xs mt-6">Solo quieres los relojes Sentinel? <Link to="/productos" className="text-blue-600 font-bold hover:underline">Compralos sin alarma</Link></p>
        </div>
      </section>

      {/* ═══ VS COMPETENCIA ═══ */}
      <section className="py-20 bg-white" data-testid="vs-competencia">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-10 tracking-tight">ManoProtect vs Securitas Direct vs Prosegur</h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase w-[30%]"></th>
                  <th className="text-center p-4 bg-blue-50"><div className="text-blue-700 text-xs font-bold">ManoProtect</div></th>
                  <th className="text-center p-4"><div className="text-gray-500 text-xs font-bold">Securitas Direct</div></th>
                  <th className="text-center p-4"><div className="text-gray-500 text-xs font-bold">Prosegur</div></th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: 'Desde', mp: '24,99 EUR/mes', sd: '39,89 EUR/mes', pg: '44,90 EUR/mes' },
                  { f: 'Permanencia', mp: 'SIN permanencia', sd: '24 meses', pg: '24-36 meses' },
                  { f: 'Equipo', mp: 'GRATIS', sd: '149 EUR', pg: 'Incluido' },
                  { f: 'Camaras kit basico', mp: '2 Full HD IA', sd: '1 basica', pg: '1 basica' },
                  { f: 'IA en camaras', mp: true, sd: false, pg: false },
                  { f: 'Reloj SOS incluido', mp: true, sd: false, pg: false },
                  { f: 'Anti-inhibicion', mp: true, sd: true, pg: true },
                  { f: 'Funciona sin movil', mp: true, sd: false, pg: false },
                  { f: 'App gratuita', mp: true, sd: true, pg: true },
                  { f: 'Aviso a Policia', mp: true, sd: true, pg: true },
                ].map((r, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="p-3 text-xs font-medium text-gray-700">{r.f}</td>
                    <td className="p-3 text-center bg-blue-50/30">
                      {r.mp === true ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : r.mp === false ? <X className="w-4 h-4 text-red-400 mx-auto" /> : <span className="text-xs font-bold text-blue-700">{r.mp}</span>}
                    </td>
                    <td className="p-3 text-center">
                      {r.sd === true ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : r.sd === false ? <X className="w-4 h-4 text-red-400 mx-auto" /> : <span className="text-xs font-medium text-gray-600">{r.sd}</span>}
                    </td>
                    <td className="p-3 text-center">
                      {r.pg === true ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : r.pg === false ? <X className="w-4 h-4 text-red-400 mx-auto" /> : <span className="text-xs font-medium text-gray-600">{r.pg}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-20 bg-gray-50" data-testid="faq-section">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-10 tracking-tight">Preguntas frecuentes</h2>
          <div className="space-y-2">
            {faqs.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors" data-testid={`faq-${i}`}>
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
      <section className="py-16 bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">Calcula tu alarma ahora</h2>
          <p className="text-white/80 mb-8 text-sm max-w-xl mx-auto">Presupuesto personalizado en 30 segundos. Sin compromiso. Sin permanencia. Equipo e instalacion GRATIS.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/calculador" className="bg-white text-red-600 px-10 py-4 rounded-full font-bold text-sm hover:shadow-2xl transition-all hover:scale-105" data-testid="cta-final-calc">
              Calcular mi alarma GRATIS
            </Link>
            <a href="tel:+34601510950" className="bg-white/15 hover:bg-white/25 text-white px-10 py-4 rounded-full font-bold text-sm border border-white/30 flex items-center gap-2 transition-all">
              <Phone className="w-4 h-4" /> 601 510 950
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default AlarmasSecuritasStyle;
