import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Search, AlertTriangle, CheckCircle, Clock, Phone, MessageSquare, Mail, Link as LinkIcon, ArrowLeft, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('phone');
  const [threats, setThreats] = useState([]);
  const [stats, setStats] = useState(null);
  const [lastAnalysis, setLastAnalysis] = useState(null);

  useEffect(() => {
    loadThreats();
    loadStats();
  }, []);

  const loadThreats = async () => {
    try {
      const response = await axios.get(`${API}/threats?user_id=demo-user`);
      setThreats(response.data);
    } catch (error) {
      console.error('Error loading threats:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/stats?user_id=demo-user`);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const analyzeContent = async () => {
    if (!content.trim()) {
      toast.error('Por favor ingresa contenido para analizar');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await axios.post(`${API}/analyze`, {
        content: content.trim(),
        content_type: contentType,
        user_id: 'demo-user'
      });

      setLastAnalysis(response.data);
      
      if (response.data.is_threat) {
        toast.error(`⚠️ AMENAZA DETECTADA: ${response.data.risk_level.toUpperCase()}`);
      } else {
        toast.success('✓ Contenido seguro');
      }

      loadThreats();
      loadStats();
      setContent('');
    } catch (error) {
      console.error('Error analyzing:', error);
      toast.error('Error al analizar el contenido');
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'critical': return 'bg-rose-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-emerald-500 text-white';
      default: return 'bg-zinc-500 text-white';
    }
  };

  const getContentIcon = (type) => {
    switch(type) {
      case 'phone': return Phone;
      case 'sms': return MessageSquare;
      case 'email': return Mail;
      case 'url': return LinkIcon;
      default: return Shield;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-to-landing-btn"
              variant="ghost"
              onClick={() => navigate('/')}
              className="rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-indigo-600" />
              <span className="text-xl font-bold">MANO Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500 text-white px-3 py-1">Plan Gratis</Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="card-hover border-zinc-200">
              <CardHeader className="pb-3">
                <CardDescription>Total Analizados</CardDescription>
                <CardTitle className="text-3xl text-indigo-600">{stats.total_analyzed}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="card-hover border-zinc-200">
              <CardHeader className="pb-3">
                <CardDescription>Amenazas Bloqueadas</CardDescription>
                <CardTitle className="text-3xl text-rose-600">{stats.threats_blocked}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="card-hover border-zinc-200">
              <CardHeader className="pb-3">
                <CardDescription>Críticas</CardDescription>
                <CardTitle className="text-3xl text-orange-500">{stats.risk_distribution.critical}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="card-hover border-zinc-200">
              <CardHeader className="pb-3">
                <CardDescription>Altas</CardDescription>
                <CardTitle className="text-3xl text-yellow-600">{stats.risk_distribution.high}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Analyzer */}
        <Card className="mb-8 border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Analizar Contenido en Tiempo Real
            </CardTitle>
            <CardDescription>
              Introduce un número de teléfono, mensaje, correo o enlace para verificar si es una amenaza
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'phone', label: 'Teléfono', icon: Phone },
                  { value: 'sms', label: 'SMS', icon: MessageSquare },
                  { value: 'email', label: 'Email', icon: Mail },
                  { value: 'url', label: 'Enlace', icon: LinkIcon }
                ].map((type) => (
                  <Button
                    key={type.value}
                    data-testid={`content-type-${type.value}`}
                    variant={contentType === type.value ? 'default' : 'outline'}
                    onClick={() => setContentType(type.value)}
                    className={`rounded-lg active:scale-95 transition-all ${
                      contentType === type.value ? 'bg-indigo-600 text-white' : 'border-zinc-300'
                    }`}
                  >
                    <type.icon className="w-4 h-4 mr-2" />
                    {type.label}
                  </Button>
                ))}
              </div>

              <div className="flex gap-3">
                <Input
                  data-testid="analyze-input"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Ej: ${contentType === 'phone' ? '+34 666 123 456' : contentType === 'url' ? 'https://ejemplo.com' : 'Contenido a analizar...'}`}
                  className="h-12 bg-zinc-50 border-zinc-200 focus:ring-2 focus:ring-indigo-500/20 rounded-lg"
                  onKeyDown={(e) => e.key === 'Enter' && analyzeContent()}
                />
                <Button
                  data-testid="analyze-btn"
                  onClick={analyzeContent}
                  disabled={analyzing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-8 h-12 shadow-sm active:scale-95 transition-all"
                >
                  {analyzing ? 'Analizando...' : 'Analizar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Analysis Result */}
        {lastAnalysis && (
          <Card className={`mb-8 border-2 ${
            lastAnalysis.is_threat ? 'border-rose-300 bg-rose-50' : 'border-emerald-300 bg-emerald-50'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {lastAnalysis.is_threat ? (
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                )}
                {lastAnalysis.is_threat ? 'AMENAZA DETECTADA' : 'CONTENIDO SEGURO'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge className={getRiskColor(lastAnalysis.risk_level)}>
                  Nivel: {lastAnalysis.risk_level.toUpperCase()}
                </Badge>
              </div>
              
              {lastAnalysis.threat_types.length > 0 && (
                <div>
                  <div className="text-sm font-semibold mb-2">Tipos de amenaza:</div>
                  <div className="flex flex-wrap gap-2">
                    {lastAnalysis.threat_types.map((type, idx) => (
                      <Badge key={idx} variant="outline" className="border-rose-300 text-rose-700">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-semibold mb-2">Recomendación:</div>
                <p className="text-sm text-zinc-700">{lastAnalysis.recommendation}</p>
              </div>

              <div>
                <div className="text-sm font-semibold mb-2">Análisis:</div>
                <p className="text-sm text-zinc-700">{lastAnalysis.analysis}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Threats History */}
        <Card className="border-zinc-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Historial de Amenazas
            </CardTitle>
            <CardDescription>
              Últimas {threats.length} amenazas detectadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {threats.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay amenazas detectadas aún. ¡Estás protegido!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {threats.map((threat, idx) => {
                  const ContentIcon = getContentIcon(threat.content_type);
                  return (
                    <div
                      key={threat.id || idx}
                      data-testid={`threat-item-${idx}`}
                      className="p-4 rounded-lg border border-zinc-200 bg-white hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                            <ContentIcon className="w-5 h-5 text-zinc-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{threat.content_type.toUpperCase()}</div>
                            <div className="text-xs text-zinc-500">
                              {new Date(threat.created_at).toLocaleString('es-ES')}
                            </div>
                          </div>
                        </div>
                        <Badge className={getRiskColor(threat.risk_level)}>
                          {threat.risk_level}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-600 mb-2 line-clamp-2">{threat.content}</p>
                      <p className="text-sm text-zinc-800 font-medium">{threat.recommendation}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;