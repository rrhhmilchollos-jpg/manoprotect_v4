/**
 * ManoProtect Connect - Aplicacion Movil para Clientes
 * iOS & Android - Control total de tu sistema de seguridad
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Shield, Smartphone, Lock, Unlock, Camera, Bell, Users, Key, MapPin, Phone, CheckCircle, ChevronRight, AlertTriangle, Eye, Clock, Fingerprint, QrCode, Wifi } from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

const APP_FEATURES = [
  { icon: Lock, title: 'Armado y desarmado remoto', desc: 'Control total de tu alarma desde cualquier lugar. Armado total, parcial y desarmado con iconos claros e intuitivos.', color: 'text-emerald-400' },
  { icon: Bell, title: 'Notificaciones push', desc: 'Alertas instantaneas en tu movil. Cada evento de tu sistema de seguridad llega en tiempo real a tu pantalla.', color: 'text-red-400' },
  { icon: Camera, title: 'Camaras en directo', desc: 'Visualiza tus camaras de seguridad en vivo desde la app. Fotos de sensores, grabaciones y vision nocturna.', color: 'text-blue-400' },
  { icon: Users, title: 'Gestion de usuarios y claves', desc: 'Crea, modifica y elimina codigos de acceso y llaves inteligentes. Controla quien entra y cuando.', color: 'text-amber-400' },
  { icon: AlertTriangle, title: 'Boton S.O.S. movil', desc: 'Alerta directa a la Central con tu geolocalizacion. Emergencia personal, medica o de seguridad en un toque.', color: 'text-pink-400' },
  { icon: Clock, title: 'Historial de eventos', desc: 'Consulta el historico completo de tu sistema: armados, desarmados, alertas, accesos y movimiento detectado.', color: 'text-violet-400' },
];

const SCREENS = [
  { title: 'Dashboard', desc: 'Estado en tiempo real de tu sistema', features: ['Estado alarma (armada/parcial/desarmada)', 'Ultimo evento registrado', 'Acceso rapido a camaras', 'Temperaturas y sensores'] },
  { title: 'Camaras', desc: 'Vision en directo de tu hogar', features: ['Streaming HD en tiempo real', 'Vision nocturna automatica', 'Fotos de eventos de sensores', 'Grabaciones guardadas'] },
  { title: 'Control', desc: 'Arma y desarma desde el movil', features: ['Armado total con un toque', 'Armado parcial (noche/dia)', 'Desarmado con PIN o huella', 'Temporizador de armado'] },
  { title: 'Usuarios', desc: 'Gestiona accesos', features: ['Crear codigos temporales', 'Llaves inteligentes NFC', 'Permisos por horario', 'Historial de accesos'] },
];

const ManoprotectConnectPage = () => (
  <div className="min-h-screen bg-white" data-testid="manoprotect-connect-page">
    <Helmet>
      <title>ManoProtect Connect | App de Seguridad para iOS y Android</title>
      <meta name="description" content="ManoProtect Connect: controla tu alarma desde el movil. Armado remoto, camaras en directo, notificaciones push, boton SOS, gestion de usuarios. Disponible en iOS y Android." />
    </Helmet>

    {/* Header */}
    <header className="bg-white/90 backdrop-blur border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2"><div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div><span className="text-emerald-600 font-bold">ManoProtect</span></Link>
        <div className="flex items-center gap-3">
          <Link to="/plans" className="text-gray-500 hover:text-emerald-600 text-sm">Planes</Link>
          <Link to="/plataforma-cra" className="text-gray-500 hover:text-emerald-600 text-sm">Plataforma CRA</Link>
        </div>
      </div>
    </header>

    {/* Hero */}
    <section className="py-20 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-200 rounded-full px-4 py-1.5 mb-6">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 text-xs font-bold">iOS & ANDROID — DESCARGA GRATUITA</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-4 tracking-tight" data-testid="connect-title">
            ManoProtect <span className="text-emerald-500">Connect</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-3">
            Tu sistema de seguridad en tu bolsillo. Controla, visualiza y gestiona tu alarma desde cualquier lugar del mundo.
          </p>
          <p className="text-emerald-600 text-sm font-bold mb-8">Incluida gratis con todos los planes de alarma ManoProtect</p>
          <div className="flex gap-3 justify-center">
            <div className="bg-gray-900 text-white px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-gray-800 transition-colors" data-testid="app-store-btn">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              <div className="text-left"><div className="text-[9px] opacity-70">Disponible en</div><div className="text-sm font-bold -mt-0.5">App Store</div></div>
            </div>
            <div className="bg-gray-900 text-white px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-gray-800 transition-colors" data-testid="google-play-btn">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/></svg>
              <div className="text-left"><div className="text-[9px] opacity-70">Disponible en</div><div className="text-sm font-bold -mt-0.5">Google Play</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-16" data-testid="connect-features">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Todo el control en tu mano</h2>
          <p className="text-gray-500 text-sm">6 funcionalidades esenciales en una sola app</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {APP_FEATURES.map((f, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-100" data-testid={`connect-feature-${i}`}>
              <f.icon className={`w-8 h-8 ${f.color} mb-4`} />
              <h3 className="text-gray-900 font-bold text-base mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* App Screens */}
    <section className="py-16 bg-gray-50" data-testid="connect-screens">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Pantallas principales</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SCREENS.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full inline-block mb-3">{s.title}</div>
              <p className="text-gray-900 font-bold text-sm mb-1">{s.desc}</p>
              <ul className="space-y-1.5 mt-3">
                {s.features.map((f, j) => <li key={j} className="flex items-center gap-1.5 text-xs text-gray-600"><CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Ecosystem */}
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Ecosistema ManoProtect completo</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          {[
            { icon: Smartphone, title: 'ManoProtect Connect', desc: 'App para clientes. Control remoto, camaras, SOS.', link: '/manoprotect-connect', active: true },
            { icon: Monitor, title: 'Plataforma CRA', desc: 'Software profesional para operadores de central.', link: '/plataforma-cra', active: false },
            { icon: Wifi, title: 'Backend & API', desc: 'Infraestructura cifrada que conecta todo el ecosistema.', link: null, active: false },
          ].map((e, i) => (
            <div key={i} className={`rounded-2xl p-6 border-2 ${e.active ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'} transition-all`}>
              <e.icon className={`w-8 h-8 mx-auto mb-3 ${e.active ? 'text-emerald-500' : 'text-gray-400'}`} />
              <h3 className={`font-bold text-sm mb-1 ${e.active ? 'text-emerald-700' : 'text-gray-900'}`}>{e.title}</h3>
              <p className="text-gray-500 text-xs mb-3">{e.desc}</p>
              {e.link && <Link to={e.link} className="text-emerald-600 text-xs font-bold hover:underline">Ver mas</Link>}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <Smartphone className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Tu seguridad, siempre contigo</h2>
        <p className="text-gray-400 text-sm mb-6">ManoProtect Connect se incluye GRATIS con todos los planes de alarma. Descarga y empieza a controlar tu hogar.</p>
        <Link to="/plans" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl text-sm transition-colors" data-testid="connect-cta-plans">Ver planes de alarma <ChevronRight className="w-4 h-4" /></Link>
      </div>
    </section>

    <LandingFooter />
  </div>
);

export default ManoprotectConnectPage;
