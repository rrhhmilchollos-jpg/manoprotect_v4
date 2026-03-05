/**
 * ManoConnect — App de Seguridad para Clientes
 * Professional alarm client app - Mobile-first, Play Store ready
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, ShieldCheck, ShieldOff, Camera, Bell, Clock,
  Users, AlertTriangle, Eye, Activity, Plus, Trash2, X,
  MapPin, Settings, Phone, ChevronDown, Power, Wifi, WifiOff,
  Lock, Unlock, Volume2, Home, History, UserCog, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL || '';

/* ─── CONSTANTS ─── */
const ARM_MODES = {
  total: { label: 'Armado Total', icon: ShieldCheck, color: '#10b981', bg: 'from-emerald-600 to-emerald-700', desc: 'Todos los sensores activos' },
  partial: { label: 'Armado Parcial', icon: Shield, color: '#f59e0b', bg: 'from-amber-500 to-amber-600', desc: 'Perimetro activo' },
  disarmed: { label: 'Desarmado', icon: ShieldOff, color: '#64748b', bg: 'from-slate-600 to-slate-700', desc: 'Sistema desactivado' },
};

const EVT = {
  intrusion: { label: 'Intrusion', color: 'text-red-400', icon: AlertTriangle },
  panic: { label: 'Panico', color: 'text-red-400', icon: AlertCircle },
  sabotage: { label: 'Sabotaje', color: 'text-orange-400', icon: AlertTriangle },
  fire: { label: 'Incendio', color: 'text-red-400', icon: AlertTriangle },
  arm_total: { label: 'Armado total', color: 'text-emerald-400', icon: ShieldCheck },
  arm_partial: { label: 'Armado parcial', color: 'text-amber-400', icon: Shield },
  arm_disarmed: { label: 'Desarmado', color: 'text-slate-400', icon: ShieldOff },
};

