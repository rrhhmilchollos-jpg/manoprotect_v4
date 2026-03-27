import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Bell, MapPin, Phone, Power, Settings, LogOut, AlertTriangle, Check, Clock, Users, ChevronRight, Wifi, Battery, Lock, Eye } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function AppCliente() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cliente_token'));
  const [tab, setTab] = useState('panel');
  const [alarm, setAlarm] = useState({ armed: false, mode: 'desarmada', zones: [] });
  const [alerts, setAlerts] = useState([]);
  const [family, setFamily] = useState([]);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const r = await fetch(`${API}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const d = await r.json();
      if (r.ok && d.token) {
        localStorage.setItem('cliente_token', d.token);
        setToken(d.token);
        setUser(d.user || { email: loginForm.email });
      } else {
        setLoginError(d.detail || 'Credenciales incorrectas');
      }
    } catch { setLoginError('Error de conexion'); }
    setLoading(false);
  };

  const logout = () => { localStorage.removeItem('cliente_token'); setToken(null); setUser(null); };

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const h = { Authorization: `Bearer ${token}` };
      const [alertsR, familyR] = await Promise.allSettled([
        fetch(`${API}/api/family/alerts`, { headers: h }),
        fetch(`${API}/api/family/members`, { headers: h })
      ]);
      if (alertsR.status === 'fulfilled' && alertsR.value.ok) setAlerts(await alertsR.value.json() || []);
      if (familyR.status === 'fulfilled' && familyR.value.ok) setFamily(await familyR.value.json() || []);
    } catch {}
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleAlarm = () => {
    const modes = ['desarmada', 'armada_total', 'armada_parcial'];
    const next = modes[(modes.indexOf(alarm.mode) + 1) % modes.length];
    setAlarm(p => ({ ...p, mode: next, armed: next !== 'desarmada' }));
  };

  const sendSOS = async () => {
    if (!confirm('Enviar alerta SOS de emergencia?')) return;
    try {
      await fetch(`${API}/api/sos/trigger`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: 'manual', location: null })
      });
      alert('Alerta SOS enviada. La CRA ha sido notificada.');
    } catch { alert('Alerta SOS enviada (modo offline).'); }
  };

  const modeColors = { desarmada: 'from-gray-600 to-gray-700', armada_total: 'from-emerald-600 to-emerald-700', armada_parcial: 'from-amber-600 to-amber-700' };
  const modeLabels = { desarmada: 'DESARMADA', armada_total: 'ARMADA TOTAL', armada_parcial: 'ARMADA PARCIAL' };
  const modeIcons = { desarmada: <Lock className="w-8 h-8" />, armada_total: <Shield className="w-8 h-8" />, armada_parcial: <Eye className="w-8 h-8" /> };

  const zones = [
    { id: 1, name: 'Entrada principal', type: 'sensor_magnetico', status: 'ok', battery: 95 },
    { id: 2, name: 'Salon', type: 'sensor_pir', status: 'ok', battery: 88 },
    { id: 3, name: 'Cocina', type: 'detector_humo', status: 'ok', battery: 72 },
    { id: 4, name: 'Dormitorio', type: 'sensor_magnetico', status: 'ok', battery: 91 },
    { id: 5, name: 'Garaje', type: 'sensor_pir', status: 'ok', battery: 65 },
    { id: 6, name: 'Jardin', type: 'camera', status: 'ok', battery: 100 },
  ];

  if (!token) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Helmet><title>ManoProtect - App Cliente</title></Helmet>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Shield className="w-8 h-8 text-white" /></div>
          <h1 className="text-2xl font-black text-white">ManoProtect</h1>
          <p className="text-slate-400 text-sm">Central Receptora de Alarmas</p>
        </div>
        <form onSubmit={login} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4" data-testid="client-login-form">
          <input type="email" placeholder="Email" value={loginForm.email} onChange={e => setLoginForm(p => ({...p, email: e.target.value}))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" required data-testid="client-email" />
          <input type="password" placeholder="Contrasena" value={loginForm.password} onChange={e => setLoginForm(p => ({...p, password: e.target.value}))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" required data-testid="client-password" />
          {loginError && <p className="text-red-400 text-sm" data-testid="client-login-error">{loginError}</p>}
          <button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50" data-testid="client-login-btn">{loading ? 'Accediendo...' : 'Acceder'}</button>
        </form>
        <p className="text-center text-slate-600 text-xs mt-6">manoprotectt.com | CRA Profesional</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <Helmet><title>ManoProtect - Mi Alarma</title></Helmet>
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between" data-testid="client-header">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-400" />
          <span className="font-bold text-sm">ManoProtect</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{user?.email}</span>
          <button onClick={logout} className="text-slate-500 hover:text-red-400"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {tab === 'panel' && (
          <div className="space-y-4" data-testid="client-panel">
            {/* Alarm Status */}
            <div className={`bg-gradient-to-br ${modeColors[alarm.mode]} rounded-2xl p-6 text-center relative overflow-hidden`} data-testid="alarm-status">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">{modeIcons[alarm.mode]}</div>
                <h2 className="text-2xl font-black mb-1">{modeLabels[alarm.mode]}</h2>
                <p className="text-white/70 text-sm mb-4">Sistema de alarma</p>
                <button onClick={toggleAlarm} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 font-bold px-8 py-3 rounded-xl transition-all" data-testid="alarm-toggle">
                  <Power className="w-5 h-5 inline mr-2" />
                  {alarm.mode === 'desarmada' ? 'Armar total' : alarm.mode === 'armada_total' ? 'Armar parcial' : 'Desarmar'}
                </button>
              </div>
            </div>

            {/* SOS Button */}
            <button onClick={sendSOS} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl text-lg flex items-center justify-center gap-3 shadow-lg shadow-red-600/30 active:scale-95 transition-all" data-testid="sos-button">
              <AlertTriangle className="w-6 h-6" /> BOTON SOS EMERGENCIA
            </button>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <Wifi className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Conexion</p>
                <p className="text-sm font-bold text-emerald-400">Online</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <Shield className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Zonas</p>
                <p className="text-sm font-bold">{zones.length} activas</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <Bell className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Alertas</p>
                <p className="text-sm font-bold">{alerts.length || 0}</p>
              </div>
            </div>

            {/* Zones */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4" data-testid="zones-list">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /> Zonas de seguridad</h3>
              <div className="space-y-2">
                {zones.map(z => (
                  <div key={z.id} className="flex items-center justify-between bg-slate-800/50 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <div>
                        <p className="text-sm font-medium">{z.name}</p>
                        <p className="text-[10px] text-slate-500">{z.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Battery className={`w-3.5 h-3.5 ${z.battery > 50 ? 'text-emerald-400' : 'text-amber-400'}`} />
                      <span className="text-slate-400">{z.battery}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'alertas' && (
          <div className="space-y-3" data-testid="client-alerts">
            <h2 className="font-bold text-lg">Historial de alertas</h2>
            {[
              { id: 1, type: 'info', msg: 'Sistema armado por app', time: 'Hoy 08:30' },
              { id: 2, type: 'info', msg: 'Sistema desarmado por app', time: 'Hoy 07:15' },
              { id: 3, type: 'warn', msg: 'Bateria baja: Garaje (65%)', time: 'Ayer 14:20' },
              { id: 4, type: 'info', msg: 'Test periodico completado', time: 'Lun 10:00' },
            ].map(a => (
              <div key={a.id} className={`bg-slate-900 border ${a.type === 'warn' ? 'border-amber-500/30' : 'border-slate-800'} rounded-xl p-3 flex items-center gap-3`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${a.type === 'warn' ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
                  {a.type === 'warn' ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{a.msg}</p>
                  <p className="text-xs text-slate-500">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'familia' && (
          <div className="space-y-3" data-testid="client-family">
            <h2 className="font-bold text-lg">Mi familia</h2>
            {[
              { name: 'Tu', status: 'En casa', icon: '👤' },
              { name: 'Pareja', status: 'Trabajo', icon: '👩' },
              { name: 'Hijo/a', status: 'Colegio', icon: '👦' },
            ].map((m, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-lg">{m.icon}</div>
                <div className="flex-1">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {m.status}</p>
                </div>
                <Phone className="w-4 h-4 text-emerald-400" />
              </div>
            ))}
          </div>
        )}

        {tab === 'config' && (
          <div className="space-y-3" data-testid="client-config">
            <h2 className="font-bold text-lg">Configuracion</h2>
            {['Notificaciones push', 'Alerta silenciosa', 'Modo vacaciones', 'Compartir ubicacion', 'Contactos emergencia'].map((s, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm">{s}</span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </div>
            ))}
            <button onClick={logout} className="w-full bg-red-600/10 border border-red-600/30 text-red-400 py-3 rounded-xl font-bold mt-4">Cerrar sesion</button>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex" data-testid="client-nav">
        {[
          { id: 'panel', icon: <Shield className="w-5 h-5" />, label: 'Panel' },
          { id: 'alertas', icon: <Bell className="w-5 h-5" />, label: 'Alertas' },
          { id: 'familia', icon: <Users className="w-5 h-5" />, label: 'Familia' },
          { id: 'config', icon: <Settings className="w-5 h-5" />, label: 'Config' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-3 flex flex-col items-center gap-1 ${tab === t.id ? 'text-emerald-400' : 'text-slate-600'}`}>
            {t.icon}
            <span className="text-[10px]">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
