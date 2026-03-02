/**
 * ManoProtect - Alarmas para Viviendas (Detalle)
 * Pisos, chalets, adosados, casas - como Securitas Direct pero mejor
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LandingFooter from '@/components/landing/LandingFooter';
import {
  Shield, Home, Camera, Wifi, Lock, Phone, Check, ArrowRight,
  Eye, Zap, Radio, Smartphone, Volume2, Watch, ChevronDown,
  Sparkles, Award, Star, Fingerprint, ThermometerSun, Droplets
} from 'lucide-react';

const IMG = {
  villaHero: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/e164cb2cf3f4f9c1c618577b32e96516dbba057689cb6c8e981cb8b78626d495.png',
  apartment: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/3491f38335afcb9caf468ea266417ef144e075a365d6a5fe69e676315b6942b6.png',
  premiumKit: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/13a8f09b29ff0fec2ceadd8b852434aa2c738e869179e58e98faadeb177de21f.png',
  remotes: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/f4721d2b816f8bb98503fc2adb37dfca8c7517e980a3faba23bd4a409699ce8d.png',
  siren: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/02324e10765dca960e91cd4c4dbacf1a487b245ad51052895887387edf5dd09f.png',
  controlPanel: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/72857182df814237ec3f71996472c4b706658084f7b96563893f7a9a5b5c7b03.png',
  camera4k: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/8a6899331a0b3e75e77e08787983a097a23c215b55cc150a3cecb45c6af975bc.png',
  sentinelWatch: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/7a282e42d9edfe3137fe6fd41329b2d34711dfa503f2395b7bd399d6e13437e8.png',
  sentinelTrio: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/16e97d0972346860b882ddea3662703ffc3438f28eae4e99da63bf51db6b6e60.png',
};

const PLANS = [
  {
    id: 'essential',
    name: 'Essential',
    target: 'Pisos y apartamentos',
    monthly: 44.90,
    promo: 33.90,
    color: 'sky',
    popular: false,
    equipment: [
      'Hub inteligente pantalla tactil 7"',
      '2 camaras IP Full HD vision nocturna',
      '3 sensores movimiento PIR anti-mascotas',
      '2 contactos magneticos puerta/ventana',
      '1 sirena exterior 110dB flash LED',
      '1 mando premium LED azul',
      '1 detector de humo inteligente',
      'Conexion 4G + WiFi + Ethernet',
    ],
    services: [
      'Centro de control 24h (CRA)',
      'Verificacion por video con IA',
      'App ManoProtect completa',
      'Anti-inhibicion multi-frecuencia',
      'Aviso a policia y bomberos',
      '1 Sentinel X de REGALO',
      'Refiere un vecino = 1 mes GRATIS',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    target: 'Chalets, adosados y casas',
    monthly: 54.90,
    promo: 44.90,
    color: 'orange',
    popular: true,
    equipment: [
      'Hub Pro pantalla tactil 10" HD',
      '4 camaras IP 2K con IA deteccion',
      '2 camaras PTZ exterior 360 grados',
      '6 sensores PIR anti-mascotas 25kg',
      '4 contactos magneticos puerta/ventana',
      '2 sirenas: exterior 120dB + interior',
      '2 mandos premium (negro y dorado)',
      'Teclado RFID codigo + tarjeta',
      'Detector humo + CO2 + inundacion',
      'Conexion 4G dual SIM + WiFi + Ethernet',
    ],
    services: [
      'Centro de control 24h Premium (CRA)',
      'Verificacion video IA avanzada',
      'Servicio de Acuda (vigilante 15 min)',
      'App ManoProtect Premium',
      'Anti-inhibicion 17 frecuencias',
      'Aviso policia + bomberos + ambulancia',
      'Grabacion en la nube 30 dias',
      'Mantenimiento semestral',
      '2 Sentinel X de REGALO',
      'Refiere un vecino = 1 mes GRATIS',
    ],
  },
];

const AlarmasVivienda = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q: 'Cual es la diferencia entre Essential y Premium?', a: 'Essential esta pensado para pisos (2 camaras, 3 sensores). Premium para chalets y casas grandes (6 camaras, 6 sensores, servicio de Acuda con vigilante y mas detectores ambientales).' },
    { q: 'Es necesaria la instalacion profesional?', a: 'Es gratuita y recomendada. Un tecnico certifica que todo funciona y te ensena la app. Si prefieres, puedes auto-instalar con nuestra guia paso a paso.' },
    { q: 'Puedo anadir mas componentes despues?', a: 'Si. Nuestro sistema es modular. Puedes anadir camaras, sensores o sirenas en cualquier momento. Hasta 100 dispositivos conectados.' },
    { q: 'Funciona con mascotas grandes?', a: 'Si. Los sensores PIR anti-mascotas ignoran animales de hasta 25 kg. Para mascotas mas grandes, usamos zonas de exclusion por camara con IA.' },
    { q: 'Como cancelo si no quiero seguir?', a: 'Llamas, nos escribes o desde la app. Sin penalizacion, sin preguntas. El equipo se recoge sin coste.' },
    { q: 'Puedo contratar solo los relojes Sentinel?', a: 'Absolutamente. Los Sentinel X, J y S funcionan de forma independiente con su propio plan. Ve a la seccion de productos para contratarlos sin alarma de hogar.' },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="alarmas-vivienda">
      <Helmet>
        <title>Alarmas para Viviendas | ManoProtect - Pisos, Chalets y Casas</title>
        <meta name="description" content="Alarma para tu vivienda desde 24,99 EUR/mes. SIN permanencia. Camaras IA, centro 24h, Sentinel SOS incluido. Mejor que Securitas Direct." />
      </Helmet>

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md shadow-blue-200"><Shield className="w-5 h-5 text-white" /></div>
            <span className="text-gray-900 text-lg font-extrabold">ManoProtect</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/alarmas/vivienda" className="text-blue-700 font-bold">Viviendas</Link>
            <Link to="/alarmas/negocio" className="text-gray-600 hover:text-blue-700">Negocios</Link>
            <Link to="/productos" className="text-gray-600 hover:text-blue-700">Relojes Sentinel</Link>
            <Link to="/contacto" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-full text-xs font-bold hover:shadow-lg transition-all">Pedir presupuesto</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.villaHero} alt="Villa protegida" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 px-3 py-1.5 rounded-full mb-5">
              <Home className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-bold text-blue-300 tracking-wider">ALARMAS PARA VIVIENDAS</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-[1.1] tracking-tight" data-testid="hero-title">
              Tu hogar, <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">blindado</span>
            </h1>
            <p className="text-base text-gray-300 mb-6 leading-relaxed">
              Pisos, chalets, adosados y casas. Camaras IA, sensores anti-mascotas, centro de control 24h 
              y Sentinel SOS de regalo. <strong className="text-white">SIN permanencia</strong>.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#planes" className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-full font-bold text-sm transition-all hover:shadow-xl flex items-center gap-2">
                Ver planes vivienda <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="tel:+34601510950" className="bg-white/10 text-white px-8 py-4 rounded-full font-bold text-sm border border-white/20">
                601 510 950
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What's included visual */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12 tracking-tight">Que incluye tu kit de alarma</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { img: IMG.controlPanel, name: 'Centralita Hub', desc: 'Pantalla tactil, sirena integrada, bateria 24h, triple conexion.' },
              { img: IMG.camera4k, name: 'Camaras IP con IA', desc: 'Vision nocturna, deteccion de personas, audio bidireccional.' },
              { img: IMG.siren, name: 'Sirena Exterior', desc: 'Hasta 120dB con flash LED. Resistente IP65. Disuasion total.' },
              { img: IMG.remotes, name: 'Mandos Premium', desc: 'Tres acabados de lujo. Boton de panico. Arma/desarma con un toque.' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all group" data-testid={`equip-${i}`}>
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{c.name}</h3>
                  <p className="text-xs text-gray-500">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Eye, name: 'Sensores PIR', desc: 'Anti-mascotas hasta 25kg. Cobertura 12m, 90 grados.' },
              { icon: Lock, name: 'Contactos Magneticos', desc: 'Para puertas y ventanas. Ultra-fino, adhesivo.' },
              { icon: ThermometerSun, name: 'Detector Humo/CO2', desc: 'Alerta inmediata por humo, monoxido y temperatura.' },
              { icon: Droplets, name: 'Sensor Inundacion', desc: 'Detecta fugas de agua al instante. Plan Premium.' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all">
                <c.icon className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-bold text-gray-900 text-sm mb-1">{c.name}</h3>
                <p className="text-xs text-gray-500">{c.desc}</p>
              </div>
            ))}
          </div>
          {/* Full kit image */}
          <div className="mt-10 rounded-3xl overflow-hidden shadow-2xl shadow-gray-200">
            <img src={IMG.premiumKit} alt="Kit completo ManoProtect" className="w-full" loading="lazy" />
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planes" className="py-20 bg-gray-950" data-testid="planes-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Planes para viviendas</h2>
            <p className="text-gray-400 text-sm">Equipo + instalacion GRATIS. SIN permanencia. Sentinel SOS incluido.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {PLANS.map((plan) => (
              <div key={plan.id} className={`rounded-3xl overflow-hidden ${plan.popular ? 'ring-2 ring-orange-500' : 'ring-1 ring-gray-800'} bg-gray-900`} data-testid={`plan-${plan.id}`}>
                <div className={`py-2.5 text-center text-xs font-bold tracking-wider ${plan.popular ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                  {plan.popular ? 'MAS VENDIDO' : 'MEJOR PRECIO'}
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-gray-400 text-xs mb-4">{plan.target}</p>
                  <div className="mb-6">
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black text-white">{plan.promo}</span>
                      <span className="text-gray-500 text-base mb-1">EUR/mes</span>
                    </div>
                    <p className="text-orange-400 text-xs font-bold mt-1">6 primeros meses (despues {plan.monthly} EUR/mes)</p>
                    <p className="text-emerald-400 text-xs font-bold">Equipo e instalacion GRATIS</p>
                  </div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-3">EQUIPO INCLUIDO</p>
                  <ul className="space-y-2 mb-5">
                    {plan.equipment.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" /><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-3">SERVICIOS INCLUIDOS</p>
                  <ul className="space-y-2 mb-6">
                    {plan.services.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <Star className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" /><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => navigate('/contacto')}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition-all text-white ${plan.popular ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg hover:shadow-orange-500/30' : 'bg-blue-600 hover:bg-blue-700'}`}
                    data-testid={`cta-${plan.id}`}>
                    Solicitar instalacion GRATIS
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-xs mt-6">Solo quieres los relojes? <Link to="/productos" className="text-blue-400 font-bold hover:underline">Compra Sentinel sin alarma</Link></p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12 tracking-tight">Como funciona la instalacion</h2>
          <div className="grid sm:grid-cols-4 gap-8">
            {[
              { n: '1', icon: Phone, title: 'Nos llamas', desc: 'Estudio de seguridad gratuito y presupuesto personalizado en 24h.' },
              { n: '2', icon: Zap, title: 'Instalacion', desc: 'Tecnico profesional en tu casa. Sin obras. Menos de 2 horas.' },
              { n: '3', icon: Radio, title: 'Conexion CRA', desc: 'Tu alarma queda conectada al centro de control 24 horas.' },
              { n: '4', icon: Smartphone, title: 'App lista', desc: 'Controla todo desde tu movil y tu Sentinel SOS.' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="relative w-16 h-16 bg-gray-950 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <s.icon className="w-7 h-7 text-white" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">{s.n}</div>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sentinel Integration */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <img src={IMG.sentinelWatch} alt="Sentinel controla tu alarma" className="rounded-3xl shadow-xl max-w-md w-full mx-auto" loading="lazy" />
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4">Controla tu alarma desde la muneca</h2>
              <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                El Sentinel SOS que viene incluido con tu kit te permite armar/desarmar la alarma, 
                ver el estado en tiempo real y activar el boton de emergencia desde tu muneca.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {['Armar/Desarmar', 'Ver camaras', 'Boton SOS', 'GPS familiar', 'E-SIM integrada', 'Alertas push'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white rounded-lg p-3 border border-gray-100">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-xs text-gray-700 font-medium">{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/productos" className="inline-flex items-center gap-2 text-blue-600 text-xs font-bold mt-4 hover:underline">
                Tambien puedes comprar Sentinel sin alarma <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">Preguntas sobre alarmas de vivienda</h2>
          <div className="space-y-2" data-testid="faq-section">
            {faqs.map((item, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-100 transition-colors">
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
      <section className="py-14 bg-gradient-to-r from-blue-700 to-cyan-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-black mb-3">Protege tu vivienda desde 24,99 EUR/mes</h2>
          <p className="text-blue-100 mb-6 text-sm">Equipo GRATIS. SIN permanencia. Sentinel SOS de regalo.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/contacto" className="bg-white text-blue-700 px-8 py-4 rounded-full font-bold text-sm hover:shadow-xl transition-all" data-testid="cta-bottom">
              Solicitar presupuesto GRATIS
            </Link>
            <Link to="/alarmas/negocio" className="bg-white/15 text-white px-8 py-4 rounded-full font-bold text-sm border border-white/30">
              Ver alarmas negocio
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default AlarmasVivienda;
