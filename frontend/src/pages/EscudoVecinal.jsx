import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, MapPin, Users, Clock, ChevronRight, Plus, Check, Eye, Bell, X, Send, Lock, Crown } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const INCIDENT_ICONS = {
  robo: { emoji: '🚨', color: '#EF4444', bg: 'bg-red-100' },
  vandalismo: { emoji: '💥', color: '#F97316', bg: 'bg-orange-100' },
  sospechoso: { emoji: '👤', color: '#EAB308', bg: 'bg-yellow-100' },
  ruido: { emoji: '🔊', color: '#8B5CF6', bg: 'bg-purple-100' },
  emergencia: { emoji: '🆘', color: '#DC2626', bg: 'bg-red-200' },
  accidente: { emoji: '🚗', color: '#0EA5E9', bg: 'bg-blue-100' },
  otro: { emoji: '📌', color: '#6B7280', bg: 'bg-gray-100' },
};

const SEVERITY_COLORS = {
  baja: 'bg-green-100 text-green-800 border-green-300',
  media: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  alta: 'bg-orange-100 text-orange-800 border-orange-300',
  critica: 'bg-red-100 text-red-800 border-red-300',
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora mismo';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  return `Hace ${Math.floor(hrs / 24)}d`;
};

function MapView({ incidents, userPos, onMapClick }) {
  const containerRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let map = null;

    const initMap = async () => {
      const L = await import('leaflet');

      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        await new Promise(r => setTimeout(r, 200));
      }

      // Create a fresh inner div for the map
      const mapDiv = document.createElement('div');
      mapDiv.style.width = '100%';
      mapDiv.style.height = '100%';
      mapDiv.style.minHeight = '400px';
      mapDiv.style.borderRadius = '12px';
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(mapDiv);

      const center = userPos ? [userPos.lat, userPos.lng] : [39.4699, -0.3763];
      map = L.map(mapDiv).setView(center, 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      if (userPos) {
        L.circle([userPos.lat, userPos.lng], {
          radius: 50, color: '#10B981', fillColor: '#10B981', fillOpacity: 0.3,
        }).addTo(map);
        L.marker([userPos.lat, userPos.lng], {
          icon: L.divIcon({
            className: '',
            html: '<div style="width:16px;height:16px;background:#10B981;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
            iconSize: [16, 16], iconAnchor: [8, 8],
          }),
        }).addTo(map).bindPopup('<b>Tu ubicacion</b>');
      }

      map.on('click', (e) => {
        if (onMapClick) onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      mapInstance.current = map;
      setMapReady(true);
      setTimeout(() => map.invalidateSize(), 300);
    };

    initMap();

    return () => {
      if (map) {
        try { map.remove(); } catch {}
      }
      mapInstance.current = null;
      setMapReady(false);
    };
  }, [userPos]);

  useEffect(() => {
    if (!mapInstance.current) return;
    import('leaflet').then((L) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      incidents.forEach((inc) => {
        const meta = INCIDENT_ICONS[inc.type] || INCIDENT_ICONS.otro;
        const sev = inc.severity || 'media';
        const size = sev === 'critica' ? 36 : sev === 'alta' ? 30 : 24;
        const marker = L.marker([inc.latitude, inc.longitude], {
          icon: L.divIcon({
            className: 'incident-marker',
            html: `<div style="width:${size}px;height:${size}px;background:${meta.color};border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${size * 0.5}px;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer">${meta.emoji}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          }),
        }).addTo(mapInstance.current);

        marker.bindPopup(`
          <div style="min-width:180px">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${inc.title}</div>
            <div style="font-size:12px;color:#666;margin-bottom:4px">${inc.description?.substring(0, 80) || ''}</div>
            <div style="display:flex;gap:8px;font-size:11px;color:#888">
              <span>${inc.type_meta?.label || inc.type}</span>
              <span>${timeAgo(inc.created_at)}</span>
            </div>
            <div style="margin-top:6px;font-size:11px;color:#059669">${inc.confirmations || 0} vecinos confirman</div>
          </div>
        `);
        markersRef.current.push(marker);
      });
    });
  }, [incidents]);

  return <div ref={containerRef} className="w-full h-full rounded-xl" style={{ minHeight: '400px' }} />;
}

function ReportModal({ open, onClose, onSubmit, clickPos }) {
  const [form, setForm] = useState({ type: 'sospechoso', title: '', description: '', severity: 'media', anonymous: false });
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    await onSubmit({
      ...form,
      latitude: clickPos?.lat || 39.4699,
      longitude: clickPos?.lng || -0.3763,
    });
    setSubmitting(false);
    setForm({ type: 'sospechoso', title: '', description: '', severity: 'media', anonymous: false });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="report-modal">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg">Reportar incidencia</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de incidencia</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(INCIDENT_ICONS).map(([key, val]) => (
                <button key={key} type="button"
                  onClick={() => setForm((f) => ({ ...f, type: key }))}
                  className={`p-2 rounded-lg border-2 text-center text-xs font-medium transition-all ${form.type === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  data-testid={`type-${key}`}
                >
                  <span className="text-lg block">{val.emoji}</span>
                  {INCIDENT_ICONS[key] && key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Titulo</label>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ej: Persona merodeando por el portal"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="report-title" required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descripcion</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe lo que has visto..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              data-testid="report-description" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gravedad</label>
            <div className="flex gap-2">
              {['baja', 'media', 'alta', 'critica'].map((s) => (
                <button key={s} type="button"
                  onClick={() => setForm((f) => ({ ...f, severity: s }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${form.severity === s ? SEVERITY_COLORS[s] + ' border-2' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  data-testid={`severity-${s}`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.anonymous} onChange={(e) => setForm((f) => ({ ...f, anonymous: e.target.checked }))}
              className="rounded border-gray-300" data-testid="report-anonymous" />
            <span className="text-sm text-gray-600">Reportar de forma anonima</span>
          </label>

          {clickPos && (
            <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Ubicacion: {clickPos.lat.toFixed(4)}, {clickPos.lng.toFixed(4)}
            </div>
          )}

          <button type="submit" disabled={submitting || !form.title.trim()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="submit-report">
            <Send className="w-4 h-4" />
            {submitting ? 'Enviando...' : 'Enviar alerta a vecinos'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function EscudoVecinal() {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [clickPos, setClickPos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mapa');

  const fetchIncidents = useCallback(async (lat = 0, lng = 0) => {
    try {
      const r = await fetch(`${API}/api/community-shield/incidents?lat=${lat}&lng=${lng}&radius_km=5`);
      const data = await r.json();
      setIncidents(data.incidents || []);
    } catch { /* ignore */ }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/community-shield/stats`);
      const data = await r.json();
      setStats(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserPos(p);
          setClickPos(p);
          fetchIncidents(p.lat, p.lng);
          fetchStats();
          setLoading(false);
        },
        () => {
          // Default: Valencia
          setUserPos({ lat: 39.4699, lng: -0.3763 });
          setClickPos({ lat: 39.4699, lng: -0.3763 });
          fetchIncidents(39.4699, -0.3763);
          fetchStats();
          setLoading(false);
        }
      );
    } else {
      setUserPos({ lat: 39.4699, lng: -0.3763 });
      setClickPos({ lat: 39.4699, lng: -0.3763 });
      fetchIncidents();
      fetchStats();
      setLoading(false);
    }
  }, [fetchIncidents, fetchStats]);

  const handleReport = async (data) => {
    try {
      const r = await fetch(`${API}/api/community-shield/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (r.ok) {
        fetchIncidents(userPos?.lat, userPos?.lng);
        fetchStats();
      }
    } catch { /* ignore */ }
  };

  const handleConfirm = async (incidentId) => {
    try {
      await fetch(`${API}/api/community-shield/incidents/${incidentId}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ confirmed: true }),
      });
      fetchIncidents(userPos?.lat, userPos?.lng);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-slate-950" data-testid="escudo-vecinal-page">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-lg font-bold">ManoProtect</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/alarmas-hogar" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Alarmas</Link>
            <Link to="/productos" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Productos</Link>
            <button onClick={() => { setShowReport(true); }} className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors" data-testid="report-btn">
              <AlertTriangle className="w-4 h-4" /> Reportar
            </button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative bg-gradient-to-b from-slate-900 to-slate-950 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #10B981 0%, transparent 50%), radial-gradient(circle at 80% 50%, #3B82F6 0%, transparent 50%)' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-xs font-semibold tracking-wide">EXCLUSIVO MANOPROTECT</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight">
            Escudo <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Vecinal</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            La primera red de seguridad comunitaria en tiempo real de Espana.
            Tus vecinos te protegen. Tu proteges a tus vecinos.
            <strong className="text-white"> Ninguna empresa de alarmas ofrece esto.</strong>
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">{stats?.active_protectors || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Protectores activos</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">{stats?.incidents_last_7_days || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Alertas esta semana</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-blue-400">{stats?.incidents_last_30_days || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Alertas este mes</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-yellow-400">24/7</div>
              <div className="text-xs text-slate-500 mt-1">Vigilancia vecinal</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4 relative z-10">
        <div className="flex gap-1 bg-slate-800 rounded-xl p-1 max-w-md mx-auto">
          {[
            { id: 'mapa', label: 'Mapa en vivo', icon: MapPin },
            { id: 'feed', label: 'Alertas', icon: Bell },
            { id: 'info', label: 'Como funciona', icon: Eye },
          ].map((tab) => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.id ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'mapa' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-xl" data-testid="map-container">
              <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-semibold">Mapa en tiempo real</span>
                </div>
                <span className="text-slate-500 text-xs">{incidents.length} incidencias activas</span>
              </div>
              {loading ? (
                <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" /></div>
              ) : (
                <div className="h-[500px]">
                  <MapView incidents={incidents} userPos={userPos} onMapClick={(pos) => { setClickPos(pos); setShowReport(true); }} />
                </div>
              )}
              <div className="p-3 border-t border-slate-700 text-center">
                <p className="text-slate-500 text-xs">Haz clic en el mapa para reportar una incidencia en esa ubicacion</p>
              </div>
            </div>

            {/* Sidebar: recent incidents */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold text-sm">Ultimas alertas</h3>
                <button onClick={() => { setShowReport(true); }} className="text-emerald-400 text-xs font-semibold hover:text-emerald-300 flex items-center gap-1" data-testid="sidebar-report-btn">
                  <Plus className="w-3 h-3" /> Reportar
                </button>
              </div>
              {incidents.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                  <Shield className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-50" />
                  <p className="text-slate-400 text-sm">No hay incidencias recientes</p>
                  <p className="text-slate-600 text-xs mt-1">Tu barrio esta tranquilo</p>
                </div>
              ) : (
                incidents.slice(0, 8).map((inc) => {
                  const meta = INCIDENT_ICONS[inc.type] || INCIDENT_ICONS.otro;
                  return (
                    <div key={inc.incident_id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 hover:border-slate-600 transition-colors group" data-testid={`incident-${inc.incident_id}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center text-base flex-shrink-0`}>{meta.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-white text-sm font-semibold truncate">{inc.title}</h4>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${SEVERITY_COLORS[inc.severity] || SEVERITY_COLORS.media}`}>{inc.severity}</span>
                          </div>
                          <p className="text-slate-500 text-xs line-clamp-1">{inc.description}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-slate-600 text-[10px] flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{timeAgo(inc.created_at)}</span>
                            <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="w-2.5 h-2.5" />{inc.confirmations} confirman</span>
                            <button onClick={() => handleConfirm(inc.incident_id)} className="text-blue-400 text-[10px] font-semibold hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`confirm-${inc.incident_id}`}>
                              Confirmar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Feed de alertas vecinales</h2>
              <button onClick={() => setShowReport(true)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1" data-testid="feed-report-btn">
                <Plus className="w-3 h-3" /> Nueva alerta
              </button>
            </div>
            {incidents.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
                <Shield className="w-14 h-14 text-emerald-400 mx-auto mb-4 opacity-40" />
                <h3 className="text-white font-bold text-lg mb-2">Todo tranquilo</h3>
                <p className="text-slate-500 text-sm">No hay alertas en las ultimas 24 horas. Se el primero en reportar si ves algo sospechoso.</p>
              </div>
            ) : (
              incidents.map((inc) => {
                const meta = INCIDENT_ICONS[inc.type] || INCIDENT_ICONS.otro;
                return (
                  <div key={inc.incident_id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition-all" data-testid={`feed-incident-${inc.incident_id}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${meta.bg} flex items-center justify-center text-xl flex-shrink-0`}>{meta.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold">{inc.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[inc.severity] || SEVERITY_COLORS.media}`}>{inc.severity}</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{inc.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(inc.created_at)}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{inc.reporter_name || 'Vecino'}</span>
                          <span className="flex items-center gap-1 text-emerald-400"><Check className="w-3 h-3" />{inc.confirmations} confirmaciones</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => handleConfirm(inc.incident_id)}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                            data-testid={`feed-confirm-${inc.incident_id}`}
                          >
                            <Check className="w-3 h-3" /> Yo tambien lo vi
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

        {activeTab === 'info' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-white font-bold text-2xl text-center mb-8">Como funciona el Escudo Vecinal</h2>
            <div className="grid sm:grid-cols-2 gap-6 mb-12">
              {[
                { icon: Eye, title: 'Observa', desc: 'Si ves algo sospechoso en tu barrio, puedes reportarlo inmediatamente desde el mapa.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { icon: Bell, title: 'Alerta', desc: 'Todos los vecinos de ManoProtect cercanos reciben la alerta al instante en su movil.', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { icon: Users, title: 'Confirma', desc: 'Los vecinos confirman la incidencia, creando una red de verificacion comunitaria.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { icon: Shield, title: 'Protege', desc: 'Juntos creais un barrio mas seguro. Las zonas con mas protectores tienen menos incidencias.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
              ].map((step, i) => (
                <div key={i} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all">
                  <div className={`w-12 h-12 ${step.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{i + 1}. {step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
              <Lock className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-2">Privacidad garantizada</h3>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                Puedes reportar de forma anonima. Nunca compartimos tu ubicacion exacta con otros usuarios.
                Solo mostramos las incidencias en el mapa, no quien las reporta.
              </p>
            </div>

            <div className="mt-12 text-center">
              <h3 className="text-white font-bold text-xl mb-3">Esto no lo ofrece nadie</h3>
              <p className="text-slate-500 text-sm max-w-lg mx-auto mb-6">
                Securitas Direct, Prosegur, Movistar Prosegur... ninguna empresa de seguridad conecta a los vecinos entre si.
                ManoProtect es la unica plataforma que combina alarmas + proteccion personal + seguridad comunitaria.
              </p>
              <Link to="/alarmas-hogar" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-colors" data-testid="cta-alarmas">
                Ver planes de alarma <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal open={showReport} onClose={() => setShowReport(false)} onSubmit={handleReport} clickPos={clickPos} />

      {/* Premium Panel CTA */}
      <section className="bg-gradient-to-r from-amber-500/5 to-red-500/5 border-t border-amber-500/10 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-4">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold">PREMIUM</span>
          </div>
          <h2 className="text-white font-bold text-2xl mb-3">Panel Vecinal Premium</h2>
          <p className="text-slate-400 text-sm mb-2">
            Alertas de <strong className="text-red-400">okupaciones</strong> y <strong className="text-red-400">robos</strong> en tiempo real.
            Coordinacion vecinal avanzada. Dashboard exclusivo. Solo 299,99 EUR/ano por familia.
          </p>
          <p className="text-emerald-400 text-xs font-bold mb-6">Plan independiente — no necesitas ningun otro producto. Trae vecinos = meses gratis.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/panel-vecinal" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-red-500 hover:shadow-xl hover:shadow-amber-500/10 text-white font-black px-8 py-3 rounded-xl transition-all" data-testid="cta-panel-vecinal">
              <Crown className="w-4 h-4" /> Ver Panel Vecinal Premium <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/dashboard-barrio" className="inline-flex items-center gap-2 border border-slate-600 hover:border-slate-500 text-white font-bold px-6 py-3 rounded-xl transition-colors" data-testid="cta-dashboard-barrio">
              Ver estadisticas del barrio <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-white font-bold text-2xl mb-3">Unete al Escudo Vecinal</h2>
          <p className="text-slate-400 text-sm mb-6">Protege tu barrio y recibe alertas de tus vecinos en tiempo real. Gratis para todos los usuarios de ManoProtect.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/registro" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl transition-colors" data-testid="cta-registro">
              Crear cuenta gratis
            </Link>
            <button onClick={() => setShowReport(true)} className="border border-slate-600 hover:border-slate-500 text-white font-bold px-8 py-3 rounded-xl transition-colors" data-testid="cta-reportar">
              Reportar incidencia
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
