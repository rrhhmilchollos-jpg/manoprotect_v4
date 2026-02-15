/**
 * ManoProtect Enterprise Portal - Complete Employee Management System
 * Main Dashboard with KPIs, Charts, and Real-time SOS monitoring
 * REFACTORED: Components extracted to /pages/enterprise/components/
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Shield, Users, Package, AlertTriangle, LogOut,
  Bell, Menu, X, TrendingUp, TrendingDown,
  Clock, CheckCircle, Activity,
  DollarSign, BarChart3,
  RefreshCw, Download, Lock, Star, MessageSquare, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { io } from 'socket.io-client';
import TwoFactorSettings from '@/components/TwoFactorSettings';

// Import refactored components
import {
  StatCard,
  SOSAlertCard,
  EmployeesSection,
  AlertsSection,
  AuditSection,
  SOSSection,
  ClientsSection,
  ReviewsSection,
  OrdersSection,
  PaymentsSection,
  mergeChartData
} from './enterprise/components';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

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

  // Detect admin subdomain for branding
  const isAdminSubdomain = window.location.hostname.startsWith('admin.');
  
  // Theme colors based on subdomain
  const theme = {
    primary: isAdminSubdomain ? 'bg-emerald-600' : 'bg-indigo-600',
    primaryHover: isAdminSubdomain ? 'hover:bg-emerald-700' : 'hover:bg-indigo-700',
    primaryText: isAdminSubdomain ? 'text-emerald-400' : 'text-indigo-400',
    badge: isAdminSubdomain ? 'Portal Empleados' : 'Enterprise'
  };

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
        <title>{isAdminSubdomain ? 'Portal Empleados - ManoProtect Admin' : 'Portal Enterprise - ManoProtect'}</title>
      </Helmet>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 h-16 border-b z-50 flex items-center justify-between px-4 ${
        isAdminSubdomain ? 'bg-slate-800 border-emerald-800/50' : 'bg-slate-800 border-slate-700'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
          <div className="flex items-center gap-2">
            <Shield className={`w-8 h-8 ${isAdminSubdomain ? 'text-emerald-500' : 'text-emerald-500'}`} />
            <span className="text-xl font-bold text-white">ManoProtect</span>
            <Badge className={`text-white ml-2 ${theme.primary}`}>{theme.badge}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Real-time WebSocket Status - Only show when connected */}
          {wsConnected && (
            <div 
              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400"
              title="Conectado en tiempo real"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              En vivo
            </div>
          )}

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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.primary}`}>
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
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-slate-800 border-r transition-transform z-40 ${
        isAdminSubdomain ? 'border-emerald-800/30' : 'border-slate-700'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <nav className="p-4 space-y-1">
          {menuItems.map(item => (
            (!item.permission || hasPermission(item.permission)) && (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? `${theme.primary} text-white`
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

export default EnterprisePortal;
