import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, MapPin, Users, Clock, Lock, Eye, Bell, X, Send, Home, Store, Siren, CheckCircle, Zap, Crown, ChevronRight } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ALERT_TYPES = {
  okupacion: { label: 'Posible okupacion', icon: Home, color: '#DC2626', bg: 'bg-red-100' },
  robo_vivienda: { label: 'Robo en vivienda', icon: Home, color: '#EF4444', bg: 'bg-red-50' },
  robo_local: { label: 'Robo en local', icon: Store, color: '#F97316', bg: 'bg-orange-100' },
  intrusion: { label: 'Intrusion', icon: AlertTriangle, color: '#EF4444', bg: 'bg-red-50' },
  vandalismo: { label: 'Vandalismo', icon: AlertTriangle, color: '#F59E0B', bg: 'bg-yellow-100' },
  sospechoso: { label: 'Sospechoso', icon: Eye, color: '#EAB308', bg: 'bg-yellow-50' },
  emergencia: { label: 'Emergencia', icon: Siren, color: '#DC2626', bg: 'bg-red-200' },
};

const URGENCY = {
  media: { label: 'Media', color: 'bg-yellow-500', text: 'text-yellow-900', border: 'border-yellow-400' },
  alta: { label: 'Alta', color: 'bg-orange-500', text: 'text-orange-900', border: 'border-orange-400' },
  critica: { label: 'Critica', color: 'bg-red-600', text: 'text-white', border: 'border-red-500' },
};

