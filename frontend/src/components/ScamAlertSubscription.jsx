/**
 * ScamAlertSubscription - Subscribe to trending scam alerts
 * Displays trending scams and allows email subscription
 */
import { useState, useEffect } from 'react';
import { Bell, BellRing, Mail, AlertTriangle, TrendingUp, Shield, Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const ScamAlertSubscription = ({ variant = 'full' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [trending, setTrending] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTrending();
    fetchStats();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await fetch(`${API_URL}/api/scam-alerts/trending`);
      if (res.ok) {
        const data = await res.json();
        setTrending(data.trending || []);
      }
    } catch (err) {
      console.error('Error fetching trending:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/scam-alerts/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Introduce tu email');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/scam-alerts/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          categories: ['all'],
          frequency: 'instant'
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setSubscribed(true);
        toast.success('¡Suscripción activada! Recibirás alertas de estafas.');
        localStorage.setItem('scam_alert_subscribed', 'true');
      } else {
        toast.error(data.detail || 'Error al suscribirse');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    'crítica': 'bg-red-600',
    'alta': 'bg-orange-500',
    'media': 'bg-yellow-500',
    'baja': 'bg-green-500'
  };

  // Compact floating widget
  if (variant === 'floating') {
    return (
      <>
        {/* Floating Button */}
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-24 right-6 z-50 bg-gradient-to-r from-red-600 to-orange-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform animate-pulse"
          data-testid="scam-alert-floating-btn"
        >
          <BellRing className="w-6 h-6" />
        </button>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Alertas de Estafas</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Recibe alertas instantáneas cuando detectemos nuevas estafas en España
                </p>
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.daily_scams}</p>
                    <p className="text-xs text-red-700">Estafas/día</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-orange-600">{stats.weekly_increase}</p>
                    <p className="text-xs text-orange-700">Esta semana</p>
                  </div>
                </div>
              )}

              {/* Subscribe Form */}
              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    data-testid="scam-alert-email-input"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700"
                    data-testid="scam-alert-subscribe-btn"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Bell className="w-4 h-4 mr-2" />
                    )}
                    Activar Alertas Gratis
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-green-700 font-medium">¡Suscripción activada!</p>
                  <p className="text-slate-500 text-sm">Recibirás alertas en tu email</p>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  // Full inline component
  return (
    <div className="bg-gradient-to-br from-slate-900 via-red-900 to-orange-900 rounded-2xl p-6 md:p-8 text-white">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Info & Subscribe */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-red-400 mb-3">
            <BellRing className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Alertas en Tiempo Real</span>
          </div>
          
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            Recibe alertas de estafas trending
          </h3>
          
          <p className="text-slate-300 mb-6">
            Te avisamos al instante cuando detectemos nuevas estafas afectando a españoles.
            {stats && ` Hoy ya hemos detectado ${stats.daily_scams} intentos de fraude.`}
          </p>

          {/* Stats Pills */}
          {stats && (
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="bg-white/10 rounded-full px-4 py-2 text-sm">
                <TrendingUp className="w-4 h-4 inline mr-1 text-red-400" />
                {stats.weekly_increase} esta semana
              </div>
              <div className="bg-white/10 rounded-full px-4 py-2 text-sm">
                <Shield className="w-4 h-4 inline mr-1 text-green-400" />
                Mayores de {stats.most_affected_age} más afectados
              </div>
            </div>
          )}

          {/* Subscribe Form */}
          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 h-12"
                  data-testid="scam-alert-email-full"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 h-12 px-6 font-semibold"
                data-testid="scam-alert-subscribe-full"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Bell className="w-5 h-5 mr-2" />
                    Activar Alertas
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-3 bg-green-600/20 border border-green-500/30 rounded-xl p-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">¡Alertas activadas!</p>
                <p className="text-sm text-green-200">Recibirás notificaciones en tu email</p>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-3">
            Sin spam. Solo alertas importantes. Cancela cuando quieras.
          </p>
        </div>

        {/* Right: Trending Scams */}
        <div className="flex-1 md:max-w-sm">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Estafas Trending Ahora
          </h4>
          
          <div className="space-y-3">
            {trending.slice(0, 3).map((scam) => (
              <div
                key={scam.id}
                className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className="font-medium text-sm leading-tight">{scam.title}</h5>
                  <Badge className={`${severityColors[scam.severity]} text-white text-xs shrink-0`}>
                    {scam.severity}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">{scam.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span>{scam.affected_count.toLocaleString()} afectados</span>
                  <span>•</span>
                  <span>{scam.region}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScamAlertSubscription;
