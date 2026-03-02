/**
 * Plataforma Central CRA - Software profesional para operadores de Central Receptora de Alarmas
 * Conecta con Sentinel Lock, alarmas, y dispositivos del ecosistema ManoProtect
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Shield, Monitor, Bell, MapPin, Phone, CheckCircle, ChevronRight,
  AlertTriangle, Eye, Clock, Users, Lock, Radio, Activity,
  Cpu, Server, Headphones, FileText, BarChart3, Layers, Zap,
  ShieldCheck, Signal, Wifi
} from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

const MODULES = [
  {
    icon: AlertTriangle,
    title: 'Recepcion de alarmas en tiempo real',
    desc: 'Panel unificado que recibe y prioriza todas las senales del ecosistema: alarmas de intrusion, Sentinel Lock, SOS personal, incendio, inundacion y sabotaje. Protocolo Contact-ID/SIA.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    icon: Eye,
    title: 'Verificacion por video con IA',
    desc: 'Acceso inmediato a camaras del cliente para verificar alarmas. La IA pre-clasifica eventos (persona, animal, vehiculo) para reducir falsas alarmas al minimo.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: MapPin,
    title: 'Geolocalizacion y despacho',
    desc: 'Mapa interactivo con ubicacion exacta del abonado, ruta optima para vigilantes de Acuda, y envio automatico de coordenadas a Policia, Bomberos o Emergencias.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Users,
    title: 'Gestion de abonados',
    desc: 'Fichas completas de cada cliente: datos personales, contactos de emergencia, planos del inmueble, codigos de verificacion, historial de eventos y dispositivos asociados.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Radio,
    title: 'Comunicacion multi-protocolo',
    desc: 'Compatible con NB-IoT (Sentinel Lock), 4G/LTE, WiFi, Ethernet y linea fija. Deteccion automatica de inhibicion de senal y fallo de comunicaciones.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    icon: FileText,
    title: 'Registro y auditoria',
    desc: 'Registro automatico de cada accion del operador con marcas de tiempo. Cumplimiento total con Ley 5/2014 de Seguridad Privada y normativa UNE-EN 50518.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
];

const WORKFLOW_STEPS = [
  { num: '01', title: 'Senal recibida', desc: 'La plataforma recibe la senal del panel de alarma, Sentinel Lock o dispositivo SOS via protocolo cifrado.', color: 'text-red-500' },
  { num: '02', title: 'Clasificacion automatica', desc: 'La IA clasifica la senal por prioridad (critica, alta, media, baja) y la asigna al operador disponible.', color: 'text-amber-500' },
  { num: '03', title: 'Verificacion', desc: 'El operador verifica con video en directo, contacto telefonico al titular o palabra clave de seguridad.', color: 'text-blue-500' },
  { num: '04', title: 'Despacho', desc: 'Si se confirma la intrusion: alerta a Policia Nacional/Guardia Civil con ubicacion + datos del cliente. Acuda en 10 min.', color: 'text-emerald-500' },
  { num: '05', title: 'Seguimiento y cierre', desc: 'El operador documenta todo el proceso, notifica al cliente y cierra el evento. Todo queda registrado para auditoria.', color: 'text-indigo-500' },
];

const COMPLIANCE = [
  { title: 'Ley 5/2014', desc: 'Ley de Seguridad Privada. Verificacion obligatoria antes de avisar a FCSE.' },
  { title: 'UNE-EN 50518', desc: 'Norma europea para Centrales Receptoras de Alarmas. Redundancia, disponibilidad 99.99%.' },
  { title: 'RGPD / LOPD-GDD', desc: 'Proteccion de datos de abonados. Cifrado AES-256, acceso por roles, auditoria completa.' },
  { title: 'Grado 2-3 CRA', desc: 'Homologacion ministerial para recepcion de senales de sistemas de seguridad Grado 2 y Grado 3.' },
];

const CRAPlatformPage = () => (
  <div className="min-h-screen bg-slate-950" data-testid="cra-platform-page">
    <Helmet>
      <title>Plataforma Central CRA | Software para Operadores | ManoProtect</title>
      <meta name="description" content="Plataforma Central CRA de ManoProtect: software profesional para operadores de Central Receptora de Alarmas. Verificacion por video IA, despacho a Policia, gestion de abonados. Cumple Ley 5/2014 y UNE-EN 50518." />
    </Helmet>

    {/* Header */}
    <header className="bg-slate-950/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
          <span className="text-white font-bold">ManoProtect</span>
          <span className="text-slate-500 text-xs ml-1">| CRA</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/sentinel-lock" className="text-slate-400 hover:text-white text-sm hidden sm:block">Sentinel Lock</Link>
          <Link to="/manoprotect-connect" className="text-slate-400 hover:text-white text-sm hidden sm:block">Connect App</Link>
          <a href="tel:+34601510950" className="text-sm text-slate-400 hover:text-emerald-400 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> <span className="hidden sm:inline">601 510 950</span></a>
        </div>
      </div>
    </header>

    {/* Hero */}
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #6366F1 0%, transparent 50%)' }} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
            <Monitor className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-400 text-xs font-bold tracking-wider">PLATAFORMA CENTRAL CRA</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-tight" data-testid="cra-title">
            El cerebro de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">seguridad conectada</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-3">
            Software profesional para operadores de Central Receptora de Alarmas. Recibe, verifica y despacha alarmas del ecosistema ManoProtect en segundos.
          </p>
          <p className="text-indigo-400 text-sm font-bold mb-8">Cumple Ley 5/2014 | UNE-EN 50518 | RGPD</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contacto" className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-8 py-4 rounded-xl transition-all text-sm" data-testid="cra-cta-demo">
              Solicitar demo profesional <ChevronRight className="w-4 h-4" />
            </Link>
            <a href="tel:+34601510950" className="inline-flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 text-white font-bold px-8 py-4 rounded-xl transition-all text-sm">
              <Phone className="w-4 h-4" /> Contactar ventas B2B
            </a>
          </div>
        </div>
      </div>
    </section>

    {/* What connects */}
    <section className="py-12 border-y border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <p className="text-center text-slate-500 text-xs font-bold tracking-wider mb-6">DISPOSITIVOS COMPATIBLES</p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {[
            { icon: Lock, label: 'Sentinel Lock' },
            { icon: Shield, label: 'Paneles de alarma' },
            { icon: Activity, label: 'Dispositivos SOS' },
            { icon: Eye, label: 'Camaras IP' },
            { icon: Signal, label: 'Sensores NB-IoT' },
            { icon: Wifi, label: 'Detectores WiFi' },
          ].map((d, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-full px-4 py-2">
              <d.icon className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-300 text-xs font-medium">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Modules */}
    <section className="py-16" data-testid="cra-modules">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">Modulos de la plataforma</h2>
          <p className="text-slate-400 text-sm">6 modulos integrados para operar una CRA de primer nivel</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((m, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 rounded-2xl p-6 transition-all group" data-testid={`cra-module-${i}`}>
              <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <m.icon className={`w-5 h-5 ${m.color}`} />
              </div>
              <h3 className="text-white font-bold text-sm mb-2">{m.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Workflow */}
    <section className="py-16 bg-slate-900/50" data-testid="cra-workflow">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">Flujo de trabajo del operador</h2>
          <p className="text-slate-400 text-sm">De la senal a la resolucion en menos de 90 segundos</p>
        </div>
        <div className="space-y-4">
          {WORKFLOW_STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-4 bg-slate-900/60 border border-slate-800 rounded-xl p-5" data-testid={`cra-step-${step.num}`}>
              <div className={`text-2xl font-black ${step.color} w-12 text-center flex-shrink-0`}>{step.num}</div>
              <div>
                <h3 className="text-white font-bold text-sm mb-0.5">{step.title}</h3>
                <p className="text-slate-400 text-xs">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Technical Specs */}
    <section className="py-16" data-testid="cra-specs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Especificaciones tecnicas</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Server, title: 'Alta disponibilidad', desc: 'Arquitectura redundante. Uptime 99.99%. Failover automatico entre servidores.' },
            { icon: Cpu, title: 'IA integrada', desc: 'Clasificacion automatica de eventos. Deteccion de patrones. Reduccion de falsas alarmas.' },
            { icon: Layers, title: 'Multi-protocolo', desc: 'Contact-ID, SIA DC-03, NB-IoT, 4G, WiFi, IP. Compatible con paneles de terceros.' },
            { icon: BarChart3, title: 'Dashboard analitico', desc: 'KPIs en tiempo real: tiempos de respuesta, eventos/hora, rendimiento por operador.' },
            { icon: Headphones, title: 'VoIP integrado', desc: 'Sistema telefonico integrado. Llamadas automaticas al titular, grabacion de conversaciones.' },
            { icon: ShieldCheck, title: 'Cifrado E2E', desc: 'Toda la comunicacion cifrada AES-256. Certificados TLS 1.3. Acceso por roles y 2FA.' },
            { icon: Clock, title: 'SLA garantizado', desc: 'Tiempo de respuesta < 30s para alarmas criticas. Escalado automatico si se supera.' },
            { icon: Zap, title: 'API abierta', desc: 'API REST documentada para integracion con sistemas de terceros, ERP y plataformas de videovigilancia.' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-center">
              <s.icon className="w-6 h-6 text-indigo-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-xs mb-1">{s.title}</h3>
              <p className="text-slate-500 text-[11px]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Compliance */}
    <section className="py-16 bg-slate-900/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <ShieldCheck className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white mb-2">Cumplimiento normativo</h2>
          <p className="text-slate-400 text-sm">Disenada para cumplir con toda la legislacion espanola y europea de seguridad privada</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {COMPLIANCE.map((c, i) => (
            <div key={i} className="bg-slate-900/60 border border-indigo-500/15 rounded-xl p-5 flex gap-4 items-start" data-testid={`compliance-${i}`}>
              <CheckCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-bold text-sm mb-1">{c.title}</h3>
                <p className="text-slate-400 text-xs">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Ecosystem */}
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Ecosistema ManoProtect completo</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          {[
            { icon: Lock, title: 'Sentinel Lock', desc: 'Cerradura inteligente autonoma. Deteccion IA + NB-IoT.', link: '/sentinel-lock', active: false },
            { icon: Monitor, title: 'Plataforma CRA', desc: 'Software profesional para operadores de central.', link: '/plataforma-cra', active: true },
            { icon: Activity, title: 'ManoProtect Connect', desc: 'App movil para clientes. Control total desde el bolsillo.', link: '/manoprotect-connect', active: false },
          ].map((e, i) => (
            <Link key={i} to={e.link} className={`rounded-2xl p-6 border-2 transition-all hover:scale-[1.02] ${e.active ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'}`}>
              <e.icon className={`w-8 h-8 mx-auto mb-3 ${e.active ? 'text-indigo-400' : 'text-slate-500'}`} />
              <h3 className={`font-bold text-sm mb-1 ${e.active ? 'text-indigo-300' : 'text-white'}`}>{e.title}</h3>
              <p className="text-slate-500 text-xs">{e.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 bg-indigo-500/5 border-t border-indigo-500/10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <Monitor className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Profesionaliza tu Central Receptora</h2>
        <p className="text-slate-400 text-sm mb-6">Solicita una demo de la Plataforma CRA de ManoProtect. Formacion incluida para operadores. Migracion asistida desde otros sistemas.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/contacto" className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-8 py-4 rounded-xl text-sm transition-colors" data-testid="cra-final-cta">
            Solicitar demo gratuita <ChevronRight className="w-4 h-4" />
          </Link>
          <a href="tel:+34601510950" className="inline-flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 text-white font-bold px-8 py-4 rounded-xl text-sm transition-colors">
            <Phone className="w-4 h-4" /> Llamar a ventas
          </a>
        </div>
      </div>
    </section>

    <LandingFooter />
  </div>
);

export default CRAPlatformPage;
