import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, AlertTriangle, TrendingUp, Clock, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Community = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunityAlerts();
    const interval = setInterval(loadCommunityAlerts, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadCommunityAlerts = async () => {
    try {
      const response = await axios.get(`${API}/community-alerts?limit=20`);
      setAlerts(response.data);
    } catch (error) {
      console.error('Error loading community alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-rose-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-emerald-500 text-white';
      default: return 'bg-zinc-500 text-white';
    }
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays}d`;
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-btn"
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-indigo-600" />
              <span className="text-xl font-bold">Alertas Comunitarias</span>
            </div>
          </div>
          <Badge className="bg-emerald-500 text-white px-3 py-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              En vivo
            </div>
          </Badge>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Info Card */}
        <Card className="mb-8 bg-indigo-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Users className="w-6 h-6" />
              Red de Protección Colaborativa
            </CardTitle>
            <CardDescription className="text-indigo-700">
              Amenazas detectadas recientemente por la comunidad MANO. Manténte alerta y protégete.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white border-zinc-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-rose-600">{alerts.length}</div>
                  <div className="text-sm text-zinc-600">Alertas Activas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-zinc-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {alerts.reduce((sum, a) => sum + a.affected_users, 0)}
                  </div>
                  <div className="text-sm text-zinc-600">Usuarios Protegidos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-zinc-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">99.8%</div>
                  <div className="text-sm text-zinc-600">Precisión</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {loading ? (
            <Card className="bg-white border-zinc-200">
              <CardContent className="py-12 text-center">
                <Shield className="w-12 h-12 mx-auto mb-3 text-zinc-400 animate-pulse" />
                <p className="text-zinc-500">Cargando alertas...</p>
              </CardContent>
            </Card>
          ) : alerts.length === 0 ? (
            <Card className="bg-white border-zinc-200">
              <CardContent className="py-12 text-center">
                <Shield className="w-12 h-12 mx-auto mb-3 text-zinc-400" />
                <p className="text-zinc-500">No hay alertas recientes</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert, idx) => (
              <Card
                key={alert.id || idx}
                data-testid={`alert-item-${idx}`}
                className="bg-white border-zinc-200 hover:border-indigo-200 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-rose-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{alert.threat_type}</div>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                          <Clock className="w-4 h-4" />
                          {getRelativeTime(alert.created_at)}
                        </div>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-zinc-700 mb-3">{alert.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-zinc-600">
                      <Users className="w-4 h-4" />
                      <span>{alert.affected_users} usuarios afectados</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/dashboard')}
                      className="text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    >
                      Verificar contenido similar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;