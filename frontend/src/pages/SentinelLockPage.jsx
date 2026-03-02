/**
 * ManoProtect Sentinel Lock - Cerradura Inteligente Autónoma
 * Producto independiente con detección de intrusión avanzada
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Shield, Lock, Wifi, WifiOff, Bell, MapPin, Cpu, Radio, AlertTriangle, CheckCircle, ChevronRight, Phone, Zap, Eye, Activity, Smartphone, Signal } from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

const SPECS = [
  { icon: WifiOff, title: 'Autonoma al 100%', desc: 'Funciona sin WiFi, sin internet, sin corriente electrica. Totalmente independiente de tu red domestica.' },
  { icon: Radio, title: 'NB-IoT / LTE-M', desc: 'Comunicacion celular industrial directa con redes 5G/4G. Bajo consumo y alta penetracion incluso en sotanos y puertas blindadas.' },
  { icon: Cpu, title: 'IA de deteccion', desc: 'Chip interno con inteligencia artificial que diferencia golpes accidentales de ataques reales. Cero falsas alarmas.' },
  { icon: Activity, title: 'Acelerometro de precision', desc: 'Sensores de vibracion de alta precision que detectan taladro, palanca, martillo y cualquier fuerza bruta.' },
  { icon: Lock, title: 'Sensor de continuidad', desc: 'Malla de micro-conductores en el cuerpo de la cerradura. Si se perfora o rompe la estructura metalica, alerta instantanea.' },
  { icon: Zap, title: 'Sensor de presion en cilindro', desc: 'Detecta extraccion del cilindro y tecnicas de bumping monitorizando la presion interna.' },
  { icon: Signal, title: 'eSIM integrada', desc: 'SIM virtual de fabrica preconfigurada para conectar con la Central ManoProtect. Sin configuracion del usuario.' },
  { icon: MapPin, title: 'Geolocalizacion', desc: 'Cell-ID + GPS asistido. Envia ubicacion exacta (calle, numero, ciudad, CP) configurada en la instalacion profesional.' },
];

const ALERT_STEPS = [
  { num: '01', title: 'Deteccion', desc: 'Sensores detectan ataque fisico (rotura, manipulacion violenta, taladro, bumping)', color: 'text-red-500' },
  { num: '02', title: 'Procesamiento IA', desc: 'Chip interno confirma intrusion real mediante analisis de inteligencia artificial', color: 'text-amber-500' },
  { num: '03', title: 'Transmision NB-IoT', desc: 'Alerta enviada a la Central ManoProtect via red celular industrial en milisegundos', color: 'text-blue-500' },
  { num: '04', title: 'Verificacion CRA', desc: 'Central Receptora verifica la senal en segundos segun protocolo regulado (Ley 5/2014)', color: 'text-indigo-500' },
  { num: '05', title: 'Aviso a Policia', desc: 'Envio inmediato de ubicacion y datos del cliente a las autoridades competentes', color: 'text-emerald-500' },
];

const SentinelLockPage = () => {
  const [activeSpec, setActiveSpec] = useState(null);

  return (
    <div className="min-h-screen bg-gray-950" data-testid="sentinel-lock-page">
      <Helmet>
        <title>Sentinel Lock | Cerradura Inteligente Autonoma | ManoProtect</title>
        <meta name="description" content="Sentinel Lock: cerradura inteligente autonoma con deteccion de intrusion por IA, sensores de vibracion, comunicacion NB-IoT y aviso directo a Policia. Sin WiFi. Sin corriente. Maxima seguridad." />
      </Helmet>

      {/* Header */}
      <header className="bg-gray-950/90 backdrop-blur border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div><span className="text-white font-bold">ManoProtect</span></Link>
          <div className="flex items-center gap-3">
            <Link to="/plans" className="text-gray-400 hover:text-white text-sm">Planes</Link>
            <a href="tel:+34601510950" className="text-sm text-gray-400 hover:text-emerald-400 hidden sm:flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> 601 510 950</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 30%, #10B981 0%, transparent 50%)' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-bold tracking-wider">SENTINEL LOCK — CERRADURA INTELIGENTE AUTONOMA</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-tight" data-testid="sentinel-lock-title">
              La cerradura que <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">llama a la policia</span> por ti
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-3">
              Deteccion de intrusion por IA. Comunicacion celular directa. Sin WiFi. Sin corriente. Aviso inmediato a la Central y a las autoridades.
            </p>
            <p className="text-emerald-400 text-sm font-bold mb-8">Compatible con todos los planes de alarma ManoProtect</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contacto" className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl transition-all text-sm" data-testid="lock-cta-contact">
                Solicitar instalacion <ChevronRight className="w-4 h-4" />
              </Link>
              <a href="tel:+34601510950" className="inline-flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-600 text-white font-bold px-8 py-4 rounded-xl transition-all text-sm">
                <Phone className="w-4 h-4" /> 601 510 950
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 bg-red-500/5 border-y border-red-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-white mb-2">El problema de las cerraduras convencionales</h2>
            <p className="text-gray-400 text-sm">Una cerradura normal no detecta, no avisa, no protege. Solo se rompe.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: 'No detectan', desc: 'Un ladron puede taladrar, hacer bumping o forzar sin que nadie se entere' },
              { title: 'No avisan', desc: 'Aunque se rompa, nadie recibe una alerta. Dependes de que alguien oiga' },
              { title: 'No son autonomas', desc: 'Si cortan la luz o el WiFi, tu alarma queda ciega. La cerradura tambien' },
            ].map((p, i) => (
              <div key={i} className="bg-gray-900/60 border border-red-500/10 rounded-xl p-5 text-center">
                <h3 className="text-white font-bold text-sm mb-2">{p.title}</h3>
                <p className="text-gray-400 text-xs">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specs Grid */}
      <section className="py-16" data-testid="specs-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">Tecnologia de grado militar</h2>
            <p className="text-gray-400 text-sm">8 tecnologias integradas en una sola cerradura</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SPECS.map((s, i) => (
              <div key={i} className="bg-gray-900/60 border border-gray-800 hover:border-emerald-500/30 rounded-xl p-5 transition-all cursor-pointer group" onClick={() => setActiveSpec(activeSpec === i ? null : i)} data-testid={`spec-${i}`}>
                <s.icon className="w-6 h-6 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-sm mb-1">{s.title}</h3>
                <p className={`text-gray-500 text-xs transition-all ${activeSpec === i ? 'text-gray-300' : ''}`}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-900/50" data-testid="alert-flow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">Como funciona la alerta</h2>
            <p className="text-gray-400 text-sm">De la deteccion a la policia en segundos</p>
          </div>
          <div className="space-y-4">
            {ALERT_STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-4 bg-gray-900/60 border border-gray-800 rounded-xl p-5" data-testid={`step-${step.num}`}>
                <div className={`text-2xl font-black ${step.color} w-12 text-center flex-shrink-0`}>{step.num}</div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-0.5">{step.title}</h3>
                  <p className="text-gray-400 text-xs">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-2xl p-6 text-center">
            <Shield className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">Cumplimiento legal garantizado</h3>
            <p className="text-gray-400 text-sm mb-3">Segun la <strong className="text-white">Ley 5/2014 de Seguridad Privada</strong>, para que la Policia acuda a tu domicilio, la senal de alarma debe ser verificada por una Central Receptora de Alarmas (CRA) homologada.</p>
            <p className="text-indigo-400 text-xs font-bold">Sentinel Lock conecta directamente con nuestra CRA autorizada. Instalacion obligatoria por tecnico de empresa de seguridad homologada.</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Ventajas para el cliente</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Proteccion total', desc: 'No solo bloquea. Detecta, analiza, avisa y disuade. La primera linea de defensa activa de tu hogar.' },
              { icon: WifiOff, title: 'Autonomia absoluta', desc: 'Aunque corten la luz, el internet o la linea telefonica, Sentinel Lock sigue funcionando y avisando.' },
              { icon: Bell, title: 'Disuasion activa', desc: 'Emite alarma sonora al detectar la primera manipulacion. El ladron huye antes de entrar.' },
            ].map((b, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><b.icon className="w-7 h-7 text-emerald-400" /></div>
                <h3 className="text-white font-bold text-sm mb-2">{b.title}</h3>
                <p className="text-gray-400 text-xs">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16" data-testid="lock-pricing">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-emerald-500/30 rounded-3xl p-8 text-center">
            <Lock className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-1">Sentinel Lock</h3>
            <p className="text-gray-400 text-xs mb-4">Cerradura inteligente autonoma</p>
            <div className="mb-2">
              <span className="text-4xl font-black text-white">249</span>
              <span className="text-gray-400 text-lg ml-1">EUR</span>
            </div>
            <p className="text-emerald-400 text-xs font-bold mb-1">+ Plan de monitorizacion desde 9,99 EUR/mes</p>
            <p className="text-gray-500 text-[10px] mb-6">Instalacion profesional GRATIS. Compatible con todos los planes de alarma.</p>
            <ul className="text-left space-y-2 mb-6">
              {['Deteccion IA anti-intrusion', 'Comunicacion NB-IoT autonoma', 'eSIM de fabrica preconfigurada', 'Sensores vibracion + continuidad + presion', 'Geolocalizacion GPS + Cell-ID', 'Conexion directa con CRA 24h', 'Alarma sonora disuasoria', 'Instalacion profesional GRATIS', 'Refiere = 1 mes GRATIS de plan'].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <Link to="/contacto" className="block w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-sm transition-colors" data-testid="lock-cta-buy">
              Solicitar Sentinel Lock
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-emerald-500/5 border-t border-emerald-500/10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Protege la primera barrera de tu hogar</h2>
          <p className="text-gray-400 text-sm mb-6">La puerta es el primer punto de ataque. Con Sentinel Lock, es tambien el primer punto de defensa.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contacto" className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl text-sm" data-testid="lock-final-cta">Pedir presupuesto GRATIS <ChevronRight className="w-4 h-4" /></Link>
            <Link to="/plans" className="inline-flex items-center justify-center gap-2 border border-gray-700 text-white font-bold px-8 py-4 rounded-xl text-sm">Ver todos los planes</Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default SentinelLockPage;
