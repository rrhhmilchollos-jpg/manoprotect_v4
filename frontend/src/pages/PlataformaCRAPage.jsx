/**
 * ManoProtect - Plataforma Central de Monitoreo (CRA)
 * Software profesional para Central Receptora de Alarmas
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Shield, Monitor, Camera, Bell, Users, Database, Phone, AlertTriangle, CheckCircle, ChevronRight, Radio, Eye, Clock, Layers, Headphones, Lock, Zap } from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

const FEATURES = [
  { icon: Bell, title: 'Gestion de alarmas en tiempo real', desc: 'Recepcion y gestion inmediata de alarmas de intrusion, incendio, panico y emergencia medica. Prioridad automatica segun gravedad.', color: 'text-red-400' },
  { icon: Camera, title: 'Video-verificacion integrada', desc: 'Acceso en vivo a camaras del cliente. Grabaciones y fotos de sensores para verificar alarmas antes de avisar a las autoridades.', color: 'text-blue-400' },
  { icon: Monitor, title: 'Panel multi-ventana', desc: 'Interfaz multi-pantalla para gestionar varios incidentes simultaneamente. Diseñada para operadores profesionales bajo presion.', color: 'text-indigo-400' },
  { icon: Database, title: 'Base de datos completa', desc: 'Registro detallado de cada cliente: instalacion, sensores, teclados, camaras, codigos de acceso, contactos de emergencia y historial.', color: 'text-emerald-400' },
  { icon: AlertTriangle, title: 'Protocolos de emergencia', desc: 'Guia paso a paso para cada tipo de emergencia. Conexion directa con Policia, Bomberos y Servicios de Emergencia.', color: 'text-amber-400' },
  { icon: Lock, title: 'Seguridad militar', desc: 'Cifrado extremo a extremo. Cumplimiento normativo CRA segun Ley 5/2014 de Seguridad Privada. Auditorias de seguridad continuas.', color: 'text-violet-400' },
];

const PlataformaCRAPage = () => (
  <div className="min-h-screen bg-gray-950" data-testid="plataforma-cra-page">
    <Helmet>
      <title>Plataforma Central de Monitoreo CRA | ManoProtect</title>
      <meta name="description" content="Software profesional para Central Receptora de Alarmas. Gestion en tiempo real, video-verificacion, panel multi-ventana, protocolos de emergencia. Seguridad de grado militar." />
    </Helmet>

    {/* Header */}
    <header className="bg-gray-950/90 backdrop-blur border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2"><div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div><span className="text-white font-bold">ManoProtect</span></Link>
        <div className="flex items-center gap-3">
          <Link to="/plans" className="text-gray-400 hover:text-white text-sm">Planes</Link>
          <Link to="/manoprotect-connect" className="text-gray-400 hover:text-white text-sm">App Movil</Link>
        </div>
      </div>
    </header>

    {/* Hero */}
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #6366F1 0%, transparent 50%)' }} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
          <Monitor className="w-4 h-4 text-indigo-400" />
          <span className="text-indigo-400 text-xs font-bold tracking-wider">SOFTWARE PROFESIONAL CRA</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight" data-testid="cra-title">
          Plataforma Central de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Monitoreo</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          El cerebro de la seguridad. Software de gestion de alarmas en tiempo real para operadores de Central Receptora con video-verificacion integrada.
        </p>
      </div>
    </section>

    {/* Features */}
    <section className="py-16" data-testid="cra-features">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-gray-900/60 border border-gray-800 hover:border-indigo-500/30 rounded-2xl p-6 transition-all" data-testid={`cra-feature-${i}`}>
              <f.icon className={`w-8 h-8 ${f.color} mb-4`} />
              <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Operator workflow */}
    <section className="py-16 bg-gray-900/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Flujo de trabajo del operador</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { icon: Bell, label: 'Recepcion alarma', desc: 'Senal recibida con prioridad, tipo y ubicacion' },
            { icon: Camera, label: 'Video-verificacion', desc: 'Acceso a camaras en vivo y grabaciones' },
            { icon: Eye, label: 'Evaluacion', desc: 'Operador confirma o descarta la alarma' },
            { icon: Phone, label: 'Aviso autoridades', desc: 'Policia, bomberos o emergencias alertados' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mx-auto mb-3"><s.icon className="w-5 h-5 text-indigo-400" /></div>
              <h3 className="text-white font-bold text-xs mb-1">{s.label}</h3>
              <p className="text-gray-500 text-[10px]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Tech */}
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Infraestructura tecnica</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Cifrado extremo a extremo', desc: 'Comunicaciones cifradas AES-256. Ninguna senal puede ser interceptada.' },
            { title: 'Escalable a miles de clientes', desc: 'Arquitectura cloud-native preparada para crecer sin limites.' },
            { title: 'Alta disponibilidad 99.99%', desc: 'Redundancia en servidores y comunicaciones. Sin punto unico de fallo.' },
            { title: 'Cumplimiento normativo', desc: 'Conforme a la Ley 5/2014 de Seguridad Privada y regulaciones CRA.' },
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-900/60 border border-gray-800 rounded-xl p-5">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div><h3 className="text-white font-bold text-sm">{t.title}</h3><p className="text-gray-400 text-xs mt-0.5">{t.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 bg-indigo-500/5 border-t border-indigo-500/10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Tu CRA con tecnologia de ultima generacion</h2>
        <p className="text-gray-400 text-sm mb-6">Software profesional que potencia la eficiencia de tus operadores y la seguridad de tus clientes.</p>
        <Link to="/contacto" className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-8 py-4 rounded-xl text-sm transition-colors" data-testid="cra-cta">Solicitar demo <ChevronRight className="w-4 h-4" /></Link>
      </div>
    </section>

    <LandingFooter />
  </div>
);

export default PlataformaCRAPage;
