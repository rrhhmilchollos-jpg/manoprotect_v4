import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/i18n/I18nContext';
import { Shield, Search, AlertTriangle, CheckCircle, Clock, Phone, MessageSquare, Mail, Link as LinkIcon, ArrowLeft, TrendingUp, Users, User, Book, Download, Share2, Flag, Building2, Heart, Settings, Bell, LogOut, Brain, MapPin, Trophy, Megaphone, Package, Truck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import NotificationCenter from '@/components/NotificationCenter';
import NotificationBell from '@/components/NotificationBell';
import PushNotificationToggle from '@/components/PushNotificationToggle';
import ThreatAnalyzer from '@/components/ThreatAnalyzer';
import AlertSubscription from '@/components/AlertSubscription';
import { SubscriptionBadge, SubscriptionBadgeCard } from '@/components/SubscriptionBadge';
import NativeAdBanner from '@/components/ads/NativeAdBanner';
import LiveLocationMap from '@/components/LiveLocationMap';
import ReviewForm from '@/components/ReviewForm';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin, isInvestor, logout } = useAuth();
  const { t } = useI18n();
  const [analyzing, setAnalyzing] = useState(false);
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('phone');
  const [threats, setThreats] = useState([]);
  const [stats, setStats] = useState(null);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'analyze'); // 'analyze', 'banking', 'history', 'pedidos'
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    loadThreats();
    loadStats();
    loadRecentAlerts();
    loadUserOrders();
  }, []);
  
  // Check URL params for tab navigation
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const loadUserOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch(`${API}/payments/orders/my-orders`, { 
        credentials: 'include' 
      });
      if (response.ok) {
        const data = await response.json();
        setUserOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadRecentAlerts = async () => {
    try {
      const response = await fetch(`${API}/alerts/history?limit=5`);
      if (response.ok) {
        const data = await response.json();
        setRecentAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

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
      toast.error(t('scamVerifier.enterContent'));
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
          toast.error(`⚠️ ${t('dashboard.threatDetected')}: ${data.risk_level.toUpperCase()}`);
        } else {
          toast.success(`✓ ${t('dashboard.safeContent')}`);
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
              <img src="/manoprotect_logo.webp" alt="ManoProtect Logo" className="h-7 w-auto" />
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
            {isInvestor && (
              <Button
                data-testid="investor-downloads-btn"
                variant="ghost"
                onClick={() => navigate('/downloads')}
                className="rounded-lg text-amber-600 hover:bg-amber-50"
              >
                <Download className="w-5 h-5 mr-2" />
                Descargas
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
            <Button
              data-testid="rewards-btn"
              variant="ghost"
              onClick={() => navigate('/rewards')}
              className="rounded-lg hover:bg-yellow-50 hover:text-yellow-700"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Recompensas
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
            <SubscriptionBadge plan={user?.plan || 'free'} size="small" showName={false} />
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
        {/* Welcome with Badge */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Hola, {user?.name || 'Usuario'}</h1>
            <p className="text-zinc-600">Tu protección está activa. Analiza contenido sospechoso abajo.</p>
          </div>
          <div className="flex items-center gap-3">
            <SubscriptionBadge plan={user?.plan || 'free'} size="large" />
            {user?.plan === 'free' && (
              <Button
                onClick={() => navigate('/pricing')}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Mejorar Plan
              </Button>
            )}
          </div>
        </div>

        {/* Shield Quick Access Banner */}
        <div 
          onClick={() => navigate('/shield')}
          className="mb-8 p-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl cursor-pointer hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <h3 className="font-bold text-lg">ManoProtect Shield</h3>
                <p className="text-white/80 text-sm">Verificador Universal, Escudo de Voz AI, DNA Digital y más</p>
              </div>
            </div>
            <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-white/90 group-hover:scale-105 transition-transform">
              Acceder
            </Button>
          </div>
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

        {/* Recent Community Alerts */}
        {recentAlerts.length > 0 && (
          <Card className="mb-8 border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-red-500" />
                  <CardTitle className="text-lg">Alertas de Seguridad Recientes</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/knowledge')}
                  className="text-zinc-600"
                >
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.slice(0, 3).map((alert, idx) => (
                  <div key={alert.id || idx} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg">
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                      alert.risk_level === 'alto' ? 'bg-red-500' : 
                      alert.risk_level === 'medio' ? 'bg-amber-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {alert.threat_type}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          {new Date(alert.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm text-zinc-900 line-clamp-1">{alert.title}</h4>
                      <p className="text-xs text-zinc-600 line-clamp-1">{alert.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Native Ad Banner */}
        {user?.plan === 'free' && (
          <div className="mb-8">
            <NativeAdBanner position="dashboard" />
          </div>
        )}

        {/* Investor Access Banner */}
        {isInvestor && (
          <Card className="mb-8 border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                    <Download className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                      Acceso de Inversor Verificado
                      <Badge className="bg-amber-600 text-white">ACTIVO</Badge>
                    </h3>
                    <p className="text-amber-700">
                      Tienes acceso a la documentación confidencial: Plan de Negocio, Modelo Financiero, Pitch Deck y Dossier B2B.
                    </p>
                  </div>
                </div>
                <Button
                  data-testid="investor-banner-downloads-btn"
                  onClick={() => navigate('/downloads')}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 h-auto"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Ir a Descargas
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-zinc-200 pb-4 flex-wrap">
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
            data-testid="tab-pedidos"
            variant={activeTab === 'pedidos' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('pedidos')}
            className={activeTab === 'pedidos' ? 'bg-red-600' : ''}
          >
            <Package className="w-4 h-4 mr-2" />
            Mis Pedidos
          </Button>
          <Button
            data-testid="tab-family"
            variant={activeTab === 'family' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('family')}
            className={activeTab === 'family' ? 'bg-indigo-600' : ''}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Localizar Familia
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
          <Button
            data-testid="tab-review"
            variant={activeTab === 'review' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('review')}
            className={activeTab === 'review' ? 'bg-yellow-500' : ''}
          >
            <Star className="w-4 h-4 mr-2" />
            Valorar
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'analyze' && (
          <ThreatAnalyzer />
        )}

        {activeTab === 'family' && (
          <div className="space-y-6">
            {/* Family Location Header */}
            <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                      <MapPin className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-emerald-900">Localización Familiar en Tiempo Real</h3>
                      <p className="text-emerald-700">Sabe dónde están tus seres queridos en todo momento</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate('/family-admin')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Gestionar Familia
                    </Button>
                    <Button
                      onClick={() => navigate('/safe-zones')}
                      variant="outline"
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Zonas Seguras
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Location Map */}
            <LiveLocationMap />

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-4 gap-4">
              <Card className="card-hover cursor-pointer" onClick={() => navigate('/sos-emergency')}>
                <CardContent className="py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h4 className="font-semibold text-zinc-900">Botón SOS</h4>
                  <p className="text-sm text-zinc-600">Alerta de emergencia inmediata</p>
                </CardContent>
              </Card>
              <Card className="card-hover cursor-pointer" onClick={() => navigate('/compartir-ubicacion')}>
                <CardContent className="py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <Share2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-zinc-900">Compartir Ubicación</h4>
                  <p className="text-sm text-zinc-600">Comparte tu ubicación con familia</p>
                </CardContent>
              </Card>
              <Card className="card-hover cursor-pointer" onClick={() => navigate('/videos-demo')}>
                <CardContent className="py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                    <Megaphone className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold text-zinc-900">Videos Demo IA</h4>
                  <p className="text-sm text-zinc-600">Genera videos con Sora 2</p>
                </CardContent>
              </Card>
              <Card className="card-hover cursor-pointer" onClick={() => navigate('/instrucciones-familiares')}>
                <CardContent className="py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                    <Book className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-zinc-900">Guía para Familiares</h4>
                  <p className="text-sm text-zinc-600">Cómo configurar la app</p>
                </CardContent>
              </Card>
            </div>
          </div>
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

        {/* Tab Content: Mis Pedidos */}
        {activeTab === 'pedidos' && (
          <div className="space-y-6">
            {/* Orders Header */}
            <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                      <Package className="w-7 h-7 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-900">Mis Dispositivos SOS</h3>
                      <p className="text-red-700">Seguimiento en tiempo real de tus pedidos</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/servicios-sos')}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Solicitar Nuevo Dispositivo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : userOrders.length === 0 ? (
              <Card className="border-dashed border-2 border-zinc-300">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 flex items-center justify-center">
                    <Package className="w-8 h-8 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-700 mb-2">No tienes pedidos aún</h3>
                  <p className="text-zinc-500 mb-4">
                    Solicita tu dispositivo SOS físico gratis y protege a tu familia
                  </p>
                  <Button
                    onClick={() => navigate('/servicios-sos')}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Solicitar Dispositivo GRATIS
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order, idx) => {
                  const statusConfig = {
                    pending_shipment: { label: 'Preparando', color: 'bg-amber-100 text-amber-800', icon: Clock },
                    preparing: { label: 'En preparación', color: 'bg-amber-100 text-amber-800', icon: Package },
                    shipped: { label: 'Enviado', color: 'bg-blue-100 text-blue-800', icon: Truck },
                    in_transit: { label: 'En tránsito', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
                    out_for_delivery: { label: 'En reparto', color: 'bg-purple-100 text-purple-800', icon: MapPin },
                    delivered: { label: 'Entregado', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle }
                  };
                  const status = statusConfig[order.order_status] || statusConfig.pending_shipment;
                  const StatusIcon = status.icon;
                  
                  return (
                    <Card key={order._id || idx} className="hover:shadow-lg transition-shadow">
                      <CardContent className="py-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Order Info */}
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                              <StatusIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-zinc-900">
                                  Pedido #{(order.session_id || order._id || '').slice(0, 8).toUpperCase()}
                                </h4>
                                <Badge className={status.color}>{status.label}</Badge>
                              </div>
                              <p className="text-sm text-zinc-600 mb-2">
                                {order.quantity || 1}x Dispositivo SOS - Estilo {order.device_style || 'adulto'}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {(order.colors || ['plata']).map((color, cIdx) => (
                                  <Badge key={cIdx} variant="outline" className="text-xs">
                                    {color}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* Shipping Info */}
                          <div className="flex flex-col items-end gap-2">
                            {order.tracking_number ? (
                              <div className="text-right">
                                <p className="text-xs text-zinc-500">Número de seguimiento</p>
                                <p className="font-mono font-bold text-zinc-900">{order.tracking_number}</p>
                                {order.carrier && (
                                  <Badge variant="outline" className="mt-1">{order.carrier}</Badge>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-zinc-500 text-right">
                                Pendiente de número de seguimiento
                              </p>
                            )}
                            <p className="text-xs text-zinc-400">
                              {order.created_at ? new Date(order.created_at).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              }) : ''}
                            </p>
                          </div>
                        </div>
                        
                        {/* Delivery Address */}
                        {order.shipping && (
                          <div className="mt-4 pt-4 border-t border-zinc-100">
                            <p className="text-xs text-zinc-500 mb-1">Dirección de entrega:</p>
                            <p className="text-sm text-zinc-700">
                              {order.shipping.fullName} • {order.shipping.address}, {order.shipping.postalCode} {order.shipping.city}
                            </p>
                          </div>
                        )}
                        
                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-zinc-500 mb-2">
                            <span>Pedido</span>
                            <span>Enviado</span>
                            <span>En camino</span>
                            <span>Entregado</span>
                          </div>
                          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                              style={{ 
                                width: order.order_status === 'delivered' ? '100%' :
                                       order.order_status === 'out_for_delivery' ? '75%' :
                                       order.order_status === 'in_transit' ? '60%' :
                                       order.order_status === 'shipped' ? '40%' :
                                       order.order_status === 'preparing' ? '20%' : '10%'
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            
            {/* Help Section */}
            <Card className="bg-zinc-50 border-zinc-200">
              <CardContent className="py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-zinc-900 mb-1">¿Tienes alguna pregunta sobre tu pedido?</h4>
                    <p className="text-sm text-zinc-600">Nuestro equipo de soporte está disponible para ayudarte</p>
                  </div>
                  <div className="flex gap-3">
                    <a href="tel:+34601510950" className="inline-flex items-center text-red-600 hover:text-red-700 font-medium">
                      <Phone className="w-4 h-4 mr-2" />
                      601 510 950
                    </a>
                    <a href="mailto:soporte@manoprotect.com" className="inline-flex items-center text-red-600 hover:text-red-700 font-medium">
                      <Mail className="w-4 h-4 mr-2" />
                      Contactar
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Review Tab */}
        {activeTab === 'review' && (
          <div className="space-y-6" data-testid="review-tab-content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Comparte tu experiencia
                </CardTitle>
                <CardDescription>
                  Tu opinión nos ayuda a mejorar y ayuda a otras familias a conocer ManoProtect
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewForm />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;