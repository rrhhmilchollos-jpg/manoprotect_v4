/**
 * ManoProtect Sentinel Lock - Cerradura Inteligente Autónoma
 * Producto independiente con detección de intrusión avanzada
 */
import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Shield, Lock, Wifi, WifiOff, Bell, MapPin, Cpu, Radio, AlertTriangle, CheckCircle, ChevronRight, Phone, Zap, Eye, Activity, Smartphone, Signal } from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

const IMG = {
  hero: 'https://static.prod-images.emergentagent.com/jobs/33b1d023-8b05-4946-8f90-203a20a655d6/images/6df0bd56a2e2507d52f33f8353bc833ef2ea53a475e923a0fdbd3abc765b03b6.png',
  exploded: 'https://static.prod-images.emergentagent.com/jobs/33b1d023-8b05-4946-8f90-203a20a655d6/images/96eb06330e61a96b0af3cc2627b0ee185761d5c9fcf015844cf4c8810ea93b74.png',
  installed: 'https://static.prod-images.emergentagent.com/jobs/33b1d023-8b05-4946-8f90-203a20a655d6/images/7cee4f876a4ee2d1cdc1fd28cd2b45644c7ab17ee2fed76abf8cb7ea4ca0b6ae.png',
  closeup: 'https://static.prod-images.emergentagent.com/jobs/33b1d023-8b05-4946-8f90-203a20a655d6/images/8c3ae3c8d5c793a1995dc5fa6d77771f48dd823ab100dfbc4051665b4625b980.png',
};

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
  { num: '01', title: 'Deteccion', desc: 'Sensores detectan ataque fisico (rotura, manipulacion violenta, taladro, bumping)', color: 'text-red-500', bg: 'bg-red-500' },
  { num: '02', title: 'Procesamiento IA', desc: 'Chip interno confirma intrusion real mediante analisis de inteligencia artificial', color: 'text-amber-500', bg: 'bg-amber-500' },
  { num: '03', title: 'Transmision NB-IoT', desc: 'Alerta enviada a la Central ManoProtect via red celular industrial en milisegundos', color: 'text-blue-500', bg: 'bg-blue-500' },
  { num: '04', title: 'Verificacion CRA', desc: 'Central Receptora verifica la senal en segundos segun protocolo regulado (Ley 5/2014)', color: 'text-indigo-500', bg: 'bg-indigo-500' },
  { num: '05', title: 'Aviso a Policia', desc: 'Envio inmediato de ubicacion y datos del cliente a las autoridades competentes', color: 'text-emerald-500', bg: 'bg-emerald-500' },
];