/* ─── SOS PANIC BUTTON ─── */
const SOSButton = ({ installId, email }) => {
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  const startPress = () => {
    setPressing(true);
    setProgress(0);
    let p = 0;
    timerRef.current = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(timerRef.current);
        triggerSOS();
      }
    }, 60);
  };

  const stopPress = () => {
    setPressing(false);
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const triggerSOS = async () => {
    setPressing(false);
    setProgress(0);
    try {
      await fetch(`${API}/api/client-app/installation/${installId}/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': email },
        credentials: 'include',
        body: JSON.stringify({ type: 'panic' }),
      });
      toast.success('Alerta SOS enviada a la CRA');
    } catch {
      toast.error('Error al enviar alerta');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="4" />
          <circle cx="50" cy="50" r="46" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray={`${progress * 2.89} 289`} strokeLinecap="round" />
        </svg>
        <button
          onMouseDown={startPress} onMouseUp={stopPress} onMouseLeave={stopPress}
          onTouchStart={startPress} onTouchEnd={stopPress}
          className="w-24 h-24 rounded-full bg-gradient-to-b from-red-500 to-red-700 text-white font-black text-sm flex flex-col items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition-transform"
          data-testid="sos-panic-btn"
        >
          <Phone className="w-6 h-6 mb-0.5" />
          SOS
        </button>
      </div>
      <p className="text-[10px] text-slate-500 mt-2 text-center">Manten pulsado 3s</p>
    </div>
  );
};

/* ─── CAMERA FEED ─── */
const CamFeed = ({ camera }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 640;
    const h = canvas.height = 360;
    let frame = 0;
    let animId;

    const draw = () => {
      frame++;
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 16) {
        const n = Math.random() * 18 - 9;
        data[i] = Math.max(0, data[i] + n);
        data[i + 1] = Math.max(0, data[i + 1] + n);
        data[i + 2] = Math.max(0, data[i + 2] + n);
      }
      ctx.putImageData(imageData, 0, 0);
      ctx.strokeStyle = 'rgba(16,185,129,0.12)';
      ctx.lineWidth = 1;
      for (let gy = 180; gy < h; gy += 25) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }
      for (let gx = 0; gx < w; gx += 70) { ctx.beginPath(); ctx.moveTo(gx, 180); ctx.lineTo(gx + (gx - w / 2) * 0.4, h); ctx.stroke(); }
      ctx.fillStyle = 'rgba(30,50,45,0.25)';
      ctx.fillRect(40, 90, 110, 130);
      ctx.fillRect(430, 70, 130, 150);
      if (frame % 280 > 240) {
        ctx.strokeStyle = 'rgba(239,68,68,0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(240 + Math.sin(frame * 0.04) * 5, 120, 90, 110);
        ctx.setLineDash([]);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.02)';
      for (let sl = 0; sl < h; sl += 3) ctx.fillRect(0, sl, w, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(0, 0, w, 26);
      ctx.fillRect(0, h - 26, w, 26);
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#10b981';
      ctx.fillText(`${camera.zone} — ${camera.location_desc}`, 8, 17);
      const now = new Date();
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      const ts = now.toLocaleDateString('es-ES') + ' ' + now.toLocaleTimeString('es-ES');
      ctx.fillText(ts, w - ctx.measureText(ts).width - 8, 17);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(12, h - 13, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '9px monospace';
      ctx.fillText('REC', 22, h - 9);
      ctx.fillStyle = '#64748b';
      ctx.fillText(`${camera.model} | ${w}x${h}`, w / 2 - 50, h - 9);
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [camera]);

  const takeSnapshot = () => {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement('a');
    a.download = `manoconnect_${camera.zone}_${Date.now()}.png`;
    a.href = c.toDataURL();
    a.click();
    toast.success('Captura guardada');
  };

  return (
    <div ref={containerRef} className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/50" data-testid={`cam-${camera.id}`}>
      <div className="relative">
        <canvas ref={canvasRef} className="w-full aspect-video" />
        <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[8px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> EN VIVO
        </div>
        <div className="absolute bottom-8 right-2 flex gap-1">
          <button onClick={takeSnapshot} className="bg-black/50 text-white p-1.5 rounded-lg hover:bg-black/70 transition"><Camera className="w-3 h-3" /></button>
          <button onClick={() => { containerRef.current?.requestFullscreen?.().catch(()=>{}) }} className="bg-black/50 text-white p-1.5 rounded-lg hover:bg-black/70 transition"><Eye className="w-3 h-3" /></button>
        </div>
      </div>
      <div className="px-3 py-2 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-white">{camera.location_desc}</p>
          <p className="text-[9px] text-slate-400">{camera.model}</p>
        </div>
        <div className={`w-2 h-2 rounded-full ${camera.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
      </div>
    </div>
  );
};

/* ─── ADD USER MODAL ─── */
const AddUserModal = ({ installId, onClose, onAdded, email }) => {
  const [newEmail, setNewEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');

  const handleAdd = async () => {
    if (!newEmail.trim()) return toast.error('Email requerido');
    try {
      const res = await fetch(`${API}/api/client-app/installation/${installId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': email },
        credentials: 'include',
        body: JSON.stringify({ user_email: newEmail, user_name: name, role }),
      });
      if (!res.ok) throw new Error();
      toast.success('Usuario anadido');
      onAdded();
      onClose();
    } catch { toast.error('Error al anadir usuario'); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 border border-slate-700" onClick={e => e.stopPropagation()} data-testid="add-user-modal">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">Anadir usuario</h3>
          <button onClick={onClose} className="text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-sm mb-3 border border-slate-600 placeholder-slate-400 focus:outline-none focus:border-emerald-500" data-testid="new-user-name" />
        <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email" type="email" className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-sm mb-3 border border-slate-600 placeholder-slate-400 focus:outline-none focus:border-emerald-500" data-testid="new-user-email" />
        <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-sm mb-5 border border-slate-600 focus:outline-none focus:border-emerald-500">
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
        </select>
        <button onClick={handleAdd} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition" data-testid="confirm-add-user">Anadir usuario</button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MANOCONNECT — MAIN APP
   ═══════════════════════════════════════════════════════════ */
const ManoConnectApp = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [installations, setInstallations] = useState([]);
  const [sel, setSel] = useState(null);
  const [events, setEvents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('home');
  const [showAddUser, setShowAddUser] = useState(false);
  const [armLoading, setArmLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInstPicker, setShowInstPicker] = useState(false);

  const email = user?.email || '';

  const fetchInstallations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/client-app/my-installations`, { headers: { 'x-user-email': email }, credentials: 'include' });
      const data = await res.json();
      setInstallations(data.installations || []);
      if (data.installations?.length > 0 && !sel) setSel(data.installations[0]);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [email, sel]);

  const fetchDetails = useCallback(async () => {
    if (!sel) return;
    try {
      const [evRes, camRes, usrRes] = await Promise.all([
        fetch(`${API}/api/client-app/installation/${sel.id}/events`, { headers: { 'x-user-email': email }, credentials: 'include' }),
        fetch(`${API}/api/client-app/installation/${sel.id}/cameras`, { headers: { 'x-user-email': email }, credentials: 'include' }),
        fetch(`${API}/api/client-app/installation/${sel.id}/users`, { headers: { 'x-user-email': email }, credentials: 'include' }).catch(() => ({ json: () => ({ users: [] }) })),
      ]);
      const [evD, camD, usrD] = await Promise.all([evRes.json(), camRes.json(), usrRes.json()]);
      setEvents(evD.events || []);
      setCameras(camD.cameras || []);
      setUsers(usrD.users || []);
    } catch (e) { console.error(e); }
  }, [sel, email]);

  useEffect(() => { fetchInstallations(); }, [fetchInstallations]);
  useEffect(() => { fetchDetails(); }, [fetchDetails]);
  useEffect(() => {
    const handler = () => { fetchInstallations(); fetchDetails(); };
    window.addEventListener('manoprotect-refresh', handler);
    const iv = setInterval(handler, 15000);
    return () => { window.removeEventListener('manoprotect-refresh', handler); clearInterval(iv); };
  }, [fetchInstallations, fetchDetails]);

  const handleArm = async (mode) => {
    if (!sel) return;
    setArmLoading(true);
    try {
      const res = await fetch(`${API}/api/client-app/installation/${sel.id}/arm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': email },
        credentials: 'include',
        body: JSON.stringify({ mode, code: '' }),
      });
      if (!res.ok) throw new Error();
      setSel(p => ({ ...p, armed_status: mode }));
      toast.success(mode === 'disarmed' ? 'Sistema desarmado' : `Armado ${mode}`);
      fetchDetails();
    } catch { toast.error('Error al cambiar estado'); }
    setArmLoading(false);
  };

  const handleRemoveUser = async (userId) => {
    try {
      await fetch(`${API}/api/client-app/installation/${sel.id}/users/${userId}`, {
        method: 'DELETE', headers: { 'x-user-email': email }, credentials: 'include',
      });
      toast.success('Usuario eliminado');
      fetchDetails();
    } catch { toast.error('Error'); }
  };

  /* ─── Loading ─── */
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
      <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 animate-pulse"><Shield className="w-7 h-7 text-white" /></div>
      <p className="text-slate-400 text-sm font-medium">Conectando...</p>
    </div>
  );

  /* ─── No installations ─── */
  if (installations.length === 0) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6" data-testid="no-installations">
      <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-5"><Shield className="w-10 h-10 text-slate-600" /></div>
      <h2 className="text-xl font-bold text-white mb-2">Sin instalaciones</h2>
      <p className="text-slate-400 text-sm text-center mb-8 max-w-xs">No tienes sistemas de seguridad asociados a tu cuenta. Contacta con ManoProtect para activar tu alarma.</p>
      <button onClick={() => navigate('/contacto')} className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold text-sm">Contactar con ManoProtect</button>
    </div>
  );

  const mode = ARM_MODES[sel?.armed_status] || ARM_MODES.disarmed;
  const ModeIcon = mode.icon;
  const onlineDevices = cameras.filter(c => c.status === 'online').length;

  return (
    <div className="min-h-screen bg-slate-950 pb-20" data-testid="manoconnect-app">

      {/* ═══ STATUS BAR ═══ */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-tight">ManoConnect</h1>
              <p className="text-[9px] text-slate-500">{sel?.client_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {installations.length > 1 && (
              <button onClick={() => setShowInstPicker(!showInstPicker)} className="text-slate-400 p-1"><ChevronDown className="w-4 h-4" /></button>
            )}
            <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-medium"><Wifi className="w-3 h-3" /> Online</div>
          </div>
        </div>
        {/* Installation picker dropdown */}
        {showInstPicker && installations.length > 1 && (
          <div className="absolute top-full left-0 right-0 bg-slate-800 border-b border-slate-700 px-4 py-3 z-50">
            <div className="max-w-lg mx-auto space-y-2">
              {installations.map(inst => (
                <button key={inst.id} onClick={() => { setSel(inst); setShowInstPicker(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition ${sel?.id === inst.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700/50 text-slate-300 border border-slate-700'}`}>
                  <MapPin className="w-3 h-3 inline mr-2" />{inst.client_name}
                  <span className="text-[10px] text-slate-500 ml-2">{inst.city}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4">

        {/* ═══ HOME TAB ═══ */}
        {tab === 'home' && (
          <div className="space-y-4" data-testid="tab-home">
            {/* Big ARM Status */}
            <div className={`bg-gradient-to-br ${mode.bg} rounded-3xl p-6 text-center relative overflow-hidden`} data-testid="arm-status">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-white rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full" />
              </div>
              <div className="relative z-10">
                <ModeIcon className="w-14 h-14 mx-auto mb-2 text-white" />
                <h2 className="text-2xl font-black text-white tracking-tight">{mode.label}</h2>
                <p className="text-white/60 text-xs mt-1">{mode.desc}</p>
                <p className="text-white/40 text-[10px] mt-1 flex items-center justify-center gap-1"><MapPin className="w-3 h-3" />{sel?.address}, {sel?.city}</p>
              </div>
            </div>

            {/* Arm Controls */}
            <div className="grid grid-cols-3 gap-2.5" data-testid="arm-controls">
              {Object.entries(ARM_MODES).map(([m, cfg]) => {
                const I = cfg.icon;
                const active = sel?.armed_status === m;
                return (
                  <button key={m} onClick={() => handleArm(m)} disabled={armLoading || active}
                    className={`rounded-2xl p-4 text-center transition-all ${active ? 'bg-slate-800 border-2' : 'bg-slate-900 border border-slate-800 hover:border-slate-600'} ${armLoading ? 'opacity-50' : ''}`}
                    style={active ? { borderColor: cfg.color } : {}}
                    data-testid={`arm-${m}`}>
                    <I className="w-6 h-6 mx-auto mb-1.5" style={{ color: active ? cfg.color : '#64748b' }} />
                    <p className="text-[10px] font-bold" style={{ color: active ? cfg.color : '#94a3b8' }}>{cfg.label.replace('Armado ', '')}</p>
                  </button>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
                <p className="text-xl font-black text-white">{sel?.device_count || 0}</p>
                <p className="text-[9px] text-slate-500">Dispositivos</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
                <p className="text-xl font-black text-emerald-400">{onlineDevices}/{cameras.length}</p>
                <p className="text-[9px] text-slate-500">Camaras</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
                <p className="text-xl font-black text-white">{events.length}</p>
                <p className="text-[9px] text-slate-500">Eventos</p>
              </div>
            </div>

            {/* SOS Button */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-sm">Emergencia</h3>
                <p className="text-slate-500 text-[10px] mt-0.5">Alerta inmediata a la CRA</p>
              </div>
              <SOSButton installId={sel?.id} email={email} />
            </div>

            {/* Recent Events */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-slate-500" /> Ultimos eventos</h3>
                <button onClick={() => setTab('history')} className="text-emerald-400 text-[10px] font-bold">Ver todo</button>
              </div>
              {events.slice(0, 4).map((ev, i) => {
                const e = EVT[ev.event_type] || { label: ev.event_type, color: 'text-slate-400', icon: Bell };
                const EIcon = e.icon;
                return (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0">
                    <EIcon className={`w-4 h-4 ${e.color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white">{e.label}</p>
                      <p className="text-[10px] text-slate-500 truncate">{ev.description}</p>
                    </div>
                    <span className="text-[9px] text-slate-600">{new Date(ev.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                );
              })}
              {events.length === 0 && <p className="text-slate-600 text-xs text-center py-4">Sin eventos</p>}
            </div>
          </div>
        )}

        {/* ═══ CAMERAS TAB ═══ */}
        {tab === 'cameras' && (
          <div className="space-y-3" data-testid="tab-cameras">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-white font-bold text-base">Camaras</h2>
              <span className="text-[10px] text-emerald-400 font-medium">{onlineDevices} online</span>
            </div>
            {cameras.length === 0 ? (
              <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800">
                <Camera className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 font-bold text-sm">Sin camaras</p>
                <p className="text-slate-600 text-xs mt-1">Contacta con ManoProtect para anadir camaras</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cameras.map(cam => <CamFeed key={cam.id} camera={cam} />)}
              </div>
            )}
          </div>
        )}

        {/* ═══ HISTORY TAB ═══ */}
        {tab === 'history' && (
          <div data-testid="tab-history">
            <h2 className="text-white font-bold text-base mb-3">Historial</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              {events.map((ev, i) => {
                const e = EVT[ev.event_type] || { label: ev.event_type, color: 'text-slate-400', icon: Bell };
                const EIcon = e.icon;
                const d = new Date(ev.created_at);
                return (
                  <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-800 last:border-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <EIcon className={`w-4 h-4 ${e.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">{e.label}{ev.zone ? ` — ${ev.zone}` : ''}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{ev.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] text-slate-500">{d.toLocaleDateString('es-ES')}</p>
                      <p className="text-[10px] text-slate-600">{d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })}
              {events.length === 0 && <p className="text-slate-600 text-xs text-center py-12">Sin eventos registrados</p>}
            </div>
          </div>
        )}

        {/* ═══ USERS TAB ═══ */}
        {tab === 'users' && (
          <div data-testid="tab-users">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold text-base">Usuarios</h2>
              {sel?.user_role === 'owner' && (
                <button onClick={() => setShowAddUser(true)} className="bg-emerald-500 text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5" data-testid="add-user-btn">
                  <Plus className="w-3.5 h-3.5" /> Anadir
                </button>
              )}
            </div>
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{u.user_name || u.user_email}</p>
                    <p className="text-[10px] text-slate-500">{u.role === 'owner' ? 'Propietario' : u.role === 'admin' ? 'Administrador' : 'Usuario'} | {u.user_email}</p>
                  </div>
                  {u.role !== 'owner' && sel?.user_role === 'owner' && (
                    <button onClick={() => handleRemoveUser(u.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
              {users.length === 0 && <p className="text-slate-600 text-xs text-center py-12">Sin usuarios</p>}
            </div>
          </div>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {tab === 'settings' && (
          <div className="space-y-3" data-testid="tab-settings">
            <h2 className="text-white font-bold text-base mb-1">Ajustes</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {[
                { icon: MapPin, label: 'Instalacion', value: sel?.client_name, color: 'text-emerald-400' },
                { icon: MapPin, label: 'Direccion', value: `${sel?.address}, ${sel?.city}`, color: 'text-blue-400' },
                { icon: Shield, label: 'Plan', value: sel?.plan?.toUpperCase(), color: 'text-amber-400' },
                { icon: Activity, label: 'Dispositivos', value: `${sel?.device_count || 0} activos`, color: 'text-purple-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 last:border-0">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <div className="flex-1"><p className="text-xs text-slate-400">{item.label}</p><p className="text-sm font-medium text-white">{item.value}</p></div>
                </div>
              ))}
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <button className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 text-left hover:bg-slate-800/50 transition">
                <Lock className="w-4 h-4 text-slate-500" />
                <div className="flex-1"><p className="text-sm text-white font-medium">Cambiar codigo de acceso</p></div>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 text-left hover:bg-slate-800/50 transition">
                <Volume2 className="w-4 h-4 text-slate-500" />
                <div className="flex-1"><p className="text-sm text-white font-medium">Notificaciones</p></div>
              </button>
              <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-800/50 transition">
                <UserCog className="w-4 h-4 text-slate-500" />
                <div className="flex-1"><p className="text-sm text-white font-medium">Mi cuenta</p></div>
              </button>
            </div>
            <p className="text-center text-slate-700 text-[10px] pt-2">ManoConnect v1.0.0 | ManoProtect</p>
          </div>
        )}
      </div>

      {/* ═══ BOTTOM NAV BAR (Mobile native feel) ═══ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 z-50 safe-area-bottom" data-testid="bottom-nav">
        <div className="max-w-lg mx-auto flex">
          {[
            { id: 'home', label: 'Inicio', icon: Home },
            { id: 'cameras', label: 'Camaras', icon: Camera },
            { id: 'history', label: 'Historial', icon: History },
            { id: 'users', label: 'Usuarios', icon: Users },
            { id: 'settings', label: 'Ajustes', icon: Settings },
          ].map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center py-2.5 transition-colors ${active ? 'text-emerald-400' : 'text-slate-600'}`}
                data-testid={`nav-${t.id}`}>
                <t.icon className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {showAddUser && <AddUserModal installId={sel?.id} onClose={() => setShowAddUser(false)} onAdded={fetchDetails} email={email} />}
    </div>
  );
};

export default ManoConnectApp;
