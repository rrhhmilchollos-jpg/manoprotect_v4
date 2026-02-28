/**
 * ManoProtect - CEO Dashboard
 * Control total: usuarios, suscripciones, pedidos, reembolsos, métricas, stock, mensajes
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, CreditCard, Package, RotateCcw, MessageSquare,
  TrendingUp, AlertTriangle, Search, ChevronLeft, ChevronRight,
  Activity, Eye, RefreshCw, BarChart3, Clock, CheckCircle, XCircle,
  Mail, Phone, Truck, Gift, Percent
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  return { token, headers: { Authorization: `Bearer ${token}` } };
};

const StatCard = ({ icon: Icon, label, value, sub, color = 'emerald', alert }) => (
  <div className={`bg-white rounded-xl border ${alert ? 'border-red-200' : 'border-gray-200'} p-4 hover:shadow-md transition-shadow`} data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}>
    <div className="flex items-center justify-between mb-2">
      <div className={`w-9 h-9 bg-${color}-50 rounded-lg flex items-center justify-center`}>
        <Icon className={`w-5 h-5 text-${color}-500`} />
      </div>
      {alert && <AlertTriangle className="w-4 h-4 text-red-500" />}
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500">{label}</p>
    {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const CEODashboard = () => {
  const nav = useNavigate();
  const { token, headers } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState({ users: [], total: 0, page: 1, pages: 1 });
  const [subs, setSubs] = useState({ subscriptions: [], total: 0, page: 1, pages: 1 });
  const [orders, setOrders] = useState({ orders: [], total: 0, page: 1, pages: 1 });
  const [messages, setMessages] = useState({ messages: [], total: 0, page: 1, pages: 1 });
  const [refunds, setRefunds] = useState({ refunds: [], total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [heartbeat, setHeartbeat] = useState({ backend: false, frontend: true });

  const fetchJSON = useCallback(async (url) => {
    const res = await fetch(`${API}${url}`, { headers });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  }, [headers]);

  const loadStats = useCallback(async () => {
    try {
      const [s, a] = await Promise.all([fetchJSON('/api/ceo/stats'), fetchJSON('/api/ceo/activity')]);
      setStats(s);
      setActivity(a.activities || []);
    } catch (e) {
      if (String(e).includes('401') || String(e).includes('403')) nav('/login');
    }
    setLoading(false);
  }, [fetchJSON, nav]);

  useEffect(() => {
    if (!token) { nav('/login'); return; }
    loadStats();
    const iv = setInterval(loadStats, 30000);
    return () => clearInterval(iv);
  }, [token, nav, loadStats]);

  // Heartbeat check every 5s
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API}/api/heartbeat`);
        setHeartbeat(h => ({ ...h, backend: res.ok }));
      } catch {
        setHeartbeat(h => ({ ...h, backend: false }));
      }
    };
    check();
    const iv = setInterval(check, 5000);
    return () => clearInterval(iv);
  }, []);

  const loadTab = useCallback(async (t, page = 1) => {
    try {
      if (t === 'users') { const d = await fetchJSON(`/api/ceo/users?page=${page}&search=${search}`); setUsers(d); }
      if (t === 'subscriptions') { const d = await fetchJSON(`/api/ceo/subscriptions?page=${page}`); setSubs(d); }
      if (t === 'orders') { const d = await fetchJSON(`/api/ceo/orders?page=${page}`); setOrders(d); }
      if (t === 'messages') { const d = await fetchJSON(`/api/ceo/messages?page=${page}`); setMessages(d); }
      if (t === 'refunds') { const d = await fetchJSON(`/api/ceo/refunds?page=${page}`); setRefunds(d); }
    } catch {}
  }, [fetchJSON, search]);

  useEffect(() => { if (tab !== 'overview') loadTab(tab); }, [tab, loadTab]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Cargando dashboard...</p>
      </div>
    </div>
  );

  const s = stats || {};
  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'subscriptions', label: 'Suscripciones', icon: CreditCard },
    { id: 'orders', label: 'Pedidos', icon: Package },
    { id: 'refunds', label: 'Reembolsos', icon: RotateCcw },
    { id: 'messages', label: 'Mensajes', icon: MessageSquare },
  ];

  const Paginator = ({ data, onPage }) => (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-b-xl border-t">
      <p className="text-xs text-gray-500">Total: {data.total} · Página {data.page}/{data.pages}</p>
      <div className="flex gap-1">
        <button disabled={data.page <= 1} onClick={() => onPage(data.page - 1)} className="p-1.5 rounded bg-white border disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
        <button disabled={data.page >= data.pages} onClick={() => onPage(data.page + 1)} className="p-1.5 rounded bg-white border disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="ceo-dashboard">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">ManoProtect CEO</h1>
              <p className="text-[10px] text-gray-400">Panel de control</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Live indicators */}
            <div className="flex items-center gap-2 text-xs">
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${heartbeat.backend ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${heartbeat.backend ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                Backend {heartbeat.backend ? 'LIVE' : 'DOWN'}
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Frontend LIVE
              </span>
            </div>
            <button onClick={loadStats} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" data-testid="refresh-btn"><RefreshCw className="w-4 h-4 text-gray-500" /></button>
            <button onClick={() => nav('/')} className="text-xs text-gray-500 hover:text-emerald-600">Ir a la web</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-6 overflow-x-auto" data-testid="dashboard-tabs">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${tab === t.id ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`} data-testid={`tab-${t.id}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard icon={Users} label="Usuarios total" value={s.users?.total || 0} sub={`+${s.users?.today || 0} hoy`} />
              <StatCard icon={CreditCard} label="Suscripciones" value={s.subscriptions?.active || 0} sub={`${s.subscriptions?.monthly || 0} mes / ${s.subscriptions?.yearly || 0} año`} />
              <StatCard icon={TrendingUp} label="MRR" value={`${s.revenue?.mrr || 0}€`} color="blue" />
              <StatCard icon={Package} label="Pedidos" value={s.orders?.total || 0} sub={`${s.orders?.pending || 0} pendientes`} alert={s.orders?.pending > 0} />
              <StatCard icon={RotateCcw} label="Reembolsos" value={s.refunds?.total || 0} sub={`${s.refunds?.pending || 0} pendientes`} alert={s.refunds?.pending > 0} color="red" />
              <StatCard icon={MessageSquare} label="Mensajes" value={s.messages?.total || 0} sub={`${s.messages?.unread || 0} sin leer`} alert={s.messages?.unread > 0} color="violet" />
            </div>

            {/* Promo Status */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5" data-testid="promo-basic-stock">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-gray-900 text-sm">Stock Sentinel X Basic (GRATIS)</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${((s.promo?.basic_stock_total - s.promo?.basic_stock_remaining) / s.promo?.basic_stock_total) * 100}%` }} />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{s.promo?.basic_stock_remaining || 50}/{s.promo?.basic_stock_total || 50}</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">Quedan {s.promo?.basic_stock_remaining || 50} unidades gratis</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5" data-testid="promo-200-users">
                <div className="flex items-center gap-2 mb-3">
                  <Percent className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-gray-900 text-sm">Promo 200 usuarios (-{s.promo?.discount_pct || 20}%)</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${((s.promo?.promo_200_total - s.promo?.promo_200_remaining) / s.promo?.promo_200_total) * 100}%` }} />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{s.promo?.promo_200_remaining || 200}/{s.promo?.promo_200_total || 200}</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">Quedan {s.promo?.promo_200_remaining || 200} plazas con descuento</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-5" data-testid="recent-activity">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Actividad reciente</h3>
              <div className="space-y-3">
                {activity.length === 0 && <p className="text-sm text-gray-400">Sin actividad reciente</p>}
                {activity.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      a.type === 'new_user' ? 'bg-emerald-50' : a.type === 'order' ? 'bg-blue-50' : 'bg-violet-50'
                    }`}>
                      {a.type === 'new_user' && <Users className="w-4 h-4 text-emerald-500" />}
                      {a.type === 'order' && <Package className="w-4 h-4 text-blue-500" />}
                      {a.type === 'message' && <MessageSquare className="w-4 h-4 text-violet-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 truncate">
                        {a.type === 'new_user' && `Nuevo usuario: ${a.email}`}
                        {a.type === 'order' && `Pedido: ${a.product} (${a.status})`}
                        {a.type === 'message' && `Mensaje de ${a.name}: ${a.subject}`}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{a.time ? new Date(a.time).toLocaleDateString('es-ES') : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS TABLE ── */}
        {tab === 'users' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadTab('users')} placeholder="Buscar por email o nombre..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:border-emerald-500 outline-none" data-testid="search-users" />
              </div>
              <button onClick={() => loadTab('users')} className="px-3 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg">Buscar</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-left text-xs text-gray-500 font-medium">
                  <th className="p-3">Email</th><th className="p-3">Nombre</th><th className="p-3">Rol</th><th className="p-3">Registro</th>
                </tr></thead>
                <tbody>
                  {users.users.map((u, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{u.email}</td>
                      <td className="p-3">{u.name || u.full_name || '-'}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${u.role === 'super_admin' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>{u.role || 'user'}</span></td>
                      <td className="p-3 text-gray-400">{u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '-'}</td>
                    </tr>
                  ))}
                  {users.users.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">Sin usuarios</td></tr>}
                </tbody>
              </table>
            </div>
            <Paginator data={users} onPage={p => loadTab('users', p)} />
          </div>
        )}

        {/* ── SUBSCRIPTIONS TABLE ── */}
        {tab === 'subscriptions' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-left text-xs text-gray-500 font-medium">
                  <th className="p-3">Email</th><th className="p-3">Plan</th><th className="p-3">Estado</th><th className="p-3">Promo</th><th className="p-3">Fecha</th>
                </tr></thead>
                <tbody>
                  {subs.subscriptions.map((s, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{s.email || '-'}</td>
                      <td className="p-3">{s.plan_type || '-'}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${s.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>{s.status || '-'}</span></td>
                      <td className="p-3">{s.promo_200 ? <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs font-semibold">-20%</span> : '-'}</td>
                      <td className="p-3 text-gray-400">{s.created_at ? new Date(s.created_at).toLocaleDateString('es-ES') : '-'}</td>
                    </tr>
                  ))}
                  {subs.subscriptions.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">Sin suscripciones</td></tr>}
                </tbody>
              </table>
            </div>
            <Paginator data={subs} onPage={p => loadTab('subscriptions', p)} />
          </div>
        )}

        {/* ── ORDERS TABLE ── */}
        {tab === 'orders' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-left text-xs text-gray-500 font-medium">
                  <th className="p-3">Email</th><th className="p-3">Producto</th><th className="p-3">Estado</th><th className="p-3">Precio</th><th className="p-3">Fecha</th>
                </tr></thead>
                <tbody>
                  {orders.orders.map((o, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{o.email || '-'}</td>
                      <td className="p-3">{o.product || '-'}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${o.status === 'shipped' ? 'bg-emerald-100 text-emerald-600' : o.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>{o.status || '-'}</span></td>
                      <td className="p-3">{o.price ? `${o.price}€` : '-'}</td>
                      <td className="p-3 text-gray-400">{o.created_at ? new Date(o.created_at).toLocaleDateString('es-ES') : '-'}</td>
                    </tr>
                  ))}
                  {orders.orders.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">Sin pedidos</td></tr>}
                </tbody>
              </table>
            </div>
            <Paginator data={orders} onPage={p => loadTab('orders', p)} />
          </div>
        )}

        {/* ── REFUNDS TABLE ── */}
        {tab === 'refunds' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-left text-xs text-gray-500 font-medium">
                  <th className="p-3">Email</th><th className="p-3">Motivo</th><th className="p-3">Estado</th><th className="p-3">Importe</th><th className="p-3">Fecha</th>
                </tr></thead>
                <tbody>
                  {refunds.refunds.map((r, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{r.email || '-'}</td>
                      <td className="p-3">{r.reason || '-'}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${r.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : r.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>{r.status || '-'}</span></td>
                      <td className="p-3">{r.amount ? `${r.amount}€` : '-'}</td>
                      <td className="p-3 text-gray-400">{r.created_at ? new Date(r.created_at).toLocaleDateString('es-ES') : '-'}</td>
                    </tr>
                  ))}
                  {refunds.refunds.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">Sin reembolsos</td></tr>}
                </tbody>
              </table>
            </div>
            <Paginator data={refunds} onPage={p => loadTab('refunds', p)} />
          </div>
        )}

        {/* ── MESSAGES TABLE ── */}
        {tab === 'messages' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-left text-xs text-gray-500 font-medium">
                  <th className="p-3">Nombre</th><th className="p-3">Email</th><th className="p-3">Asunto</th><th className="p-3">Estado</th><th className="p-3">Fecha</th>
                </tr></thead>
                <tbody>
                  {messages.messages.map((m, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{m.name || '-'}</td>
                      <td className="p-3">{m.email || '-'}</td>
                      <td className="p-3">{m.subject || '-'}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${m.status === 'new' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>{m.status === 'new' ? 'Nuevo' : 'Leído'}</span></td>
                      <td className="p-3 text-gray-400">{m.created_at ? new Date(m.created_at).toLocaleDateString('es-ES') : '-'}</td>
                    </tr>
                  ))}
                  {messages.messages.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">Sin mensajes</td></tr>}
                </tbody>
              </table>
            </div>
            <Paginator data={messages} onPage={p => loadTab('messages', p)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CEODashboard;
