import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Shield, Users, CreditCard, FileText, CheckCircle, XCircle, 
  Clock, ArrowLeft, TrendingUp, Download, Eye, UserCheck, Loader2,
  MessageCircle, Key, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import RealTimeMetrics from '@/components/RealTimeMetrics';
import WhatsAppManager from '@/components/WhatsAppManager';
import APIKeyManager from '@/components/APIKeyManager';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [investors, setInvestors] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [downloads, setDownloads] = useState([]);
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
      const [dashRes, invRes, usersRes, paymentsRes, downloadsRes] = await Promise.all([
        fetch(`${API}/admin/dashboard`, { credentials: 'include' }),
        fetch(`${API}/admin/investors`, { credentials: 'include' }),
        fetch(`${API}/admin/users?limit=50`, { credentials: 'include' }),
        fetch(`${API}/admin/payments`, { credentials: 'include' }),
        fetch(`${API}/admin/document-downloads`, { credentials: 'include' })
      ]);

      if (dashRes.ok) setDashboard(await dashRes.json());
      if (invRes.ok) setInvestors(await invRes.json());
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
      if (downloadsRes.ok) setDownloads(await downloadsRes.json());
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
        toast.error('Error al actualizar rol');
      }
    } catch (error) {
      toast.error('Error de conexión');
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
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>Ver y gestionar todos los usuarios registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Usuario</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Rol</th>
                        <th className="text-left p-3">Plan</th>
                        <th className="text-left p-3">Fecha</th>
                        <th className="text-left p-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.user_id} className="border-b hover:bg-zinc-50">
                          <td className="p-3 font-medium">{u.name}</td>
                          <td className="p-3">{u.email}</td>
                          <td className="p-3">
                            <Badge className={
                              u.role === 'admin' ? 'bg-red-600' :
                              u.role === 'investor' ? 'bg-amber-600' :
                              'bg-zinc-600'
                            }>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{u.plan || 'free'}</Badge>
                          </td>
                          <td className="p-3 text-zinc-500">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '-'}
                          </td>
                          <td className="p-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.user_id, e.target.value)}
                              className="border rounded px-2 py-1 text-sm"
                            >
                              <option value="user">Usuario</option>
                              <option value="investor">Inversor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
