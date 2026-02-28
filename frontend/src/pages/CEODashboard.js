/**
 * ManoProtect CEO Dashboard - Enterprise Edition
 * Sidebar + Dashboard + Inventario + Usuarios + Membresías + Pagos + Seguridad + Reportes
 * Colores corporativos: azul (#1e40af) y naranja (#ea580c)
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line
} from 'recharts';
import {
  Shield, Users, CreditCard, Package, RotateCcw, MessageSquare,
  TrendingUp, AlertTriangle, Search, ChevronLeft, ChevronRight,
  Activity, RefreshCw, BarChart3, Gift, Percent, Bell, Settings,
  Layout, Box, Lock, FileText, Download, Menu, X, Eye, UserX, UserCheck,
  CheckCircle, XCircle, ChevronDown
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const COLORS = ['#1e40af', '#ea580c', '#16a34a', '#7c3aed', '#dc2626', '#0891b2'];

const CEODashboard = () => {
  const nav = useNavigate();
  const [section, setSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState({ users: [], total: 0, page: 1, pages: 1 });
  const [subs, setSubs] = useState({ subscriptions: [], total: 0, page: 1, pages: 1 });
  const [orders, setOrders] = useState({ orders: [], total: 0, page: 1, pages: 1 });
  const [messages, setMessages] = useState({ messages: [], total: 0, page: 1, pages: 1 });
  const [refunds, setRefunds] = useState({ refunds: [], total: 0, page: 1, pages: 1 });
  const [payments, setPayments] = useState([]);
  const [inventory, setInventory] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [securityLogs, setSecurityLogs] = useState({ logs: [], total: 0 });
  const [securityOverview, setSecurityOverview] = useState(null);
  const [blockedIps, setBlockedIps] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [heartbeat, setHeartbeat] = useState({ backend: false });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchJSON = useCallback(async (url) => {
    const res = await fetch(`${API}${url}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const [s, a, c, n] = await Promise.all([
        fetchJSON('/api/ceo/stats'),
        fetchJSON('/api/ceo/activity'),
        fetchJSON('/api/ceo/chart-data'),
        fetchJSON('/api/ceo/notifications'),
      ]);
      setStats(s); setActivity(a.activities || []); setChartData(c); setNotifications(n.notifications || []);
    } catch (e) {
      if (String(e).includes('401') || String(e).includes('403')) nav('/login');
    }
    setLoading(false);
  }, [fetchJSON, nav]);

  useEffect(() => { loadDashboard(); const iv = setInterval(loadDashboard, 30000); return () => clearInterval(iv); }, [loadDashboard]);

  useEffect(() => {
    const check = async () => {
      try { const r = await fetch(`${API}/api/heartbeat`); setHeartbeat({ backend: r.ok }); } catch { setHeartbeat({ backend: false }); }
    };
    check(); const iv = setInterval(check, 5000); return () => clearInterval(iv);
  }, []);

  // Notification polling every 10s
  useEffect(() => {
    const poll = async () => {
      try {
        const n = await fetchJSON('/api/ceo/notifications');
        setNotifications(n.notifications || []);
      } catch {}
    };
    const iv = setInterval(poll, 10000);
    return () => clearInterval(iv);
  }, [fetchJSON]);

  const loadSection = useCallback(async (s, page = 1) => {
    try {
      if (s === 'users') setUsers(await fetchJSON(`/api/ceo/users?page=${page}&search=${search}`));
      if (s === 'memberships') setSubs(await fetchJSON(`/api/ceo/subscriptions?page=${page}`));
      if (s === 'orders' || s === 'inventory-orders') setOrders(await fetchJSON(`/api/ceo/orders?page=${page}`));
      if (s === 'messages') setMessages(await fetchJSON(`/api/ceo/messages?page=${page}`));
      if (s === 'payments') {
        const [r, p] = await Promise.all([fetchJSON(`/api/ceo/refunds?page=${page}`), fetchJSON('/api/ceo/payments?page=1&limit=50')]);
        setRefunds(r); setPayments(p.payments || []);
      }
      if (s === 'inventory') setInventory(await fetchJSON(`/api/ceo/inventory?page=${page}`));
      if (s === 'security') {
        const [logs, overview, ips] = await Promise.all([fetchJSON('/api/ceo/security-logs'), fetchJSON('/api/ceo/security-overview'), fetchJSON('/api/ceo/blocked-ips')]);
        setSecurityLogs(logs); setSecurityOverview(overview); setBlockedIps(ips.blocked_ips || []);
      }
    } catch {}
  }, [fetchJSON, search]);

  useEffect(() => { if (section !== 'dashboard') loadSection(section); }, [section, loadSection]);

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  const s = stats || {};
  const unreadNotifs = notifications.filter(n => n.severity === 'error' || n.severity === 'warning').length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layout },
    { id: 'inventory', label: 'Inventario', icon: Box },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'memberships', label: 'Membresías', icon: CreditCard },
    { id: 'payments', label: 'Pagos', icon: TrendingUp },
    { id: 'security', label: 'Seguridad', icon: Lock },
    { id: 'messages', label: 'Mensajes', icon: MessageSquare },
    { id: 'reports', label: 'Reportes', icon: FileText },
  ];

  const Paginator = ({ data, onPage }) => (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t">
      <p className="text-xs text-gray-500">Total: {data.total} | Pág {data.page}/{data.pages}</p>
      <div className="flex gap-1">
        <button disabled={data.page <= 1} onClick={() => onPage(data.page - 1)} className="p-1.5 rounded bg-white border disabled:opacity-30 hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
        <button disabled={data.page >= data.pages} onClick={() => onPage(data.page + 1)} className="p-1.5 rounded bg-white border disabled:opacity-30 hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex" data-testid="ceo-dashboard">
      {/* ═══ SIDEBAR ═══ */}
      <aside className={`fixed inset-y-0 left-0 z-40 bg-[#0f172a] text-white transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-0 -translate-x-full'} lg:translate-x-0 lg:static lg:${sidebarOpen ? 'w-56' : 'w-16'}`} data-testid="sidebar">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"><Shield className="w-4 h-4 text-white" /></div>
            {sidebarOpen && <div><p className="font-bold text-sm">ManoProtect</p><p className="text-[10px] text-slate-400">Panel CEO</p></div>}
          </div>
        </div>
        <nav className="py-3 space-y-0.5 px-2" data-testid="sidebar-nav">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setSection(item.id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${section === item.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              data-testid={`nav-${item.id}`}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
              {item.id === 'messages' && s.messages?.unread > 0 && sidebarOpen && <span className="ml-auto bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{s.messages.unread}</span>}
            </button>
          ))}
        </nav>
        {sidebarOpen && <div className="absolute bottom-4 left-0 right-0 px-4">
          <button onClick={() => nav('/')} className="w-full text-xs text-slate-500 hover:text-white py-2 flex items-center gap-2 justify-center"><Eye className="w-3 h-3" /> Ver sitio web</button>
        </div>}
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30" data-testid="dashboard-header">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"><Menu className="w-5 h-5" /></button>
            <h2 className="font-bold text-gray-900 text-lg capitalize">{menuItems.find(m => m.id === section)?.label || 'Dashboard'}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${heartbeat.backend ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${heartbeat.backend ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} /> Backend {heartbeat.backend ? 'LIVE' : 'DOWN'}
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Frontend LIVE
              </span>
            </div>
            {/* Notifications bell */}
            <div className="relative">
              <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 hover:bg-slate-100 rounded-lg relative" data-testid="notif-bell">
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadNotifs > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{unreadNotifs}</span>}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-xl border z-50 max-h-80 overflow-y-auto" data-testid="notif-panel">
                  <div className="p-3 border-b font-bold text-sm text-gray-900 flex items-center justify-between">
                    Notificaciones
                    <button onClick={() => setShowNotifs(false)}><X className="w-4 h-4 text-gray-400" /></button>
                  </div>
                  {notifications.length === 0 && <p className="p-4 text-sm text-gray-400 text-center">Sin notificaciones</p>}
                  {notifications.map((n, i) => (
                    <div key={i} className={`p-3 border-b last:border-0 flex items-start gap-2 ${n.severity === 'error' ? 'bg-red-50' : n.severity === 'warning' ? 'bg-amber-50' : n.severity === 'success' ? 'bg-green-50' : 'bg-blue-50'}`}>
                      {n.severity === 'error' && <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                      {n.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                      {n.severity === 'success' && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />}
                      {n.severity === 'info' && <Bell className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
                      <p className="text-xs text-gray-700">{n.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={loadDashboard} className="p-2 hover:bg-slate-100 rounded-lg" data-testid="refresh-btn"><RefreshCw className="w-4 h-4 text-gray-500" /></button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">

          {/* ═══════ DASHBOARD ═══════ */}
          {section === 'dashboard' && (
            <div className="space-y-6">
              {/* Alerts Bar */}
              {(s.alerts?.pending_refunds || s.alerts?.failed_payments > 0 || s.alerts?.low_stock) && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex flex-wrap gap-3" data-testid="alerts-bar">
                  {s.alerts?.low_stock && <span className="flex items-center gap-1 text-xs font-semibold text-orange-700"><AlertTriangle className="w-3.5 h-3.5" /> Stock bajo</span>}
                  {s.alerts?.pending_refunds && <span className="flex items-center gap-1 text-xs font-semibold text-orange-700"><RotateCcw className="w-3.5 h-3.5" /> Reembolsos pendientes</span>}
                  {s.alerts?.failed_payments > 0 && <span className="flex items-center gap-1 text-xs font-semibold text-red-700"><XCircle className="w-3.5 h-3.5" /> {s.alerts.failed_payments} pago(s) fallido(s)</span>}
                  {s.alerts?.expiring_subs > 0 && <span className="flex items-center gap-1 text-xs font-semibold text-amber-700"><CreditCard className="w-3.5 h-3.5" /> {s.alerts.expiring_subs} suscripción(es) por vencer</span>}
                </div>
              )}

              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" data-testid="stat-cards">
                {[
                  { icon: Users, label: 'Usuarios', value: s.users?.total || 0, sub: `+${s.users?.today || 0} hoy`, color: 'blue' },
                  { icon: CreditCard, label: 'Suscripciones', value: s.subscriptions?.active || 0, sub: `${s.subscriptions?.monthly || 0} mes / ${s.subscriptions?.yearly || 0} año`, color: 'blue' },
                  { icon: TrendingUp, label: 'Ventas Mes', value: `${s.revenue?.month || 0}€`, sub: `Hoy: ${s.revenue?.today || 0}€`, color: 'orange' },
                  { icon: Package, label: 'Pedidos', value: s.orders?.total || 0, sub: `${s.orders?.pending || 0} pendientes`, color: 'blue', alert: s.orders?.pending > 0 },
                  { icon: RotateCcw, label: 'Reembolsos', value: s.refunds?.total || 0, sub: `${s.refunds?.pending || 0} pendientes`, color: 'red', alert: s.refunds?.pending > 0 },
                  { icon: MessageSquare, label: 'Mensajes', value: s.messages?.total || 0, sub: `${s.messages?.unread || 0} sin leer`, color: 'orange', alert: s.messages?.unread > 0 },
                ].map((card, i) => (
                  <div key={i} className={`bg-white rounded-xl border ${card.alert ? 'border-orange-300' : 'border-gray-200'} p-4 hover:shadow-md transition-shadow`} data-testid={`stat-${card.label.toLowerCase()}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-9 h-9 ${card.color === 'orange' ? 'bg-orange-50' : card.color === 'red' ? 'bg-red-50' : 'bg-blue-50'} rounded-lg flex items-center justify-center`}>
                        <card.icon className={`w-5 h-5 ${card.color === 'orange' ? 'text-orange-500' : card.color === 'red' ? 'text-red-500' : 'text-blue-600'}`} />
                      </div>
                      {card.alert && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500">{card.label}</p>
                    {card.sub && <p className="text-[10px] text-gray-400 mt-0.5">{card.sub}</p>}
                  </div>
                ))}
              </div>

              {/* Inventory Quick View */}
              <div className="grid sm:grid-cols-3 gap-3" data-testid="inventory-quick">
                {[
                  { name: 'Sentinel X', stock: s.inventory?.sentinel_x || 0, color: '#1e40af' },
                  { name: 'Sentinel J', stock: s.inventory?.sentinel_j || 0, color: '#ea580c' },
                  { name: 'Sentinel S', stock: s.inventory?.sentinel_s || 0, color: '#16a34a' },
                ].map((p, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-gray-900">{p.name}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{p.stock} uds</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, p.stock * 2)}%`, backgroundColor: p.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              {chartData && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="charts-section">
                  {/* Users Bar Chart */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="font-bold text-sm text-gray-900 mb-3">Usuarios por Mes</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={chartData.users_by_month}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="users" fill="#1e40af" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Revenue Line Chart */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="font-bold text-sm text-gray-900 mb-3">Ingresos por Mes</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={chartData.revenue_by_month}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={2} dot={{ fill: '#ea580c' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Plan Pie Chart */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="font-bold text-sm text-gray-900 mb-3">Distribución Planes</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={chartData.plan_distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                          {chartData.plan_distribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Promo + Activity */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-white rounded-xl border border-gray-200 p-4" data-testid="promo-basic-stock">
                    <div className="flex items-center gap-2 mb-2"><Gift className="w-4 h-4 text-blue-600" /><h3 className="font-bold text-gray-900 text-sm">Sentinel X Basic GRATIS</h3></div>
                    <div className="flex items-center gap-3"><div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${((s.promo?.basic_stock_total - s.promo?.basic_stock_remaining) / (s.promo?.basic_stock_total || 50)) * 100}%` }} /></div><p className="text-sm font-bold">{s.promo?.basic_stock_remaining ?? 50}/{s.promo?.basic_stock_total || 50}</p></div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4" data-testid="promo-200-users">
                    <div className="flex items-center gap-2 mb-2"><Percent className="w-4 h-4 text-orange-500" /><h3 className="font-bold text-gray-900 text-sm">Promo -{s.promo?.discount_pct || 20}% (200 plazas)</h3></div>
                    <div className="flex items-center gap-3"><div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${((s.promo?.promo_200_total - s.promo?.promo_200_remaining) / (s.promo?.promo_200_total || 200)) * 100}%` }} /></div><p className="text-sm font-bold">{s.promo?.promo_200_remaining ?? 200}/{s.promo?.promo_200_total || 200}</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4" data-testid="recent-activity">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm"><Activity className="w-4 h-4 text-blue-600" /> Actividad Reciente</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {activity.length === 0 && <p className="text-sm text-gray-400">Sin actividad reciente</p>}
                    {activity.slice(0, 10).map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-gray-50 last:border-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${a.type === 'new_user' ? 'bg-blue-50' : a.type === 'order' ? 'bg-orange-50' : a.type === 'payment' ? 'bg-green-50' : 'bg-violet-50'}`}>
                          {a.type === 'new_user' && <Users className="w-3 h-3 text-blue-600" />}
                          {a.type === 'order' && <Package className="w-3 h-3 text-orange-500" />}
                          {a.type === 'message' && <MessageSquare className="w-3 h-3 text-violet-500" />}
                          {a.type === 'payment' && <TrendingUp className="w-3 h-3 text-green-500" />}
                        </div>
                        <p className="flex-1 min-w-0 truncate text-gray-600">
                          {a.type === 'new_user' && `Nuevo: ${a.email}`}
                          {a.type === 'order' && `Pedido: ${a.product} (${a.status})`}
                          {a.type === 'message' && `${a.name}: ${a.subject}`}
                          {a.type === 'payment' && `Pago: ${a.amount}€ - ${a.email}`}
                        </p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{a.time ? new Date(a.time).toLocaleDateString('es-ES') : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ INVENTORY ═══════ */}
          {section === 'inventory' && (
            <div className="space-y-4" data-testid="inventory-section">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b flex flex-wrap items-center gap-3">
                  <h3 className="font-bold text-gray-900">Inventario Sentinel</h3>
                  <div className="flex gap-2">
                    {['sentinel_x', 'sentinel_j', 'sentinel_s'].map(p => (
                      <span key={p} className="text-xs bg-slate-100 px-2 py-1 rounded font-medium">{p.replace('sentinel_', 'Sentinel ').toUpperCase()}: {s.inventory?.[p] || 0}</span>
                    ))}
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <select id="inv-filter-product" className="text-xs border rounded-lg px-2 py-1.5" onChange={e => { document.getElementById('inv-filter-product').dataset.val = e.target.value; }}>
                      <option value="">Todos</option>
                      <option value="sentinel_x">Sentinel X</option>
                      <option value="sentinel_j">Sentinel J</option>
                      <option value="sentinel_s">Sentinel S</option>
                    </select>
                    <select id="inv-filter-status" className="text-xs border rounded-lg px-2 py-1.5" onChange={e => { document.getElementById('inv-filter-status').dataset.val = e.target.value; }}>
                      <option value="">Todos estados</option>
                      <option value="in_stock">En stock</option>
                      <option value="sold">Vendido</option>
                      <option value="shipping">En envío</option>
                      <option value="returned">Devuelto</option>
                    </select>
                    <button onClick={() => { const p = document.getElementById('inv-filter-product')?.value || ''; const st = document.getElementById('inv-filter-status')?.value || ''; fetch(`${API}/api/ceo/inventory?product=${p}&status=${st}`, { credentials: 'include' }).then(r => r.json()).then(setInventory); }} className="px-3 py-1.5 bg-slate-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-slate-200">Filtrar</button>
                    <button onClick={() => {
                      const product = prompt('Producto (sentinel_x, sentinel_j, sentinel_s):');
                      if (!product) return;
                      const location = prompt('Ubicación:', 'Almacén Madrid');
                      fetch(`${API}/api/ceo/inventory`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product, location, status: 'in_stock' }) }).then(r => r.json()).then(r => { if (r.success) { loadSection('inventory'); loadDashboard(); } });
                    }} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700" data-testid="add-inventory-btn">+ Añadir nuevo</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50 text-left text-xs text-gray-500 font-medium">
                      <th className="p-3">Producto</th><th className="p-3">Nº Serie</th><th className="p-3">Estado</th><th className="p-3">Cantidad</th><th className="p-3">Ubicación</th><th className="p-3">Fecha</th><th className="p-3">Acciones</th>
                    </tr></thead>
                    <tbody>
                      {inventory.items.map((item, i) => (
                        <tr key={i} className="border-t hover:bg-slate-50">
                          <td className="p-3 font-medium">{item.product?.replace('sentinel_', 'Sentinel ')?.toUpperCase() || '-'}</td>
                          <td className="p-3 font-mono text-xs">{item.serial_number || '-'}</td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${item.status === 'in_stock' ? 'bg-green-100 text-green-600' : item.status === 'sold' ? 'bg-blue-100 text-blue-600' : item.status === 'returned' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{item.status === 'in_stock' ? 'En stock' : item.status === 'sold' ? 'Vendido' : item.status === 'returned' ? 'Devuelto' : 'En envío'}</span></td>
                          <td className="p-3">1</td>
                          <td className="p-3 text-gray-500">{item.location || '-'}</td>
                          <td className="p-3 text-gray-400 text-xs">{item.created_at ? new Date(item.created_at).toLocaleDateString('es-ES') : '-'}</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <button onClick={() => {
                                const loc = prompt('Nueva ubicación:', item.location);
                                if (loc) fetch(`${API}/api/ceo/inventory/${item.item_id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product: item.product, status: item.status, location: loc }) }).then(() => loadSection('inventory'));
                              }} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded hover:bg-blue-100 font-semibold" data-testid={`edit-inv-${i}`}>Editar</button>
                              {item.status === 'in_stock' && <button onClick={() => {
                                if (window.confirm('¿Marcar como vendido?')) fetch(`${API}/api/ceo/inventory/${item.item_id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product: item.product, status: 'sold', location: item.location }) }).then(() => { loadSection('inventory'); loadDashboard(); });
                              }} className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded hover:bg-orange-100 font-semibold" data-testid={`sell-inv-${i}`}>Vendido</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {inventory.items.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">Sin items en inventario. Haz clic en "+ Añadir nuevo" para crear items.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <Paginator data={inventory} onPage={p => loadSection('inventory', p)} />
              </div>
            </div>
          )}

          {/* ═══════ USERS ═══════ */}
          {section === 'users' && (
            <div className="space-y-4" data-testid="users-section">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadSection('users')} placeholder="Buscar por email, nombre, ID, IP..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:border-blue-500 outline-none" data-testid="search-users" />
                  </div>
                  <button onClick={() => loadSection('users')} className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">Buscar</button>
                  <a href={`${API}/api/ceo/export/users`} className="px-3 py-2 bg-slate-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-slate-200 flex items-center gap-1"><Download className="w-3 h-3" /> CSV</a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50 text-left text-xs text-gray-500 font-medium">
                      <th className="p-3">Nombre</th><th className="p-3">Email</th><th className="p-3">ID Suscriptor</th><th className="p-3">IP Registro</th><th className="p-3">Plan</th><th className="p-3">Estado</th><th className="p-3">Registro</th><th className="p-3">Acciones</th>
                    </tr></thead>
                    <tbody>
                      {users.users.map((u, i) => (
                        <tr key={i} className="border-t hover:bg-slate-50">
                          <td className="p-3 font-medium text-gray-900">{u.name || u.full_name || '-'}</td>
                          <td className="p-3">{u.email}</td>
                          <td className="p-3 font-mono text-[11px] text-gray-400">{u.user_id?.slice(-8) || '-'}</td>
                          <td className="p-3 font-mono text-[11px] text-gray-400">{u.registration_ip || u.last_ip || '—'}</td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${u.plan === 'enterprise' ? 'bg-blue-100 text-blue-700' : u.plan === 'free' || !u.plan ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-600'}`}>{u.plan || 'free'}</span></td>
                          <td className="p-3">{u.is_active !== false ? <span className="text-green-600 text-xs font-semibold">Activa</span> : <span className="text-red-600 text-xs font-semibold">Suspendida</span>}</td>
                          <td className="p-3 text-gray-400 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '-'}</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <button onClick={() => {
                                const plan = prompt('Nuevo plan (free, family-monthly, family-yearly, enterprise):', u.plan || 'free');
                                if (!plan) return;
                                const disc = prompt('% descuento (0 = sin descuento):', '0');
                                fetch(`${API}/api/ceo/users/${u.user_id}/plan`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan_type: plan, discount_pct: parseInt(disc || '0') }) }).then(r => r.json()).then(r => { if (r.success) loadSection('users'); });
                              }} className="p-1.5 rounded text-blue-500 hover:bg-blue-50" title="Cambiar plan" data-testid={`change-plan-${i}`}>
                                <CreditCard className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={async () => {
                                if (!window.confirm(u.is_active !== false ? '¿Suspender esta cuenta?' : '¿Activar esta cuenta?')) return;
                                await fetch(`${API}/api/ceo/users/${u.user_id}/suspend`, { method: 'PATCH', credentials: 'include' });
                                loadSection('users');
                              }} className={`p-1.5 rounded ${u.is_active !== false ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`} title={u.is_active !== false ? 'Suspender' : 'Activar'} data-testid={`toggle-user-${i}`}>
                                {u.is_active !== false ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.users.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-gray-400">Sin usuarios</td></tr>}
                    </tbody>
                  </table>
                </div>
                <Paginator data={users} onPage={p => loadSection('users', p)} />
              </div>
              {/* Panel de gestión de planes */}
              <div className="bg-white rounded-xl border border-gray-200 p-4" data-testid="plan-management-panel">
                <h3 className="font-bold text-gray-900 mb-3">Gestión de Planes de Suscripción</h3>
                <div className="grid sm:grid-cols-4 gap-3">
                  {[
                    { plan: 'free', label: 'Free', price: '0€/mes', color: 'bg-gray-50 border-gray-200' },
                    { plan: 'family-monthly', label: 'Mensual', price: '9,99€/mes', color: 'bg-blue-50 border-blue-200' },
                    { plan: 'family-yearly', label: 'Anual', price: '99,99€/año', color: 'bg-orange-50 border-orange-200' },
                    { plan: 'enterprise', label: 'Enterprise', price: 'Personalizado', color: 'bg-emerald-50 border-emerald-200' },
                  ].map((p, i) => (
                    <div key={i} className={`border rounded-xl p-3 ${p.color}`}>
                      <p className="font-bold text-sm text-gray-900">{p.label}</p>
                      <p className="text-xs text-gray-500 mb-2">{p.price}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {users.users.filter(u => (u.plan || 'free') === p.plan || (!u.plan && p.plan === 'free')).length}
                      </p>
                      <p className="text-[10px] text-gray-400">suscriptores</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Suscripciones próximas a vencer: <strong>{s.subscriptions?.expiring_soon || 0}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ MEMBERSHIPS ═══════ */}
          {section === 'memberships' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" data-testid="memberships-section">
              <div className="p-4 border-b"><h3 className="font-bold text-gray-900">Suscripciones y Membresías</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 text-left text-xs text-gray-500 font-medium">
                    <th className="p-3">Email</th><th className="p-3">Plan</th><th className="p-3">Estado</th><th className="p-3">Promo</th><th className="p-3">Importe</th><th className="p-3">Fecha</th>
                  </tr></thead>
                  <tbody>
                    {subs.subscriptions.map((sub, i) => (
                      <tr key={i} className="border-t hover:bg-slate-50">
                        <td className="p-3">{sub.email || '-'}</td>
                        <td className="p-3 font-medium">{sub.plan_type || '-'}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${sub.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{sub.status}</span></td>
                        <td className="p-3">{sub.promo_200 ? <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs font-semibold">-20%</span> : '-'}</td>
                        <td className="p-3">{sub.amount_paid ? `${sub.amount_paid}€` : '-'}</td>
                        <td className="p-3 text-gray-400 text-xs">{sub.created_at ? new Date(sub.created_at).toLocaleDateString('es-ES') : '-'}</td>
                      </tr>
                    ))}
                    {subs.subscriptions.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">Sin suscripciones activas</td></tr>}
                  </tbody>
                </table>
              </div>
              <Paginator data={subs} onPage={p => loadSection('memberships', p)} />
            </div>
          )}

          {/* ═══════ PAYMENTS & REFUNDS ═══════ */}
          {section === 'payments' && (
            <div className="space-y-4" data-testid="payments-section">
              {/* Tabla de Transacciones */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Transacciones de Pago</h3>
                  <div className="flex gap-2">
                    <a href={`${API}/api/ceo/export/payments`} className="px-3 py-1.5 bg-slate-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-slate-200 flex items-center gap-1"><Download className="w-3 h-3" /> CSV</a>
                    <button onClick={() => window.print()} className="px-3 py-1.5 bg-slate-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-slate-200 flex items-center gap-1"><FileText className="w-3 h-3" /> PDF</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="payments-table">
                    <thead><tr className="bg-slate-50 text-left text-xs text-gray-500 font-medium">
                      <th className="p-3">Usuario</th><th className="p-3">ID</th><th className="p-3">Email</th><th className="p-3">Método</th><th className="p-3">Importe</th><th className="p-3">Estado</th><th className="p-3">Fecha</th>
                    </tr></thead>
                    <tbody>
                      {(payments || []).map((p, i) => (
                        <tr key={i} className="border-t hover:bg-slate-50">
                          <td className="p-3 font-medium">{p.user_id?.slice(-8) || '-'}</td>
                          <td className="p-3 font-mono text-[11px] text-gray-400">{p.session_id?.slice(-10) || '-'}</td>
                          <td className="p-3">{p.email || '-'}</td>
                          <td className="p-3"><span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-semibold">Stripe</span></td>
                          <td className="p-3 font-bold">{p.amount ? `${p.amount}€` : '-'}</td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${p.payment_status === 'paid' ? 'bg-green-100 text-green-600' : p.payment_status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{p.payment_status === 'paid' ? 'Completado' : p.payment_status === 'failed' ? 'Fallido' : 'Pendiente'}</span></td>
                          <td className="p-3 text-gray-400 text-xs">{p.created_at ? new Date(p.created_at).toLocaleDateString('es-ES') : '-'}</td>
                        </tr>
                      ))}
                      {(!payments || payments.length === 0) && <tr><td colSpan={7} className="p-8 text-center text-gray-400">Sin transacciones registradas</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Panel de Reembolsos */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b"><h3 className="font-bold text-gray-900">Solicitudes de Reembolso</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50 text-left text-xs text-gray-500 font-medium">
                      <th className="p-3">Email</th><th className="p-3">Motivo</th><th className="p-3">Estado</th><th className="p-3">Importe</th><th className="p-3">Fecha</th><th className="p-3">Acciones</th>
                    </tr></thead>
                    <tbody>
                      {refunds.refunds.map((r, i) => (
                        <tr key={i} className="border-t hover:bg-slate-50">
                          <td className="p-3">{r.email || '-'}</td>
                          <td className="p-3">{r.reason || '-'}</td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${r.status === 'approved' ? 'bg-green-100 text-green-600' : r.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{r.status === 'approved' ? 'Aprobado' : r.status === 'rejected' ? 'Rechazado' : 'Pendiente'}</span></td>
                          <td className="p-3">{r.amount ? `${r.amount}€` : '-'}</td>
                          <td className="p-3 text-gray-400 text-xs">{r.created_at ? new Date(r.created_at).toLocaleDateString('es-ES') : '-'}</td>
                          <td className="p-3">
                            {r.status === 'pending' && (
                              <div className="flex gap-1">
                                <button onClick={async () => { await fetch(`${API}/api/ceo/refunds/${r.refund_id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve', reason: '' }) }); loadSection('payments'); }}
                                  className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded hover:bg-green-100 font-semibold flex items-center gap-1" data-testid={`approve-refund-${i}`}><CheckCircle className="w-3 h-3" /> Aprobar</button>
                                <button onClick={async () => { const reason = prompt('Motivo del rechazo:'); await fetch(`${API}/api/ceo/refunds/${r.refund_id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reject', reason: reason || '' }) }); loadSection('payments'); }}
                                  className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100 font-semibold flex items-center gap-1" data-testid={`reject-refund-${i}`}><XCircle className="w-3 h-3" /> Rechazar</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {refunds.refunds.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">Sin reembolsos</td></tr>}
                    </tbody>
                  </table>
                </div>
                <Paginator data={refunds} onPage={p => loadSection('payments', p)} />
              </div>
            </div>
          )}

          {/* ═══════ SECURITY ═══════ */}
          {section === 'security' && (
            <div className="space-y-4" data-testid="security-section">
              {securityOverview && (
                <div className="grid sm:grid-cols-4 gap-3">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2"><Lock className="w-4 h-4 text-blue-600" /><h3 className="font-bold text-sm">Administradores</h3></div>
                    <p className="text-2xl font-bold text-gray-900">{securityOverview.total_admins}</p>
                    <div className="mt-2 space-y-1">
                      {securityOverview.admin_users?.map((a, i) => (
                        <p key={i} className="text-xs text-gray-500">{a.email} <span className="text-blue-600 font-semibold">({a.role})</span></p>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-green-600" /><h3 className="font-bold text-sm">2FA Activado</h3></div>
                    <p className="text-2xl font-bold text-gray-900">{securityOverview.two_factor_enabled_count}</p>
                    <p className="text-xs text-gray-400">usuarios con 2FA</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-red-500" /><h3 className="font-bold text-sm">Intentos Fallidos</h3></div>
                    <p className="text-2xl font-bold text-gray-900">{securityOverview.failed_login_attempts}</p>
                    <p className="text-xs text-gray-400">login fallidos</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2"><Lock className="w-4 h-4 text-red-600" /><h3 className="font-bold text-sm">IPs Bloqueadas</h3></div>
                    <p className="text-2xl font-bold text-gray-900">{securityOverview.blocked_ips_count || 0}</p>
                    <p className="text-xs text-gray-400">accesos denegados</p>
                  </div>
                </div>
              )}

              {/* IP Blacklist Panel */}
              <div className="bg-white rounded-xl border border-red-200 overflow-hidden" data-testid="ip-blacklist-panel">
                <div className="p-4 border-b border-red-100 bg-red-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-600" />
                    <h3 className="font-bold text-red-800">Sistema de Bloqueo de IP</h3>
                  </div>
                  <button onClick={() => {
                    const ip = prompt('IP a bloquear:');
                    if (!ip) return;
                    const reason = prompt('Motivo del bloqueo:');
                    fetch(`${API}/api/ceo/block-ip`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip, reason: reason || 'Bloqueado por CEO', user_id: '' }) }).then(r => r.json()).then(() => loadSection('security'));
                  }} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700" data-testid="block-ip-btn">+ Bloquear IP</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-red-50/50 text-left text-xs text-gray-500 font-medium">
                      <th className="p-3">IP</th><th className="p-3">Estado</th><th className="p-3">Motivo</th><th className="p-3">Usuario</th><th className="p-3">Fecha</th><th className="p-3">Acciones</th>
                    </tr></thead>
                    <tbody>
                      {blockedIps.map((ip, i) => (
                        <tr key={i} className="border-t hover:bg-red-50/30">
                          <td className="p-3 font-mono font-bold text-gray-900">{ip.ip}</td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${ip.active ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{ip.active ? 'Bloqueada' : 'Desbloqueada'}</span></td>
                          <td className="p-3 text-gray-500 text-xs">{ip.reason || '-'}</td>
                          <td className="p-3 font-mono text-xs text-gray-400">{ip.user_id?.slice(-8) || '-'}</td>
                          <td className="p-3 text-gray-400 text-xs">{ip.blocked_at ? new Date(ip.blocked_at).toLocaleDateString('es-ES') : '-'}</td>
                          <td className="p-3">
                            {ip.active ? (
                              <button onClick={() => { fetch(`${API}/api/ceo/unblock-ip`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip: ip.ip }) }).then(() => loadSection('security')); }}
                                className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded hover:bg-green-100 font-semibold" data-testid={`unblock-ip-${i}`}>Desbloquear</button>
                            ) : (
                              <button onClick={() => { fetch(`${API}/api/ceo/block-ip`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip: ip.ip, reason: ip.reason || '' }) }).then(() => loadSection('security')); }}
                                className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100 font-semibold">Re-bloquear</button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {blockedIps.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No hay IPs bloqueadas. El sistema detecta automáticamente las IPs de cada usuario.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Activity Log */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b"><h3 className="font-bold text-gray-900">Registro de Actividad por IP</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50 text-left text-xs text-gray-500 font-medium">
                      <th className="p-3">Acción</th><th className="p-3">IP</th><th className="p-3">Usuario</th><th className="p-3">Detalles</th><th className="p-3">Fecha</th>
                    </tr></thead>
                    <tbody>
                      {securityLogs.logs?.map((log, i) => (
                        <tr key={i} className="border-t hover:bg-slate-50">
                          <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${log.action?.includes('block') ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{log.action}</span></td>
                          <td className="p-3 font-mono text-xs">{log.ip || '-'}</td>
                          <td className="p-3">{log.user_email || log.user_id || '-'}</td>
                          <td className="p-3 text-gray-500 text-xs">{log.reason || (log.old_plan ? `${log.old_plan} → ${log.new_plan}` : log.changed_by || '-')}</td>
                          <td className="p-3 text-gray-400 text-xs">{log.created_at ? new Date(log.created_at).toLocaleDateString('es-ES') : '-'}</td>
                        </tr>
                      ))}
                      {(!securityLogs.logs || securityLogs.logs.length === 0) && <tr><td colSpan={5} className="p-8 text-center text-gray-400">Sin registros de actividad</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ MESSAGES ═══════ */}
          {section === 'messages' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" data-testid="messages-section">
              <div className="p-4 border-b"><h3 className="font-bold text-gray-900">Mensajes de Contacto</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 text-left text-xs text-gray-500 font-medium">
                    <th className="p-3">Nombre</th><th className="p-3">Email</th><th className="p-3">Asunto</th><th className="p-3">Estado</th><th className="p-3">Fecha</th>
                  </tr></thead>
                  <tbody>
                    {messages.messages.map((m, i) => (
                      <tr key={i} className="border-t hover:bg-slate-50">
                        <td className="p-3 font-medium">{m.name || '-'}</td>
                        <td className="p-3">{m.email || '-'}</td>
                        <td className="p-3">{m.subject || '-'}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${m.status === 'new' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>{m.status === 'new' ? 'Nuevo' : 'Leído'}</span></td>
                        <td className="p-3 text-gray-400 text-xs">{m.created_at ? new Date(m.created_at).toLocaleDateString('es-ES') : '-'}</td>
                      </tr>
                    ))}
                    {messages.messages.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">Sin mensajes</td></tr>}
                  </tbody>
                </table>
              </div>
              <Paginator data={messages} onPage={p => loadSection('messages', p)} />
            </div>
          )}

          {/* ═══════ REPORTS ═══════ */}
          {section === 'reports' && (
            <div className="space-y-4" data-testid="reports-section">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Exportar Reportes</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <a href={`${API}/api/ceo/export/users`} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
                    <div><p className="font-bold text-sm text-gray-900">Usuarios CSV</p><p className="text-xs text-gray-500">Exportar todos los usuarios</p></div>
                    <Download className="w-4 h-4 text-gray-400 ml-auto" />
                  </a>
                  <a href={`${API}/api/ceo/export/payments`} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center"><CreditCard className="w-5 h-5 text-orange-500" /></div>
                    <div><p className="font-bold text-sm text-gray-900">Pagos CSV</p><p className="text-xs text-gray-500">Exportar transacciones</p></div>
                    <Download className="w-4 h-4 text-gray-400 ml-auto" />
                  </a>
                </div>
              </div>
              {/* Revenue Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Resumen Financiero</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-center"><p className="text-xs text-blue-600 font-semibold">MRR</p><p className="text-xl font-bold text-blue-800">{s.revenue?.mrr || 0}€</p></div>
                  <div className="p-3 bg-orange-50 rounded-xl text-center"><p className="text-xs text-orange-600 font-semibold">Hoy</p><p className="text-xl font-bold text-orange-800">{s.revenue?.today || 0}€</p></div>
                  <div className="p-3 bg-green-50 rounded-xl text-center"><p className="text-xs text-green-600 font-semibold">Este Mes</p><p className="text-xl font-bold text-green-800">{s.revenue?.month || 0}€</p></div>
                  <div className="p-3 bg-purple-50 rounded-xl text-center"><p className="text-xs text-purple-600 font-semibold">Total</p><p className="text-xl font-bold text-purple-800">{s.revenue?.total || 0}€</p></div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
};

export default CEODashboard;
