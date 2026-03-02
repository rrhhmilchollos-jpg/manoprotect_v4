import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shield, TrendingUp, Users, MapPin, AlertTriangle, ChevronRight, Crown, BarChart3, Activity, Clock, CheckCircle } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const SECURITY_LEVEL_MAP = {
  alto: { label: 'Alto', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', ring: 'ring-emerald-500/30' },
  medio: { label: 'Medio', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', ring: 'ring-yellow-500/30' },
  bajo: { label: 'Bajo', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', ring: 'ring-red-500/30' },
};

const TYPE_LABELS = {
  okupacion: 'Okupacion',
  robo_vivienda: 'Robo vivienda',
  robo_local: 'Robo local',
  intrusion: 'Intrusion',
  vandalismo: 'Vandalismo',
  sospechoso: 'Sospechoso',
  emergencia: 'Emergencia',
  robo: 'Robo',
  ruido: 'Ruido',
  accidente: 'Accidente',
  otro: 'Otro',
};

const TYPE_COLORS = ['#EF4444', '#F97316', '#EAB308', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

function StatCard({ icon: Icon, label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-all group" data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
        <span className="text-slate-400 text-sm font-medium">{label}</span>
      </div>
      <div className={`text-3xl font-black ${color} tracking-tight`}>{value}</div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  );
}

function SimpleBarChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <div className="text-slate-500 text-sm text-center py-8">Sin datos todavia</div>;
  }
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="space-y-3" data-testid="type-chart">
      {entries.map(([key, val], i) => (
        <div key={key} className="flex items-center gap-3">
          <span className="text-slate-400 text-xs w-24 truncate text-right">{TYPE_LABELS[key] || key}</span>
          <div className="flex-1 bg-slate-700/50 rounded-full h-6 overflow-hidden">
            <div
              className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700"
              style={{ width: `${Math.max((val / max) * 100, 8)}%`, backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length] }}
            >
              <span className="text-white text-[10px] font-bold">{val}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniMap({ heatmapPoints }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !heatmapPoints || heatmapPoints.length === 0) return;

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

      const mapDiv = document.createElement('div');
      mapDiv.style.cssText = 'width:100%;height:100%;border-radius:12px';
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(mapDiv);

      const center = heatmapPoints.length > 0
        ? [heatmapPoints[0].latitude, heatmapPoints[0].longitude]
        : [39.4699, -0.3763];
      map = L.map(mapDiv, { zoomControl: false, attributionControl: false }).setView(center, 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

      heatmapPoints.forEach((p) => {
        const color = p.severity === 'critica' ? '#EF4444' : p.severity === 'alta' ? '#F97316' : '#EAB308';
        L.circleMarker([p.latitude, p.longitude], { radius: 6, fillColor: color, color: 'transparent', fillOpacity: 0.7 }).addTo(map);
      });

      setTimeout(() => map.invalidateSize(), 300);
    };

    initMap();
    return () => { if (map) try { map.remove(); } catch {} };
  }, [heatmapPoints]);

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: '300px' }} />;
}