const timeAgo = (d) => {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'Ahora';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

/* ========================
   PAYWALL - No access
   ======================== */
function VecinalPaywall({ planInfo }) {
  const handleCheckout = async () => {
    try {
      const r = await fetch(`${API}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan_type: 'vecinal-anual', origin_url: window.location.origin }),
      });
      const d = await r.json();
      if (d.checkout_url) window.location.href = d.checkout_url;
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col" data-testid="vecinal-paywall">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
            <span className="text-white font-bold">ManoProtect</span>
          </Link>
          <Link to="/escudo-vecinal" className="text-sm text-slate-400 hover:text-white">Escudo Vecinal Gratuito</Link>
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold tracking-wide">PLAN PREMIUM EXCLUSIVO</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 tracking-tight">
            Panel <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">Vecinal</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto mb-4">
            El sistema de proteccion vecinal mas avanzado de Espana.
            Alertas de <strong className="text-red-400">okupaciones</strong>, <strong className="text-red-400">robos</strong> e <strong className="text-red-400">intrusiones</strong> en tiempo real entre todos los vecinos.
          </p>
          <p className="text-sm text-emerald-400 font-bold mb-8 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> Plan independiente — no necesitas ningun otro producto de ManoProtect
          </p>

          {/* Price card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/30 rounded-3xl p-8 max-w-md mx-auto mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-black px-4 py-1 rounded-bl-xl">SOLO ANUAL</div>
            <div className="absolute top-0 left-0 bg-emerald-500 text-white text-xs font-black px-4 py-1 rounded-br-xl">INDEPENDIENTE</div>
            <div className="mb-2 mt-4">
              <span className="text-5xl font-black text-white">{planInfo?.price || 299.99}</span>
              <span className="text-lg text-slate-400 ml-1">EUR/ano</span>
            </div>
            <p className="text-emerald-400 text-sm font-bold mb-2">{planInfo?.price_monthly_equivalent || 25.00} EUR/mes equivalente</p>
            <p className="text-amber-400/70 text-xs mb-6">Por unidad familiar — ilimitadas familias pueden unirse al barrio</p>

            <div className="space-y-2 text-left mb-6">
              {(planInfo?.features || [
                'Panel Vecinal en tiempo real 24/7',
                'Alertas instantaneas a todos los vecinos',
                'Alertas de okupacion y robos',
                'Alarma completa incluida',
                'Dispositivo Sentinel SOS incluido',
                'Prioridad en alertas policiales',
              ]).slice(0, 8).map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm">{f}</span>
                </div>
              ))}
            </div>

            <button onClick={handleCheckout} className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 text-white font-black text-base hover:shadow-xl hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2" data-testid="checkout-vecinal">
              <Crown className="w-5 h-5" /> Contratar Plan Vecinal Anual
            </button>
            <p className="text-slate-500 text-xs mt-3">Solo disponible como plan anual por unidad familiar</p>
          </div>

          {/* Comparison */}
          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { name: 'Securitas Direct', lacks: 'No conecta vecinos' },
              { name: 'Prosegur', lacks: 'Sin alertas comunitarias' },
              { name: 'ManoProtect', has: 'Panel Vecinal exclusivo', highlight: true },
            ].map((c, i) => (
              <div key={i} className={`rounded-xl p-4 ${c.highlight ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800/50 border border-slate-700'}`}>
                <p className="font-bold text-sm mb-1" style={{ color: c.highlight ? '#10B981' : '#94A3B8' }}>{c.name}</p>
                {c.lacks && <p className="text-xs text-red-400">{c.lacks}</p>}
                {c.has && <p className="text-xs text-emerald-400 font-bold">{c.has}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================
   ALERT MODAL
   ======================== */
function AlertModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ type: 'sospechoso', title: '', description: '', urgency: 'alta', address: '' });
  const [sending, setSending] = useState(false);
  const [userPos, setUserPos] = useState({ lat: 39.4699, lng: -0.3763 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((p) => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }), () => {});
    }
  }, []);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSending(true);
    await onSubmit({ ...form, latitude: userPos.lat, longitude: userPos.lng });
    setSending(false);
    setForm({ type: 'sospechoso', title: '', description: '', urgency: 'alta', address: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()} data-testid="alert-modal">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Siren className="w-5 h-5 text-red-500" />
            <h3 className="text-white font-bold">Alerta vecinal urgente</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Tipo de alerta</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ALERT_TYPES).map(([k, v]) => (
                <button key={k} type="button"
                  onClick={() => setForm(f => ({ ...f, type: k }))}
                  className={`p-2.5 rounded-lg border-2 text-left text-xs font-semibold transition-all flex items-center gap-2 ${form.type === k ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}
                  data-testid={`alert-type-${k}`}>
                  <v.icon className="w-4 h-4" style={{ color: v.color }} />
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">Que esta pasando?</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ej: Grupo forzando puerta del portal 14"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 outline-none"
              data-testid="alert-title" required />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">Detalles</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Describe la situacion con el maximo detalle posible..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 outline-none resize-none"
              data-testid="alert-desc" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">Direccion (opcional)</label>
            <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Calle, numero, portal..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 outline-none"
              data-testid="alert-address" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Urgencia</label>
            <div className="flex gap-2">
              {Object.entries(URGENCY).map(([k, v]) => (
                <button key={k} type="button"
                  onClick={() => setForm(f => ({ ...f, urgency: k }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border-2 transition-all ${form.urgency === k ? `${v.color} ${v.text} ${v.border}` : 'border-slate-700 text-slate-500'}`}
                  data-testid={`urgency-${k}`}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={sending || !form.title.trim()}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="submit-alert">
            <Siren className="w-4 h-4" />
            {sending ? 'Enviando alerta...' : 'ENVIAR ALERTA A TODOS LOS VECINOS'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ========================
   MAIN: Panel Vecinal Dashboard
   ======================== */
export default function PanelVecinal() {
  const [access, setAccess] = useState(null);
  const [planInfo, setPlanInfo] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [tab, setTab] = useState('alertas');

  const checkAccess = useCallback(async () => {
    try {
      const [accessRes, planRes] = await Promise.all([
        fetch(`${API}/api/panel-vecinal/check-access`, { credentials: 'include' }),
        fetch(`${API}/api/panel-vecinal/plan-info`),
      ]);
      const accessData = await accessRes.json();
      const planData = await planRes.json();
      setAccess(accessData);
      setPlanInfo(planData);
      return accessData.has_access;
    } catch {
      setAccess({ has_access: false });
      return false;
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashRes, alertsRes] = await Promise.all([
        fetch(`${API}/api/panel-vecinal/dashboard`, { credentials: 'include' }),
        fetch(`${API}/api/panel-vecinal/alerts`, { credentials: 'include' }),
      ]);
      if (dashRes.ok) setDashboard(await dashRes.json());
      if (alertsRes.ok) {
        const d = await alertsRes.json();
        setAlerts(d.alerts || []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const hasAccess = await checkAccess();
      if (hasAccess) await fetchDashboard();
      setLoading(false);
    })();
  }, [checkAccess, fetchDashboard]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!access?.has_access) return;
    const iv = setInterval(() => fetchDashboard(), 15000);
    return () => clearInterval(iv);
  }, [access, fetchDashboard]);

  const handleSendAlert = async (data) => {
    try {
      await fetch(`${API}/api/panel-vecinal/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      fetchDashboard();
    } catch { /* ignore */ }
  };

  const handleConfirm = async (alertId) => {
    try {
      await fetch(`${API}/api/panel-vecinal/alerts/${alertId}/confirm`, {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      fetchDashboard();
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400" />
      </div>
    );
  }

  // PAYWALL: No access
  if (!access?.has_access) {
    return <VecinalPaywall planInfo={planInfo} />;
  }

  // DASHBOARD: Has access
  const securityColor = dashboard?.security_level === 'alto' ? 'text-emerald-400' : dashboard?.security_level === 'medio' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-slate-950" data-testid="panel-vecinal-dashboard">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center"><Crown className="w-5 h-5 text-white" /></div>
              <span className="text-white font-bold">Panel Vecinal</span>
            </Link>
            <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">PREMIUM</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/escudo-vecinal" className="text-sm text-slate-400 hover:text-white hidden sm:block">Escudo Vecinal</Link>
            <button onClick={() => setShowAlert(true)}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-black px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors animate-pulse hover:animate-none"
              data-testid="send-alert-btn">
              <Siren className="w-4 h-4" /> ALERTA
            </button>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-slate-900/50 border-b border-slate-800/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-black ${securityColor}`}>{dashboard?.security_level?.toUpperCase() || 'ALTO'}</div>
            <div className="text-xs text-slate-500">Nivel seguridad barrio</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-white">{dashboard?.alerts_this_week || 0}</div>
            <div className="text-xs text-slate-500">Alertas esta semana</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-amber-400">{dashboard?.active_families || 0}</div>
            <div className="text-xs text-slate-500">Familias protegidas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-400">24/7</div>
            <div className="text-xs text-slate-500">Vigilancia activa</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex gap-1 bg-slate-800 rounded-xl p-1 max-w-md">
          {[
            { id: 'alertas', label: 'Alertas en vivo', icon: Siren },
            { id: 'mapa', label: 'Mapa', icon: MapPin },
            { id: 'stats', label: 'Estadisticas', icon: Eye },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'}`}
              data-testid={`tab-${t.id}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {tab === 'alertas' && (
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
                <Shield className="w-14 h-14 text-emerald-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-white font-bold text-lg mb-2">Tu barrio esta seguro</h3>
                <p className="text-slate-500 text-sm">No hay alertas activas en las ultimas 48 horas.</p>
              </div>
            ) : (
              alerts.map(a => {
                const meta = ALERT_TYPES[a.type] || ALERT_TYPES.sospechoso;
                const urg = URGENCY[a.urgency] || URGENCY.alta;
                const Icon = meta.icon;
                return (
                  <div key={a.alert_id} className={`bg-slate-800 border rounded-2xl p-5 transition-all hover:border-slate-600 ${a.urgency === 'critica' ? 'border-red-500/50 shadow-lg shadow-red-500/5' : 'border-slate-700'}`}
                    data-testid={`alert-${a.alert_id}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6" style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-white font-bold text-sm">{a.title}</h3>
                          {a.is_premium_alert && <span className="bg-amber-500/20 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded">PREMIUM</span>}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${urg.color} ${urg.text}`}>{urg.label}</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{a.description}</p>
                        {a.address && <p className="text-slate-500 text-xs mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" />{a.address}</p>}
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-slate-600 flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(a.created_at)}</span>
                          <span className="text-slate-500">{a.reporter_name}</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" />{a.confirmations} confirman</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => handleConfirm(a.alert_id)}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                            data-testid={`confirm-${a.alert_id}`}>
                            <CheckCircle className="w-3 h-3" /> Yo tambien lo veo
                          </button>
                          <button className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <Bell className="w-3 h-3" /> Avisar a policia
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'mapa' && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="p-3 border-b border-slate-700 flex items-center justify-between">
              <span className="text-white text-sm font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Mapa de alertas premium
              </span>
              <span className="text-slate-500 text-xs">{alerts.length} alertas activas</span>
            </div>
            <div className="h-[500px] flex items-center justify-center bg-slate-800">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-50" />
                <p className="text-slate-400 text-sm">Mapa interactivo del barrio</p>
                <Link to="/escudo-vecinal" className="text-amber-400 text-xs font-bold hover:underline mt-2 inline-block">Ver mapa completo en Escudo Vecinal</Link>
              </div>
            </div>
          </div>
        )}

        {tab === 'stats' && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Alertas por tipo (30 dias)</h3>
              <div className="space-y-3">
                {Object.entries(dashboard?.by_type || {}).map(([type, count]) => {
                  const meta = ALERT_TYPES[type] || ALERT_TYPES.sospechoso;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center`}>
                          <meta.icon className="w-4 h-4" style={{ color: meta.color }} />
                        </div>
                        <span className="text-slate-300 text-sm">{meta.label}</span>
                      </div>
                      <span className="text-white font-bold">{count}</span>
                    </div>
                  );
                })}
                {Object.keys(dashboard?.by_type || {}).length === 0 && (
                  <p className="text-slate-500 text-sm">Sin datos aun</p>
                )}
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Resumen mensual</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                  <span className="text-slate-400 text-sm">Alertas totales (30d)</span>
                  <span className="text-white font-bold text-lg">{dashboard?.alerts_this_month || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                  <span className="text-slate-400 text-sm">Esta semana</span>
                  <span className="text-white font-bold text-lg">{dashboard?.alerts_this_week || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                  <span className="text-slate-400 text-sm">Familias protegidas</span>
                  <span className="text-amber-400 font-bold text-lg">{dashboard?.active_families || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <span className="text-emerald-400 text-sm font-bold">Nivel seguridad</span>
                  <span className={`font-black text-lg ${securityColor}`}>{dashboard?.security_level?.toUpperCase() || 'ALTO'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertModal open={showAlert} onClose={() => setShowAlert(false)} onSubmit={handleSendAlert} />
    </div>
  );
}
