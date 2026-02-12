/**
 * ManoProtect - Employee Dashboard
 * Panel de control completo para empleados y administradores
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';
import { 
  Shield, Users, AlertTriangle, BarChart3, Settings, Bell,
  Search, Download, RefreshCw, Eye, CheckCircle, XCircle,
  TrendingUp, Clock, Activity, Database, Server, Globe,
  Lock, UserCheck, FileText, CreditCard, Mail, MessageSquare,
  Smartphone, Monitor, Wifi, WifiOff, MoreVertical, Filter,
  ChevronRight, ArrowUpRight, ArrowDownRight, Plus, Trash2,
  Edit, Award, Fingerprint, Phone, Link, PieChart, Map
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

// Stat Card Component
const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
  <Card className="bg-white border-zinc-200 hover:shadow-md transition-shadow">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-zinc-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>{change}%</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// User Management Table
const UserManagement = ({ users, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gestión de Usuarios
            </CardTitle>
            <CardDescription>{users.length} usuarios registrados</CardDescription>
          </div>
          <Button variant="outline" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-3 py-2 rounded-md border border-zinc-300 text-sm"
          >
            <option value="all">Todos los planes</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
            <option value="family">Familiar</option>
            <option value="business">Business</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50">
              <tr className="text-xs text-zinc-500 uppercase">
                <th className="text-left p-3">Usuario</th>
                <th className="text-left p-3">Plan</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3">Registro</th>
                <th className="text-left p-3">Última actividad</th>
                <th className="text-left p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice(0, 20).map((user, idx) => (
                <tr key={user.user_id || idx} className="border-t border-zinc-100 hover:bg-zinc-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600">
                          {user.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.name || 'Sin nombre'}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge className={
                      user.plan === 'premium' ? 'bg-amber-100 text-amber-700' :
                      user.plan === 'family' ? 'bg-emerald-100 text-emerald-700' :
                      user.plan === 'business' ? 'bg-purple-100 text-purple-700' :
                      'bg-zinc-100 text-zinc-600'
                    }>
                      {user.plan || 'free'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-zinc-600">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : '-'}
                  </td>
                  <td className="p-3 text-sm text-zinc-600">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString('es-ES') : '-'}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// Threat Monitor
const ThreatMonitor = ({ threats }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        Monitor de Amenazas
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {threats.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay amenazas activas</p>
          </div>
        ) : (
          threats.map((threat, idx) => (
            <div 
              key={idx}
              className={`p-3 rounded-lg border-l-4 ${
                threat.risk_level === 'critical' ? 'bg-red-50 border-red-500' :
                threat.risk_level === 'high' ? 'bg-orange-50 border-orange-500' :
                threat.risk_level === 'medium' ? 'bg-amber-50 border-amber-500' :
                'bg-zinc-50 border-zinc-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      threat.risk_level === 'critical' ? 'bg-red-500' :
                      threat.risk_level === 'high' ? 'bg-orange-500' :
                      threat.risk_level === 'medium' ? 'bg-amber-500' :
                      'bg-zinc-400'
                    }>
                      {threat.risk_level?.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-zinc-500">{threat.content_type}</span>
                  </div>
                  <p className="text-sm font-medium mt-1">{threat.content?.slice(0, 50)}...</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {new Date(threat.created_at).toLocaleString('es-ES')}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </CardContent>
  </Card>
);

// Trust Seal Manager
const TrustSealManager = ({ seals, onRefresh }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Sellos de Confianza
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {seals.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay sellos registrados</p>
            <Button className="mt-3 bg-amber-500 hover:bg-amber-600">
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Sello
            </Button>
          </div>
        ) : (
          seals.map((seal, idx) => (
            <div key={idx} className="p-3 bg-zinc-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  seal.verified ? 'bg-emerald-100' : 'bg-amber-100'
                }`}>
                  <Award className={`w-5 h-5 ${seal.verified ? 'text-emerald-600' : 'text-amber-600'}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">{seal.business_name}</p>
                  <p className="text-xs text-zinc-500">{seal.website}</p>
                  <p className="text-xs font-mono text-zinc-400">{seal.seal_code}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={seal.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                  {seal.verified ? 'Verificado' : 'Pendiente'}
                </Badge>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </CardContent>
  </Card>
);

// DNA Digital Manager
const DNADigitalManager = ({ dnaRecords, onRefresh }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-cyan-500" />
          Identidades DNA Digital
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {dnaRecords.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <Fingerprint className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay identidades registradas</p>
          </div>
        ) : (
          dnaRecords.map((dna, idx) => (
            <div key={idx} className="p-3 bg-zinc-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  dna.status === 'verified' ? 'bg-emerald-100' : 'bg-cyan-100'
                }`}>
                  <Fingerprint className={`w-5 h-5 ${dna.status === 'verified' ? 'text-emerald-600' : 'text-cyan-600'}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">{dna.owner_name}</p>
                  <p className="text-xs text-zinc-500">{dna.email}</p>
                  <p className="text-xs font-mono text-zinc-400">{dna.dna_code}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={dna.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-cyan-100 text-cyan-700'}>
                  {dna.status === 'verified' ? 'Verificado' : 'Pendiente'}
                </Badge>
                <span className="text-xs text-zinc-500">{dna.trust_score}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </CardContent>
  </Card>
);

// System Status
const SystemStatus = () => {
  const services = [
    { name: 'API Principal', status: 'online', latency: '45ms' },
    { name: 'Base de Datos', status: 'online', latency: '12ms' },
    { name: 'Google Safe Browsing', status: 'online', latency: '120ms' },
    { name: 'VirusTotal API', status: 'online', latency: '200ms' },
    { name: 'Firebase', status: 'online', latency: '80ms' },
    { name: 'Stripe Payments', status: 'online', latency: '150ms' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-500" />
          Estado del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {services.map((service, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  service.status === 'online' ? 'bg-emerald-500' :
                  service.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <span className="text-sm">{service.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">{service.latency}</span>
                <Badge className={
                  service.status === 'online' ? 'bg-emerald-100 text-emerald-700' :
                  service.status === 'degraded' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }>
                  {service.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    threatsBlocked: 0,
    revenueMonth: 0,
    trustSeals: 0,
    dnaRegistrations: 0
  });
  const [users, setUsers] = useState([]);
  const [threats, setThreats] = useState([]);
  const [seals, setSeals] = useState([]);
  const [dnaRecords, setDnaRecords] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load stats
      const [statsRes, usersRes, threatsRes] = await Promise.all([
        fetch(`${API}/api/admin/stats`, { credentials: 'include' }).then(r => r.ok ? r.json() : null),
        fetch(`${API}/api/admin/users`, { credentials: 'include' }).then(r => r.ok ? r.json() : { users: [] }),
        fetch(`${API}/api/threats`, { credentials: 'include' }).then(r => r.ok ? r.json() : [])
      ]);

      if (statsRes) {
        setStats({
          totalUsers: statsRes.total_users || 0,
          activeUsers: statsRes.active_users || 0,
          threatsBlocked: statsRes.threats_blocked || 0,
          revenueMonth: statsRes.revenue_month || 0,
          trustSeals: statsRes.trust_seals || 0,
          dnaRegistrations: statsRes.dna_registrations || 0
        });
      }

      setUsers(usersRes.users || []);
      setThreats(Array.isArray(threatsRes) ? threatsRes : []);

      // Load trust seals and DNA
      const [sealsRes, dnaRes] = await Promise.all([
        fetch(`${API}/api/admin/trust-seals`, { credentials: 'include' }).then(r => r.ok ? r.json() : { seals: [] }),
        fetch(`${API}/api/admin/dna-digital`, { credentials: 'include' }).then(r => r.ok ? r.json() : { records: [] })
      ]);

      setSeals(sealsRes.seals || []);
      setDnaRecords(dnaRes.records || []);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard de Empleados - ManoProtect</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-zinc-50">
        {/* Header */}
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-zinc-900">ManoProtect</span>
                    <span className="text-xs block text-zinc-500">Panel de Control</span>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={loadDashboardData} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
                <Button variant="ghost" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                    3
                  </span>
                </Button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-full">
                  <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">{user?.name?.charAt(0) || 'A'}</span>
                  </div>
                  <span className="text-sm font-medium">{user?.name || 'Admin'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Quick Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Usuarios Totales" 
              value={stats.totalUsers.toLocaleString()} 
              change={12} 
              trend="up"
              icon={Users} 
              color="bg-indigo-500" 
            />
            <StatCard 
              title="Amenazas Bloqueadas" 
              value={stats.threatsBlocked.toLocaleString()} 
              change={8} 
              trend="up"
              icon={Shield} 
              color="bg-emerald-500" 
            />
            <StatCard 
              title="Sellos de Confianza" 
              value={stats.trustSeals} 
              icon={Award} 
              color="bg-amber-500" 
            />
            <StatCard 
              title="DNA Digital" 
              value={stats.dnaRegistrations} 
              icon={Fingerprint} 
              color="bg-cyan-500" 
            />
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-white border border-zinc-200 p-1">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="threats" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Amenazas
              </TabsTrigger>
              <TabsTrigger value="seals" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Sellos
              </TabsTrigger>
              <TabsTrigger value="dna" className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4" />
                DNA Digital
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                Sistema
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <ThreatMonitor threats={threats.slice(0, 5)} />
                </div>
                <div className="space-y-6">
                  <SystemStatus />
                  
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="w-5 h-5 text-purple-500" />
                        Acciones Rápidas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate('/shield')}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Ir a ManoProtect Shield
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate('/admin')}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Panel Admin Completo
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate('/investor-crm')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        CRM Inversores
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab('seals')}
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Gestionar Sellos
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="mt-6">
              <UserManagement 
                users={users} 
                loading={loading}
                onRefresh={loadDashboardData}
              />
            </TabsContent>

            {/* Threats Tab */}
            <TabsContent value="threats" className="mt-6">
              <ThreatMonitor threats={threats} />
            </TabsContent>

            {/* Seals Tab */}
            <TabsContent value="seals" className="mt-6">
              <TrustSealManager seals={seals} onRefresh={loadDashboardData} />
            </TabsContent>

            {/* DNA Tab */}
            <TabsContent value="dna" className="mt-6">
              <DNADigitalManager dnaRecords={dnaRecords} onRefresh={loadDashboardData} />
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <SystemStatus />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-500" />
                      Métricas del Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600">CPU Usage</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-zinc-200 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-emerald-500" />
                          </div>
                          <span className="text-xs text-zinc-500">33%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600">Memory Usage</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-zinc-200 rounded-full overflow-hidden">
                            <div className="w-1/2 h-full bg-blue-500" />
                          </div>
                          <span className="text-xs text-zinc-500">50%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600">Disk Usage</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-zinc-200 rounded-full overflow-hidden">
                            <div className="w-1/4 h-full bg-amber-500" />
                          </div>
                          <span className="text-xs text-zinc-500">25%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600">API Requests/min</span>
                        <span className="text-sm font-medium">1,245</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
