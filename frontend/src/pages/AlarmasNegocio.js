/**
 * ManoProtect - Alarmas para Negocios (Detalle)
 * Locales, naves, oficinas, comercios
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LandingFooter from '@/components/landing/LandingFooter';
import {
  Shield, Building2, Camera, Lock, Phone, Check, ArrowRight,
  Eye, Zap, Radio, Smartphone, Volume2, Watch, ChevronDown,
  Sparkles, Star, Fingerprint, Users, Globe, Key
} from 'lucide-react';

const IMG = {
  businessLobby: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/849e086aebf89bbc87613eecc7dd2e68ad9829e7f3df9e73c316cb6968ad6176.png',
  warehouse: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/d5b3ee6bbfe8654c951190925530016926f3d28ff3b43f8772f9590a60b21930.png',
  premiumKit: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/13a8f09b29ff0fec2ceadd8b852434aa2c738e869179e58e98faadeb177de21f.png',
  camera4k: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/8a6899331a0b3e75e77e08787983a097a23c215b55cc150a3cecb45c6af975bc.png',
  controlPanel: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/72857182df814237ec3f71996472c4b706658084f7b96563893f7a9a5b5c7b03.png',
  sentinelTrio: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/16e97d0972346860b882ddea3662703ffc3438f28eae4e99da63bf51db6b6e60.png',
  remotes: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/f4721d2b816f8bb98503fc2adb37dfca8c7517e980a3faba23bd4a409699ce8d.png',
};

const BUSINESS_TYPES = [
  { icon: Building2, name: 'Locales comerciales', desc: 'Tiendas, restaurantes, farmacias, talleres' },
  { icon: Globe, name: 'Oficinas', desc: 'Despachos, coworkings, consultas medicas' },
  { icon: Key, name: 'Naves industriales', desc: 'Almacenes, fabricas, logistica' },
  { icon: Users, name: 'Franquicias', desc: 'Gestion multi-sede desde una sola app' },
];

const AlarmasNegocio = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q: 'Que tipo de negocios protegeis?', a: 'Todo tipo: locales comerciales, restaurantes, oficinas, despachos, naves industriales, almacenes, farmacias, talleres, franquicias multi-sede, consultas medicas, gimnasios y cualquier espacio profesional.' },
    { q: 'Incluye control de acceso para empleados?', a: 'Si. El sistema incluye lector biometrico (huella dactilar) + tarjetas RFID. Puedes gestionar horarios, permisos y registros de acceso de empleados desde la app.' },
    { q: 'Puedo ver las camaras desde cualquier lugar?', a: 'Si. La app ManoProtect Business te permite ver todas las camaras en directo, revisar grabaciones de los ultimos 90 dias, y gestionar varias sedes desde una sola cuenta.' },
    { q: 'Que es el servicio de Acuda prioritario?', a: 'Cuando se confirma una intrusion, ademas de avisar a policia, enviamos un vigilante de seguridad armado a tu negocio en menos de 10 minutos. Disponible 24/7.' },
    { q: 'Necesito cerrar el negocio para la instalacion?', a: 'No necesariamente. Podemos instalar fuera del horario comercial o los fines de semana sin coste extra. La instalacion dura 3-4 horas para un negocio medio.' },
    { q: 'Gestionais varias sedes?', a: 'Si. Con ManoProtect Business puedes controlar todas tus sedes desde una sola app. Dashboard multi-sede con alertas independientes por ubicacion.' },
    { q: 'Puedo contratar solo relojes Sentinel para mis empleados?', a: 'Si. Los Sentinel SOS se contratan por separado. Ideal para vigilantes, repartidores o trabajadores en solitario. Ve a productos para mas info.' },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="alarmas-negocio">
      <Helmet>
        <title>Alarmas para Negocios | ManoProtect - Locales, Naves y Oficinas</title>
        <meta name="description" content="Alarma profesional para tu negocio desde 54,99 EUR/mes. Camaras 4K con IA, control acceso biometrico, centro 24h, servicio Acuda. SIN permanencia." />
      </Helmet>

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md shadow-blue-200"><Shield className="w-5 h-5 text-white" /></div>
            <span className="text-gray-900 text-lg font-extrabold">ManoProtect</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/alarmas/vivienda" className="text-gray-600 hover:text-blue-700">Viviendas</Link>
            <Link to="/alarmas/negocio" className="text-emerald-700 font-bold">Negocios</Link>
            <Link to="/productos" className="text-gray-600 hover:text-blue-700">Relojes Sentinel</Link>
            <Link to="/contacto" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-full text-xs font-bold hover:shadow-lg transition-all">Pedir presupuesto</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.businessLobby} alt="Negocio protegido" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 px-3 py-1.5 rounded-full mb-5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-300 tracking-wider">ALARMAS PARA NEGOCIOS</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-[1.1] tracking-tight" data-testid="hero-title">
              Tu negocio, <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">protegido 24/7</span>
            </h1>
            <p className="text-base text-gray-300 mb-6 leading-relaxed">
              Locales, naves, oficinas y comercios. Camaras 4K con IA, control de acceso biometrico, 
              servicio de Acuda prioritario y monitorizacion 24h. <strong className="text-white">SIN permanencia</strong>.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#plan" className="group bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-full font-bold text-sm transition-all hover:shadow-xl flex items-center gap-2">
                Ver plan Business <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="tel:+34601510950" className="bg-white/10 text-white px-8 py-4 rounded-full font-bold text-sm border border-white/20">
                601 510 950
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Business types */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-10 tracking-tight">Proteccion para todo tipo de negocio</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BUSINESS_TYPES.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-emerald-200 transition-all text-center" data-testid={`btype-${i}`}>
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <t.icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{t.name}</h3>
                <p className="text-xs text-gray-500">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12 tracking-tight">Equipamiento empresarial avanzado</h2>
          <div className="grid lg:grid-cols-2 gap-8 items-center mb-12">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img src={IMG.warehouse} alt="Nave industrial protegida" className="w-full" loading="lazy" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tecnologia de nivel bancario</h3>
              <div className="space-y-4">
                {[
                  { icon: Camera, title: 'Camaras 4K con IA', desc: 'Deteccion inteligente de personas, vehiculos y comportamientos sospechosos. PTZ 360 grados con zoom 30x.' },
                  { icon: Fingerprint, title: 'Control acceso biometrico', desc: 'Lector de huella dactilar + tarjetas RFID. Registro de entradas/salidas de empleados.' },
                  { icon: Eye, title: 'Videoportero facial', desc: 'Reconocimiento facial para permitir/denegar acceso. Comunicacion bidireccional.' },
                  { icon: Volume2, title: 'Sirenas 130dB', desc: 'Sirenas interiores y exteriores con flash estroboscopico. Maxima disuasion.' },
                  { icon: Radio, title: 'Hub Enterprise redundante', desc: 'Doble hub con 4G dual + WiFi 6 + Ethernet x2. Bateria 48h. Anti-inhibicion Grado 3.' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{f.title}</h4>
                      <p className="text-xs text-gray-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { img: IMG.camera4k, name: 'Camaras PTZ 4K', desc: '360 grados, vision nocturna, deteccion IA de personas' },
              { img: IMG.controlPanel, name: 'Hub Enterprise', desc: 'Pantalla 10", 4G dual, WiFi 6, bateria 48h' },
              { img: IMG.remotes, name: 'Mandos y control', desc: 'Mandos premium + teclado + control biometrico' },
            ].map((c, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{c.name}</h3>
                  <p className="text-xs text-gray-500">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Plan */}
      <section id="plan" className="py-20 bg-gray-950" data-testid="plan-section">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Plan ManoProtect Business</h2>
            <p className="text-gray-400 text-sm">El kit de seguridad mas completo del mercado para negocios.</p>
          </div>
          <div className="rounded-3xl overflow-hidden ring-2 ring-emerald-500 bg-gray-900 shadow-2xl shadow-emerald-500/10">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center py-3 text-sm font-bold tracking-wider">PLAN EMPRESARIAL - TODO INCLUIDO</div>
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="flex items-end justify-center gap-2">
                  <span className="text-6xl font-black text-white">54,99</span>
                  <span className="text-gray-400 text-lg mb-2">EUR/mes</span>
                </div>
                <p className="text-orange-400 text-sm font-bold mt-1">6 primeros meses (despues 69,99 EUR/mes)</p>
                <p className="text-emerald-400 text-xs font-bold mt-1">Equipo + instalacion profesional GRATIS</p>
                <p className="text-red-400 text-xs font-bold mt-1">SIN permanencia. Cancela cuando quieras.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-3">EQUIPO INCLUIDO</p>
                  <ul className="space-y-2">
                    {[
                      'Hub Enterprise pantalla 10" + hub backup',
                      '6 camaras IP 4K IA deteccion personas',
                      '4 camaras PTZ exterior 360 grados IP67',
                      '10 sensores movimiento volumetricos',
                      '8 contactos magneticos puertas/ventanas',
                      'Control acceso biometrico (huella+RFID)',
                      'Videoportero IP reconocimiento facial',
                      '2 sirenas ext 130dB + 2 interiores',
                      'Detectores humo + CO2 + gas + inundacion',
                      'Conexion 4G dual + WiFi 6 + Ethernet x2',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" /><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-3">SERVICIOS INCLUIDOS</p>
                  <ul className="space-y-2">
                    {[
                      'Centro control 24h Enterprise (CRA)',
                      'Verificacion video + IA + reconocimiento',
                      'Servicio Acuda prioritario (10 min)',
                      'App ManoProtect Business multi-sede',
                      'Anti-inhibicion Grado 3 certificado',
                      'Custodia de llaves del negocio',
                      'Grabacion en la nube 90 dias',
                      'Mantenimiento preventivo trimestral',
                      '3 Sentinel X para propietarios/gerentes',
                      'Soporte tecnico prioritario 24/7',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <Star className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" /><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-8 space-y-3">
                <button onClick={() => navigate('/contacto')}
                  className="w-full py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                  data-testid="cta-business">
                  Solicitar presupuesto personalizado GRATIS
                </button>
                <p className="text-center text-gray-500 text-xs">Solo quieres Sentinel para tus empleados? <Link to="/productos" className="text-emerald-400 font-bold hover:underline">Compralo sin alarma</Link></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sentinel for business */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4">Sentinel SOS para tu equipo</h2>
              <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                Cada kit Business incluye 3 relojes Sentinel. Ideal para propietarios, gerentes o trabajadores 
                en solitario. Boton SOS conectado al centro 24h, GPS y alerta de caida.
              </p>
              <div className="space-y-2.5 mb-5">
                {['Boton SOS para emergencias laborales', 'GPS en tiempo real de empleados', 'Alerta de caida automatica', 'E-SIM integrada sin movil', 'Arma/desarma la alarma del negocio'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/productos" className="inline-flex items-center gap-2 text-emerald-600 text-xs font-bold hover:underline">
                Comprar Sentinel sin alarma <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <img src={IMG.sentinelTrio} alt="Sentinel para negocios" className="rounded-3xl shadow-xl max-w-md w-full mx-auto" loading="lazy" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">Preguntas sobre alarmas de negocio</h2>
          <div className="space-y-2" data-testid="faq-section">
            {faqs.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-gray-900 text-sm pr-4">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-gradient-to-r from-emerald-700 to-teal-700 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-black mb-3">Protege tu negocio desde 54,99 EUR/mes</h2>
          <p className="text-emerald-100 mb-6 text-sm">Equipo GRATIS. SIN permanencia. 3 Sentinel SOS incluidos.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/contacto" className="bg-white text-emerald-700 px-8 py-4 rounded-full font-bold text-sm hover:shadow-xl transition-all" data-testid="cta-bottom">
              Solicitar presupuesto GRATIS
            </Link>
            <Link to="/alarmas/vivienda" className="bg-white/15 text-white px-8 py-4 rounded-full font-bold text-sm border border-white/30">
              Ver alarmas vivienda
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default AlarmasNegocio;
