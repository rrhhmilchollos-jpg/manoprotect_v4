/**
 * ManoProtect Enterprise Portal - Complete Employee Management System
 * Main Dashboard with KPIs, Charts, and Real-time SOS monitoring
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Shield, Users, Package, AlertTriangle, Settings, LogOut,
  Bell, Search, Menu, X, ChevronRight, TrendingUp, TrendingDown,
  Phone, MapPin, Clock, CheckCircle, XCircle, Activity,
  DollarSign, ShoppingCart, FileText, BarChart3, Eye,
  UserPlus, RefreshCw, Filter, Download, MoreVertical,
  Zap, Target, AlertCircle, PhoneCall, Star, MessageSquare, Lock,
  CreditCard, RotateCcw, AlertOctagon, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { io } from 'socket.io-client';
import TwoFactorSettings from '@/components/TwoFactorSettings';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// ============================================
// CHART HELPER FUNCTIONS (REAL DATA ONLY)
// ============================================

// Merge alerts and SOS data for combined chart - NO MOCK DATA
const mergeChartData = (alerts, sos) => {
  // Create a map of all dates from both datasets
  const dateMap = new Map();
  
  // Add alert data
  if (alerts && alerts.length > 0) {
    alerts.forEach(a => {
      if (a.date) {
        dateMap.set(a.date, { 
          ...(dateMap.get(a.date) || {}), 
          date: a.date, 
          alerts: a.count || 0 
        });
      }
    });
  }
  
  // Add SOS data
  if (sos && sos.length > 0) {
    sos.forEach(s => {
      if (s.date) {
        dateMap.set(s.date, { 
          ...(dateMap.get(s.date) || {}), 
          date: s.date, 
          sos: s.count || 0 
        });
      }
    });
  }
  
  // Convert to array and sort by date
  const result = Array.from(dateMap.values())
    .map(item => ({
      date: item.date,
      alerts: item.alerts || 0,
      sos: item.sos || 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return result;
};

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, trendValue }) => (
  <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ============================================
// SOS ALERT CARD COMPONENT
// ============================================
const SOSAlertCard = ({ sos, onRespond }) => {
  const priorityColors = {
    critical: 'bg-red-600 animate-pulse',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div className={`bg-slate-800/80 rounded-xl p-4 border-l-4 ${sos.priority === 'critical' ? 'border-red-500' : 'border-orange-500'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge className={priorityColors[sos.priority]}>
            {sos.priority.toUpperCase()}
          </Badge>
          <span className="text-slate-400 text-sm">
            {new Date(sos.created_at).toLocaleTimeString('es-ES')}
          </span>
        </div>
        <Badge variant="outline" className="text-slate-300 border-slate-600">
          {sos.status === 'pending' ? 'Pendiente' : 'En proceso'}
        </Badge>
      </div>
      
      <h4 className="text-white font-semibold mb-1">{sos.client_name}</h4>
      <p className="text-slate-400 text-sm mb-2">{sos.client_phone}</p>
      
      {sos.location && (
        <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
          <MapPin className="w-3 h-3" />
          {sos.location.address || `${sos.location.lat}, ${sos.location.lng}`}
        </div>
      )}
      
      {sos.message && (
        <p className="text-slate-300 text-sm bg-slate-900/50 rounded-lg p-2 mb-3">
          "{sos.message}"
        </p>
      )}
      
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onRespond(sos.sos_id, 'assign')}
          className="bg-indigo-600 hover:bg-indigo-700 flex-1"
        >
          <UserPlus className="w-4 h-4 mr-1" />
          Asignarme
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRespond(sos.sos_id, 'call_emergency', '112')}
          className="border-red-500 text-red-400 hover:bg-red-500/20"
        >
          <PhoneCall className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// ============================================
// MAIN ENTERPRISE PORTAL COMPONENT
// ============================================
const EnterprisePortal = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [pendingSOS, setPendingSOS] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [chartData, setChartData] = useState({
    revenue: [],
    alerts: [],
    sos: [],
    users: []
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [realtimeNotification, setRealtimeNotification] = useState(null);
  const [exporting, setExporting] = useState(null);

  // Export helper function
  const handleExport = async (type, params = {}) => {
    setExporting(type);
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_URL}/api/export/${type}/csv${queryParams ? '?' + queryParams : ''}`;
      const response = await fetch(url, { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || `${type}_export.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Exportación completada');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Error al exportar');
    } finally {
      setExporting(null);
    }
  };

  // Check auth
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch data on auth success
  useEffect(() => {
    if (employee) {
      fetchDashboardData();
      fetchChartData();
      const interval = setInterval(fetchPendingSOS, 10000); // Refresh SOS every 10s
      return () => clearInterval(interval);
    }
  }, [employee]);

  // WebSocket connection for real-time SOS alerts
  useEffect(() => {
    if (!employee) return;

    const wsUrl = API_URL.replace('https://', 'wss://').replace('http://', 'ws://').replace('/api', '');
    
    const socket = io(wsUrl, {
      path: '/ws/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socket.on('connect', () => {
      console.log('[Enterprise WS] Connected');
      setWsConnected(true);
      
      // Register as enterprise employee for admin notifications
      socket.emit('register_enterprise', {
        employee_id: employee.employee_id,
        employee_name: employee.name,
        role: employee.role
      });
    });

    socket.on('disconnect', () => {
      console.log('[Enterprise WS] Disconnected');
      setWsConnected(false);
    });

    // Listen for new SOS alerts
    socket.on('sos_alert', (data) => {
      console.log('[Enterprise WS] New SOS Alert:', data);
      
      // Show toast notification
      toast.error(`🚨 Nueva Emergencia SOS de ${data.alert?.user_name || 'Usuario'}`, {
        duration: 10000,
        action: {
          label: 'Ver',
          onClick: () => setActiveSection('sos')
        }
      });

      // Play notification sound
      playNotificationSound();

      // Add to pending SOS list
      setPendingSOS(prev => {
        const exists = prev.some(s => s.sos_id === data.alert?.alert_id);
        if (!exists && data.alert) {
          return [{
            sos_id: data.alert.alert_id,
            client_name: data.alert.user_name,
            location: data.alert.location,
            status: 'pending',
            created_at: data.alert.created_at,
            priority: 'high'
          }, ...prev];
        }
        return prev;
      });

      // Show real-time notification banner
      setRealtimeNotification({
        type: 'sos',
        message: `Emergencia SOS activa - ${data.alert?.user_name}`,
        timestamp: new Date().toISOString()
      });
    });

    // Listen for SOS resolved
    socket.on('sos_resolved', (data) => {
      console.log('[Enterprise WS] SOS Resolved:', data);
      
      toast.success(`✅ Emergencia ${data.alert_id} resuelta`, {
        duration: 5000
      });

      // Remove from pending list
      setPendingSOS(prev => prev.filter(s => s.sos_id !== data.alert_id));
      setRealtimeNotification(null);
    });

    // Listen for security alerts
    socket.on('security_alert', (data) => {
      console.log('[Enterprise WS] Security Alert:', data);
      
      toast.warning(`⚠️ Alerta de Seguridad: ${data.alert_type}`, {
        duration: 8000
      });

      // Refresh alerts
      fetchDashboardData();
    });

    return () => {
      socket.disconnect();
    };
  }, [employee]);

  // Play notification sound for critical alerts
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/alert.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Audio autoplay might be blocked
        console.log('[Audio] Autoplay blocked');
      });
    } catch (e) {
      console.log('[Audio] Failed to play:', e);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/auth/me`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setEmployee(data);
      } else {
        navigate('/enterprise/login');
      }
    } catch (err) {
      navigate('/enterprise/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [statsRes, sosRes, alertsRes] = await Promise.all([
        fetch(`${API_URL}/api/enterprise/dashboard/stats`, { credentials: 'include' }),
        fetch(`${API_URL}/api/enterprise/sos/pending`, { credentials: 'include' }),
        fetch(`${API_URL}/api/enterprise/alerts?limit=5`, { credentials: 'include' })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (sosRes.ok) {
        const sosData = await sosRes.json();
        setPendingSOS(sosData.events || []);
      }
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setRecentAlerts(alertsData.alerts || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    }
  };

  const fetchChartData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/dashboard/charts?days=7`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setChartData({
          revenue: data.revenue_trend || [],
          alerts: data.phishing_trend || [],
          sos: data.sos_trend || [],
          users: data.users_trend || []
        });
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
    }
  };

  const fetchPendingSOS = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/sos/pending`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPendingSOS(data.events || []);
      }
    } catch (err) {
      console.error('Error fetching SOS:', err);
    }
  };

  const handleSOSRespond = async (sosId, action, emergencyService = null) => {
    try {
      const body = { action };
      if (emergencyService) body.emergency_service = emergencyService;

      const res = await fetch(`${API_URL}/api/enterprise/sos/${sosId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast.success(action === 'assign' ? 'SOS asignado a ti' : 'Emergencia contactada');
        fetchPendingSOS();
      } else {
        toast.error('Error al responder al SOS');
      }
    } catch (err) {
      toast.error('Error de conexión');
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/enterprise/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    navigate('/enterprise/login');
  };

  const hasPermission = (permission) => {
    if (!employee?.permissions) return false;
    return employee.permissions.includes('all') || employee.permissions.includes(permission);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: BarChart3, permission: null },
    { id: 'employees', label: 'Empleados', icon: Users, permission: 'view_employees' },
    { id: 'clients', label: 'Gestión de Usuarios', icon: Users, permission: 'view_clients' },
    { id: 'sos', label: 'Emergencias SOS', icon: AlertTriangle, permission: 'view_sos' },
    { id: 'alerts', label: 'Alertas de Seguridad', icon: Shield, permission: 'view_alerts' },
    { id: 'reviews', label: 'Valoraciones', icon: Star, permission: null },
    { id: 'orders', label: 'Pedidos Dispositivos', icon: Package, permission: 'view_device_orders' },
    { id: 'payments', label: 'Flujo de Caja', icon: DollarSign, permission: 'view_payments' },
    { id: 'audit', label: 'Registro de Auditoría', icon: FileText, permission: 'view_audit_logs' },
    { id: 'security', label: 'Seguridad (2FA)', icon: Lock, permission: null },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Helmet>
        <title>Portal Enterprise - ManoProtect</title>
      </Helmet>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-800 border-b border-slate-700 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-emerald-500" />
            <span className="text-xl font-bold text-white">ManoProtect</span>
            <Badge className="bg-indigo-600 text-white ml-2">Enterprise</Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Real-time WebSocket Status */}
          <div 
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
              wsConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
            }`}
            title={wsConnected ? 'Conectado en tiempo real' : 'Reconectando...'}
          >
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
            {wsConnected ? 'En vivo' : 'Offline'}
          </div>

          {/* SOS Alert Indicator */}
          {pendingSOS.length > 0 && (
            <button
              onClick={() => setActiveSection('sos')}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg animate-pulse"
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span className="text-white font-semibold">{pendingSOS.length} SOS</span>
            </button>
          )}

          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <Bell className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {employee?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-white text-sm font-medium">{employee?.name}</p>
              <p className="text-slate-400 text-xs capitalize">{employee?.role?.replace('_', ' ')}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-slate-800 border-r border-slate-700 transition-transform z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <nav className="p-4 space-y-1">
          {menuItems.map(item => (
            (!item.permission || hasPermission(item.permission)) && (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.id === 'sos' && pendingSOS.length > 0 && (
                  <Badge className="ml-auto bg-red-500">{pendingSOS.length}</Badge>
                )}
              </button>
            )
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 ${sidebarOpen ? 'lg:pl-64' : ''} min-h-screen`}>
        <div className="p-6">
          {/* Dashboard View */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                  <p className="text-slate-400">Resumen de operaciones en tiempo real</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleExport('dashboard-summary', { days: 30 })}
                    variant="outline" 
                    className="border-slate-600 text-slate-300"
                    disabled={exporting === 'dashboard-summary'}
                    data-testid="export-dashboard-btn"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {exporting === 'dashboard-summary' ? 'Exportando...' : 'Exportar CSV'}
                  </Button>
                  <Button onClick={fetchDashboardData} variant="outline" className="border-slate-600 text-slate-300">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualizar
                  </Button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Empleados Activos"
                  value={stats.active_employees || 0}
                  subtitle={`${stats.employees_at_risk || 0} en riesgo`}
                  icon={Users}
                  color="bg-indigo-600"
                />
                <StatCard
                  title="Clientes Totales"
                  value={stats.total_clients || 0}
                  subtitle={`${stats.premium_clients || 0} premium`}
                  icon={Users}
                  color="bg-emerald-600"
                />
                <StatCard
                  title="SOS Pendientes"
                  value={stats.pending_sos || 0}
                  subtitle={`${stats.resolved_sos_today || 0} resueltos hoy`}
                  icon={AlertTriangle}
                  color={stats.pending_sos > 0 ? "bg-red-600" : "bg-slate-600"}
                />
                <StatCard
                  title="Alertas Hoy"
                  value={stats.total_alerts_today || 0}
                  subtitle={`${stats.blocked_threats_today || 0} bloqueadas`}
                  icon={Shield}
                  color="bg-orange-600"
                />
              </div>

              {/* Revenue & Orders */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Ingresos Hoy"
                  value={`€${(stats.revenue_today || 0).toFixed(2)}`}
                  icon={DollarSign}
                  color="bg-green-600"
                />
                <StatCard
                  title="Ingresos Mes"
                  value={`€${(stats.revenue_month || 0).toFixed(2)}`}
                  icon={TrendingUp}
                  color="bg-teal-600"
                />
                <StatCard
                  title="Pedidos Pendientes"
                  value={stats.pending_device_orders || 0}
                  subtitle="Dispositivos SOS"
                  icon={Package}
                  color="bg-amber-600"
                />
                <StatCard
                  title="Tiempo Respuesta"
                  value={stats.avg_response_time ? `${stats.avg_response_time}s` : 'N/A'}
                  subtitle="Promedio SOS"
                  icon={Clock}
                  color="bg-purple-600"
                />
              </div>

              {/* Charts Section */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Trend Chart */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                      Tendencia de Ingresos (7 días)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {chartData.revenue.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData.revenue}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#94a3b8" 
                              fontSize={12}
                              tickFormatter={(value) => value?.slice(5) || ''}
                            />
                            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `€${value}`} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1e293b', 
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#f1f5f9'
                              }}
                              formatter={(value) => [`€${value}`, 'Ingresos']}
                              labelFormatter={(label) => `Fecha: ${label}`}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="amount" 
                              stroke="#10b981" 
                              fillOpacity={1} 
                              fill="url(#colorRevenue)" 
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-500">
                          <div className="text-center">
                            <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>Sin datos de ingresos en este período</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Alerts & SOS Trend Chart */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-orange-500" />
                      Alertas y Eventos SOS (7 días)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {(chartData.alerts.length > 0 || chartData.sos.length > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={mergeChartData(chartData.alerts, chartData.sos)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#94a3b8" 
                              fontSize={12}
                              tickFormatter={(value) => value?.slice(5) || ''}
                            />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1e293b', 
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#f1f5f9'
                              }}
                              labelFormatter={(label) => `Fecha: ${label}`}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="alerts" 
                              name="Alertas"
                              stroke="#f97316" 
                              strokeWidth={2}
                              dot={{ fill: '#f97316', strokeWidth: 2 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="sos" 
                              name="Eventos SOS"
                              stroke="#ef4444" 
                              strokeWidth={2}
                              dot={{ fill: '#ef4444', strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-500">
                          <div className="text-center">
                            <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>Sin alertas ni eventos SOS en este período</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Users Registration Trend */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    Usuarios Registrados (últimos 7 días)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    {chartData.users.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.users}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#94a3b8" 
                            fontSize={12}
                            tickFormatter={(value) => value?.slice(5) || ''}
                          />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: '1px solid #334155',
                              borderRadius: '8px',
                              color: '#f1f5f9'
                            }}
                            formatter={(value) => [value, 'Nuevos usuarios']}
                            labelFormatter={(label) => `Fecha: ${label}`}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="#6366f1" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500">
                        <div className="text-center">
                          <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p>Sin nuevos registros en este período</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* SOS Alerts & Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Pending SOS */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Emergencias SOS Activas
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveSection('sos')}
                        className="border-slate-600 text-slate-300"
                      >
                        Ver todas
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pendingSOS.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                        <p>No hay emergencias pendientes</p>
                      </div>
                    ) : (
                      pendingSOS.slice(0, 3).map(sos => (
                        <SOSAlertCard
                          key={sos.sos_id}
                          sos={sos}
                          onRespond={handleSOSRespond}
                        />
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Recent Alerts */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-orange-500" />
                        Alertas de Seguridad Recientes
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveSection('alerts')}
                        className="border-slate-600 text-slate-300"
                      >
                        Ver todas
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentAlerts.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Shield className="w-12 h-12 mx-auto mb-3" />
                        <p>No hay alertas recientes</p>
                      </div>
                    ) : (
                      recentAlerts.map(alert => (
                        <div
                          key={alert.alert_id}
                          className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg"
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            alert.severity === 'critical' ? 'bg-red-500' :
                            alert.severity === 'high' ? 'bg-orange-500' :
                            alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{alert.title}</p>
                            <p className="text-slate-400 text-xs">{alert.client_name}</p>
                          </div>
                          <Badge variant="outline" className="text-slate-400 border-slate-600 text-xs">
                            {alert.alert_type}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Employees Section */}
          {activeSection === 'employees' && (
            <EmployeesSection employee={employee} hasPermission={hasPermission} />
          )}

          {/* Clients Section */}
          {activeSection === 'clients' && (
            <ClientsSection employee={employee} hasPermission={hasPermission} />
          )}

          {/* SOS Section */}
          {activeSection === 'sos' && (
            <SOSSection employee={employee} hasPermission={hasPermission} onRespond={handleSOSRespond} />
          )}

          {/* Alerts Section */}
          {activeSection === 'alerts' && (
            <AlertsSection employee={employee} hasPermission={hasPermission} />
          )}

          {/* Reviews Section */}
          {activeSection === 'reviews' && (
            <ReviewsSection employee={employee} hasPermission={hasPermission} />
          )}

          {/* Orders Section */}
          {activeSection === 'orders' && (
            <OrdersSection employee={employee} hasPermission={hasPermission} />
          )}

          {/* Payments Section */}
          {activeSection === 'payments' && (
            <PaymentsSection employee={employee} hasPermission={hasPermission} />
          )}

          {/* Audit Section */}
          {activeSection === 'audit' && (
            <AuditSection employee={employee} hasPermission={hasPermission} />
          )}

          {/* Security Section (2FA) */}
          {activeSection === 'security' && (
            <div className="space-y-6" data-testid="security-section">
              <div>
                <h1 className="text-2xl font-bold text-white">Configuración de Seguridad</h1>
                <p className="text-slate-400">Gestiona la autenticación de dos factores y opciones de seguridad</p>
              </div>
              <TwoFactorSettings />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// ============================================
// EMPLOYEES SECTION COMPONENT
// ============================================
const EmployeesSection = ({ employee, hasPermission }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [search, statusFilter]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await fetch(`${API_URL}/api/enterprise/employees?${params}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (employeeId, action) => {
    try {
      const endpoint = action === 'delete' 
        ? `${API_URL}/api/enterprise/employees/${employeeId}`
        : `${API_URL}/api/enterprise/employees/${employeeId}/${action}`;
      
      const res = await fetch(endpoint, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        credentials: 'include'
      });
      
      if (res.ok) {
        toast.success(`Acción '${action}' ejecutada`);
        fetchEmployees();
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Error');
      }
    } catch (err) {
      toast.error('Error de conexión');
    }
  };

  const statusColors = {
    active: 'bg-emerald-500',
    suspended: 'bg-red-500',
    pending: 'bg-yellow-500',
    inactive: 'bg-slate-500'
  };

  const riskColors = {
    low: 'text-emerald-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Empleados</h1>
          <p className="text-slate-400">Administra el equipo de ManoProtect</p>
        </div>
        {hasPermission('manage_employees') && (
          <Button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Empleado
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Buscar por nombre, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="suspended">Suspendidos</option>
          <option value="pending">Pendientes</option>
        </select>
        <Button variant="outline" onClick={fetchEmployees} className="border-slate-700 text-slate-300">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Table */}
      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left p-4 text-slate-400 font-medium">Empleado</th>
                <th className="text-left p-4 text-slate-400 font-medium">Rol</th>
                <th className="text-left p-4 text-slate-400 font-medium">Departamento</th>
                <th className="text-left p-4 text-slate-400 font-medium">Estado</th>
                <th className="text-left p-4 text-slate-400 font-medium">Riesgo</th>
                <th className="text-left p-4 text-slate-400 font-medium">Último acceso</th>
                <th className="text-right p-4 text-slate-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin" />
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No se encontraron empleados
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.employee_id} className="border-t border-slate-700 hover:bg-slate-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">{emp.name?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{emp.name}</p>
                          <p className="text-slate-500 text-sm">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-slate-300 border-slate-600 capitalize">
                        {emp.role?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-300">{emp.department || '-'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium text-white ${statusColors[emp.status]}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${riskColors[emp.risk_level] || 'text-slate-400'}`}>
                        {emp.risk_level?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {emp.last_login ? new Date(emp.last_login).toLocaleDateString('es-ES') : 'Nunca'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedEmployee(emp)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {hasPermission('manage_employees') && (
                          <>
                            {emp.status === 'active' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAction(emp.employee_id, 'suspend')}
                                className="text-orange-400 hover:text-orange-300"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAction(emp.employee_id, 'activate')}
                                className="text-emerald-400 hover:text-emerald-300"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateEmployeeModal onClose={() => setShowCreateModal(false)} onSuccess={fetchEmployees} />
      )}

      {/* Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
      )}
    </div>
  );
};

// ============================================
// CLIENTS SECTION COMPONENT (GESTIÓN DE USUARIOS)
// ============================================
const ClientsSection = ({ employee, hasPermission }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [search, planFilter]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (planFilter) params.append('plan', planFilter);
      
      const res = await fetch(`${API_URL}/api/enterprise/clients?${params}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDetails = async (clientId) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`${API_URL}/api/enterprise/clients/${clientId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setClientDetails(data);
      } else {
        toast.error('Error al cargar detalles del usuario');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    fetchClientDetails(client.user_id || client.email);
  };

  const closeModal = () => {
    setSelectedClient(null);
    setClientDetails(null);
  };

  const planColors = {
    free: 'bg-slate-600',
    'family-monthly': 'bg-emerald-600',
    'family-yearly': 'bg-emerald-600',
    premium: 'bg-indigo-600',
    enterprise: 'bg-purple-600'
  };

  const planLabels = {
    free: 'Gratuito',
    'family-monthly': 'Familiar Mensual',
    'family-yearly': 'Familiar Anual',
    premium: 'Premium',
    enterprise: 'Empresarial'
  };

  const statusLabels = {
    active: 'Activo',
    inactive: 'Inactivo',
    suspended: 'Suspendido',
    cancelled: 'Cancelado',
    trial: 'Prueba'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" data-testid="clients-title">Gestión de Usuarios</h1>
          <p className="text-slate-400">Visualiza y gestiona los usuarios de ManoProtect</p>
        </div>
        <Button 
          onClick={async () => {
            const params = planFilter ? { plan: planFilter } : {};
            const queryStr = new URLSearchParams(params).toString();
            const url = `${API_URL}/api/export/users/csv${queryStr ? '?' + queryStr : ''}`;
            const response = await fetch(url, { credentials: 'include' });
            if (response.ok) {
              const blob = await response.blob();
              const a = document.createElement('a');
              a.href = window.URL.createObjectURL(blob);
              a.download = 'usuarios_manoprotect.csv';
              a.click();
              toast.success('Exportación completada');
            }
          }}
          variant="outline"
          className="border-slate-600 text-slate-300"
          data-testid="export-users-btn"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Buscar por nombre, email, teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
            data-testid="clients-search-input"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          data-testid="clients-plan-filter"
        >
          <option value="">Todos los planes</option>
          <option value="free">Gratuito</option>
          <option value="family-monthly">Familiar Mensual</option>
          <option value="family-yearly">Familiar Anual</option>
          <option value="premium">Premium</option>
        </select>
        <Button variant="outline" onClick={fetchClients} className="border-slate-700 text-slate-300" data-testid="clients-refresh-btn">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabla de Usuarios */}
      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="clients-table">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left p-4 text-slate-400 font-medium">Usuario</th>
                <th className="text-left p-4 text-slate-400 font-medium">Plan</th>
                <th className="text-left p-4 text-slate-400 font-medium">Estado</th>
                <th className="text-left p-4 text-slate-400 font-medium">Dispositivo SOS</th>
                <th className="text-left p-4 text-slate-400 font-medium">Fecha de Registro</th>
                <th className="text-right p-4 text-slate-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin" />
                    <p className="mt-2">Cargando usuarios...</p>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.user_id || client.email} className="border-t border-slate-700 hover:bg-slate-800/50" data-testid={`client-row-${client.user_id}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">{client.name?.charAt(0) || 'U'}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{client.name || 'Sin nombre'}</p>
                          <p className="text-slate-500 text-sm">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${planColors[client.plan] || planColors.free} text-white`}>
                        {planLabels[client.plan] || 'Gratuito'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                        client.subscription_status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                        client.is_trial ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          client.subscription_status === 'active' ? 'bg-emerald-400' :
                          client.is_trial ? 'bg-yellow-400' : 'bg-slate-400'
                        }`}></span>
                        {client.is_trial ? 'Prueba' : statusLabels[client.subscription_status] || 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4">
                      {client.sos_button_requested ? (
                        <Badge className="bg-emerald-600">Solicitado</Badge>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {client.created_at ? new Date(client.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric'
                      }) : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewClient(client)}
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                        data-testid={`view-client-btn-${client.user_id}`}
                        title="Ver detalles del usuario"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Detalles del Usuario */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          details={clientDetails}
          loading={loadingDetails}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

// ============================================
// CLIENT DETAIL MODAL (MODAL DE DETALLES DE USUARIO)
// ============================================
const ClientDetailModal = ({ client, details, loading, onClose }) => {
  const planLabels = {
    free: 'Gratuito',
    'family-monthly': 'Familiar Mensual',
    'family-yearly': 'Familiar Anual',
    premium: 'Premium',
    enterprise: 'Empresarial'
  };

  const planColors = {
    free: 'bg-slate-600',
    'family-monthly': 'bg-emerald-600',
    'family-yearly': 'bg-emerald-600',
    premium: 'bg-indigo-600',
    enterprise: 'bg-purple-600'
  };

  // Payment status translations and colors
  const paymentStatusConfig = {
    completed: { label: 'Completado', color: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400' },
    paid: { label: 'Pagado', color: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400' },
    succeeded: { label: 'Exitoso', color: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400' },
    pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-400' },
    pending_payment: { label: 'Pago Pendiente', color: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-400' },
    processing: { label: 'Procesando', color: 'bg-blue-500/20 text-blue-400', dot: 'bg-blue-400' },
    failed: { label: 'Fallido', color: 'bg-red-500/20 text-red-400', dot: 'bg-red-400' },
    refunded: { label: 'Reembolsado', color: 'bg-orange-500/20 text-orange-400', dot: 'bg-orange-400' },
    cancelled: { label: 'Cancelado', color: 'bg-slate-500/20 text-slate-400', dot: 'bg-slate-400' },
    unknown: { label: 'Desconocido', color: 'bg-slate-500/20 text-slate-400', dot: 'bg-slate-400' }
  };

  const getPaymentStatus = (status) => {
    const normalizedStatus = (status || 'unknown').toLowerCase();
    return paymentStatusConfig[normalizedStatus] || paymentStatusConfig.unknown;
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" data-testid="client-detail-modal">
      <Card className="bg-slate-800 border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700 shrink-0">
          <CardTitle className="text-white">Detalles del Usuario</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white" data-testid="close-modal-btn">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
              <span className="ml-3 text-slate-400">Cargando información...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Información del Usuario */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-2xl font-bold">
                    {(details?.name || client.name)?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white truncate" data-testid="client-name">
                    {details?.name || client?.name || 'Sin nombre'}
                  </h3>
                  <p className="text-slate-400 truncate" data-testid="client-email">{details?.email || client?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${planColors[details?.plan || client.plan] || planColors.free} text-white`}>
                      {planLabels[details?.plan || client.plan] || 'Gratuito'}
                    </Badge>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                      (details?.subscription_status || client.subscription_status) === 'active' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : (details?.is_trial || client.is_trial) 
                          ? 'bg-yellow-500/20 text-yellow-400' 
                          : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {(details?.is_trial || client.is_trial) ? 'Prueba' : 
                       (details?.subscription_status || client.subscription_status) === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estadísticas del Usuario */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-2xl font-bold text-white">{details?.sos_events_count || 0}</p>
                  <p className="text-slate-500 text-sm">Eventos SOS</p>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-2xl font-bold text-white">{details?.alerts_count || 0}</p>
                  <p className="text-slate-500 text-sm">Alertas</p>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-2xl font-bold text-white">{details?.total_payments || 0}</p>
                  <p className="text-slate-500 text-sm">Pagos</p>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div>
                  <p className="text-slate-500 text-sm">Teléfono</p>
                  <p className="text-white">{details?.phone || client.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Fecha de Registro</p>
                  <p className="text-white">{formatDate(details?.created_at || client.created_at)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Dispositivo SOS</p>
                  <p className="text-white">
                    {details?.device_order ? (
                      <span className="text-emerald-400">Solicitado</span>
                    ) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">ID de Usuario</p>
                  <p className="text-white font-mono text-xs">{details?.user_id || client.user_id || '-'}</p>
                </div>
              </div>

              {/* Historial de Pagos */}
              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Historial de Transacciones
                </h4>
                
                {(!details?.payment_history || details.payment_history.length === 0) ? (
                  <div className="text-center py-8 bg-slate-900/30 rounded-lg">
                    <DollarSign className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="text-slate-500">No hay transacciones registradas</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {details.payment_history.map((payment, index) => {
                      const statusConfig = getPaymentStatus(payment.status);
                      return (
                        <div 
                          key={payment.payment_id || index} 
                          className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors"
                          data-testid={`payment-row-${index}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium truncate">
                                {payment.plan || 'Pago'}
                              </p>
                              {/* Estado de la transacción con indicador visual */}
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                                {statusConfig.label}
                              </span>
                            </div>
                            <p className="text-slate-500 text-xs mt-1">
                              {formatDate(payment.created_at)}
                              {payment.payment_id && (
                                <span className="ml-2 font-mono">
                                  #{payment.payment_id.slice(-8)}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p className={`font-semibold ${
                              payment.status === 'completed' || payment.status === 'paid' || payment.status === 'succeeded'
                                ? 'text-emerald-400' 
                                : payment.status === 'pending' || payment.status === 'pending_payment'
                                  ? 'text-yellow-400'
                                  : 'text-slate-400'
                            }`}>
                              {formatCurrency(payment.amount, payment.currency)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================
// SOS SECTION COMPONENT
// ============================================
const SOSSection = ({ employee, hasPermission, onRespond }) => {
  const [sosEvents, setSosEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchSOS();
    const interval = setInterval(fetchSOS, 10000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchSOS = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await fetch(`${API_URL}/api/enterprise/sos?${params}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setSosEvents(data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    critical: 'bg-red-600',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  const statusColors = {
    pending: 'bg-red-500/20 text-red-400',
    in_progress: 'bg-yellow-500/20 text-yellow-400',
    resolved: 'bg-emerald-500/20 text-emerald-400',
    escalated: 'bg-purple-500/20 text-purple-400',
    false_alarm: 'bg-slate-500/20 text-slate-400'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Centro de Emergencias SOS
          </h1>
          <p className="text-slate-400">Gestión en tiempo real de alertas de emergencia</p>
        </div>
        <Button variant="outline" onClick={fetchSOS} className="border-slate-700 text-slate-300">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="in_progress">En proceso</option>
          <option value="resolved">Resueltos</option>
          <option value="escalated">Escalados</option>
        </select>
      </div>

      {/* SOS Grid */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 mx-auto text-slate-500 animate-spin" />
        </div>
      ) : sosEvents.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
          <h3 className="text-xl font-bold text-white mb-2">Sin emergencias activas</h3>
          <p className="text-slate-400">Todas las alertas han sido atendidas</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sosEvents.map((sos) => (
            <Card key={sos.sos_id} className={`bg-slate-800/50 border-slate-700 ${sos.status === 'pending' ? 'border-l-4 border-l-red-500' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={priorityColors[sos.priority]}>
                    {sos.priority?.toUpperCase()}
                  </Badge>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[sos.status]}`}>
                    {sos.status}
                  </span>
                </div>
                
                <h4 className="text-white font-semibold mb-1">{sos.client_name || 'Cliente'}</h4>
                <p className="text-slate-400 text-sm mb-2">{sos.client_phone || 'Sin teléfono'}</p>
                
                {sos.location?.address && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
                    <MapPin className="w-3 h-3" />
                    {sos.location.address}
                  </div>
                )}
                
                <div className="text-slate-500 text-xs mb-3">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {new Date(sos.created_at).toLocaleString('es-ES')}
                </div>
                
                {hasPermission('respond_sos') && sos.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => onRespond(sos.sos_id, 'assign')}
                      className="bg-indigo-600 hover:bg-indigo-700 flex-1"
                    >
                      Asignarme
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRespond(sos.sos_id, 'call_emergency', '112')}
                      className="border-red-500 text-red-400"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// ALERTS SECTION COMPONENT
// ============================================
const AlertsSection = ({ employee, hasPermission }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/alerts`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alertas de Seguridad</h1>
          <p className="text-slate-400">Monitoreo de amenazas detectadas</p>
        </div>
        <Button variant="outline" onClick={fetchAlerts} className="border-slate-700 text-slate-300">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left p-4 text-slate-400 font-medium">Tipo</th>
                <th className="text-left p-4 text-slate-400 font-medium">Severidad</th>
                <th className="text-left p-4 text-slate-400 font-medium">Título</th>
                <th className="text-left p-4 text-slate-400 font-medium">Cliente</th>
                <th className="text-left p-4 text-slate-400 font-medium">Estado</th>
                <th className="text-left p-4 text-slate-400 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin" />
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No hay alertas registradas
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.alert_id} className="border-t border-slate-700 hover:bg-slate-800/50">
                    <td className="p-4">
                      <Badge variant="outline" className="text-slate-300 border-slate-600">
                        {alert.alert_type}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={severityColors[alert.severity]}>
                        {alert.severity}
                      </Badge>
                    </td>
                    <td className="p-4 text-white">{alert.title}</td>
                    <td className="p-4 text-slate-400">{alert.client_name || '-'}</td>
                    <td className="p-4">
                      {alert.blocked ? (
                        <Badge className="bg-emerald-600">Bloqueada</Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-400 border-yellow-600">Pendiente</Badge>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(alert.created_at).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ============================================
// REVIEWS SECTION COMPONENT - User Ratings Management
// ============================================
const ReviewsSection = ({ employee, hasPermission }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [statusFilter, page]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await fetch(`${API_URL}/api/reviews/admin/all?${params}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setTotalPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/stats`);
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/admin/${reviewId}/approve`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Valoración aprobada');
        fetchReviews();
        fetchStats();
      } else {
        toast.error('Error al aprobar');
      }
    } catch (err) {
      toast.error('Error de conexión');
    }
  };

  const handleReject = async (reviewId) => {
    const reason = window.prompt('Motivo del rechazo:');
    if (!reason || reason.length < 5) {
      toast.error('Debes indicar un motivo (mín. 5 caracteres)');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/reviews/admin/${reviewId}/reject?reason=${encodeURIComponent(reason)}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Valoración rechazada');
        fetchReviews();
        fetchStats();
      } else {
        toast.error('Error al rechazar');
      }
    } catch (err) {
      toast.error('Error de conexión');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('¿Eliminar esta valoración permanentemente?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/reviews/admin/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Valoración eliminada');
        fetchReviews();
        fetchStats();
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Error al eliminar');
      }
    } catch (err) {
      toast.error('Error de conexión');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: { className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Aprobada' },
      pending: { className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Pendiente' },
      rejected: { className: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Rechazada' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="space-y-6" data-testid="reviews-section">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Valoraciones de Usuarios</h1>
          <p className="text-slate-400">Gestiona las valoraciones de los clientes</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={async () => {
              const url = `${API_URL}/api/export/reviews/csv${statusFilter ? '?status=' + statusFilter : ''}`;
              const response = await fetch(url, { credentials: 'include' });
              if (response.ok) {
                const blob = await response.blob();
                const a = document.createElement('a');
                a.href = window.URL.createObjectURL(blob);
                a.download = 'valoraciones_manoprotect.csv';
                a.click();
                toast.success('Exportación completada');
              }
            }}
            variant="outline" 
            className="border-slate-600 text-slate-300"
            data-testid="export-reviews-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button 
            onClick={() => { fetchReviews(); fetchStats(); }} 
            variant="outline" 
            className="border-slate-600 text-slate-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(stats.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
                ))}
              </div>
              <p className="text-2xl font-bold text-white">{stats.average_rating?.toFixed(1) || '0'}</p>
              <p className="text-xs text-slate-400">Media</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats.total_reviews || 0}</p>
              <p className="text-xs text-slate-400">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{stats.distribution?.five_stars || 0}</p>
              <p className="text-xs text-slate-400">5 estrellas</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{stats.distribution?.four_stars || 0}</p>
              <p className="text-xs text-slate-400">4 estrellas</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-400">
                {(stats.distribution?.three_stars || 0) + (stats.distribution?.two_stars || 0) + (stats.distribution?.one_star || 0)}
              </p>
              <p className="text-xs text-slate-400">1-3 estrellas</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2"
              data-testid="status-filter"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Valoraciones</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-400">Cargando...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay valoraciones {statusFilter && `con estado "${statusFilter}"`}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => {
                const status = getStatusBadge(review.status);
                return (
                  <div 
                    key={review.review_id}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                    data-testid={`review-item-${review.review_id}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* User info */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                            {review.user_initial || 'U'}
                          </div>
                          <div>
                            <p className="text-white font-medium">{review.display_name || review.user_name}</p>
                            <p className="text-xs text-slate-400">
                              {review.user_email} • {review.user_plan_display || review.user_plan}
                            </p>
                          </div>
                          <Badge className={`ml-auto ${status.className}`}>
                            {status.label}
                          </Badge>
                        </div>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          {[1,2,3,4,5].map(i => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} 
                            />
                          ))}
                          <span className="ml-2 text-sm text-slate-400">
                            {new Date(review.created_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        
                        {/* Title & Comment */}
                        {review.title && (
                          <h4 className="text-white font-medium mb-1">{review.title}</h4>
                        )}
                        <p className="text-slate-300 text-sm">"{review.comment}"</p>
                        
                        {/* Rejection reason */}
                        {review.status === 'rejected' && review.rejection_reason && (
                          <div className="mt-2 text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">
                            Motivo: {review.rejection_reason}
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {review.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(review.review_id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              data-testid={`approve-${review.review_id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(review.review_id)}
                              className="border-red-500 text-red-400 hover:bg-red-500/20"
                              data-testid={`reject-${review.review_id}`}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rechazar
                            </Button>
                          </>
                        )}
                        {['super_admin', 'admin'].includes(employee?.role) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(review.review_id)}
                            className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                            data-testid={`delete-${review.review_id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-slate-600 text-slate-300"
              >
                Anterior
              </Button>
              <span className="text-slate-400 text-sm">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-slate-600 text-slate-300"
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================
// ORDERS SECTION COMPONENT  
// ============================================
const OrdersSection = ({ employee, hasPermission }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/device-orders`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/device-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Pedido actualizado a: ${statusLabels[status] || status}`);
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Error al actualizar');
      }
    } catch (err) {
      toast.error('Error de conexión');
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de cancelar este pedido?')) return;
    try {
      const res = await fetch(`${API_URL}/api/enterprise/device-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (res.ok) {
        toast.success('Pedido cancelado');
        fetchOrders();
      }
    } catch (err) {
      toast.error('Error al cancelar');
    }
  };

  const markAsPaid = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/device-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ payment_status: 'paid', status: 'confirmed' })
      });
      if (res.ok) {
        toast.success('Pago confirmado');
        fetchOrders();
      }
    } catch (err) {
      toast.error('Error al confirmar pago');
    }
  };

  const statusColors = {
    pending_payment: 'bg-yellow-600 text-white',
    pending: 'bg-yellow-600 text-white',
    confirmed: 'bg-blue-600 text-white',
    processing: 'bg-indigo-600 text-white',
    shipped: 'bg-purple-600 text-white',
    delivered: 'bg-emerald-600 text-white',
    cancelled: 'bg-red-600 text-white'
  };

  const statusLabels = {
    pending_payment: 'Pendiente Pago',
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    processing: 'En Preparación',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };

  const paymentColors = {
    paid: 'bg-emerald-600 text-white',
    pending: 'bg-orange-600 text-white',
    failed: 'bg-red-600 text-white',
    refunded: 'bg-gray-600 text-white'
  };

  return (
    <div className="space-y-6" data-testid="orders-section">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pedidos de Dispositivos SOS</h1>
          <p className="text-slate-400">Gestión de envíos de botones SOS físicos</p>
        </div>
        <Button variant="outline" onClick={fetchOrders} className="border-slate-600 text-white hover:bg-slate-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-slate-400 text-sm">Total Pedidos</p>
            <p className="text-2xl font-bold text-white">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-900/30 border-yellow-700">
          <CardContent className="p-4">
            <p className="text-yellow-400 text-sm">Pendientes Pago</p>
            <p className="text-2xl font-bold text-yellow-300">
              {orders.filter(o => o.payment_status === 'pending').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/30 border-blue-700">
          <CardContent className="p-4">
            <p className="text-blue-400 text-sm">En Proceso</p>
            <p className="text-2xl font-bold text-blue-300">
              {orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-900/30 border-emerald-700">
          <CardContent className="p-4">
            <p className="text-emerald-400 text-sm">Entregados</p>
            <p className="text-2xl font-bold text-emerald-300">
              {orders.filter(o => o.status === 'delivered').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="text-left p-4 text-white font-semibold">ID Pedido</th>
                <th className="text-left p-4 text-white font-semibold">Cliente</th>
                <th className="text-left p-4 text-white font-semibold">Cantidad</th>
                <th className="text-left p-4 text-white font-semibold">Dirección</th>
                <th className="text-left p-4 text-white font-semibold">Estado</th>
                <th className="text-left p-4 text-white font-semibold">Pago</th>
                <th className="text-right p-4 text-white font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No hay pedidos registrados
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.order_id} className="border-t border-slate-700 hover:bg-slate-700/50">
                    <td className="p-4">
                      <span className="text-white font-mono text-sm bg-slate-700 px-2 py-1 rounded">
                        {order.order_id}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-white font-medium">{order.user_name || order.shipping?.full_name || 'N/A'}</p>
                      <p className="text-slate-400 text-sm">{order.user_email || 'Sin email'}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-bold text-lg">{order.quantity}x</span>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{order.shipping?.city || 'N/A'}</p>
                      <p className="text-slate-400 text-sm">{order.shipping?.postal_code || ''}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-600 text-white'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentColors[order.payment_status] || 'bg-gray-600 text-white'}`}>
                        {order.payment_status === 'paid' ? 'Pagado' : order.payment_status === 'pending' ? 'Pendiente' : order.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Details */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }}
                          className="border-slate-600 text-white hover:bg-slate-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {/* Mark as Paid - Only for pending payments */}
                        {order.payment_status === 'pending' && order.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            onClick={() => markAsPaid(order.order_id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Pago OK
                          </Button>
                        )}
                        
                        {/* Status Change - Only for paid orders */}
                        {order.payment_status === 'paid' && !['delivered', 'cancelled'].includes(order.status) && (
                          <select
                            onChange={(e) => e.target.value && updateOrderStatus(order.order_id, e.target.value)}
                            className="text-sm bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white cursor-pointer"
                            defaultValue=""
                          >
                            <option value="" disabled>Cambiar...</option>
                            {order.status !== 'confirmed' && <option value="confirmed">Confirmado</option>}
                            {order.status !== 'processing' && <option value="processing">En Preparación</option>}
                            {order.status !== 'shipped' && <option value="shipped">Enviado</option>}
                            <option value="delivered">Entregado</option>
                          </select>
                        )}
                        
                        {/* Cancel Order */}
                        {!['delivered', 'cancelled'].includes(order.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelOrder(order.order_id)}
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-white">Detalles del Pedido</CardTitle>
                <CardDescription className="text-slate-400 font-mono">
                  {selectedOrder.order_id}
                </CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Status */}
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[selectedOrder.status]}`}>
                  {statusLabels[selectedOrder.status]}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${paymentColors[selectedOrder.payment_status]}`}>
                  {selectedOrder.payment_status === 'paid' ? 'Pagado' : 'Pago Pendiente'}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  Información del Cliente
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Nombre</p>
                    <p className="text-white">{selectedOrder.user_name || selectedOrder.shipping?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Email</p>
                    <p className="text-white">{selectedOrder.user_email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Teléfono</p>
                    <p className="text-white">{selectedOrder.shipping?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Cantidad</p>
                    <p className="text-white font-bold">{selectedOrder.quantity} dispositivo(s)</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Dirección de Envío
                </h4>
                <div className="text-sm">
                  <p className="text-white">{selectedOrder.shipping?.address || 'N/A'}</p>
                  <p className="text-white">{selectedOrder.shipping?.city}, {selectedOrder.shipping?.postal_code}</p>
                  <p className="text-slate-400">{selectedOrder.shipping?.country || 'España'}</p>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  Información del Pedido
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Total</p>
                    <p className="text-emerald-400 font-bold text-lg">€{selectedOrder.total_price?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Fecha Pedido</p>
                    <p className="text-white">
                      {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('es-ES') : 'N/A'}
                    </p>
                  </div>
                  {selectedOrder.stripe_session_id && (
                    <div className="col-span-2">
                      <p className="text-slate-400">ID Stripe</p>
                      <p className="text-white font-mono text-xs break-all">{selectedOrder.stripe_session_id}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-700">
                {selectedOrder.payment_status === 'pending' && selectedOrder.status !== 'cancelled' && (
                  <Button onClick={() => { markAsPaid(selectedOrder.order_id); setShowDetailsModal(false); }} className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Pago
                  </Button>
                )}
                {!['delivered', 'cancelled'].includes(selectedOrder.status) && (
                  <Button variant="outline" onClick={() => { cancelOrder(selectedOrder.order_id); setShowDetailsModal(false); }} className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar Pedido
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowDetailsModal(false)} className="border-slate-600 text-white ml-auto">
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// ============================================
// PAYMENTS SECTION COMPONENT
// ============================================
const PaymentsSection = ({ employee, hasPermission }) => {
  const [summary, setSummary] = useState({});
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stripe Payment Lookup & Refund State
  const [searchId, setSearchId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [paymentLogs, setPaymentLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'lookup', 'logs'

  const canProcessRefunds = ['super_admin', 'admin', 'finance'].includes(employee?.role);
  const canViewPayments = ['super_admin', 'admin', 'finance', 'supervisor'].includes(employee?.role);

  useEffect(() => {
    fetchData();
    if (canViewPayments) {
      fetchPaymentLogs();
    }
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, paymentsRes] = await Promise.all([
        fetch(`${API_URL}/api/enterprise/payments/summary`, { credentials: 'include' }),
        fetch(`${API_URL}/api/enterprise/payments`, { credentials: 'include' })
      ]);
      
      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/admin/payment-logs?limit=50`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPaymentLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaymentSearch = async () => {
    if (!searchId.trim()) {
      toast.error('Introduce un ID de pago válido');
      return;
    }
    
    setSearchLoading(true);
    setPaymentDetails(null);
    
    try {
      const res = await fetch(`${API_URL}/api/enterprise/admin/payments/${searchId.trim()}`, { credentials: 'include' });
      const data = await res.json();
      
      if (res.ok) {
        setPaymentDetails(data);
        toast.success('Pago encontrado');
      } else {
        toast.error(data.detail || 'Pago no encontrado');
      }
    } catch (err) {
      toast.error('Error al buscar pago');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!refundReason.trim() || refundReason.length < 5) {
      toast.error('El motivo debe tener al menos 5 caracteres');
      return;
    }
    
    setRefundLoading(true);
    
    try {
      const body = { reason: refundReason };
      if (refundAmount && parseFloat(refundAmount) > 0) {
        body.amount = parseFloat(refundAmount);
      }
      
      const res = await fetch(`${API_URL}/api/enterprise/admin/payments/${paymentDetails.payment_id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Reembolso procesado correctamente');
        setShowRefundModal(false);
        setRefundReason('');
        setRefundAmount('');
        // Refresh payment details
        handlePaymentSearch();
        fetchPaymentLogs();
      } else {
        toast.error(data.detail || 'Error al procesar reembolso');
      }
    } catch (err) {
      toast.error('Error al procesar reembolso');
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="payments-section">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Pagos</h1>
          <p className="text-slate-400">Administra pagos, reembolsos y flujo de caja</p>
        </div>
        <Button variant="outline" onClick={fetchData} className="border-slate-700 text-slate-300">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
          data-testid="tab-overview"
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Resumen
        </button>
        {canViewPayments && (
          <button
            onClick={() => setActiveTab('lookup')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'lookup' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            data-testid="tab-lookup"
          >
            <Search className="w-4 h-4 inline mr-2" />
            Buscar Pago
          </button>
        )}
        {canViewPayments && (
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'logs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            data-testid="tab-logs"
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Registro de Operaciones
          </button>
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Ingresos Hoy"
              value={`€${(summary.today?.amount || 0).toFixed(2)}`}
              subtitle={`${summary.today?.count || 0} transacciones`}
              icon={DollarSign}
              color="bg-emerald-600"
            />
            <StatCard
              title="Ingresos Semana"
              value={`€${(summary.week?.amount || 0).toFixed(2)}`}
              subtitle={`${summary.week?.count || 0} transacciones`}
              icon={TrendingUp}
              color="bg-blue-600"
            />
            <StatCard
              title="Ingresos Mes"
              value={`€${(summary.month?.amount || 0).toFixed(2)}`}
              subtitle={`${summary.month?.count || 0} transacciones`}
              icon={BarChart3}
              color="bg-indigo-600"
            />
          </div>

          {/* Payments Table */}
          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-white">Últimas Transacciones</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 text-slate-400 font-medium">ID</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Cliente</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Plan</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Importe</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Estado</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 mx-auto animate-spin" />
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No hay transacciones
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment, idx) => (
                      <tr key={payment.payment_id || idx} className="border-t border-slate-700 hover:bg-slate-800/50">
                        <td className="p-4 text-white font-mono text-xs">{payment.payment_id?.slice(0, 12) || '-'}</td>
                        <td className="p-4 text-slate-300">{payment.client_email || payment.email || '-'}</td>
                        <td className="p-4 text-slate-400">{payment.plan || '-'}</td>
                        <td className="p-4 text-emerald-400 font-semibold">€{(payment.amount || 0).toFixed(2)}</td>
                        <td className="p-4">
                          <Badge className={payment.status === 'completed' ? 'bg-emerald-600' : 'bg-yellow-600'}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-500 text-sm">
                          {payment.created_at ? new Date(payment.created_at).toLocaleDateString('es-ES') : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Payment Lookup Tab */}
      {activeTab === 'lookup' && canViewPayments && (
        <div className="space-y-6">
          {/* Search Box */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                Buscar Pago en Stripe
              </CardTitle>
              <CardDescription className="text-slate-400">
                Introduce el ID del PaymentIntent o Charge de Stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="pi_xxxx... o ch_xxxx..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white flex-1"
                  data-testid="payment-search-input"
                />
                <Button 
                  onClick={handlePaymentSearch}
                  disabled={searchLoading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                  data-testid="payment-search-btn"
                >
                  {searchLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          {paymentDetails && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-white">Detalles del Pago</CardTitle>
                  <CardDescription className="text-slate-400 font-mono text-xs mt-1">
                    {paymentDetails.payment_id}
                  </CardDescription>
                </div>
                <Badge className={paymentDetails.status === 'succeeded' ? 'bg-emerald-600' : 'bg-yellow-600'}>
                  {paymentDetails.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-xs uppercase">Importe</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      €{paymentDetails.amount_received?.toFixed(2) || paymentDetails.amount?.toFixed(2)}
                    </p>
                    <p className="text-slate-500 text-xs">{paymentDetails.currency}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-xs uppercase">Reembolsado</p>
                    <p className="text-2xl font-bold text-red-400">
                      €{paymentDetails.total_refunded?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-slate-500 text-xs">{paymentDetails.refunds?.length || 0} reembolsos</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-xs uppercase">Reembolsable</p>
                    <p className="text-2xl font-bold text-blue-400">
                      €{paymentDetails.refundable_amount?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-slate-500 text-xs">{paymentDetails.is_refundable ? 'Disponible' : 'No disponible'}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-xs uppercase">Método</p>
                    <p className="text-xl font-bold text-white capitalize">
                      {paymentDetails.payment_method || 'card'}
                    </p>
                    <p className="text-slate-500 text-xs">{paymentDetails.payment_type}</p>
                  </div>
                </div>

                {/* Customer Info */}
                {paymentDetails.customer && (
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      Información del Cliente
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Email</p>
                        <p className="text-white">{paymentDetails.customer.email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Nombre</p>
                        <p className="text-white">{paymentDetails.customer.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Teléfono</p>
                        <p className="text-white">{paymentDetails.customer.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">ID Cliente</p>
                        <p className="text-white font-mono text-xs">{paymentDetails.customer.id || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {paymentDetails.metadata && Object.keys(paymentDetails.metadata).length > 0 && (
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      Metadatos
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {Object.entries(paymentDetails.metadata).map(([key, value]) => (
                        <div key={key} className="bg-slate-800 rounded p-2">
                          <p className="text-slate-400 text-xs">{key}</p>
                          <p className="text-white break-all">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Previous Refunds */}
                {paymentDetails.refunds && paymentDetails.refunds.length > 0 && (
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-red-400" />
                      Historial de Reembolsos
                    </h4>
                    <div className="space-y-2">
                      {paymentDetails.refunds.map((refund, idx) => (
                        <div key={refund.refund_id || idx} className="flex items-center justify-between bg-slate-800 rounded p-3">
                          <div>
                            <p className="text-white font-mono text-xs">{refund.refund_id}</p>
                            <p className="text-slate-400 text-xs">
                              {refund.created ? new Date(refund.created).toLocaleString('es-ES') : '-'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-red-400 font-semibold">-€{refund.amount?.toFixed(2)}</p>
                            <Badge variant="outline" className="text-xs">
                              {refund.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Refund Button */}
                {canProcessRefunds && paymentDetails.is_refundable && (
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setShowRefundModal(true)}
                      className="bg-red-600 hover:bg-red-700"
                      data-testid="process-refund-btn"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Procesar Reembolso
                    </Button>
                  </div>
                )}

                {!paymentDetails.is_refundable && (
                  <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 flex items-center gap-3">
                    <AlertOctagon className="w-5 h-5 text-yellow-500" />
                    <p className="text-yellow-200 text-sm">
                      Este pago no es reembolsable. {paymentDetails.total_refunded > 0 ? 'Ya ha sido reembolsado completamente.' : 'El estado del pago no permite reembolsos.'}
                    </p>
                  </div>
                )}

                {/* Created Date */}
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Clock className="w-4 h-4" />
                  Creado: {paymentDetails.created ? new Date(paymentDetails.created).toLocaleString('es-ES') : '-'}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Payment Logs Tab */}
      {activeTab === 'logs' && canViewPayments && (
        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Registro de Operaciones de Pagos
            </CardTitle>
            <CardDescription className="text-slate-400">
              Historial de consultas y reembolsos procesados
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left p-4 text-slate-400 font-medium">Fecha</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Acción</th>
                  <th className="text-left p-4 text-slate-400 font-medium">ID Pago</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Importe</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Empleado</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {paymentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No hay registros de operaciones
                    </td>
                  </tr>
                ) : (
                  paymentLogs.map((log, idx) => (
                    <tr key={log.log_id || idx} className="border-t border-slate-700 hover:bg-slate-800/50">
                      <td className="p-4 text-slate-300 text-sm">
                        {log.created_at ? new Date(log.created_at).toLocaleString('es-ES') : '-'}
                      </td>
                      <td className="p-4">
                        <Badge className={log.action === 'refund' ? 'bg-red-600' : 'bg-blue-600'}>
                          {log.action === 'refund' ? 'Reembolso' : 'Consulta'}
                        </Badge>
                      </td>
                      <td className="p-4 text-white font-mono text-xs">{log.payment_id?.slice(0, 15) || '-'}</td>
                      <td className="p-4">
                        {log.action === 'refund' ? (
                          <span className="text-red-400 font-semibold">-€{log.refund_amount?.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-300">{log.employee_name || '-'}</td>
                      <td className="p-4 text-slate-400 text-sm max-w-xs truncate">{log.reason || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Refund Confirmation Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" data-testid="refund-modal">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-500" />
                Confirmar Reembolso
              </CardTitle>
              <CardDescription className="text-slate-400">
                Esta acción no se puede deshacer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Pago original</p>
                <p className="text-white font-mono text-sm">{paymentDetails?.payment_id}</p>
                <p className="text-emerald-400 text-lg font-bold mt-1">
                  €{paymentDetails?.amount_received?.toFixed(2)}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Máximo reembolsable: €{paymentDetails?.refundable_amount?.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-slate-300 text-sm block mb-2">
                  Importe a reembolsar (opcional, dejar vacío para reembolso total)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={paymentDetails?.refundable_amount}
                  placeholder={`Máx: €${paymentDetails?.refundable_amount?.toFixed(2)}`}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white"
                  data-testid="refund-amount-input"
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm block mb-2">
                  Motivo del reembolso <span className="text-red-400">*</span>
                </label>
                <textarea
                  placeholder="Describe el motivo del reembolso (mínimo 5 caracteres)"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-white placeholder-slate-500 min-h-[100px]"
                  data-testid="refund-reason-input"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRefundModal(false);
                    setRefundReason('');
                    setRefundAmount('');
                  }}
                  className="flex-1 border-slate-600 text-slate-300"
                  disabled={refundLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleRefund}
                  disabled={refundLoading || refundReason.length < 5}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  data-testid="confirm-refund-btn"
                >
                  {refundLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-2" />
                  )}
                  Confirmar Reembolso
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// ============================================
// AUDIT SECTION COMPONENT
// ============================================
const AuditSection = ({ employee, hasPermission }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/audit-logs`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const actionColors = {
    login: 'text-emerald-400',
    logout: 'text-slate-400',
    create: 'text-blue-400',
    update: 'text-yellow-400',
    delete: 'text-red-400',
    suspend: 'text-orange-400',
    activate: 'text-emerald-400'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Logs de Auditoría</h1>
          <p className="text-slate-400">Registro de todas las acciones del sistema</p>
        </div>
        <Button variant="outline" onClick={fetchLogs} className="border-slate-700 text-slate-300">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left p-4 text-slate-400 font-medium">Fecha/Hora</th>
                <th className="text-left p-4 text-slate-400 font-medium">Empleado</th>
                <th className="text-left p-4 text-slate-400 font-medium">Acción</th>
                <th className="text-left p-4 text-slate-400 font-medium">Recurso</th>
                <th className="text-left p-4 text-slate-400 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No hay logs registrados
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.log_id || idx} className="border-t border-slate-700">
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(log.created_at).toLocaleString('es-ES')}
                    </td>
                    <td className="p-4">
                      <p className="text-white">{log.employee_name}</p>
                      <p className="text-slate-500 text-xs">{log.employee_role}</p>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${actionColors[log.action] || 'text-slate-400'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {log.resource_type}: {log.resource_id?.slice(0, 12)}
                    </td>
                    <td className="p-4 text-slate-500 text-xs font-mono">{log.ip_address || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ============================================
// MODALS
// ============================================
const CreateEmployeeModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: 'operator',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/enterprise/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          status: 'active',
          permissions: []
        })
      });
      
      if (res.ok) {
        toast.success('Empleado creado correctamente');
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Error al crear empleado');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-white">Nuevo Empleado</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Nombre completo"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              className="bg-slate-900 border-slate-700 text-white"
            />
            <Input
              type="email"
              placeholder="Email corporativo"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              className="bg-slate-900 border-slate-700 text-white"
            />
            <Input
              placeholder="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="bg-slate-900 border-slate-700 text-white"
            />
            <Input
              placeholder="Departamento"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              className="bg-slate-900 border-slate-700 text-white"
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            >
              <option value="operator">Operador</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrador</option>
              <option value="auditor">Auditor</option>
            </select>
            <Input
              type="password"
              placeholder="Contraseña temporal"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              className="bg-slate-900 border-slate-700 text-white"
            />
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-slate-600 text-slate-300">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                {loading ? 'Creando...' : 'Crear Empleado'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const EmployeeDetailModal = ({ employee, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-800 border-slate-700 w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Detalle de Empleado</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{employee.name?.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{employee.name}</h3>
              <p className="text-slate-400">{employee.email}</p>
              <Badge variant="outline" className="mt-1 text-slate-300 border-slate-600 capitalize">
                {employee.role?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
            <div>
              <p className="text-slate-500 text-sm">Departamento</p>
              <p className="text-white">{employee.department || 'Sin asignar'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Teléfono</p>
              <p className="text-white">{employee.phone || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Estado</p>
              <p className={`font-medium ${employee.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                {employee.status}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Nivel de Riesgo</p>
              <p className="text-white">{employee.risk_level || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">2FA Activo</p>
              <p className={employee.two_factor_enabled ? 'text-emerald-400' : 'text-yellow-400'}>
                {employee.two_factor_enabled ? 'Sí' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Último Acceso</p>
              <p className="text-white">
                {employee.last_login ? new Date(employee.last_login).toLocaleString('es-ES') : 'Nunca'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnterprisePortal;
