/**
 * CRA Operator Dashboard — Central Receptora de Alarmas
 * Panel operativo en tiempo real para monitoreo de alarmas
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, AlertTriangle, Bell, Eye, Phone, MapPin, CheckCircle, Clock,
  Radio, Cpu, Users, Lock, Activity, Monitor, ChevronRight, RefreshCw,
  Camera, Wifi, WifiOff, Play, Square, FileText, Headphones, X, Zap
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500', pulse: true },
  high: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500', pulse: true },
  medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500', pulse: false },
  low: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500', pulse: false },
};

const EVENT_ICONS = {
  intrusion: AlertTriangle, panic: Bell, sabotage: WifiOff, fire: Zap, medical: Activity, test: CheckCircle,
  arm_total: Lock, arm_partial: Lock, arm_disarmed: Lock,
};

const STATUS_LABELS = {
  pending: { label: 'Pendiente', color: 'bg-red-500' },
  in_progress: { label: 'En curso', color: 'bg-amber-500' },
  police_dispatched: { label: 'Policia avisada', color: 'bg-blue-500' },
  acuda_dispatched: { label: 'Acuda enviado', color: 'bg-indigo-500' },
  resolved: { label: 'Resuelto', color: 'bg-emerald-500' },
};

/* ─── PROTOCOL MODAL ─── */
const ProtocolModal = ({ protocol, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full mx-4 p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">{protocol.name}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
      <div className="space-y-3">
        {protocol.steps.map(s => (
          <div key={s.num} className="flex gap-3 bg-slate-800/50 rounded-xl p-3">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-400 text-sm font-bold">{s.num}</span>
            </div>
            <div>
              <p className="text-white text-sm font-bold">{s.action}</p>
              <p className="text-slate-400 text-xs">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── ALARM DETAIL MODAL ─── */
const AlarmDetailModal = ({ alarm, onClose, onAction }) => {
  const [actionNotes, setActionNotes] = useState('');
  const sev = SEVERITY_COLORS[alarm.severity] || SEVERITY_COLORS.medium;
  const Icon = EVENT_ICONS[alarm.event_type] || AlertTriangle;
  const st = STATUS_LABELS[alarm.status] || STATUS_LABELS.pending;

  const handleAction = async (action) => {
    await onAction(alarm.id, action, actionNotes);
    setActionNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full mx-4 p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()} data-testid="alarm-detail-modal">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${sev.bg} rounded-xl flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${sev.text}`} />
            </div>
            <div>
              <h3 className="text-white font-bold">{alarm.event_type?.toUpperCase()} — {alarm.zone}</h3>
              <p className="text-slate-400 text-xs">{alarm.client_name} | {alarm.address}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`${st.color} text-white text-xs px-3 py-1 rounded-full font-bold`}>{st.label}</span>
          <span className={`${sev.badge} text-white text-xs px-3 py-1 rounded-full font-bold`}>{alarm.severity}</span>
          <span className="text-slate-500 text-xs ml-auto">{new Date(alarm.created_at).toLocaleString('es-ES')}</span>
        </div>

        <p className="text-slate-300 text-sm mb-4 bg-slate-800/50 rounded-xl p-3">{alarm.description}</p>

        {/* Action log */}
        {alarm.action_log?.length > 0 && (
          <div className="mb-4">
            <p className="text-slate-500 text-xs font-bold mb-2">REGISTRO DE ACCIONES</p>
            <div className="space-y-1">
              {alarm.action_log.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-xs bg-slate-800/30 rounded-lg px-3 py-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300 font-medium">{a.action}</span>
                  {a.notes && <span className="text-slate-500">— {a.notes}</span>}
                  <span className="text-slate-600 ml-auto">{new Date(a.timestamp).toLocaleTimeString('es-ES')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {alarm.status !== 'resolved' && (
          <div className="border-t border-slate-800 pt-4">
            <textarea
              value={actionNotes}
              onChange={e => setActionNotes(e.target.value)}
              placeholder="Notas del operador..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm mb-3 resize-none h-16"
              data-testid="alarm-notes-input"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button onClick={() => handleAction('verify_video')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5" data-testid="action-verify-video">
                <Camera className="w-3.5 h-3.5" /> Video-verificar
              </button>
              <button onClick={() => handleAction('call_client')} className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5" data-testid="action-call-client">
                <Phone className="w-3.5 h-3.5" /> Llamar titular
              </button>
              <button onClick={() => handleAction('call_police')} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5" data-testid="action-call-police">
                <AlertTriangle className="w-3.5 h-3.5" /> Avisar Policia
              </button>
              <button onClick={() => handleAction('dispatch_acuda')} className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5" data-testid="action-dispatch-acuda">
                <MapPin className="w-3.5 h-3.5" /> Despachar Acuda
              </button>
              <button onClick={() => handleAction('false_alarm')} className="bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5" data-testid="action-false-alarm">
                <X className="w-3.5 h-3.5" /> Falsa alarma
              </button>
              <button onClick={() => handleAction('resolved')} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5" data-testid="action-resolved">
                <CheckCircle className="w-3.5 h-3.5" /> Resuelto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


/* ─── MAIN DASHBOARD ─── */
const CRAOperatorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [alarms, setAlarms] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [activeTab, setActiveTab] = useState('alarms');
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [selectedInstallation, setSelectedInstallation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, alarmsRes, installRes, protoRes] = await Promise.all([
        fetch(`${API}/api/cra/dashboard`),
        fetch(`${API}/api/cra/alarms?limit=50`),
        fetch(`${API}/api/cra/installations`),
        fetch(`${API}/api/cra/protocols`),
      ]);
      const [dash, alm, inst, proto] = await Promise.all([
        dashRes.json(), alarmsRes.json(), installRes.json(), protoRes.json()
      ]);
      setStats(dash);
      setAlarms(alm.alarms || []);
      setInstallations(inst.installations || []);
      setProtocols(proto.protocols || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); const iv = setInterval(fetchData, 15000); return () => clearInterval(iv); }, [fetchData]);
  useEffect(() => { const handler = () => fetchData(); window.addEventListener('manoprotect-refresh', handler); return () => window.removeEventListener('manoprotect-refresh', handler); }, [fetchData]);

  const handleAlarmAction = async (alarmId, action, notes) => {
    try {
      await fetch(`${API}/api/cra/alarms/${alarmId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });
      setSelectedAlarm(null);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleAssign = async (alarmId) => {
    try {
      await fetch(`${API}/api/cra/alarms/${alarmId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator_id: 'operator-1' }),
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  const pendingAlarms = alarms.filter(a => a.status === 'pending');
  const activeAlarms = alarms.filter(a => ['in_progress', 'police_dispatched', 'acuda_dispatched'].includes(a.status));

  return (
    <div className="min-h-screen bg-slate-950" data-testid="cra-operator-dashboard">
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center"><Monitor className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-white font-bold text-sm">Central Receptora de Alarmas</h1>
              <p className="text-slate-500 text-[10px]">ManoProtect CRA — Panel Operador</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {pendingAlarms.length > 0 && (
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1 animate-pulse">
                <Bell className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400 text-xs font-bold">{pendingAlarms.length} pendientes</span>
              </div>
            )}
            <button onClick={fetchData} className="text-slate-400 hover:text-white"><RefreshCw className="w-4 h-4" /></button>
            <div className="w-2 h-2 bg-emerald-500 rounded-full" title="Sistema operativo" />
            <Link to="/" className="text-slate-500 text-xs hover:text-slate-300">Salir</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6" data-testid="cra-stats">
          {[
            { label: 'Instalaciones', value: stats?.total_installations || 0, icon: Shield, color: 'text-emerald-400' },
            { label: 'Dispositivos', value: stats?.total_devices || 0, icon: Cpu, color: 'text-blue-400' },
            { label: 'Pendientes', value: stats?.pending_alarms || 0, icon: AlertTriangle, color: 'text-red-400' },
            { label: 'En curso', value: stats?.in_progress || 0, icon: Activity, color: 'text-amber-400' },
            { label: 'Eventos hoy', value: stats?.today_events || 0, icon: Bell, color: 'text-indigo-400' },
            { label: 'Resueltos hoy', value: stats?.resolved_today || 0, icon: CheckCircle, color: 'text-emerald-400' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-slate-500 text-[10px] font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-slate-800 pb-2">
          {[
            { id: 'alarms', label: 'Alarmas', icon: Bell, count: pendingAlarms.length + activeAlarms.length },
            { id: 'installations', label: 'Instalaciones', icon: Shield, count: installations.length },
            { id: 'protocols', label: 'Protocolos', icon: FileText, count: protocols.length },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === t.id ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
              data-testid={`tab-${t.id}`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
              {t.count > 0 && <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === t.id ? 'bg-indigo-500/30' : 'bg-slate-800'}`}>{t.count}</span>}
            </button>
          ))}
        </div>

        {/* ALARMS TAB */}
        {activeTab === 'alarms' && (
          <div className="space-y-2" data-testid="alarms-list">
            {alarms.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Shield className="w-12 h-12 mx-auto mb-3 text-emerald-500/30" />
                <p className="font-bold">Sin alarmas activas</p>
                <p className="text-xs">Todo el sistema operativo</p>
              </div>
            ) : alarms.map(alarm => {
              const sev = SEVERITY_COLORS[alarm.severity] || SEVERITY_COLORS.medium;
              const Icon = EVENT_ICONS[alarm.event_type] || AlertTriangle;
              const st = STATUS_LABELS[alarm.status] || STATUS_LABELS.pending;
              return (
                <div
                  key={alarm.id}
                  className={`${sev.bg} border ${sev.border} rounded-xl p-4 cursor-pointer hover:brightness-110 transition-all ${sev.pulse && alarm.status === 'pending' ? 'animate-pulse' : ''}`}
                  onClick={() => setSelectedAlarm(alarm)}
                  data-testid={`alarm-${alarm.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${sev.badge} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white font-bold text-sm">{alarm.event_type?.toUpperCase()}</span>
                        <span className={`${st.color} text-white text-[9px] px-2 py-0.5 rounded-full font-bold`}>{st.label}</span>
                      </div>
                      <p className="text-slate-300 text-xs">{alarm.client_name || 'Desconocido'} — {alarm.address || alarm.zone}</p>
                      <p className="text-slate-500 text-[10px]">{alarm.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-slate-400 text-[10px]">{new Date(alarm.created_at).toLocaleTimeString('es-ES')}</p>
                      {alarm.status === 'pending' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAssign(alarm.id); }}
                          className="mt-1 bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] px-3 py-1 rounded-lg font-bold"
                          data-testid={`assign-${alarm.id}`}
                        >
                          Asignar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* INSTALLATIONS TAB */}
        {activeTab === 'installations' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="installations-list">
            {installations.map(inst => (
              <div
                key={inst.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 rounded-xl p-5 cursor-pointer transition-all"
                onClick={() => setSelectedInstallation(selectedInstallation?.id === inst.id ? null : inst)}
                data-testid={`installation-${inst.id}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${inst.armed_status === 'disarmed' ? 'bg-slate-500' : inst.armed_status === 'partial' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <h3 className="text-white font-bold text-sm">{inst.client_name}</h3>
                </div>
                <p className="text-slate-400 text-xs mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {inst.address}, {inst.city}</p>
                <p className="text-slate-500 text-[10px] mb-2">Plan: {inst.plan_type} | Estado: {inst.armed_status}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{inst.status}</span>
                  <span className="text-[10px] text-slate-600">Tel: {inst.client_phone}</span>
                </div>

                {selectedInstallation?.id === inst.id && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-1">
                    <p className="text-slate-500 text-[10px] font-bold">CONTACTOS EMERGENCIA</p>
                    {inst.emergency_contacts?.length > 0 ? inst.emergency_contacts.map((c, i) => (
                      <p key={i} className="text-slate-400 text-xs">{c.name}: {c.phone}</p>
                    )) : <p className="text-slate-600 text-xs">Sin contactos registrados</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PROTOCOLS TAB */}
        {activeTab === 'protocols' && (
          <div className="grid sm:grid-cols-2 gap-3" data-testid="protocols-list">
            {protocols.map(proto => (
              <div
                key={proto.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 rounded-xl p-5 cursor-pointer transition-all"
                onClick={() => setSelectedProtocol(proto)}
                data-testid={`protocol-${proto.id}`}
              >
                <FileText className="w-6 h-6 text-indigo-400 mb-2" />
                <h3 className="text-white font-bold text-sm mb-1">{proto.name}</h3>
                <p className="text-slate-500 text-xs">{proto.steps.length} pasos | Haz click para ver el protocolo completo</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedAlarm && <AlarmDetailModal alarm={selectedAlarm} onClose={() => setSelectedAlarm(null)} onAction={handleAlarmAction} />}
      {selectedProtocol && <ProtocolModal protocol={selectedProtocol} onClose={() => setSelectedProtocol(null)} />}
    </div>
  );
};

export default CRAOperatorDashboard;
