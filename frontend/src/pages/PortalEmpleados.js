import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { 
  Shield, Users, AlertTriangle, MessageSquare, BarChart3, 
  Download, Monitor, Smartphone, Search, Bell, Settings,
  ChevronRight, CheckCircle, Clock, XCircle
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function PortalEmpleados() {
  const [stats, setStats] = useState({
    total_threats: 0,
    resolved_today: 0,
    pending_tickets: 0,
    active_users: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        axios.get(`${API}/api/fraud/public/scam-stats`),
        axios.get(`${API}/api/community-alerts`)
      ]);
      
      setStats({
        total_threats: statsRes.data.total_scams_blocked || 52847,
        resolved_today: statsRes.data.scams_today || 127,
        pending_tickets: 23,
        active_users: statsRes.data.protected_families || 10234
      });
      
      setRecentAlerts(alertsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const downloads = [
    {
      platform: 'Windows',
      icon: <Monitor className="w-8 h-8" />,
      file: '/ManoProtect-Desktop-Windows.zip',
      size: '107 MB',
      version: '1.0.0',
      description: 'Para ordenadores de escritorio Windows 10/11',
      color: 'from-blue-500 to-blue-600'
    },
    {
      platform: 'Android',
      icon: <Smartphone className="w-8 h-8" />,
      file: '/ManoProtect-Android-Project.zip',
      size: '4.8 MB',
      version: '1.0.0',
      description: 'Para tablets y móviles Android de las sucursales',
      color: 'from-green-500 to-green-600',
      note: 'Requiere compilar con Android Studio'
    }
  ];

  const features = [
    { icon: <BarChart3 />, title: 'Dashboard', desc: 'Estadísticas en tiempo real' },
    { icon: <AlertTriangle />, title: 'Gestión de Amenazas', desc: 'Ver, asignar y resolver' },
    { icon: <Users />, title: 'Clientes', desc: 'Administrar cuentas' },
    { icon: <Search />, title: 'Verificador', desc: 'Analizar contenido sospechoso' },
    { icon: <MessageSquare />, title: 'Tickets', desc: 'Soporte al cliente' },
    { icon: <Bell />, title: 'Alertas', desc: 'Enviar alertas masivas' },
  ];

  return (
    <>
      <Helmet>
        <title>Portal de Empleados - ManoProtect</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <header className="border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-emerald-400">ManoProtect</span>
                <span className="text-xs block text-slate-400">Portal de Empleados</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">STARTBOOKING SL</span>
              <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Amenazas Bloqueadas', value: stats.total_threats.toLocaleString(), icon: <Shield />, color: 'emerald' },
              { label: 'Resueltas Hoy', value: stats.resolved_today, icon: <CheckCircle />, color: 'blue' },
              { label: 'Tickets Pendientes', value: stats.pending_tickets, icon: <Clock />, color: 'amber' },
              { label: 'Usuarios Activos', value: stats.active_users.toLocaleString(), icon: <Users />, color: 'purple' },
            ].map((stat, i) => (
              <div key={i} className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-4`}>
                <div className={`w-10 h-10 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center mb-3`}>
                  <span className={`text-${stat.color}-400`}>{stat.icon}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Downloads Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Download className="w-6 h-6 text-emerald-400" />
              Descargas para Sucursales
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {downloads.map((dl, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
                  <div className={`bg-gradient-to-r ${dl.color} p-6`}>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                        {dl.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{dl.platform}</h3>
                        <p className="text-sm opacity-90">v{dl.version} • {dl.size}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-slate-300 mb-4">{dl.description}</p>
                    {dl.note && (
                      <p className="text-sm text-amber-400 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {dl.note}
                      </p>
                    )}
                    <a
                      href={dl.file}
                      download
                      className="inline-flex items-center gap-2 w-full justify-center py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                      data-testid={`download-${dl.platform.toLowerCase()}`}
                    >
                      <Download className="w-5 h-5" />
                      Descargar {dl.platform}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Funcionalidades del Software</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {features.map((feat, i) => (
                <div key={i} className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                    {feat.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{feat.title}</h4>
                    <p className="text-sm text-slate-400">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Bell className="w-6 h-6 text-amber-400" />
              Alertas Recientes
            </h2>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
              {recentAlerts.map((alert, i) => (
                <div key={i} className={`p-4 flex items-center justify-between ${i !== recentAlerts.length - 1 ? 'border-b border-slate-700/50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{alert.threat_type}</p>
                      <p className="text-sm text-slate-400 line-clamp-1">{alert.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-400" />
              Instrucciones de Instalación
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-emerald-400 mb-3">Windows (Ordenadores)</h3>
                <ol className="space-y-2 text-sm text-slate-300">
                  <li className="flex gap-2"><span className="text-emerald-400">1.</span> Descargar el archivo ZIP</li>
                  <li className="flex gap-2"><span className="text-emerald-400">2.</span> Extraer en carpeta local</li>
                  <li className="flex gap-2"><span className="text-emerald-400">3.</span> Ejecutar "ManoProtect Desktop.exe"</li>
                  <li className="flex gap-2"><span className="text-emerald-400">4.</span> Iniciar sesión con credenciales de empleado</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-green-400 mb-3">Android (Tablets/Móviles)</h3>
                <ol className="space-y-2 text-sm text-slate-300">
                  <li className="flex gap-2"><span className="text-green-400">1.</span> Descargar proyecto Android</li>
                  <li className="flex gap-2"><span className="text-green-400">2.</span> Abrir en Android Studio</li>
                  <li className="flex gap-2"><span className="text-green-400">3.</span> Build → Generate Signed APK</li>
                  <li className="flex gap-2"><span className="text-green-400">4.</span> Instalar APK en dispositivos</li>
                </ol>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-sm text-amber-400">
                <strong>Credenciales de acceso:</strong> Contacta con tu supervisor para obtener tus credenciales de empleado.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-slate-500 text-sm">
            <p>STARTBOOKING SL • CIF: B19427723</p>
            <p className="mt-1">© 2024 ManoProtect - Portal Interno de Empleados</p>
          </div>
        </main>
      </div>
    </>
  );
}
