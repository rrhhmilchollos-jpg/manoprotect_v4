import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '@/utils/apiBase';
import { toast } from 'sonner';
import {
  Wrench, Clock, CheckCircle2, MapPin, Phone, User, LogOut,
  ChevronRight, Loader2, RefreshCw, FileText, AlertTriangle, Play
} from 'lucide-react';
import NotificationBell from '@/components/gestion/NotificationBell';
import UpdateChecker from '@/components/gestion/UpdateChecker';

const gFetch = async (path, opts = {}) => {
  const token = localStorage.getItem('gestion_token');
  const res = await fetch(`${API}/gestion${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
  });
  if (res.status === 401) { localStorage.removeItem('gestion_token'); window.location.href = '/gestion/login'; return; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Error');
  return data;
};

const StatusBadge = ({ estado }) => {
  const conf = {
    pendiente: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
    asignado: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: User },
    en_progreso: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Play },
    completado: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
    cancelado: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertTriangle },
  };
  const c = conf[estado] || conf.pendiente;
  const Icon = c.icon;
  return <span className={`px-2 py-0.5 rounded-full text-xs border ${c.color} inline-flex items-center gap-1`}><Icon className="w-3 h-3" />{estado}</span>;
};

const MANUALES = [
  { titulo: 'Guía Panel Central', desc: 'Instalación y configuración del panel ManoProtect', tipo: 'PDF' },
  { titulo: 'Cámaras IP Interior', desc: 'Montaje y conexión WiFi paso a paso', tipo: 'PDF' },
  { titulo: 'Cámaras IP Exterior', desc: 'Instalación exterior resistente al agua', tipo: 'PDF' },
  { titulo: 'Sensores PIR', desc: 'Ubicación óptima y calibración', tipo: 'PDF' },
  { titulo: 'Sentinel Lock Pro', desc: 'Guía completa de instalación cerradura inteligente', tipo: 'Video' },
  { titulo: 'Sirena + Teclado', desc: 'Conexión al panel y configuración de zonas', tipo: 'PDF' },
];

export default function GestionInstaladores() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('pendientes');
  const [instalaciones, setInstalaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('gestion_user') || 'null');
    if (!u || u.rol !== 'instalador') { navigate('/gestion/login'); return; }
    setUser(u);
  }, [navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [inst, st] = await Promise.all([gFetch('/instalaciones'), gFetch('/dashboard/stats')]);
      setInstalaciones(inst.instalaciones || []);
      setStats(st);
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const updateEstado = async (id, estado) => {
    try {
      await gFetch(`/instalaciones/${id}`, { method: 'PUT', body: JSON.stringify({ estado }) });
      toast.success(`Instalación actualizada a: ${estado}`);
      loadData();
    } catch (e) { toast.error(e.message); }
  };

  const pendientes = instalaciones.filter(i => ['pendiente', 'asignado'].includes(i.estado));
  const enProgreso = instalaciones.filter(i => i.estado === 'en_progreso');
  const completadas = instalaciones.filter(i => i.estado === 'completado');

  if (!user) return null;

  const renderInstalacion = (inst) => (
    <div key={inst.instalacion_id} className="bg-slate-900 border border-slate-800 rounded-xl p-4" data-testid={`instalacion-${inst.instalacion_id}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-indigo-400">{inst.instalacion_id}</span>
        <StatusBadge estado={inst.estado} />
      </div>
      <p className="text-sm font-medium text-white">{inst.cliente_nombre}</p>
      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{inst.direccion || 'Sin dirección'}</span>
      </div>
      {inst.cliente_telefono && (
        <a href={`tel:${inst.cliente_telefono}`} className="flex items-center gap-1 mt-1 text-xs text-emerald-400 hover:text-emerald-300">
          <Phone className="w-3 h-3" />{inst.cliente_telefono}
        </a>
      )}
      {inst.fecha_programada && (
        <p className="text-xs text-slate-600 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />Programada: {inst.fecha_programada}</p>
      )}
      {inst.notas && <p className="text-xs text-slate-600 mt-1 italic">"{inst.notas}"</p>}
      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        {inst.estado === 'asignado' && (
          <button onClick={() => updateEstado(inst.instalacion_id, 'en_progreso')} className="flex-1 bg-purple-600/20 border border-purple-500/30 text-purple-400 text-xs py-2 rounded-lg font-medium hover:bg-purple-600/40" data-testid={`start-${inst.instalacion_id}`}>
            Iniciar Instalación
          </button>
        )}
        {inst.estado === 'en_progreso' && (
          <button onClick={() => updateEstado(inst.instalacion_id, 'completado')} className="flex-1 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs py-2 rounded-lg font-medium hover:bg-emerald-600/40" data-testid={`complete-${inst.instalacion_id}`}>
            Marcar Completada
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950" data-testid="gestion-instaladores-page">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center"><Wrench className="w-4 h-4 text-amber-400" /></div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">Instaladores</h1>
            <p className="text-[10px] text-slate-500">{user.nombre}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="p-2 text-slate-400 hover:text-white"><RefreshCw className="w-4 h-4" /></button>
          <NotificationBell />
          <button data-testid="gestion-logout" onClick={() => { localStorage.removeItem('gestion_token'); localStorage.removeItem('gestion_user'); navigate('/gestion/login'); }} className="p-2 text-slate-400 hover:text-red-400"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      <UpdateChecker appName="instaladores" />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 p-3">
          {[
            { label: 'Asignadas', value: pendientes.length, color: 'text-yellow-400' },
            { label: 'En Progreso', value: enProgreso.length, color: 'text-purple-400' },
            { label: 'Completadas', value: completadas.length, color: 'text-emerald-400' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 px-2">
        {[
          { id: 'pendientes', label: 'Pendientes', icon: Clock },
          { id: 'progreso', label: 'En Progreso', icon: Play },
          { id: 'completadas', label: 'Completadas', icon: CheckCircle2 },
          { id: 'manuales', label: 'Manuales', icon: FileText },
        ].map(t => (
          <button
            key={t.id}
            data-testid={`tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-3 text-xs font-medium border-b-2 transition-colors ${tab === t.id ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <t.icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="p-3">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-slate-500 animate-spin" /></div>
        ) : tab === 'pendientes' ? (
          <div className="space-y-3">
            {pendientes.length === 0 && <p className="text-center text-slate-500 text-sm py-10">No tienes instalaciones pendientes</p>}
            {pendientes.map(renderInstalacion)}
          </div>
        ) : tab === 'progreso' ? (
          <div className="space-y-3">
            {enProgreso.length === 0 && <p className="text-center text-slate-500 text-sm py-10">No hay instalaciones en progreso</p>}
            {enProgreso.map(renderInstalacion)}
          </div>
        ) : tab === 'completadas' ? (
          <div className="space-y-3">
            {completadas.length === 0 && <p className="text-center text-slate-500 text-sm py-10">Sin instalaciones completadas aún</p>}
            {completadas.map(renderInstalacion)}
          </div>
        ) : tab === 'manuales' ? (
          <div className="space-y-2">
            {MANUALES.map((m, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{m.titulo}</p>
                  <p className="text-xs text-slate-500">{m.desc}</p>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{m.tipo}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
