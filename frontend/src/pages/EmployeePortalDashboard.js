/**
 * ManoProtect - Employee Portal Dashboard
 * Complete control panel for employees and directors
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, Users, Package, AlertTriangle, Settings, LogOut,
  UserPlus, Mail, Phone, Search, RefreshCw, ChevronRight,
  BarChart3, Clock, CheckCircle, XCircle, Eye, Trash2,
  Send, Copy, Building2, FileText, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <Card className="bg-slate-800/50 border-slate-700">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ============================================
// MAIN COMPONENT
// ============================================
const EmployeePortalDashboard = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [employees, setEmployees] = useState([]);
  const [invites, setInvites] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'employee',
    department: ''
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [createdInvite, setCreatedInvite] = useState(null);

  // Check authentication
  useEffect(() => {
    const session = localStorage.getItem('employee_session');
    if (!session) {
      navigate('/empleados/login');
      return;
    }
    setEmployee(JSON.parse(session));
    setLoading(false);
  }, [navigate]);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!employee?.session_token) return;

    try {
      // Fetch stats
      const statsRes = await fetch(`${API}/api/employee-portal/dashboard/stats`, {
        credentials: 'include'
      });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      // Fetch employees (director only)
      if (employee.role === 'director' || employee.role === 'superadmin') {
        const empRes = await fetch(`${API}/api/employee-portal/employees`, {
          credentials: 'include'
        });
        if (empRes.ok) {
          const data = await empRes.json();
          setEmployees(data.employees || []);
        }

        // Fetch invites
        const invRes = await fetch(`${API}/api/employee-portal/invites`, {
          credentials: 'include'
        });
        if (invRes.ok) {
          const data = await invRes.json();
          setInvites(data.invites || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [employee]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create invite
  const handleCreateInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setCreatedInvite(null);

    try {
      const response = await fetch(`${API}/api/employee-portal/invites`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(inviteForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al crear invitación');
      }

      setCreatedInvite(data);
      toast.success('Invitación creada exitosamente');
      setInviteForm({ email: '', name: '', role: 'employee', department: '' });
      fetchData();

    } catch (error) {
      toast.error(error.message);
    } finally {
      setInviteLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch(`${API}/api/employee-portal/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {}
    
    localStorage.removeItem('employee_session');
    navigate('/empleados/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const isDirector = employee?.role === 'director' || employee?.role === 'superadmin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Helmet>
        <title>Panel de Empleados - ManoProtect</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Portal de Empleados</h1>
              <p className="text-xs text-slate-400">ManoProtect</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{employee?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{employee?.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
              data-testid="employee-logout-btn"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Resumen
            </TabsTrigger>
            {isDirector && (
              <>
                <TabsTrigger value="employees" className="data-[state=active]:bg-indigo-600">
                  <Users className="w-4 h-4 mr-2" />
                  Empleados
                </TabsTrigger>
                <TabsTrigger value="invites" className="data-[state=active]:bg-indigo-600">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invitaciones
                </TabsTrigger>
                <TabsTrigger value="documents" className="data-[state=active]:bg-indigo-600">
                  <FileText className="w-4 h-4 mr-2" />
                  Documentos
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="orders" className="data-[state=active]:bg-indigo-600">
              <Package className="w-4 h-4 mr-2" />
              Pedidos
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Usuarios Totales"
                value={stats.total_users || 0}
                icon={Users}
                color="bg-indigo-600"
              />
              <StatCard
                title="Usuarios Premium"
                value={stats.premium_users || 0}
                icon={Shield}
                color="bg-emerald-600"
              />
              <StatCard
                title="Pedidos Totales"
                value={stats.total_orders || 0}
                icon={Package}
                color="bg-blue-600"
              />
              <StatCard
                title="Pedidos Pendientes"
                value={stats.pending_orders || 0}
                icon={Clock}
                color="bg-amber-600"
              />
            </div>

            {isDirector && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  title="Empleados Activos"
                  value={stats.active_employees || 0}
                  icon={Users}
                  color="bg-purple-600"
                />
                <StatCard
                  title="Invitaciones Pendientes"
                  value={stats.pending_invites || 0}
                  icon={Mail}
                  color="bg-pink-600"
                />
                <StatCard
                  title="Amenazas Detectadas"
                  value={stats.total_threats || 0}
                  icon={AlertTriangle}
                  color="bg-red-600"
                />
              </div>
            )}

            {/* Quick Actions */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4 border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => navigate('/admin/shipping')}
                >
                  <Package className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Gestionar Envíos</p>
                    <p className="text-xs text-slate-500">Ver y actualizar pedidos</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4 border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => navigate('/admin/users')}
                >
                  <Users className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Ver Usuarios</p>
                    <p className="text-xs text-slate-500">Lista de usuarios</p>
                  </div>
                </Button>
                {isDirector && (
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => setActiveTab('invites')}
                  >
                    <UserPlus className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">Crear Empleado</p>
                      <p className="text-xs text-slate-500">Invitar nuevo empleado</p>
                    </div>
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab (Director only) */}
          {isDirector && (
            <TabsContent value="employees" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Empleados</CardTitle>
                      <CardDescription className="text-slate-400">
                        {employees.length} empleados registrados
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchData}
                      className="border-slate-600 text-slate-300"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualizar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {employees.map((emp) => (
                      <div
                        key={emp.employee_id}
                        className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                            {emp.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-white">{emp.name}</p>
                            <p className="text-sm text-slate-400">{emp.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={emp.is_active ? 'default' : 'secondary'}
                            className={emp.is_active ? 'bg-emerald-600' : 'bg-slate-600'}
                          >
                            {emp.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <Badge variant="outline" className="border-slate-600 text-slate-300 capitalize">
                            {emp.role}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {employees.length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        No hay empleados registrados
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Invites Tab (Director only) */}
          {isDirector && (
            <TabsContent value="invites" className="space-y-6">
              {/* Create Invite Form */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Crear Nueva Invitación
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Genera credenciales para un nuevo empleado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateInvite} className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Nombre completo</label>
                      <Input
                        placeholder="Juan García"
                        value={inviteForm.name}
                        onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                        className="bg-slate-900/50 border-slate-600 text-white"
                        required
                        data-testid="invite-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Email</label>
                      <Input
                        type="email"
                        placeholder="empleado@manoprotect.com"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                        className="bg-slate-900/50 border-slate-600 text-white"
                        required
                        data-testid="invite-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Rol</label>
                      <select
                        value={inviteForm.role}
                        onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                        className="w-full h-10 px-3 rounded-md bg-slate-900/50 border border-slate-600 text-white"
                        data-testid="invite-role"
                      >
                        <option value="employee">Empleado (Básico)</option>
                        <option value="soporte">Soporte al Cliente</option>
                        <option value="ventas">Ventas</option>
                        <option value="logistica">Logística</option>
                        <option value="marketing">Marketing</option>
                        <option value="analista_fraude">Analista de Fraude</option>
                        <option value="manager">Manager</option>
                        <option value="director">Director</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Departamento</label>
                      <select
                        value={inviteForm.department}
                        onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                        className="w-full h-10 px-3 rounded-md bg-slate-900/50 border border-slate-600 text-white"
                        data-testid="invite-department"
                      >
                        <option value="">Seleccionar departamento...</option>
                        <option value="Dirección">Dirección</option>
                        <option value="Atención al Cliente">Atención al Cliente</option>
                        <option value="Ventas">Ventas</option>
                        <option value="Logística">Logística</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Seguridad">Seguridad y Fraude</option>
                        <option value="Tecnología">Tecnología</option>
                        <option value="Administración">Administración</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <Button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700"
                        disabled={inviteLoading}
                        data-testid="create-invite-btn"
                      >
                        {inviteLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Creando...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Crear Invitación
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Created invite info */}
                  {createdInvite && (
                    <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <h4 className="font-medium text-emerald-400 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Invitación Creada
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                          <span className="text-slate-400">Email:</span>
                          <span className="text-white">{createdInvite.email}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                          <span className="text-slate-400">Contraseña temporal:</span>
                          <div className="flex items-center gap-2">
                            <code className="text-emerald-400">{createdInvite.temp_password}</code>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(createdInvite.temp_password)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                          <span className="text-slate-400">URL de registro:</span>
                          <div className="flex items-center gap-2">
                            <code className="text-indigo-400 text-xs truncate max-w-[200px]">
                              {window.location.origin}{createdInvite.registration_url}
                            </code>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(`${window.location.origin}${createdInvite.registration_url}`)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-3">
                        Envía estas credenciales al nuevo empleado. La invitación expira en 7 días.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Invites List */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Invitaciones Pendientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invites.filter(i => i.status === 'pending').map((invite) => (
                      <div
                        key={invite.invite_id}
                        className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                      >
                        <div>
                          <p className="font-medium text-white">{invite.name}</p>
                          <p className="text-sm text-slate-400">{invite.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="border-amber-500 text-amber-400">
                            Pendiente
                          </Badge>
                          <span className="text-xs text-slate-500">
                            Expira: {new Date(invite.expires_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {invites.filter(i => i.status === 'pending').length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        No hay invitaciones pendientes
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Gestión de Pedidos</CardTitle>
                <CardDescription className="text-slate-400">
                  Accede al panel completo de envíos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate('/admin/shipping')}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Ir al Panel de Envíos
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          {isDirector && (
            <TabsContent value="documents" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    Documentos Legales
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Modelos de contratos y documentos oficiales para nuevos empleados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Employment Contract */}
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1">Contrato de Trabajo Indefinido</h3>
                          <p className="text-sm text-slate-400 mb-2">
                            Modelo oficial de contrato laboral conforme al Estatuto de los Trabajadores
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">
                              PDF
                            </Badge>
                            <Badge className="bg-slate-600/20 text-slate-400 border-slate-600/30">
                              Con sello oficial
                            </Badge>
                            <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-600/30">
                              v2.0 - Feb 2026
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <a
                        href="/contrato_empleado_manoprotect.zip"
                        download
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                        data-testid="download-contract-btn"
                      >
                        <Download className="w-4 h-4" />
                        Descargar ZIP
                      </a>
                    </div>
                  </div>

                  {/* Contract Info */}
                  <div className="bg-indigo-900/20 rounded-xl p-4 border border-indigo-600/30">
                    <h4 className="font-medium text-indigo-300 mb-2">Contenido del ZIP:</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Contrato_Trabajo_ManoProtect.pdf - Modelo estándar
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Contrato_Trabajo_ManoProtect_Sellado.pdf - Con cuño oficial
                      </li>
                    </ul>
                  </div>

                  {/* Usage Instructions */}
                  <div className="bg-amber-900/20 rounded-xl p-4 border border-amber-600/30">
                    <h4 className="font-medium text-amber-300 mb-2">Instrucciones de uso:</h4>
                    <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                      <li>Descarga el ZIP y extrae los archivos PDF</li>
                      <li>Imprime 2 copias del contrato</li>
                      <li>Rellena los campos en blanco con los datos del empleado</li>
                      <li>Ambas partes deben firmar las 2 copias</li>
                      <li>Cada parte conserva una copia firmada</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default EmployeePortalDashboard;
