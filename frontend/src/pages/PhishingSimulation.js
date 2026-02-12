/**
 * Phishing Simulation Platform - B2B Enterprise Feature
 * Simula ataques de phishing para entrenar empleados
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Phishing, Mail, Users, Target, Play, Pause, BarChart3,
  ArrowLeft, Shield, AlertTriangle, CheckCircle, Clock,
  Plus, Trash2, Eye, Send, FileText, Building2, Loader2,
  TrendingUp, TrendingDown, UserCheck, UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const PHISHING_TEMPLATES = [
  {
    id: 'bank_alert',
    name: 'Alerta Bancaria',
    subject: 'Actividad sospechosa en su cuenta',
    preview: 'Hemos detectado un intento de acceso...',
    difficulty: 'medium',
    category: 'financial'
  },
  {
    id: 'it_password',
    name: 'Cambio de Contraseña IT',
    subject: 'Su contraseña expira en 24 horas',
    preview: 'El departamento de IT requiere que actualice...',
    difficulty: 'easy',
    category: 'corporate'
  },
  {
    id: 'ceo_urgent',
    name: 'CEO Urgente',
    subject: 'Necesito tu ayuda urgente',
    preview: 'Estoy en una reunión y necesito que hagas...',
    difficulty: 'hard',
    category: 'social'
  },
  {
    id: 'invoice_attached',
    name: 'Factura Adjunta',
    subject: 'Factura pendiente de pago',
    preview: 'Adjuntamos factura vencida por...',
    difficulty: 'medium',
    category: 'financial'
  },
  {
    id: 'microsoft_365',
    name: 'Microsoft 365 Login',
    subject: 'Su sesión ha expirado',
    preview: 'Por favor inicie sesión para continuar...',
    difficulty: 'hard',
    category: 'tech'
  }
];

const PhishingSimulation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddEmployeesModal, setShowAddEmployeesModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // New campaign form
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    template_id: '',
    target_department: 'all',
    scheduled_date: ''
  });

  // Bulk add employees
  const [bulkEmails, setBulkEmails] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadCampaigns(),
      loadEmployees(),
      loadStats()
    ]);
    setLoading(false);
  };

  const loadCampaigns = async () => {
    try {
      const response = await fetch(`${API}/phishing/campaigns`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await fetch(`${API}/phishing/employees`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API}/phishing/stats`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.template_id) {
      toast.error('Nombre y plantilla son obligatorios');
      return;
    }

    try {
      const response = await fetch(`${API}/phishing/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newCampaign)
      });

      if (response.ok) {
        toast.success('Campaña creada');
        setShowCreateModal(false);
        setNewCampaign({ name: '', template_id: '', target_department: 'all', scheduled_date: '' });
        loadCampaigns();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al crear campaña');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const launchCampaign = async (campaignId) => {
    try {
      const response = await fetch(`${API}/phishing/campaigns/${campaignId}/launch`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Campaña lanzada');
        loadCampaigns();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al lanzar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const addEmployees = async () => {
    const emails = bulkEmails.split('\n').map(e => e.trim()).filter(e => e);
    if (emails.length === 0) {
      toast.error('Añade al menos un email');
      return;
    }

    try {
      const response = await fetch(`${API}/phishing/employees/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ emails })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.added} empleados añadidos`);
        setShowAddEmployeesModal(false);
        setBulkEmails('');
        loadEmployees();
      }
    } catch (error) {
      toast.error('Error al añadir empleados');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-amber-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-zinc-500';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft': return <Badge variant="outline" className="border-zinc-500 text-zinc-400">Borrador</Badge>;
      case 'scheduled': return <Badge className="bg-blue-500">Programada</Badge>;
      case 'running': return <Badge className="bg-amber-500">En curso</Badge>;
      case 'completed': return <Badge className="bg-green-500">Completada</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-red-950/10 to-zinc-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-white/80 hover:text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  Simulación de Phishing
                  <Badge className="bg-white/20 text-white">Enterprise</Badge>
                </h1>
                <p className="text-white/80">Entrena a tu equipo contra ataques de phishing</p>
              </div>
            </div>
            <Badge className="bg-red-500/20 text-red-200 border-red-400/30">
              <Building2 className="w-3 h-3 mr-1" />
              B2B
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">{employees.length}</p>
                  <p className="text-xs text-zinc-400">Empleados</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">{campaigns.length}</p>
                  <p className="text-xs text-zinc-400">Campañas</p>
                </div>
                <Mail className="w-8 h-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">{stats?.click_rate || 0}%</p>
                  <p className="text-xs text-zinc-400">Tasa de Clics</p>
                </div>
                {(stats?.click_rate || 0) > 20 ? (
                  <TrendingDown className="w-8 h-8 text-red-400" />
                ) : (
                  <TrendingUp className="w-8 h-8 text-green-400" />
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">{stats?.report_rate || 0}%</p>
                  <p className="text-xs text-zinc-400">Reportes</p>
                </div>
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="bg-zinc-800 border-zinc-700">
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-zinc-700">
              <Mail className="w-4 h-4 mr-2" />
              Campañas
            </TabsTrigger>
            <TabsTrigger value="employees" className="data-[state=active]:bg-zinc-700">
              <Users className="w-4 h-4 mr-2" />
              Empleados
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-zinc-700">
              <FileText className="w-4 h-4 mr-2" />
              Plantillas
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-zinc-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Reportes
            </TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Campañas de Phishing</h2>
              <Button onClick={() => setShowCreateModal(true)} className="bg-red-600 hover:bg-red-700" data-testid="create-campaign-btn">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Campaña
              </Button>
            </div>

            {campaigns.length === 0 ? (
              <Card className="bg-zinc-800/30 border-zinc-700 border-dashed">
                <CardContent className="py-16 text-center">
                  <Target className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Sin campañas</h3>
                  <p className="text-zinc-400 mb-6">Crea tu primera campaña de simulación</p>
                  <Button onClick={() => setShowCreateModal(true)} className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Campaña
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="bg-zinc-800/50 border-zinc-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-red-500/20 rounded-xl">
                            <Mail className="w-6 h-6 text-red-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{campaign.name}</h3>
                            <p className="text-zinc-400 text-sm">
                              {PHISHING_TEMPLATES.find(t => t.id === campaign.template_id)?.name || 'Plantilla personalizada'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(campaign.status)}
                          {campaign.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => launchCampaign(campaign.id)}
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Lanzar
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="border-zinc-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {campaign.status === 'running' && (
                        <div className="mt-4 pt-4 border-t border-zinc-700">
                          <div className="flex justify-between text-sm text-zinc-400 mb-2">
                            <span>Progreso</span>
                            <span>{campaign.progress || 0}%</span>
                          </div>
                          <Progress value={campaign.progress || 0} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Empleados ({employees.length})</h2>
              <Button onClick={() => setShowAddEmployeesModal(true)} className="bg-blue-600 hover:bg-blue-700" data-testid="add-employees-btn">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Empleados
              </Button>
            </div>

            {employees.length === 0 ? (
              <Card className="bg-zinc-800/30 border-zinc-700 border-dashed">
                <CardContent className="py-16 text-center">
                  <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Sin empleados</h3>
                  <p className="text-zinc-400 mb-6">Añade empleados para las simulaciones</p>
                  <Button onClick={() => setShowAddEmployeesModal(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir Empleados
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((employee) => (
                  <Card key={employee.id} className="bg-zinc-800/50 border-zinc-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {employee.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{employee.email}</p>
                          <p className="text-zinc-500 text-sm">{employee.department || 'Sin departamento'}</p>
                        </div>
                        {employee.clicked_count > 0 ? (
                          <UserX className="w-5 h-5 text-red-400" />
                        ) : (
                          <UserCheck className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <h2 className="text-xl font-bold text-white mb-4">Plantillas de Phishing</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {PHISHING_TEMPLATES.map((template) => (
                <Card key={template.id} className="bg-zinc-800/50 border-zinc-700 hover:border-red-500/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-red-400" />
                        <div>
                          <h3 className="text-white font-semibold">{template.name}</h3>
                          <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-400 mt-1">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs text-white ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty === 'easy' ? 'Fácil' : template.difficulty === 'medium' ? 'Media' : 'Difícil'}
                      </div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-3 mt-2">
                      <p className="text-xs text-zinc-500 mb-1">Asunto:</p>
                      <p className="text-sm text-white">{template.subject}</p>
                      <p className="text-xs text-zinc-500 mt-2 mb-1">Vista previa:</p>
                      <p className="text-sm text-zinc-400">{template.preview}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <h2 className="text-xl font-bold text-white mb-4">Análisis y Reportes</h2>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Reportes en desarrollo</h3>
                <p className="text-zinc-400">
                  Los reportes detallados estarán disponibles después de completar campañas
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Security Notice */}
        <Card className="mt-8 bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-700/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Uso Ético</h3>
                <p className="text-zinc-300 text-sm">
                  Esta herramienta está diseñada exclusivamente para entrenar a empleados de tu organización.
                  El uso para fines maliciosos está estrictamente prohibido y puede tener consecuencias legales.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Campaign Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <DialogHeader>
            <DialogTitle>Nueva Campaña de Phishing</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Configura una simulación de phishing para tu equipo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Nombre de la Campaña *</label>
              <Input
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="Ej: Simulación Q1 2026"
                className="bg-zinc-800 border-zinc-700"
                data-testid="campaign-name-input"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Plantilla *</label>
              <Select value={newCampaign.template_id} onValueChange={(v) => setNewCampaign({ ...newCampaign, template_id: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Selecciona una plantilla" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {PHISHING_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} - {template.difficulty === 'easy' ? 'Fácil' : template.difficulty === 'medium' ? 'Media' : 'Difícil'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Departamento objetivo</label>
              <Select value={newCampaign.target_department} onValueChange={(v) => setNewCampaign({ ...newCampaign, target_department: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all">Todos los empleados</SelectItem>
                  <SelectItem value="sales">Ventas</SelectItem>
                  <SelectItem value="finance">Finanzas</SelectItem>
                  <SelectItem value="hr">Recursos Humanos</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
            <Button onClick={createCampaign} className="bg-red-600 hover:bg-red-700" data-testid="save-campaign-btn">
              Crear Campaña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Employees Modal */}
      <Dialog open={showAddEmployeesModal} onOpenChange={setShowAddEmployeesModal}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <DialogHeader>
            <DialogTitle>Añadir Empleados</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Introduce los emails de los empleados (uno por línea)
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={bulkEmails}
            onChange={(e) => setBulkEmails(e.target.value)}
            placeholder="empleado1@empresa.com&#10;empleado2@empresa.com&#10;empleado3@empresa.com"
            className="bg-zinc-800 border-zinc-700 min-h-[150px]"
            data-testid="bulk-emails-input"
          />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddEmployeesModal(false)}>Cancelar</Button>
            <Button onClick={addEmployees} className="bg-blue-600 hover:bg-blue-700" data-testid="save-employees-btn">
              Añadir Empleados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhishingSimulation;
