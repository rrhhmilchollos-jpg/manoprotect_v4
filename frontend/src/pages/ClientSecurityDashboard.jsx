/**
 * ManoProtect Connect — Client Security Dashboard
 * Panel de control del cliente: Armado/Desarmado, Camaras, Eventos, Usuarios
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, ShieldCheck, ShieldOff, Lock, Unlock, Camera, Bell, Clock,
  Users, Key, AlertTriangle, CheckCircle, ChevronRight, RefreshCw,
  Eye, Smartphone, Activity, Plus, Trash2, X, MapPin, Settings
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const ARM_MODES = {
  total: { label: 'Armado Total', icon: ShieldCheck, color: 'bg-emerald-500', desc: 'Todos los sensores activos. Casa vacia.' },
  partial: { label: 'Armado Parcial', icon: Shield, color: 'bg-amber-500', desc: 'Perimetro activo, interior desactivado. Dormir en casa.' },
  disarmed: { label: 'Desarmado', icon: ShieldOff, color: 'bg-slate-500', desc: 'Sistema desactivado. Sin proteccion.' },
};

const EVENT_LABELS = {
  intrusion: { label: 'Intrusion', color: 'text-red-400', bg: 'bg-red-500/10' },
  panic: { label: 'Panico', color: 'text-red-400', bg: 'bg-red-500/10' },
  sabotage: { label: 'Sabotaje', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  fire: { label: 'Incendio', color: 'text-red-400', bg: 'bg-red-500/10' },
  arm_total: { label: 'Armado total', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  arm_partial: { label: 'Armado parcial', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  arm_disarmed: { label: 'Desarmado', color: 'text-slate-400', bg: 'bg-slate-500/10' },
};

/* ─── ADD USER MODAL ─── */
const AddUserModal = ({ installId, onClose, onAdded }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const { user } = useAuth();

  const handleAdd = async () => {
    if (!email) return toast.error('Email requerido');
    try {
      const res = await fetch(`${API}/api/client-app/installation/${installId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': user?.email || '' },
        body: JSON.stringify({ installation_id: installId, user_email: email, user_name: name, role }),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      toast.success('Usuario anadido');
      onAdded();
      onClose();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-sm w-full mx-4 p-6" onClick={e => e.stopPropagation()} data-testid="add-user-modal">
        <h3 className="font-bold text-lg mb-4">Anadir usuario</h3>
        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" className="w-full border rounded-xl px-4 py-3 text-sm" data-testid="new-user-name" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full border rounded-xl px-4 py-3 text-sm" data-testid="new-user-email" />
          <select value={role} onChange={e => setRole(e.target.value)} className="w-full border rounded-xl px-4 py-3 text-sm" data-testid="new-user-role">
            <option value="admin">Administrador</option>
            <option value="user">Usuario</option>
            <option value="guest">Invitado</option>
          </select>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-3 border rounded-xl text-sm font-bold">Cancelar</button>
          <button onClick={handleAdd} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold" data-testid="confirm-add-user">Anadir</button>
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN CLIENT DASHBOARD ─── */
const ClientSecurityDashboard = () => {
  const { user } = useAuth();
  const [installations, setInstallations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [events, setEvents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('control');
  const [showAddUser, setShowAddUser] = useState(false);
  const [armLoading, setArmLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const email = user?.email || '';

  const fetchInstallations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/client-app/my-installations`, {
        headers: { 'x-user-email': email },
      });
      const data = await res.json();
      setInstallations(data.installations || []);
      if (data.installations?.length > 0 && !selected) {
        setSelected(data.installations[0]);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [email, selected]);

  const fetchDetails = useCallback(async () => {
    if (!selected) return;
    try {
      const [evRes, camRes, usrRes] = await Promise.all([
        fetch(`${API}/api/client-app/installation/${selected.id}/events`, { headers: { 'x-user-email': email } }),
        fetch(`${API}/api/client-app/installation/${selected.id}/cameras`, { headers: { 'x-user-email': email } }),
        fetch(`${API}/api/client-app/installation/${selected.id}/users`, { headers: { 'x-user-email': email } }).catch(() => ({ json: () => ({ users: [] }) })),
      ]);
      const [evData, camData, usrData] = await Promise.all([evRes.json(), camRes.json(), usrRes.json()]);
      setEvents(evData.events || []);
      setCameras(camData.cameras || []);
      setUsers(usrData.users || []);
    } catch (e) { console.error(e); }
  }, [selected, email]);

  useEffect(() => { fetchInstallations(); }, [fetchInstallations]);
  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  const handleArm = async (mode) => {
    if (!selected) return;
    setArmLoading(true);
    try {
      const res = await fetch(`${API}/api/client-app/installation/${selected.id}/arm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': email },
        body: JSON.stringify({ mode, code: '' }),
      });
      if (!res.ok) throw new Error('Error');
      setSelected(prev => ({ ...prev, armed_status: mode }));
      toast.success(mode === 'disarmed' ? 'Sistema desarmado' : `Armado ${mode}`);
      fetchDetails();
    } catch (e) { toast.error('Error al cambiar estado'); }
    setArmLoading(false);
  };

  const handleRemoveUser = async (userId) => {
    try {
      await fetch(`${API}/api/client-app/installation/${selected.id}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'x-user-email': email },
      });
      toast.success('Usuario eliminado');
      fetchDetails();
    } catch (e) { toast.error('Error'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );

  if (installations.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" data-testid="no-installations">
      <div className="text-center max-w-md">
        <Shield className="w-16 h-16 text-emerald-500/30 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sin instalaciones</h2>
        <p className="text-gray-500 text-sm mb-6">No tienes instalaciones de seguridad asociadas a tu cuenta. Contacta con ManoProtect para activar tu sistema.</p>
        <Link to="/contacto" className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-sm">Contactar</Link>
      </div>
    </div>
  );

  const currentMode = ARM_MODES[selected?.armed_status] || ARM_MODES.disarmed;
  const CurrentModeIcon = currentMode.icon;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="client-security-dashboard">
      {/* Top Bar */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <div>
              <h1 className="font-bold text-sm text-gray-900">ManoProtect Connect</h1>
              <p className="text-[10px] text-gray-400">Mi seguridad</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { fetchInstallations(); fetchDetails(); }} className="text-gray-400 hover:text-gray-600"><RefreshCw className="w-4 h-4" /></button>
            <Link to="/dashboard" className="text-gray-400 text-xs hover:text-gray-600">Mi cuenta</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Installation selector */}
        {installations.length > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {installations.map(inst => (
              <button
                key={inst.id}
                onClick={() => setSelected(inst)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selected?.id === inst.id ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-700 border-gray-200'}`}
              >
                <MapPin className="w-3 h-3 inline mr-1" />{inst.client_name}
              </button>
            ))}
          </div>
        )}

        {/* ARM STATUS — Big Controls */}
        <div className={`${currentMode.color} rounded-3xl p-6 mb-6 text-white text-center`} data-testid="arm-status-panel">
          <CurrentModeIcon className="w-12 h-12 mx-auto mb-2" />
          <h2 className="text-xl font-black mb-0.5">{currentMode.label}</h2>
          <p className="text-white/70 text-xs mb-1">{currentMode.desc}</p>
          <p className="text-white/50 text-[10px]">{selected?.address}, {selected?.city}</p>
        </div>

        {/* Arm Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6" data-testid="arm-buttons">
          {Object.entries(ARM_MODES).map(([mode, cfg]) => {
            const BtnIcon = cfg.icon;
            const isActive = selected?.armed_status === mode;
            return (
              <button
                key={mode}
                onClick={() => handleArm(mode)}
                disabled={armLoading || isActive}
                className={`rounded-2xl p-4 text-center transition-all border-2 ${isActive ? `${cfg.color} text-white border-transparent` : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'} ${armLoading ? 'opacity-50' : ''}`}
                data-testid={`arm-btn-${mode}`}
              >
                <BtnIcon className={`w-6 h-6 mx-auto mb-1 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <p className="text-xs font-bold">{cfg.label}</p>
              </button>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 bg-gray-100 rounded-xl p-1">
          {[
            { id: 'control', label: 'Panel', icon: Shield },
            { id: 'cameras', label: 'Camaras', icon: Camera },
            { id: 'events', label: 'Eventos', icon: Bell },
            { id: 'users', label: 'Usuarios', icon: Users },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              data-testid={`client-tab-${t.id}`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* CONTROL TAB */}
        {activeTab === 'control' && (
          <div className="space-y-3" data-testid="control-panel">
            <div className="bg-white rounded-2xl border p-5">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Estado del sistema</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-gray-900">{selected?.device_count || 0}</p>
                  <p className="text-[10px] text-gray-500">Dispositivos</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-gray-900">{events.length}</p>
                  <p className="text-[10px] text-gray-500">Eventos recientes</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border p-5">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> Ultimos eventos</h3>
              {events.slice(0, 5).map((ev, i) => {
                const evCfg = EVENT_LABELS[ev.event_type] || { label: ev.event_type, color: 'text-gray-400', bg: 'bg-gray-100' };
                return (
                  <div key={i} className={`flex items-center gap-3 ${evCfg.bg} rounded-xl p-3 mb-2`}>
                    <Bell className={`w-4 h-4 ${evCfg.color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900">{evCfg.label}</p>
                      <p className="text-[10px] text-gray-500">{ev.description}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{new Date(ev.created_at).toLocaleTimeString('es-ES')}</span>
                  </div>
                );
              })}
              {events.length === 0 && <p className="text-gray-400 text-xs text-center py-4">Sin eventos recientes</p>}
            </div>
          </div>
        )}

        {/* CAMERAS TAB */}
        {activeTab === 'cameras' && (
          <div data-testid="cameras-panel">
            {cameras.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border">
                <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-bold text-sm">Sin camaras configuradas</p>
                <p className="text-gray-400 text-xs">Contacta con ManoProtect para anadir camaras a tu instalacion</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {cameras.map(cam => (
                  <div key={cam.id} className="bg-white rounded-2xl border overflow-hidden">
                    <div className="bg-gray-900 aspect-video flex items-center justify-center relative">
                      <Camera className="w-10 h-10 text-gray-600" />
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> EN VIVO
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-gray-900">{cam.location_desc || cam.zone}</p>
                      <p className="text-[10px] text-gray-500">{cam.model} | {cam.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-2xl border p-5" data-testid="events-panel">
            <h3 className="font-bold text-sm mb-3">Historial de eventos</h3>
            <div className="space-y-2">
              {events.map((ev, i) => {
                const evCfg = EVENT_LABELS[ev.event_type] || { label: ev.event_type, color: 'text-gray-400', bg: 'bg-gray-100' };
                return (
                  <div key={i} className="flex items-center gap-3 border-b border-gray-100 pb-2 last:border-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${evCfg.bg}`}>
                      <Bell className={`w-4 h-4 ${evCfg.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900">{evCfg.label} — {ev.zone}</p>
                      <p className="text-[10px] text-gray-500">{ev.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] text-gray-400">{new Date(ev.created_at).toLocaleDateString('es-ES')}</p>
                      <p className="text-[10px] text-gray-400">{new Date(ev.created_at).toLocaleTimeString('es-ES')}</p>
                    </div>
                  </div>
                );
              })}
              {events.length === 0 && <p className="text-gray-400 text-xs text-center py-8">Sin eventos registrados</p>}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border p-5" data-testid="users-panel">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">Usuarios con acceso</h3>
              {selected?.user_role === 'owner' && (
                <button onClick={() => setShowAddUser(true)} className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1" data-testid="add-user-btn">
                  <Plus className="w-3 h-3" /> Anadir
                </button>
              )}
            </div>
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900">{u.user_name || u.user_email}</p>
                    <p className="text-[10px] text-gray-500">{u.role} | {u.user_email}</p>
                  </div>
                  {u.role !== 'owner' && selected?.user_role === 'owner' && (
                    <button onClick={() => handleRemoveUser(u.id)} className="text-red-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAddUser && <AddUserModal installId={selected?.id} onClose={() => setShowAddUser(false)} onAdded={fetchDetails} />}
    </div>
  );
};

export default ClientSecurityDashboard;