export default function PublicDashboardPage() {
  const [stats, setStats] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, heatRes] = await Promise.all([
        fetch(`${API}/api/dashboard-barrio/public-stats`),
        fetch(`${API}/api/community-shield/heatmap`),
      ]);
      const [statsData, heatData] = await Promise.all([statsRes.json(), heatRes.json()]);
      setStats(statsData);
      setHeatmap(heatData.points || []);
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const secLevel = stats?.security_overview?.level || 'alto';
  const sec = SECURITY_LEVEL_MAP[secLevel] || SECURITY_LEVEL_MAP.alto;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950" data-testid="dashboard-barrio-page">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <span className="text-white font-bold text-sm">ManoProtect</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/escudo-vecinal" className="text-slate-400 hover:text-white text-xs transition-colors">Escudo Vecinal</Link>
            <Link to="/panel-vecinal" className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1" data-testid="cta-premium-header">
              <Crown className="w-3 h-3" /> Premium
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #6366F1 0%, transparent 50%), radial-gradient(circle at 70% 60%, #10B981 0%, transparent 50%)' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-indigo-400 text-xs font-semibold tracking-wide">DATOS PUBLICOS EN TIEMPO REAL</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight">
            Dashboard de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Barrio</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Estadisticas anonimizadas de seguridad de tu barrio. Transparencia total, sin datos personales.
          </p>
        </div>
      </section>

      {/* Security Level Badge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 mb-8">
        <div className={`max-w-sm mx-auto ${sec.bg} ${sec.border} border rounded-2xl p-4 flex items-center gap-4 ring-2 ${sec.ring}`} data-testid="security-level">
          <div className="flex flex-col items-center">
            <Activity className={`w-8 h-8 ${sec.color}`} />
            <span className={`text-xs font-bold mt-1 ${sec.color}`}>Nivel</span>
          </div>
          <div>
            <div className={`text-2xl font-black ${sec.color}`}>{sec.label}</div>
            <div className="text-slate-400 text-xs">Tasa de resolucion: {stats?.security_overview?.resolution_rate || 100}%</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={AlertTriangle} label="Alertas semana" value={stats?.alerts?.this_week || 0} sub="Ultimos 7 dias" />
          <StatCard icon={TrendingUp} label="Alertas mes" value={stats?.alerts?.this_month || 0} sub="Ultimos 30 dias" />
          <StatCard icon={CheckCircle} label="Resueltas" value={stats?.alerts?.resolved_this_month || 0} sub="Este mes" color="text-emerald-400" />
          <StatCard icon={Users} label="Familias Premium" value={stats?.community?.active_premium_families || 0} sub="Vecinos protegidos" color="text-indigo-400" />
        </div>
      </div>

      {/* Charts + Map */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Type breakdown */}
          <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-1">Incidencias por tipo</h3>
            <p className="text-slate-500 text-xs mb-6">Ultimos 30 dias - datos anonimizados</p>
            <SimpleBarChart data={{ ...(stats?.by_type || {}), ...(stats?.community_by_type || {}) }} />
          </div>

          {/* Heatmap */}
          <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span className="text-white font-bold text-sm">Mapa de incidencias</span>
              <span className="text-slate-500 text-xs ml-auto">{heatmap.length} puntos</span>
            </div>
            <div className="h-[340px]">
              {heatmap.length > 0 ? <MiniMap heatmapPoints={heatmap} /> : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">Sin incidencias registradas</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Impact Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        <div className="bg-gradient-to-r from-indigo-500/5 to-emerald-500/5 border border-indigo-500/10 rounded-2xl p-8">
          <h3 className="text-white font-bold text-xl text-center mb-6">Impacto del Escudo Vecinal</h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-black text-indigo-400">{stats?.impact?.neighborhoods_protected || 1}</div>
              <div className="text-slate-500 text-xs mt-1">Barrios protegidos</div>
            </div>
            <div>
              <div className="text-3xl font-black text-emerald-400">{stats?.impact?.alerts_prevented || 0}</div>
              <div className="text-slate-500 text-xs mt-1">Alertas prevenidas</div>
            </div>
            <div>
              <div className="text-3xl font-black text-yellow-400">{stats?.impact?.response_improvement || '0%'}</div>
              <div className="text-slate-500 text-xs mt-1">Mejor tiempo respuesta</div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 text-center">
            <Clock className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <div className="text-2xl font-black text-white">{stats?.alerts?.total_year || 0}</div>
            <div className="text-slate-500 text-xs">Alertas este ano</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 text-center">
            <Users className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-black text-white">{stats?.community?.total_protectors || 0}</div>
            <div className="text-slate-500 text-xs">Protectores en la red</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 text-center">
            <MapPin className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-black text-white">{stats?.community?.community_incidents_month || 0}</div>
            <div className="text-slate-500 text-xs">Incidencias comunitarias (mes)</div>
          </div>
        </div>
      </div>

      {/* CTA Premium */}
      <section className="bg-gradient-to-r from-indigo-900/30 to-emerald-900/20 border-t border-indigo-500/10 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Crown className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-white font-black text-2xl sm:text-3xl mb-3">Quieres proteger tu barrio?</h2>
          <p className="text-slate-400 text-sm mb-2">
            Con el <strong className="text-white">Escudo Vecinal Premium</strong> recibes alertas de okupaciones, robos e intrusiones en tiempo real.
          </p>
          <p className="text-indigo-400 text-xs font-bold mb-6">Solo {stats?.plan_info?.price || 299.99} EUR/ano por familia. Plan independiente.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/panel-vecinal" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl transition-colors flex items-center justify-center gap-2" data-testid="cta-premium-bottom">
              <Crown className="w-4 h-4" /> Ver Plan Premium <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/escudo-vecinal" className="border border-slate-600 hover:border-slate-500 text-white font-bold px-8 py-3 rounded-xl transition-colors" data-testid="cta-escudo">
              Escudo Vecinal gratuito
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-xs">ManoProtect - Dashboard de Barrio. Datos anonimizados y publicos. Ninguna informacion personal es mostrada.</p>
          <div className="flex justify-center gap-4 mt-3">
            <Link to="/" className="text-slate-500 hover:text-white text-xs transition-colors">Inicio</Link>
            <Link to="/escudo-vecinal" className="text-slate-500 hover:text-white text-xs transition-colors">Escudo Vecinal</Link>
            <Link to="/panel-vecinal" className="text-slate-500 hover:text-white text-xs transition-colors">Panel Premium</Link>
            <Link to="/privacy-policy" className="text-slate-500 hover:text-white text-xs transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
