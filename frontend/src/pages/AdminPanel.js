import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Shield, Users, CreditCard, FileText, CheckCircle, XCircle, 
  Clock, ArrowLeft, TrendingUp, Download, Eye, UserCheck, Loader2,
  MessageCircle, Key, Activity, Crown, Database, Trash2, Edit, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import RealTimeMetrics from '@/components/RealTimeMetrics';
import WhatsAppManager from '@/components/WhatsAppManager';
import APIKeyManager from '@/components/APIKeyManager';
import { SubscriptionBadge } from '@/components/SubscriptionBadge';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

// Available plans
const AVAILABLE_PLANS = [
  { value: 'free', label: '🥉 Gratis (Bronce)' },
  { value: 'personal', label: '🥈 Personal (Plata)' },
  { value: 'personal-monthly', label: '🥈 Personal Mensual (Plata)' },
  { value: 'personal-quarterly', label: '🥇 Personal Trimestral (Oro)' },
  { value: 'personal-yearly', label: '🥇 Personal Anual (Oro)' },
  { value: 'family-monthly', label: '💎 Familiar Mensual (Platino)' },
  { value: 'family-quarterly', label: '💎 Familiar Trimestral (Platino)' },
  { value: 'family-yearly', label: '💠 Familiar Anual (Diamante)' },
  { value: 'business', label: '💠 Business (Diamante)' },
  { value: 'enterprise', label: '👑 Enterprise (Élite)' },
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [investors, setInvestors] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [subscriptions, setSubscriptions] = useState({ subscribers: [], stats: {}, recent_changes: [] });
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadAllData();
  }, [isAdmin, navigate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dashRes, invRes, usersRes, paymentsRes, downloadsRes, subsRes] = await Promise.all([
        fetch(`${API}/admin/dashboard`, { credentials: 'include' }),
        fetch(`${API}/admin/investors`, { credentials: 'include' }),
        fetch(`${API}/admin/users?limit=50`, { credentials: 'include' }),
        fetch(`${API}/admin/payments`, { credentials: 'include' }),
        fetch(`${API}/admin/document-downloads`, { credentials: 'include' }),
        fetch(`${API}/admin/subscriptions`, { credentials: 'include' })
      ]);

      if (dashRes.ok) setDashboard(await dashRes.json());
      if (invRes.ok) setInvestors(await invRes.json());
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
      if (downloadsRes.ok) setDownloads(await downloadsRes.json());
      if (subsRes.ok) setSubscriptions(await subsRes.json());
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveInvestor = async (requestId) => {
    setActionLoading(requestId);
    try {
      const response = await fetch(`${API}/admin/investors/${requestId}/approve`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast.success('Inversor aprobado');
        loadAllData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al aprobar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectInvestor = async (requestId) => {
    setActionLoading(requestId);
    try {
      const response = await fetch(`${API}/admin/investors/${requestId}/reject`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast.success('Solicitud rechazada');
        loadAllData();
      } else {
        toast.error('Error al rechazar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangePlan = async (userId, newPlan) => {
    setActionLoading(userId);
    try {
      const response = await fetch(`${API}/admin/users/${userId}/plan?plan=${newPlan}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast.success(`Plan actualizado a ${newPlan}`);
        loadAllData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al actualizar plan');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente a ${email}?`)) {
      return;
    }
    
    setActionLoading(userId);
    try {
      const response = await fetch(`${API}/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast.success('Usuario eliminado');
        loadAllData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al eliminar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCleanupTestUsers = async () => {
    if (!window.confirm('¿Eliminar TODOS los usuarios de test?')) {
      return;
    }
    
    setActionLoading('cleanup');
    try {
      const response = await fetch(`${API}/admin/users/cleanup/test-users`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        loadAllData();
      } else {
        toast.error('Error al limpiar usuarios');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const response = await fetch(`${API}/admin/users/${userId}/role?role=${newRole}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast.success(`Rol actualizado a ${newRole}`);
        loadAllData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al actualizar rol');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleToggleUserStatus = async (userId, currentlyActive) => {
    const newStatus = !currentlyActive;
    const action = newStatus ? 'activar' : 'dar de baja';
    
    if (!window.confirm(`¿Seguro que quieres ${action} este usuario?`)) {
      return;
    }
    
    setActionLoading(userId);
    try {
      const response = await fetch(`${API}/admin/users/${userId}/status?is_active=${newStatus}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        loadAllData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al cambiar estado');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async (userId, email) => {
    if (!window.confirm(`¿Cancelar suscripción de ${email}? Se degradará a plan gratuito.`)) {
      return;
    }
    
    setActionLoading(userId);
    try {
      const response = await fetch(`${API}/admin/users/${userId}/cancel-subscription`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        loadAllData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al cancelar suscripción');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setActionLoading(null);
    }
  };

  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const handleViewUserDetails = async (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    
    try {
      const response = await fetch(`${API}/admin/users/${user.user_id || user.id}/details`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserDetails(data);
      }
    } catch (error) {
      toast.error('Error al cargar detalles');
    }
  };

  const handleUpdatePlan = async (userId, newPlan) => {
    setActionLoading(`plan-${userId}`);
    try {
      const response = await fetch(`${API}/admin/users/${userId}/plan?plan=${newPlan}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        loadAllData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al actualizar plan');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const pendingInvestors = investors.filter(i => i.status === 'pending');

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold">Panel de Administración</span>
            </div>
          </div>
          <Badge className="bg-red-600 text-white">Admin: {user?.name}</Badge>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-indigo-600">{dashboard.stats.total_users}</div>
                <div className="text-sm text-zinc-600">Usuarios Totales</div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-emerald-600">{dashboard.stats.premium_users}</div>
                <div className="text-sm text-zinc-600">Usuarios Premium</div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-amber-600">{dashboard.stats.pending_investors}</div>
                <div className="text-sm text-zinc-600">Inversores Pendientes</div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600">{dashboard.stats.approved_investors}</div>
                <div className="text-sm text-zinc-600">Inversores Aprobados</div>
              </CardContent>
            </Card>
            <Card className="bg-white col-span-2">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-emerald-600">€{dashboard.stats.total_revenue?.toLocaleString()}</div>
                <div className="text-sm text-zinc-600">Ingresos Totales</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="investors" className="space-y-6">
          <TabsList className="bg-white border flex-wrap">
            <TabsTrigger value="investors" className="data-[state=active]:bg-indigo-100">
              <UserCheck className="w-4 h-4 mr-2" />
              Inversores ({pendingInvestors.length} pendientes)
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-indigo-100">
              <Users className="w-4 h-4 mr-2" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-amber-100">
              <Crown className="w-4 h-4 mr-2" />
              Suscripciones
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-indigo-100">
              <CreditCard className="w-4 h-4 mr-2" />
              Pagos
            </TabsTrigger>
            <TabsTrigger value="downloads" className="data-[state=active]:bg-indigo-100">
              <Download className="w-4 h-4 mr-2" />
              Descargas
            </TabsTrigger>
            <TabsTrigger value="realtime" className="data-[state=active]:bg-indigo-100">
              <Activity className="w-4 h-4 mr-2" />
              Tiempo Real
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="data-[state=active]:bg-indigo-100">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-indigo-100">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="database" className="data-[state=active]:bg-emerald-100">
              <Database className="w-4 h-4 mr-2" />
              Base de Datos
            </TabsTrigger>
          </TabsList>

          {/* Investors Tab */}
          <TabsContent value="investors">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Solicitudes de Inversores</CardTitle>
                <CardDescription>Gestiona las solicitudes de acceso a documentación confidencial</CardDescription>
              </CardHeader>
              <CardContent>
                {investors.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">No hay solicitudes de inversores</p>
                ) : (
                  <div className="space-y-4">
                    {investors.map((inv) => (
                      <div 
                        key={inv.request_id} 
                        className={`p-4 rounded-lg border-2 ${
                          inv.status === 'pending' ? 'border-amber-300 bg-amber-50' :
                          inv.status === 'approved' ? 'border-emerald-300 bg-emerald-50' :
                          'border-red-300 bg-red-50'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-lg">{inv.company_name}</span>
                              <Badge className={
                                inv.status === 'pending' ? 'bg-amber-600' :
                                inv.status === 'approved' ? 'bg-emerald-600' :
                                'bg-red-600'
                              }>
                                {inv.status === 'pending' ? 'Pendiente' :
                                 inv.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                              </Badge>
                            </div>
                            <div className="grid md:grid-cols-2 gap-2 text-sm text-zinc-600">
                              <div><strong>CIF:</strong> {inv.cif}</div>
                              <div><strong>Contacto:</strong> {inv.contact_name}</div>
                              <div><strong>Email:</strong> {inv.contact_email}</div>
                              <div><strong>Teléfono:</strong> {inv.contact_phone}</div>
                              <div><strong>Cargo:</strong> {inv.position}</div>
                              <div><strong>Fecha:</strong> {new Date(inv.created_at).toLocaleDateString('es-ES')}</div>
                            </div>
                            <div className="mt-2 text-sm">
                              <strong>Motivo:</strong> {inv.reason}
                            </div>
                          </div>
                          
                          {inv.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleApproveInvestor(inv.request_id)}
                                disabled={actionLoading === inv.request_id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                {actionLoading === inv.request_id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <><CheckCircle className="w-4 h-4 mr-2" /> Aprobar</>
                                )}
                              </Button>
                              <Button
                                onClick={() => handleRejectInvestor(inv.request_id)}
                                disabled={actionLoading === inv.request_id}
                                variant="outline"
                                className="border-red-600 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-2" /> Rechazar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>Ver y gestionar todos los usuarios registrados ({users.length})</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={loadAllData}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualizar
                  </Button>
                  <Button
                    onClick={handleCleanupTestUsers}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    disabled={actionLoading === 'cleanup'}
                  >
                    {actionLoading === 'cleanup' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><Trash2 className="w-4 h-4 mr-2" />Limpiar Test</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-zinc-50">
                        <th className="text-left p-3">Usuario</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Insignia</th>
                        <th className="text-left p-3">Plan</th>
                        <th className="text-left p-3">Rol</th>
                        <th className="text-left p-3">Fecha</th>
                        <th className="text-left p-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.user_id || u.id} className={`border-b hover:bg-zinc-50 ${u.is_active === false ? 'opacity-50 bg-red-50' : ''}`}>
                          <td className="p-3 font-medium">
                            <div className="flex items-center gap-2">
                              <span>{u.name || 'Sin nombre'}</span>
                              {u.is_active === false && <span className="text-xs text-red-500">(Baja)</span>}
                            </div>
                          </td>
                          <td className="p-3 text-zinc-600 text-xs">{u.email}</td>
                          <td className="p-3">
                            <SubscriptionBadge plan={u.plan || 'free'} size="small" />
                          </td>
                          <td className="p-3">
                            <Select
                              value={u.plan || 'free'}
                              onValueChange={(value) => handleChangePlan(u.user_id || u.id, value)}
                              disabled={u.role === 'superadmin' || actionLoading === (u.user_id || u.id)}
                            >
                              <SelectTrigger className="w-44 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {AVAILABLE_PLANS.map((plan) => (
                                  <SelectItem key={plan.value} value={plan.value} className="text-xs">
                                    {plan.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3">
                            <Badge className={
                              u.role === 'superadmin' ? 'bg-red-600' :
                              u.role === 'admin' ? 'bg-amber-600' :
                              'bg-zinc-500'
                            }>
                              {u.role === 'superadmin' ? '👑 Super' : 
                               u.role === 'admin' ? '⭐ Admin' : '👤 User'}
                            </Badge>
                          </td>
                          <td className="p-3 text-zinc-500 text-xs">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '-'}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1 flex-wrap">
                              {/* View Details Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewUserDetails(u)}
                                className="h-7 text-xs"
                                title="Ver detalles"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              
                              {u.role !== 'superadmin' && (
                                <>
                                  {/* Activate/Deactivate Button */}
                                  <Button
                                    size="sm"
                                    variant={u.is_active === false ? "default" : "outline"}
                                    onClick={() => handleToggleUserStatus(u.user_id || u.id, u.is_active !== false)}
                                    className={`h-7 text-xs ${u.is_active === false ? 'bg-emerald-600' : ''}`}
                                    disabled={actionLoading === (u.user_id || u.id)}
                                    title={u.is_active === false ? 'Activar usuario' : 'Dar de baja'}
                                  >
                                    {actionLoading === (u.user_id || u.id) ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : u.is_active === false ? (
                                      '✓ Activar'
                                    ) : (
                                      '⏸ Baja'
                                    )}
                                  </Button>
                                  
                                  {/* Cancel Subscription Button (only for paid plans) */}
                                  {u.plan && u.plan !== 'free' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCancelSubscription(u.user_id || u.id, u.email)}
                                      className="h-7 text-xs text-amber-600 border-amber-300 hover:bg-amber-50"
                                      disabled={actionLoading === (u.user_id || u.id)}
                                      title="Cancelar suscripción"
                                    >
                                      ✕ Cancelar
                                    </Button>
                                  )}
                                  
                                  {/* Delete Button */}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteUser(u.user_id || u.id, u.email)}
                                    className="h-7 text-xs text-red-600 hover:bg-red-50"
                                    disabled={actionLoading === (u.user_id || u.id)}
                                    title="Eliminar permanentemente"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab - Manual Premium Management */}
          <TabsContent value="subscriptions">
            <div className="space-y-6">
              {/* Subscription Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                  <CardContent className="pt-6">
                    <Crown className="w-8 h-8 text-amber-600 mb-2" />
                    <div className="text-3xl font-bold text-amber-700">{subscriptions.stats?.total_premium || 0}</div>
                    <div className="text-sm text-amber-600">Suscriptores Premium</div>
                  </CardContent>
                </Card>
                {Object.entries(subscriptions.stats?.by_plan || {}).map(([plan, count]) => (
                  <Card key={plan} className="bg-white">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-indigo-600">{count}</div>
                      <div className="text-sm text-zinc-600 capitalize">{plan}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Manual Plan Management */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    Gestión Manual de Suscripciones
                  </CardTitle>
                  <CardDescription>
                    Activa o desactiva planes Premium para usuarios de forma manual. 
                    Útil para pruebas, promociones o casos especiales.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-zinc-50">
                          <th className="text-left p-3">Usuario</th>
                          <th className="text-left p-3">Email</th>
                          <th className="text-left p-3">Plan Actual</th>
                          <th className="text-left p-3">Estado</th>
                          <th className="text-left p-3">Cambiar Plan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.user_id} className="border-b hover:bg-zinc-50">
                            <td className="p-3 font-medium">{u.name}</td>
                            <td className="p-3 text-zinc-600">{u.email}</td>
                            <td className="p-3">
                              <Badge className={
                                u.plan === 'enterprise' ? 'bg-purple-600' :
                                u.plan === 'business' ? 'bg-amber-600' :
                                u.plan === 'family' ? 'bg-blue-600' :
                                u.plan === 'personal' ? 'bg-emerald-600' :
                                'bg-zinc-400'
                              }>
                                {u.plan || 'free'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              {u.subscription_status === 'active' ? (
                                <Badge className="bg-emerald-100 text-emerald-700">Activo</Badge>
                              ) : (
                                <Badge variant="outline" className="text-zinc-500">Inactivo</Badge>
                              )}
                            </td>
                            <td className="p-3">
                              <select
                                value={u.plan || 'free'}
                                onChange={(e) => handleUpdatePlan(u.user_id, e.target.value)}
                                disabled={actionLoading === `plan-${u.user_id}`}
                                className="border rounded px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="free">🆓 Free</option>
                                <option value="personal">⭐ Personal (9.99€/mes)</option>
                                <option value="family">👨‍👩‍👧‍👦 Family (19.99€/mes)</option>
                                <option value="business">🏢 Business (49.99€/mes)</option>
                                <option value="enterprise">🚀 Enterprise (199.99€/mes)</option>
                              </select>
                              {actionLoading === `plan-${u.user_id}` && (
                                <Loader2 className="w-4 h-4 animate-spin inline ml-2" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Changes Log */}
              {subscriptions.recent_changes?.length > 0 && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Historial de Cambios de Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {subscriptions.recent_changes.map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                          <div>
                            <span className="font-mono text-xs text-zinc-500">{log.user_id}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{log.old_plan}</Badge>
                              <span className="text-zinc-400">→</span>
                              <Badge className="bg-indigo-600">{log.new_plan}</Badge>
                            </div>
                          </div>
                          <span className="text-xs text-zinc-500">
                            {log.created_at ? new Date(log.created_at).toLocaleString('es-ES') : '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Historial de Pagos</CardTitle>
                <CardDescription>Todas las transacciones de Stripe</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">No hay pagos registrados</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">ID Sesión</th>
                          <th className="text-left p-3">Usuario</th>
                          <th className="text-left p-3">Plan</th>
                          <th className="text-left p-3">Monto</th>
                          <th className="text-left p-3">Estado</th>
                          <th className="text-left p-3">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p.id} className="border-b hover:bg-zinc-50">
                            <td className="p-3 font-mono text-xs">{p.session_id?.slice(0, 20)}...</td>
                            <td className="p-3">{p.email}</td>
                            <td className="p-3">{p.plan_type}</td>
                            <td className="p-3 font-bold">€{p.amount}</td>
                            <td className="p-3">
                              <Badge className={
                                p.payment_status === 'paid' ? 'bg-emerald-600' :
                                p.payment_status === 'pending' ? 'bg-amber-600' :
                                'bg-red-600'
                              }>
                                {p.payment_status}
                              </Badge>
                            </td>
                            <td className="p-3 text-zinc-500">
                              {new Date(p.created_at).toLocaleString('es-ES')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Downloads Tab */}
          <TabsContent value="downloads">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Historial de Descargas</CardTitle>
                <CardDescription>Registro de documentos descargados por inversores</CardDescription>
              </CardHeader>
              <CardContent>
                {downloads.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">No hay descargas registradas</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Usuario ID</th>
                          <th className="text-left p-3">Documento</th>
                          <th className="text-left p-3">Formato</th>
                          <th className="text-left p-3">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {downloads.map((d, idx) => (
                          <tr key={idx} className="border-b hover:bg-zinc-50">
                            <td className="p-3 font-mono text-xs">{d.user_id}</td>
                            <td className="p-3 font-medium">{d.doc_type}</td>
                            <td className="p-3">
                              <Badge variant="outline">{d.format || 'md'}</Badge>
                            </td>
                            <td className="p-3 text-zinc-500">
                              {new Date(d.downloaded_at).toLocaleString('es-ES')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Real-time Metrics Tab */}
          <TabsContent value="realtime">
            <div className="space-y-6">
              <RealTimeMetrics />
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Acerca del Dashboard en Tiempo Real
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm text-zinc-600">
                    <p>
                      El dashboard de métricas en tiempo real utiliza Server-Sent Events (SSE) para 
                      mostrar datos actualizados cada 5 segundos sin necesidad de recargar la página.
                    </p>
                    <ul className="mt-3 space-y-1">
                      <li><strong>Analizados:</strong> Total de contenidos verificados</li>
                      <li><strong>Bloqueadas:</strong> Amenazas detectadas y neutralizadas</li>
                      <li><strong>Protección:</strong> Tasa de éxito en detección</li>
                      <li><strong>Última Hora:</strong> Actividad reciente</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp">
            <WhatsAppManager />
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api">
            <APIKeyManager />
          </TabsContent>

          {/* Database Info Tab */}
          <TabsContent value="database">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  Información de Base de Datos
                </CardTitle>
                <CardDescription>
                  Configuración y estado de la base de datos MongoDB de MANO
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Connection Info */}
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <h3 className="font-semibold text-emerald-800 mb-3">📍 Conexión</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-zinc-600">URL:</span>
                        <code className="ml-2 px-2 py-1 bg-white rounded">mongodb://localhost:27017</code>
                      </div>
                      <div>
                        <span className="text-zinc-600">Base de Datos:</span>
                        <code className="ml-2 px-2 py-1 bg-white rounded">test_database</code>
                      </div>
                    </div>
                  </div>

                  {/* Collections */}
                  <div className="p-4 bg-zinc-50 rounded-lg border">
                    <h3 className="font-semibold mb-3">📂 Colecciones Principales</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { name: 'users', desc: 'Usuarios registrados', icon: '👤' },
                        { name: 'sessions', desc: 'Sesiones activas', icon: '🔐' },
                        { name: 'payment_transactions', desc: 'Pagos de Stripe', icon: '💳' },
                        { name: 'bank_accounts', desc: 'Cuentas bancarias', icon: '🏦' },
                        { name: 'bank_transactions', desc: 'Transacciones', icon: '💸' },
                        { name: 'threat_analysis', desc: 'Análisis de amenazas', icon: '🛡️' },
                        { name: 'rewards', desc: 'Sistema de recompensas', icon: '🏆' },
                        { name: 'notifications', desc: 'Notificaciones', icon: '🔔' },
                        { name: 'investor_requests', desc: 'Solicitudes inversores', icon: '📋' },
                        { name: 'admin_logs', desc: 'Logs de admin', icon: '📝' },
                        { name: 'email_preferences', desc: 'Preferencias email', icon: '📧' },
                        { name: 'api_keys', desc: 'API Keys partners', icon: '🔑' },
                      ].map(col => (
                        <div key={col.name} className="p-3 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            <span>{col.icon}</span>
                            <code className="text-sm font-medium">{col.name}</code>
                          </div>
                          <p className="text-xs text-zinc-500 mt-1">{col.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats from Dashboard */}
                  {dashboard && (
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <h3 className="font-semibold text-indigo-800 mb-3">📊 Estadísticas en Vivo</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-white rounded">
                          <div className="text-2xl font-bold text-indigo-600">{dashboard.stats?.total_users || 0}</div>
                          <div className="text-xs text-zinc-500">Usuarios Total</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded">
                          <div className="text-2xl font-bold text-emerald-600">{dashboard.stats?.premium_users || 0}</div>
                          <div className="text-xs text-zinc-500">Premium</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded">
                          <div className="text-2xl font-bold text-amber-600">{dashboard.stats?.approved_investors || 0}</div>
                          <div className="text-xs text-zinc-500">Inversores</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded">
                          <div className="text-2xl font-bold text-purple-600">€{dashboard.stats?.total_revenue?.toLocaleString() || 0}</div>
                          <div className="text-xs text-zinc-500">Ingresos</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Access Note */}
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h3 className="font-semibold text-amber-800 mb-2">⚠️ Nota Importante</h3>
                    <p className="text-sm text-amber-700">
                      La base de datos MongoDB está alojada en el servidor de Emergent. 
                      Para acceso directo a la base de datos (consultas avanzadas, exports, etc.), 
                      puedes usar herramientas como MongoDB Compass conectando a la URL indicada arriba 
                      cuando la aplicación esté desplegada.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
