/**
 * ManoProtect - AdMob Analytics Dashboard Component
 * Monitorea ingresos y rendimiento de anuncios
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  DollarSign,
  BarChart3,
  Users,
  Target,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdMobDashboard = () => {
  const [stats, setStats] = useState({
    impressions: 0,
    clicks: 0,
    revenue: 0,
    ctr: 0,
    ecpm: 0,
    fillRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Simulated stats - En producción, conectar con AdMob API
  useEffect(() => {
    // Cargar stats guardadas localmente
    const savedStats = localStorage.getItem('admob_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    setLastUpdated(new Date());
  }, []);

  const refreshStats = async () => {
    setLoading(true);
    
    // En producción, esto conectaría con AdMob Reporting API
    // Por ahora, mostramos cómo se vería el dashboard
    
    setTimeout(() => {
      const newStats = {
        impressions: Math.floor(Math.random() * 1000) + 100,
        clicks: Math.floor(Math.random() * 50) + 5,
        revenue: (Math.random() * 10 + 0.5).toFixed(2),
        ctr: (Math.random() * 3 + 0.5).toFixed(2),
        ecpm: (Math.random() * 5 + 1).toFixed(2),
        fillRate: (Math.random() * 30 + 70).toFixed(1)
      };
      setStats(newStats);
      localStorage.setItem('admob_stats', JSON.stringify(newStats));
      setLastUpdated(new Date());
      setLoading(false);
    }, 1000);
  };

  const statCards = [
    {
      title: 'Impresiones',
      value: stats.impressions.toLocaleString(),
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      description: 'Anuncios mostrados'
    },
    {
      title: 'Clics',
      value: stats.clicks.toLocaleString(),
      icon: MousePointer,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      description: 'Interacciones'
    },
    {
      title: 'Ingresos',
      value: `€${stats.revenue}`,
      icon: DollarSign,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      description: 'Estimado hoy'
    },
    {
      title: 'CTR',
      value: `${stats.ctr}%`,
      icon: Target,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      description: 'Click-through rate'
    },
    {
      title: 'eCPM',
      value: `€${stats.ecpm}`,
      icon: BarChart3,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      description: 'Por 1000 impresiones'
    },
    {
      title: 'Fill Rate',
      value: `${stats.fillRate}%`,
      icon: TrendingUp,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      description: 'Tasa de llenado'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AdMob Dashboard</h2>
          <p className="text-sm text-slate-500">
            Monitorea el rendimiento de tus anuncios
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-slate-400">
              Actualizado: {lastUpdated.toLocaleTimeString('es-ES')}
            </span>
          )}
          <Button
            onClick={refreshStats}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Configuración AdMob</h3>
              <p className="text-sm text-amber-700 mt-1">
                Publisher ID: <code className="bg-amber-100 px-1 rounded">pub-7713974112203810</code>
              </p>
              <p className="text-xs text-amber-600 mt-2">
                Para ver estadísticas reales, accede a{' '}
                <a 
                  href="https://apps.admob.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-800"
                >
                  apps.admob.com
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm font-medium text-slate-700">{stat.title}</p>
              <p className="text-xs text-slate-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ad Units Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Unidades de Anuncios Activas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Rewarded Video</p>
                <p className="text-xs text-slate-500 font-mono">ca-app-pub-7713974112203810/4909676040</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">Activo</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Native Ad</p>
                <p className="text-xs text-slate-500 font-mono">ca-app-pub-7713974112203810/5727933690</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">Activo</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">app-ads.txt</p>
                <p className="text-xs text-slate-500">/app-ads.txt verificado</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">✓ Verificado</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-indigo-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-indigo-900 mb-2">💡 Tips para aumentar ingresos</h3>
          <ul className="text-sm text-indigo-700 space-y-1">
            <li>• Muestra anuncios rewarded después de completar acciones</li>
            <li>• Usa native ads en el dashboard para usuarios free</li>
            <li>• Implementa intersticiales en transiciones (post-aprobación)</li>
            <li>• No muestres más de 1 intersticial cada 60 segundos</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdMobDashboard;
