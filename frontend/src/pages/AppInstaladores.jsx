import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Wrench, Calendar, CheckSquare, MapPin, LogOut, ChevronRight, Clock, Check, Camera, Package, AlertTriangle, Truck, Users, Phone } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function AppInstaladores() {
  const [token, setToken] = useState(localStorage.getItem('instalador_token'));
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('agenda');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [checklist, setChecklist] = useState({});

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const r = await fetch(`${API}/api/gestion/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const d = await r.json();
      if (r.ok && d.token) {
        localStorage.setItem('instalador_token', d.token);
        setToken(d.token);
        setUser(d.user);
      } else {
        setLoginError(d.detail || 'Credenciales incorrectas');
      }
    } catch { setLoginError('Error de conexion'); }
    setLoading(false);
  };

  const logout = () => { localStorage.removeItem('instalador_token'); setToken(null); setUser(null); };

  const JOBS = [
    { id: 1, client: 'Garcia Martinez, Juan', address: 'Calle Mayor 15, 3A, Madrid', date: '28/03/2026', time: '09:00-11:00', status: 'programada', kit: 'Kit Plus Hogar', phone: '612 345 678', notes: 'Piso 3o, ascensor. Perro en casa.' },
    { id: 2, client: 'Lopez Fernandez, Maria', address: 'Av. Libertad 42, Valencia', date: '28/03/2026', time: '12:00-14:00', status: 'programada', kit: 'Kit Premium Hogar', phone: '634 567 890', notes: 'Chalet 2 plantas. Acceso garaje.' },
    { id: 3, client: 'Rodriguez Perez, Carlos', address: 'Paseo Castellana 100, Madrid', date: '29/03/2026', time: '09:00-11:00', status: 'programada', kit: 'Kit Negocio', phone: '656 789 012', notes: 'Local comercial. Puerta trasera.' },
    { id: 4, client: 'Sanchez Gil, Ana', address: 'Calle Sol 8, 1B, Barcelona', date: '27/03/2026', time: '16:00-18:00', status: 'completada', kit: 'Kit Basico Hogar', phone: '678 901 234', notes: '' },
    { id: 5, client: 'Moreno Ruiz, Pablo', address: 'Ronda Sur 22, Sevilla', date: '26/03/2026', time: '10:00-12:00', status: 'completada', kit: 'Kit Plus Hogar', phone: '690 123 456', notes: '' },
  ];

  const CHECKLIST_ITEMS = [
    { id: 'panel', label: 'Panel central instalado y configurado', category: 'Central' },
    { id: 'sensores', label: 'Sensores puerta/ventana instalados', category: 'Sensores' },
    { id: 'pir', label: 'Detectores PIR posicionados', category: 'Sensores' },
    { id: 'sirena', label: 'Sirena instalada y probada', category: 'Alarma' },
    { id: 'camaras', label: 'Camaras configuradas y con imagen', category: 'Video' },
    { id: 'teclado', label: 'Teclado instalado y codigo configurado', category: 'Acceso' },
    { id: 'mando', label: 'Mandos entregados y programados', category: 'Acceso' },
    { id: 'wifi', label: 'Conexion WiFi/4G verificada', category: 'Conexion' },
    { id: 'cra', label: 'Comunicacion CRA verificada', category: 'Conexion' },
    { id: 'app', label: 'App cliente configurada en movil', category: 'Software' },
    { id: 'test', label: 'Test completo del sistema realizado', category: 'Verificacion' },
    { id: 'cliente', label: 'Cliente formado en uso del sistema', category: 'Formacion' },
    { id: 'fotos', label: 'Fotos de la instalacion tomadas', category: 'Documentacion' },
    { id: 'firma', label: 'Acta de instalacion firmada', category: 'Documentacion' },
  ];

  const statusColors = { programada: 'bg-blue-500/20 text-blue-400 border-blue-500/30', en_curso: 'bg-amber-500/20 text-amber-400 border-amber-500/30', completada: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };

  const toggleCheck = (id) => setChecklist(p => ({ ...p, [id]: !p[id] }));
  const completedChecks = Object.values(checklist).filter(Boolean).length;

  if (!token) return (
    <div className="min-h-screen bg-orange-950 flex items-center justify-center p-4">
      <Helmet><title>ManoProtect Instaladores</title></Helmet>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Wrench className="w-8 h-8 text-white" /></div>
          <h1 className="text-2xl font-black text-white">ManoProtect</h1>
          <p className="text-orange-300 text-sm">App Instaladores</p>
        </div>
        <form onSubmit={login} className="bg-orange-900/50 border border-orange-800 rounded-2xl p-6 space-y-4" data-testid="instalador-login-form">
          <input type="email" placeholder="Email instalador" value={loginForm.email} onChange={e => setLoginForm(p => ({...p, email: e.target.value}))} className="w-full bg-orange-900 border border-orange-700 rounded-xl px-4 py-3 text-white placeholder-orange-400 focus:outline-none focus:border-orange-400" required data-testid="instalador-email" />
          <input type="password" placeholder="Contrasena" value={loginForm.password} onChange={e => setLoginForm(p => ({...p, password: e.target.value}))} className="w-full bg-orange-900 border border-orange-700 rounded-xl px-4 py-3 text-white placeholder-orange-400 focus:outline-none focus:border-orange-400" required data-testid="instalador-password" />
          {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50" data-testid="instalador-login-btn">{loading ? 'Accediendo...' : 'Acceder'}</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-950 text-white pb-20">
      <Helmet><title>ManoProtect - Instaladores</title></Helmet>
      <header className="bg-orange-900 border-b border-orange-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><Wrench className="w-5 h-5 text-orange-400" /><span className="font-bold text-sm">Instaladores</span></div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-orange-300">{user?.nombre || user?.email}</span>
          <button onClick={logout} className="text-orange-500 hover:text-red-400"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {tab === 'agenda' && !selectedJob && (
          <div className="space-y-4" data-testid="instalador-agenda">
            <h2 className="font-bold text-lg">Mi agenda</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-orange-900/50 border border-orange-800 rounded-xl p-3 text-center">
                <Calendar className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-lg font-black">{JOBS.filter(j => j.status === 'programada').length}</p>
                <p className="text-[10px] text-orange-300">Programadas</p>
              </div>
              <div className="bg-orange-900/50 border border-orange-800 rounded-xl p-3 text-center">
                <Wrench className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-lg font-black">0</p>
                <p className="text-[10px] text-orange-300">En curso</p>
              </div>
              <div className="bg-orange-900/50 border border-orange-800 rounded-xl p-3 text-center">
                <Check className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-lg font-black">{JOBS.filter(j => j.status === 'completada').length}</p>
                <p className="text-[10px] text-orange-300">Completadas</p>
              </div>
            </div>
            {JOBS.map(j => (
              <button key={j.id} onClick={() => { setSelectedJob(j); setChecklist({}); }} className="w-full bg-orange-900/50 border border-orange-800 hover:border-orange-600 rounded-xl p-4 text-left transition-colors" data-testid={`job-${j.id}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-sm">{j.client}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusColors[j.status]}`}>{j.status}</span>
                </div>
                <p className="text-xs text-orange-300 flex items-center gap-1 mb-1"><MapPin className="w-3 h-3" /> {j.address}</p>
                <div className="flex items-center gap-3 text-xs text-orange-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {j.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {j.time}</span>
                  <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {j.kit}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === 'agenda' && selectedJob && (
          <div className="space-y-4" data-testid="instalador-job-detail">
            <button onClick={() => setSelectedJob(null)} className="text-orange-400 text-sm flex items-center gap-1"><ChevronRight className="w-4 h-4 rotate-180" /> Volver a agenda</button>
            
            <div className="bg-orange-900/50 border border-orange-800 rounded-xl p-4">
              <h3 className="font-bold text-lg mb-1">{selectedJob.client}</h3>
              <p className="text-sm text-orange-300 flex items-center gap-1 mb-1"><MapPin className="w-4 h-4" /> {selectedJob.address}</p>
              <p className="text-sm text-orange-300 flex items-center gap-1 mb-1"><Calendar className="w-4 h-4" /> {selectedJob.date} | {selectedJob.time}</p>
              <p className="text-sm text-orange-300 flex items-center gap-1 mb-1"><Package className="w-4 h-4" /> {selectedJob.kit}</p>
              <a href={`tel:${selectedJob.phone}`} className="inline-flex items-center gap-1 text-sm text-emerald-400 mt-2"><Phone className="w-4 h-4" /> {selectedJob.phone}</a>
              {selectedJob.notes && <p className="text-xs text-orange-500 mt-2 bg-orange-900/50 rounded-lg p-2"><AlertTriangle className="w-3 h-3 inline mr-1" /> {selectedJob.notes}</p>}
            </div>

            {/* Checklist */}
            <div className="bg-orange-900/50 border border-orange-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm">Checklist de instalacion</h3>
                <span className="text-xs text-orange-400">{completedChecks}/{CHECKLIST_ITEMS.length}</span>
              </div>
              <div className="w-full h-2 bg-orange-800 rounded-full mb-4">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(completedChecks / CHECKLIST_ITEMS.length) * 100}%` }} />
              </div>
              <div className="space-y-2">
                {CHECKLIST_ITEMS.map(item => (
                  <button key={item.id} onClick={() => toggleCheck(item.id)} className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${checklist[item.id] ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-orange-800/30 border border-transparent'}`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${checklist[item.id] ? 'bg-emerald-500' : 'bg-orange-800 border border-orange-600'}`}>
                      {checklist[item.id] && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className={`text-sm ${checklist[item.id] ? 'text-emerald-400 line-through' : 'text-white'}`}>{item.label}</p>
                      <p className="text-[10px] text-orange-500">{item.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {completedChecks === CHECKLIST_ITEMS.length && (
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                <Check className="w-5 h-5" /> Finalizar instalacion
              </button>
            )}
          </div>
        )}

        {tab === 'material' && (
          <div className="space-y-4" data-testid="instalador-material">
            <h2 className="font-bold text-lg">Material en vehiculo</h2>
            {[
              { name: 'Panel Central ManoProtect', qty: 3, icon: <Shield className="w-4 h-4" /> },
              { name: 'Sensor Puerta/Ventana', qty: 12, icon: <Package className="w-4 h-4" /> },
              { name: 'Detector PIR', qty: 8, icon: <Package className="w-4 h-4" /> },
              { name: 'Sirena Interior 110dB', qty: 4, icon: <Package className="w-4 h-4" /> },
              { name: 'Camara IP Interior HD', qty: 3, icon: <Camera className="w-4 h-4" /> },
              { name: 'Camara IP Exterior 4K', qty: 2, icon: <Camera className="w-4 h-4" /> },
              { name: 'Mando a Distancia', qty: 6, icon: <Package className="w-4 h-4" /> },
              { name: 'Teclado Panel', qty: 2, icon: <Package className="w-4 h-4" /> },
              { name: 'Detector de Humo', qty: 4, icon: <AlertTriangle className="w-4 h-4" /> },
              { name: 'Sentinel S', qty: 2, icon: <Clock className="w-4 h-4" /> },
            ].map((m, i) => (
              <div key={i} className="bg-orange-900/50 border border-orange-800 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-800 rounded-lg flex items-center justify-center text-orange-400">{m.icon}</div>
                  <p className="text-sm font-medium">{m.name}</p>
                </div>
                <span className={`text-sm font-bold ${m.qty > 3 ? 'text-emerald-400' : 'text-amber-400'}`}>{m.qty} uds</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'equipo' && (
          <div className="space-y-4" data-testid="instalador-equipo">
            <h2 className="font-bold text-lg">Mi equipo</h2>
            <div className="bg-orange-900/50 border border-orange-800 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Truck className="w-6 h-6 text-orange-400" />
                <div>
                  <p className="font-bold">Vehiculo: Ford Transit Custom</p>
                  <p className="text-xs text-orange-300">Matricula: 1234 ABC</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-900/50 border border-orange-800 rounded-xl p-4">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-orange-400" /> Miembros del equipo</h3>
              {[
                { name: user?.nombre || 'Instalador 1', role: 'Tecnico Principal', avatar: '👷' },
                { name: 'Tecnico Auxiliar', role: 'Ayudante', avatar: '👨‍🔧' },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-orange-800/50 last:border-0">
                  <span className="text-lg">{m.avatar}</span>
                  <div><p className="text-sm font-medium">{m.name}</p><p className="text-xs text-orange-400">{m.role}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-orange-900 border-t border-orange-800 flex" data-testid="instalador-nav">
        {[
          { id: 'agenda', icon: <Calendar className="w-5 h-5" />, label: 'Agenda' },
          { id: 'material', icon: <Package className="w-5 h-5" />, label: 'Material' },
          { id: 'equipo', icon: <Users className="w-5 h-5" />, label: 'Equipo' },
        ].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSelectedJob(null); }} className={`flex-1 py-3 flex flex-col items-center gap-1 ${tab === t.id ? 'text-orange-400' : 'text-orange-700'}`}>
            {t.icon}<span className="text-[10px]">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
