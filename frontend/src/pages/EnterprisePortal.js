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
  Zap, Target, AlertCircle, PhoneCall
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

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

  // Check auth
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch data on auth success
  useEffect(() => {
    if (employee) {
      fetchDashboardData();
      const interval = setInterval(fetchPendingSOS, 10000); // Refresh SOS every 10s
      return () => clearInterval(interval);
    }
  }, [employee]);

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
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, permission: null },
    { id: 'employees', label: 'Empleados', icon: Users, permission: 'view_employees' },
    { id: 'clients', label: 'Clientes', icon: Users, permission: 'view_clients' },
    { id: 'sos', label: 'Emergencias SOS', icon: AlertTriangle, permission: 'view_sos' },
    { id: 'alerts', label: 'Alertas Seguridad', icon: Shield, permission: 'view_alerts' },
    { id: 'orders', label: 'Pedidos Dispositivos', icon: Package, permission: 'view_device_orders' },
    { id: 'payments', label: 'Flujo de Caja', icon: DollarSign, permission: 'view_payments' },
    { id: 'audit', label: 'Logs Auditoría', icon: FileText, permission: 'view_audit_logs' },
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
                <Button onClick={fetchDashboardData} variant="outline" className="border-slate-600 text-slate-300">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
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

          {/* Other sections - placeholder for now */}
          {activeSection !== 'dashboard' && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-slate-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {menuItems.find(m => m.id === activeSection)?.label || 'Sección'}
              </h2>
              <p className="text-slate-400">
                Esta sección está en desarrollo. Próximamente disponible.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EnterprisePortal;
