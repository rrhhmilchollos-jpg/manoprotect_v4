import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Shield, TrendingUp, Users, Building2, ArrowLeft, AlertTriangle, 
  CheckCircle, DollarSign, BarChart3, PieChart, Calendar, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const EnterpriseDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch(`${API}/enterprise/dashboard`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      } else {
        toast.error('Error al cargar dashboard');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    toast.info('Generando informe...');
    try {
      const response = await fetch(`${API}/enterprise/reports?period=${period}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const reportData = await response.json();
        // Create downloadable JSON
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mano_enterprise_report_${period}.json`;
        a.click();
        toast.success('Informe descargado');
      }
    } catch (error) {
      toast.error('Error al generar informe');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const riskColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500'
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <header className="bg-zinc-800 border-b border-zinc-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-indigo-500" />
              <div>
                <span className="text-xl font-bold">Dashboard Empresarial</span>
                <p className="text-sm text-zinc-400">Análisis avanzado de seguridad</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportReport} className="bg-indigo-600 hover:bg-indigo-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-800 border-zinc-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{data?.summary?.total_analyzed || 0}</div>
                  <div className="text-sm text-zinc-400">Análisis Totales</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-800 border-zinc-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{data?.summary?.threats_blocked || 0}</div>
                  <div className="text-sm text-zinc-400">Amenazas Bloqueadas</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-800 border-zinc-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{data?.summary?.protection_rate || 100}%</div>
                  <div className="text-sm text-zinc-400">Tasa de Protección</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-800 border-zinc-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold">€{(data?.summary?.money_saved || 0).toLocaleString()}</div>
                  <div className="text-sm text-zinc-400">Dinero Ahorrado</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Risk Distribution */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <PieChart className="w-5 h-5 text-indigo-500" />
                Distribución de Riesgos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data?.risk_distribution || {}).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${riskColors[level]}`}></div>
                      <span className="capitalize">{level === 'critical' ? 'Crítico' : level === 'high' ? 'Alto' : level === 'medium' ? 'Medio' : 'Bajo'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{count}</span>
                      <div className={`h-2 rounded-full ${riskColors[level]}`} style={{width: `${Math.max(count * 10, 20)}px`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Threat Types */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Tipos de Amenazas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data?.threat_types || {}).slice(0, 5).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-zinc-300">{type}</span>
                    <Badge className="bg-indigo-600">{count}</Badge>
                  </div>
                ))}
                {Object.keys(data?.threat_types || {}).length === 0 && (
                  <p className="text-zinc-500 text-center py-4">Sin amenazas detectadas</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Employees */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5 text-indigo-500" />
                Empleados Protegidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-indigo-500">{data?.summary?.active_employees || 0}</div>
                <div className="text-zinc-400">Total Empleados</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  <div className="text-xl font-bold text-emerald-500">98%</div>
                  <div className="text-xs text-zinc-400">Compliance</div>
                </div>
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  <div className="text-xl font-bold text-amber-500">2</div>
                  <div className="text-xs text-zinc-400">Alertas Activas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Departments */}
        <Card className="bg-zinc-800 border-zinc-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Seguridad por Departamento</CardTitle>
            <CardDescription className="text-zinc-400">Análisis de riesgo por área de la empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {(data?.departments || []).map((dept) => (
                <div key={dept.name} className="bg-zinc-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{dept.name}</span>
                    <Badge className={dept.risk_score > 4 ? 'bg-red-600' : dept.risk_score > 3 ? 'bg-amber-600' : 'bg-emerald-600'}>
                      {dept.risk_score.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="text-sm text-zinc-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Empleados:</span>
                      <span className="text-white">{dept.employee_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amenazas:</span>
                      <span className="text-white">{dept.threats_blocked}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Tendencia de Amenazas (30 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end gap-1">
              {(data?.trend_data || []).map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-indigo-600 rounded-t transition-all hover:bg-indigo-500"
                    style={{height: `${Math.max(day.threats * 20, 4)}px`}}
                    title={`${day.date}: ${day.threats} amenazas`}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-zinc-500">
              <span>Hace 30 días</span>
              <span>Hoy</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnterpriseDashboard;
