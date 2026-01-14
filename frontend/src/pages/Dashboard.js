import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Shield, Search, AlertTriangle, CheckCircle, Clock, Phone, MessageSquare, Mail, Link as LinkIcon, ArrowLeft, TrendingUp, Users, User, Book, Download, Share2, Flag, Building2, Heart, Settings, Bell, LogOut, Brain, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import NotificationCenter from '@/components/NotificationCenter';
import PushNotificationToggle from '@/components/PushNotificationToggle';
import ThreatAnalyzer from '@/components/ThreatAnalyzer';
import BankingDashboard from '@/components/BankingDashboard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('phone');
  const [threats, setThreats] = useState([]);
  const [stats, setStats] = useState(null);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze', 'banking', 'history'

  useEffect(() => {
    loadThreats();
    loadStats();
  }, []);

  const loadThreats = async () => {
    try {
      const response = await fetch(`${API}/threats`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setThreats(data);
      }
    } catch (error) {
      console.error('Error loading threats:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API}/stats`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
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
      const response = await fetch(`${API}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: content.trim(),
          content_type: contentType
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLastAnalysis(data);
        
        if (data.is_threat) {
          toast.error(`⚠️ AMENAZA DETECTADA: ${data.risk_level.toUpperCase()}`);
        } else {
          toast.success('✓ Contenido seguro');
        }

        loadThreats();
        loadStats();
        setContent('');
      } else {
        toast.error('Error al analizar el contenido');
      }
    } catch (error) {
      console.error('Error analyzing:', error);
      toast.error('Error al analizar el contenido');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast.success('Sesión cerrada');
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

  const shareThreat = async (threatId) => {
    try {
      const response = await fetch(`${API}/threats/${threatId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ threat_id: threatId, share_type: 'link' })
      });
      if (response.ok) {
        const data = await response.json();
        await navigator.clipboard.writeText(data.share_text || 'Alerta de seguridad MANO');
        toast.success('Contenido copiado al portapapeles');
      }
    } catch (error) {
      toast.error('Error al compartir amenaza');
    }
  };

  const reportFalsePositive = async (threatId) => {
    try {
      const response = await fetch(`${API}/threats/${threatId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ threat_id: threatId, reason: 'Falso positivo reportado por usuario' })
      });
      if (response.ok) {
        toast.success('Falso positivo reportado. Gracias por tu feedback.');
        loadThreats();
      }
    } catch (error) {
      toast.error('Error al reportar');
    }
  };

  const exportThreats = async () => {
    try {
      const response = await fetch(`${API}/export/threats?format=csv`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([data.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename || `mano-threats-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Historial exportado correctamente');
      }
    } catch (error) {
      toast.error('Error al exportar historial');
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
              <img src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" alt="MANO Logo" className="h-7 w-auto" />
              <span className="text-xl font-bold">MANO Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                data-testid="admin-panel-btn"
                variant="ghost"
                onClick={() => navigate('/admin')}
                className="rounded-lg text-red-600 hover:bg-red-50"
              >
                <Settings className="w-5 h-5 mr-2" />
                Admin
              </Button>
            )}
            <Button
              data-testid="enterprise-btn"
              variant="ghost"
              onClick={() => navigate('/enterprise')}
              className="rounded-lg hover:bg-indigo-50 hover:text-indigo-700"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Empresas
            </Button>
            <Button
              data-testid="family-admin-btn"
              variant="ghost"
              onClick={() => navigate('/family-admin')}
              className="rounded-lg hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Heart className="w-5 h-5 mr-2" />
              Familia
            </Button>
            <Button
              data-testid="contacts-btn"
              variant="ghost"
              onClick={() => navigate('/contacts')}
              className="rounded-lg"
            >
              <Phone className="w-5 h-5 mr-2" />
              Contactos
            </Button>
            <Button
              data-testid="knowledge-btn"
              variant="ghost"
              onClick={() => navigate('/knowledge')}
              className="rounded-lg"
            >
              <Book className="w-5 h-5 mr-2" />
              Aprende
            </Button>
            <PushNotificationToggle variant="compact" />
            <NotificationCenter />
            <Button
              data-testid="profile-btn"
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="rounded-lg"
            >
              <User className="w-5 h-5" />
            </Button>
            <Badge className={`${user?.plan?.includes('family') ? 'bg-emerald-600' : user?.plan !== 'free' ? 'bg-indigo-600' : 'bg-zinc-500'} text-white px-3 py-1`}>
              {user?.plan?.includes('family') ? 'Familiar' : user?.plan !== 'free' ? 'Premium' : 'Gratis'}
            </Badge>
            <Button
              data-testid="logout-btn"
              variant="ghost"
              onClick={handleLogout}
              className="rounded-lg text-zinc-600 hover:text-red-600"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">Hola, {user?.name || 'Usuario'}</h1>
          <p className="text-zinc-600">Tu protección está activa. Analiza contenido sospechoso abajo.</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="card-hover border-zinc-200 bg-white">
              <CardHeader className="pb-3">
                <CardDescription>Total Analizados</CardDescription>
                <CardTitle className="text-3xl text-indigo-600">{stats.total_analyzed}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="card-hover border-zinc-200 bg-white">
              <CardHeader className="pb-3">
                <CardDescription>Amenazas Bloqueadas</CardDescription>
                <CardTitle className="text-3xl text-rose-600">{stats.threats_blocked}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="card-hover border-zinc-200 bg-white">
              <CardHeader className="pb-3">
                <CardDescription>Críticas</CardDescription>
                <CardTitle className="text-3xl text-orange-500">{stats.risk_distribution?.critical || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="card-hover border-zinc-200 bg-white">
              <CardHeader className="pb-3">
                <CardDescription>Altas</CardDescription>
                <CardTitle className="text-3xl text-yellow-600">{stats.risk_distribution?.high || 0}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-zinc-200 pb-4">
          <Button
            data-testid="tab-analyze"
            variant={activeTab === 'analyze' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('analyze')}
            className={activeTab === 'analyze' ? 'bg-indigo-600' : ''}
          >
            <Brain className="w-4 h-4 mr-2" />
            Analizador IA
          </Button>
          <Button
            data-testid="tab-banking"
            variant={activeTab === 'banking' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('banking')}
            className={activeTab === 'banking' ? 'bg-indigo-600' : ''}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Banca Segura
          </Button>
          <Button
            data-testid="tab-history"
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('history')}
            className={activeTab === 'history' ? 'bg-indigo-600' : ''}
          >
            <Clock className="w-4 h-4 mr-2" />
            Historial
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'analyze' && (
          <ThreatAnalyzer />
        )}

        {activeTab === 'banking' && (
          <BankingDashboard />
        )}

        {activeTab === 'history' && (
          <>
        {/* Original Analyzer */}
        <Card className="mb-8 border-zinc-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Análisis Rápido
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
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Historial de Amenazas
                </CardTitle>
                <CardDescription>
                  Últimas {threats.length} amenazas detectadas
                </CardDescription>
              </div>
              {threats.length > 0 && (
                <Button
                  data-testid="export-threats-btn"
                  onClick={exportThreats}
                  variant="outline"
                  className="border-zinc-300 hover:bg-zinc-50 rounded-lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              )}
            </div>
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
                      <p className="text-sm text-zinc-800 font-medium mb-3">{threat.recommendation}</p>
                      <div className="flex gap-2">
                        <Button
                          data-testid={`share-threat-${idx}`}
                          variant="outline"
                          size="sm"
                          onClick={() => shareThreat(threat.id)}
                          className="border-zinc-300 hover:bg-zinc-50 rounded-lg"
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          Compartir
                        </Button>
                        {!threat.reported_false_positive && (
                          <Button
                            data-testid={`report-threat-${idx}`}
                            variant="outline"
                            size="sm"
                            onClick={() => reportFalsePositive(threat.id)}
                            className="border-zinc-300 hover:bg-zinc-50 rounded-lg"
                          >
                            <Flag className="w-4 h-4 mr-1" />
                            Falso positivo
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;