/* ─── INTERACTIVE DEMO COMPONENT ─── */
const InteractiveDemo = () => {
  const [activeStep, setActiveStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);

  const DEMO_STATES = [
    { label: 'Normal', status: 'ARMADA', led: 'bg-emerald-500', ring: 'ring-emerald-500/30', pulse: false, desc: 'Sentinel Lock en modo vigilancia. Todos los sensores activos. Sin actividad sospechosa.', icon: Shield },
    { label: 'Vibracion detectada', status: 'ANALIZANDO', led: 'bg-amber-400', ring: 'ring-amber-400/30', pulse: true, desc: 'Acelerometro detecta vibracion anormal. IA analiza el patron: taladro, palanca o golpe accidental?', icon: Activity },
    { label: 'Intrusion confirmada', status: 'ALERTA', led: 'bg-red-500', ring: 'ring-red-500/40', pulse: true, desc: 'IA confirma ataque real con 98.7% de confianza. Activando sirena disuasoria y transmision NB-IoT.', icon: AlertTriangle },
    { label: 'Transmitiendo a CRA', status: 'TRANSMITIENDO', led: 'bg-blue-500', ring: 'ring-blue-500/30', pulse: true, desc: 'Senal cifrada enviada a la Central Receptora de Alarmas via red celular NB-IoT. Latencia: 340ms.', icon: Radio },
    { label: 'Policia avisada', status: 'DESPACHO', led: 'bg-indigo-500', ring: 'ring-indigo-500/30', pulse: false, desc: 'CRA verifica y despacha a Policia Nacional. Ubicacion enviada: Calle ejemplo 15, 3B, Madrid, 28001.', icon: MapPin },
    { label: 'Resuelto', status: 'SEGURO', led: 'bg-emerald-500', ring: 'ring-emerald-500/30', pulse: false, desc: 'Intrusion neutralizada. Policia en el lugar. Sistema rearmado automaticamente. Tiempo total: 47 segundos.', icon: CheckCircle },
  ];

  const startDemo = () => {
    if (isPlaying) {
      clearInterval(timerRef.current);
      setIsPlaying(false);
      setActiveStep(-1);
      return;
    }
    setIsPlaying(true);
    setActiveStep(0);
    let step = 0;
    timerRef.current = setInterval(() => {
      step++;
      if (step >= DEMO_STATES.length) {
        clearInterval(timerRef.current);
        setIsPlaying(false);
        setActiveStep(-1);
      } else {
        setActiveStep(step);
      }
    }, 2800);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const current = activeStep >= 0 ? DEMO_STATES[activeStep] : null;
  const CurrentIcon = current?.icon || Shield;

  return (
    <section className="py-20 bg-gray-950 border-y border-gray-800" data-testid="interactive-demo">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4">
            <Eye className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-xs font-bold tracking-wider">DEMO INTERACTIVA EN TIEMPO REAL</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">Asi protege Sentinel Lock tu hogar</h2>
          <p className="text-gray-400 text-sm">Simulacion en tiempo real del sistema de deteccion IA</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Lock Visual */}
          <div className="relative flex items-center justify-center">
            <div className={`relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden border-2 transition-all duration-700 ${current ? current.ring + ' border-opacity-60' : 'ring-0 border-gray-800'}`}>
              <img
                src={IMG.closeup}
                alt="Sentinel Lock - Vista detalle"
                className="w-full h-full object-cover"
                width={320}
                height={320}
              />
              {/* LED overlay */}
              <div className={`absolute top-4 right-4 w-4 h-4 rounded-full transition-all duration-500 ${current ? current.led : 'bg-emerald-500'} ${current?.pulse ? 'animate-pulse' : ''}`} />
              {/* Status badge */}
              <div className={`absolute bottom-4 left-4 right-4 backdrop-blur-md rounded-xl px-4 py-3 transition-all duration-500 ${current ? 'bg-black/70' : 'bg-black/50'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${current ? current.led : 'bg-emerald-500'} ${current?.pulse ? 'animate-pulse' : ''}`} />
                  <span className="text-white text-xs font-bold tracking-wider">{current ? current.status : 'STANDBY'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls & Info */}
          <div>
            <button
              onClick={startDemo}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all mb-6 flex items-center justify-center gap-2 ${isPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}
              data-testid="demo-play-btn"
            >
              {isPlaying ? (
                <><span className="w-3 h-3 bg-white rounded-sm" /> Detener simulacion</>
              ) : (
                <><Eye className="w-4 h-4" /> Iniciar simulacion de intrusion</>
              )}
            </button>

            {/* Timeline */}
            <div className="space-y-2">
              {DEMO_STATES.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-500 border ${activeStep === i ? s.ring + ' bg-gray-900 border-gray-700' : 'bg-gray-900/30 border-gray-800/50 opacity-50'} ${activeStep > i ? 'opacity-70' : ''} ${activeStep === -1 ? '!opacity-100 !border-gray-800/50' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${activeStep === i ? s.led : 'bg-gray-800'}`}>
                    <s.icon className={`w-4 h-4 ${activeStep === i ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${activeStep === i ? 'text-white' : 'text-gray-400'}`}>{s.label}</p>
                    {activeStep === i && <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{s.desc}</p>}
                  </div>
                  {activeStep > i && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

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
            <Link to="/plataforma-cra" className="text-gray-400 hover:text-white text-sm hidden sm:block">Plataforma CRA</Link>
            <Link to="/manoprotect-connect" className="text-gray-400 hover:text-white text-sm hidden sm:block">App Connect</Link>
            <Link to="/plans" className="text-gray-400 hover:text-white text-sm">Planes</Link>
            <a href="tel:+34601510950" className="text-sm text-gray-400 hover:text-emerald-400 hidden sm:flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> 601 510 950</a>
          </div>
        </div>
      </header>

      {/* Hero with product image */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 30%, #10B981 0%, transparent 50%)' }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-bold tracking-wider">SENTINEL LOCK</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-tight" data-testid="sentinel-lock-title">
                La cerradura que <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">llama a la policia</span> por ti
              </h1>
              <p className="text-base sm:text-lg text-gray-400 max-w-lg mb-3">
                Deteccion de intrusion por IA. Comunicacion celular directa. Sin WiFi. Sin corriente. Aviso inmediato a la Central y a las autoridades.
              </p>
              <p className="text-emerald-400 text-sm font-bold mb-8">Compatible con todos los planes de alarma ManoProtect</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/contacto" className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl transition-all text-sm" data-testid="lock-cta-contact">
                  Solicitar instalacion <ChevronRight className="w-4 h-4" />
                </Link>
                <a href="tel:+34601510950" className="inline-flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-600 text-white font-bold px-8 py-4 rounded-xl transition-all text-sm">
                  <Phone className="w-4 h-4" /> 601 510 950
                </a>
              </div>
            </div>
            <div className="relative flex justify-center">
              <img
                src={IMG.hero}
                alt="Sentinel Lock - Cerradura inteligente autonoma europea cilindrica"
                className="rounded-3xl shadow-2xl shadow-emerald-500/10 max-w-md w-full"
                width={768}
                height={512}
                fetchPriority="high"
              />
              <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg">
                Cilindro europeo DIN
              </div>
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

      {/* Exploded view - Technology */}
      <section className="py-16" data-testid="tech-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Tecnologia de grado militar</h2>
            <p className="text-gray-400 text-sm">8 tecnologias integradas en una sola cerradura de cilindro europeo</p>
          </div>
          <div className="mb-12 flex justify-center">
            <img
              src={IMG.exploded}
              alt="Sentinel Lock - Vista explosionada de componentes internos"
              className="rounded-2xl border border-gray-800 max-w-2xl w-full shadow-xl"
              width={768}
              height={512}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="specs-section">
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

      {/* Interactive Demo */}
      <InteractiveDemo />

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

      {/* Installed view */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="flex justify-center order-2 lg:order-1">
              <img
                src={IMG.installed}
                alt="Sentinel Lock instalada en puerta de vivienda espanola"
                className="rounded-3xl shadow-xl max-w-xs w-full"
                width={512}
                height={768}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl font-bold text-white mb-4">Disenada para puertas espanolas</h2>
              <p className="text-gray-400 text-sm mb-6">Sentinel Lock se adapta al cilindro europeo DIN estandar, el mas utilizado en Espana. Compatible con puertas blindadas, acorazadas y de PVC. Instalacion profesional sin danos a la puerta.</p>
              <div className="space-y-3">
                {[
                  { icon: Shield, title: 'Proteccion total', desc: 'Detecta, analiza, avisa y disuade. La primera linea de defensa activa de tu hogar.' },
                  { icon: WifiOff, title: 'Autonomia absoluta', desc: 'Aunque corten la luz, internet o la linea telefonica, Sentinel Lock sigue avisando.' },
                  { icon: Bell, title: 'Disuasion activa', desc: 'Emite alarma sonora al detectar la primera manipulacion. El ladron huye antes de entrar.' },
                ].map((b, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0"><b.icon className="w-5 h-5 text-emerald-400" /></div>
                    <div>
                      <h3 className="text-white font-bold text-sm mb-0.5">{b.title}</h3>
                      <p className="text-gray-500 text-xs">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

      {/* Pricing */}
      <section className="py-16" data-testid="lock-pricing">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-emerald-500/30 rounded-3xl overflow-hidden">
            <div className="flex justify-center bg-gray-900/50 border-b border-gray-800">
              <img
                src={IMG.closeup}
                alt="Sentinel Lock - Detalle de precision"
                className="w-full max-h-48 object-cover"
                width={448}
                height={192}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="p-8 text-center">
              <Lock className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white mb-1">Sentinel Lock</h3>
              <p className="text-gray-400 text-xs mb-4">Cerradura inteligente autonoma — Cilindro europeo DIN</p>
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
        </div>
      </section>

      {/* Ecosystem */}
      <section className="py-16 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Ecosistema ManoProtect completo</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            {[
              { icon: Lock, title: 'Sentinel Lock', desc: 'Cerradura inteligente autonoma. Deteccion IA + NB-IoT.', link: '/sentinel-lock', active: true },
              { icon: Smartphone, title: 'ManoProtect Connect', desc: 'App para clientes. Control remoto, camaras, SOS.', link: '/manoprotect-connect', active: false },
              { icon: Eye, title: 'Plataforma CRA', desc: 'Software profesional para operadores de central.', link: '/plataforma-cra', active: false },
            ].map((e, i) => (
              <Link key={i} to={e.link} className={`rounded-2xl p-6 border-2 transition-all hover:scale-[1.02] ${e.active ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-700 bg-gray-900/40 hover:border-gray-600'}`}>
                <e.icon className={`w-8 h-8 mx-auto mb-3 ${e.active ? 'text-emerald-400' : 'text-gray-500'}`} />
                <h3 className={`font-bold text-sm mb-1 ${e.active ? 'text-emerald-300' : 'text-white'}`}>{e.title}</h3>
                <p className="text-gray-500 text-xs">{e.desc}</p>
              </Link>
            ))}
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
