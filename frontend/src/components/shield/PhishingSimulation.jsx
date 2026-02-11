/**
 * ManoProtect Shield - Phishing Simulation for Enterprises
 * Train employees with simulated phishing attacks
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, Send, Users, BarChart3, AlertTriangle, CheckCircle, 
  XCircle, Clock, Target, Shield, Loader2, Play, Pause,
  FileText, Download, TrendingUp, TrendingDown
} from 'lucide-react';

const TEMPLATES = [
  {
    id: 'it_password',
    name: 'Cambio de contraseña IT',
    difficulty: 'easy',
    description: 'Email del departamento IT solicitando cambio de contraseña',
    preview: 'Su contraseña expira en 24h. Haga clic aquí para renovarla.'
  },
  {
    id: 'ceo_urgent',
    name: 'Mensaje urgente del CEO',
    difficulty: 'medium',
    description: 'Email falso del CEO pidiendo transferencia urgente',
    preview: 'Necesito que hagas una transferencia urgente. Es confidencial.'
  },
  {
    id: 'invoice_payment',
    name: 'Factura pendiente',
    difficulty: 'medium',
    description: 'Factura falsa de un proveedor conocido',
    preview: 'Adjuntamos factura pendiente de pago. Vence mañana.'
  },
  {
    id: 'hr_benefits',
    name: 'Actualización de beneficios RRHH',
    difficulty: 'hard',
    description: 'Email de RRHH sobre actualización de beneficios',
    preview: 'Nuevos beneficios disponibles. Complete el formulario adjunto.'
  },
  {
    id: 'microsoft_alert',
    name: 'Alerta de seguridad Microsoft',
    difficulty: 'hard',
    description: 'Alerta falsa de Microsoft sobre actividad sospechosa',
    preview: 'Detectamos actividad inusual en su cuenta Microsoft 365.'
  }
];

const DEMO_SIMULATIONS = [
  {
    id: 1,
    name: 'Simulación Q1 2026',
    template: 'ceo_urgent',
    status: 'completed',
    date: '2026-01-15',
    total: 50,
    clicked: 12,
    reported: 28,
    no_action: 10
  },
  {
    id: 2,
    name: 'Test Departamento Ventas',
    template: 'invoice_payment',
    status: 'completed',
    date: '2026-02-01',
    total: 25,
    clicked: 5,
    reported: 15,
    no_action: 5
  }
];

const PhishingSimulation = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [simulations, setSimulations] = useState(DEMO_SIMULATIONS);
  const [newSimulation, setNewSimulation] = useState({
    name: '',
    template: 'it_password',
    emails: ''
  });
  const [creating, setCreating] = useState(false);
  const [selectedSim, setSelectedSim] = useState(null);

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return 'bg-emerald-100 text-emerald-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  const getDifficultyLabel = (diff) => {
    switch (diff) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Medio';
      case 'hard': return 'Difícil';
      default: return diff;
    }
  };

  const calculateRiskScore = (sim) => {
    return Math.round((sim.clicked / sim.total) * 100);
  };

  const handleCreateSimulation = async () => {
    setCreating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const emailList = newSimulation.emails.split(/[,\n]/).filter(e => e.trim());
    const newSim = {
      id: Date.now(),
      name: newSimulation.name,
      template: newSimulation.template,
      status: 'scheduled',
      date: new Date().toISOString().split('T')[0],
      total: emailList.length,
      clicked: 0,
      reported: 0,
      no_action: emailList.length
    };
    
    setSimulations([newSim, ...simulations]);
    setNewSimulation({ name: '', template: 'it_password', emails: '' });
    setCreating(false);
    setActiveTab('dashboard');
  };

  // Calculate overall stats
  const totalEmployees = simulations.reduce((acc, s) => acc + s.total, 0);
  const totalClicked = simulations.reduce((acc, s) => acc + s.clicked, 0);
  const totalReported = simulations.reduce((acc, s) => acc + s.reported, 0);
  const avgClickRate = totalEmployees > 0 ? Math.round((totalClicked / totalEmployees) * 100) : 0;
  const avgReportRate = totalEmployees > 0 ? Math.round((totalReported / totalEmployees) * 100) : 0;

  return (
    <Card className="border-indigo-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Simulacro de Phishing</CardTitle>
              <CardDescription>
                Entrena a tus empleados con ataques simulados
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-indigo-600">Enterprise</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b pb-4">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('dashboard')}
            className={activeTab === 'dashboard' ? 'bg-indigo-600' : ''}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === 'create' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('create')}
            className={activeTab === 'create' ? 'bg-indigo-600' : ''}
          >
            <Send className="w-4 h-4 mr-2" />
            Nuevo Simulacro
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('history')}
            className={activeTab === 'history' ? 'bg-indigo-600' : ''}
          >
            <FileText className="w-4 h-4 mr-2" />
            Historial
          </Button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="bg-zinc-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-zinc-900">{simulations.length}</p>
                <p className="text-sm text-zinc-500">Simulacros</p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-zinc-900">{totalEmployees}</p>
                <p className="text-sm text-zinc-500">Empleados testeados</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-red-600">{avgClickRate}%</p>
                <p className="text-sm text-zinc-500">Tasa de clic</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-emerald-600">{avgReportRate}%</p>
                <p className="text-sm text-zinc-500">Tasa de reporte</p>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 rounded-lg p-6">
              <h4 className="font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Evaluación de Riesgo
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Empleados que hacen clic en phishing</span>
                    <span className={avgClickRate > 20 ? 'text-red-600 font-bold' : 'text-emerald-600'}>{avgClickRate}%</span>
                  </div>
                  <Progress value={avgClickRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Empleados que reportan phishing</span>
                    <span className={avgReportRate > 50 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>{avgReportRate}%</span>
                  </div>
                  <Progress value={avgReportRate} className="h-2" />
                </div>
              </div>
              
              <div className={`mt-4 p-3 rounded-lg ${avgClickRate > 20 ? 'bg-red-100' : 'bg-emerald-100'}`}>
                <p className={`font-medium ${avgClickRate > 20 ? 'text-red-700' : 'text-emerald-700'}`}>
                  {avgClickRate > 20 
                    ? '⚠️ Nivel de riesgo ALTO - Se recomienda formación adicional'
                    : '✅ Nivel de riesgo BAJO - Buen nivel de concienciación'}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="font-semibold text-zinc-800 mb-3">Actividad Reciente</h4>
              {simulations.length === 0 ? (
                <div className="text-center py-8 bg-zinc-50 rounded-lg">
                  <Target className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
                  <p className="text-zinc-600">No hay simulacros todavía</p>
                  <Button 
                    className="mt-3 bg-indigo-600"
                    onClick={() => setActiveTab('create')}
                  >
                    Crear primer simulacro
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {simulations.slice(0, 3).map(sim => (
                    <div key={sim.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-indigo-500" />
                        <div>
                          <p className="font-medium text-zinc-800">{sim.name}</p>
                          <p className="text-xs text-zinc-500">{sim.date} • {sim.total} empleados</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-sm font-bold ${calculateRiskScore(sim) > 20 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {calculateRiskScore(sim)}% clics
                          </p>
                        </div>
                        <Badge variant="outline">{sim.status === 'completed' ? 'Completado' : 'Programado'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Nombre del simulacro</label>
              <Input
                placeholder="Ej: Test Q1 2026 - Departamento Finanzas"
                value={newSimulation.name}
                onChange={(e) => setNewSimulation({...newSimulation, name: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Plantilla de ataque</label>
              <div className="grid sm:grid-cols-2 gap-3">
                {TEMPLATES.map(template => (
                  <div
                    key={template.id}
                    onClick={() => setNewSimulation({...newSimulation, template: template.id})}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      newSimulation.template === template.id 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-zinc-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-zinc-900">{template.name}</h5>
                      <Badge className={getDifficultyColor(template.difficulty)}>
                        {getDifficultyLabel(template.difficulty)}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-600 mb-2">{template.description}</p>
                    <p className="text-xs text-zinc-400 italic">"{template.preview}"</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Emails de empleados (uno por línea o separados por coma)
              </label>
              <textarea
                className="w-full p-3 border rounded-lg min-h-[120px] text-sm"
                placeholder="empleado1@empresa.com&#10;empleado2@empresa.com&#10;empleado3@empresa.com"
                value={newSimulation.emails}
                onChange={(e) => setNewSimulation({...newSimulation, emails: e.target.value})}
              />
              <p className="text-xs text-zinc-500 mt-1">
                {newSimulation.emails.split(/[,\n]/).filter(e => e.trim()).length} emails detectados
              </p>
            </div>

            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                <strong>Importante:</strong> Los empleados recibirán un email de prueba. 
                Si hacen clic, serán redirigidos a una página de formación.
              </p>
            </div>

            <Button
              onClick={handleCreateSimulation}
              disabled={!newSimulation.name || !newSimulation.emails || creating}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Programando simulacro...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Lanzar Simulacro
                </>
              )}
            </Button>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {simulations.length === 0 ? (
              <div className="text-center py-12 bg-zinc-50 rounded-lg">
                <FileText className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
                <p className="text-zinc-600">No hay simulacros en el historial</p>
              </div>
            ) : (
              simulations.map(sim => {
                const clickRate = calculateRiskScore(sim);
                const reportRate = Math.round((sim.reported / sim.total) * 100);
                
                return (
                  <div key={sim.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-zinc-900">{sim.name}</h4>
                        <p className="text-sm text-zinc-500">
                          {sim.date} • Plantilla: {TEMPLATES.find(t => t.id === sim.template)?.name}
                        </p>
                      </div>
                      <Badge variant={sim.status === 'completed' ? 'default' : 'outline'}>
                        {sim.status === 'completed' ? 'Completado' : 'En curso'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="bg-zinc-50 rounded p-3">
                        <p className="text-2xl font-bold text-zinc-900">{sim.total}</p>
                        <p className="text-xs text-zinc-500">Total</p>
                      </div>
                      <div className="bg-red-50 rounded p-3">
                        <p className="text-2xl font-bold text-red-600">{sim.clicked}</p>
                        <p className="text-xs text-zinc-500">Clics ({clickRate}%)</p>
                      </div>
                      <div className="bg-emerald-50 rounded p-3">
                        <p className="text-2xl font-bold text-emerald-600">{sim.reported}</p>
                        <p className="text-xs text-zinc-500">Reportes ({reportRate}%)</p>
                      </div>
                      <div className="bg-zinc-50 rounded p-3">
                        <p className="text-2xl font-bold text-zinc-600">{sim.no_action}</p>
                        <p className="text-xs text-zinc-500">Sin acción</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar Informe
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 pt-4 border-t text-xs text-zinc-500 text-center">
          <p>Los simulacros ayudan a reducir el riesgo de phishing real hasta en un 90%</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhishingSimulation;
