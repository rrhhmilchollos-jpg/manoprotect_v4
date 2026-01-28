import { useState } from 'react';
import { Bell, Mail, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AlertSubscription({ variant = 'default', className = '' }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, introduce tu email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/alerts/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || null,
          alert_types: ['all'],
          frequency: 'immediate'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSubscribed(true);
        toast.success(data.message || '¡Te has suscrito correctamente!');
      } else {
        if (data.status === 'already_subscribed') {
          toast.info(data.message);
        } else {
          toast.error(data.detail || 'Error al suscribirse');
        }
      }
    } catch (error) {
      toast.error('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-6 text-center ${className}`} data-testid="alert-subscription-success">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-green-800">¡Suscripción activada!</h3>
        <p className="text-green-600 text-sm mt-1">
          Recibirás alertas de seguridad en {email}
        </p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubscribe} className={`flex flex-col sm:flex-row gap-2 ${className}`} data-testid="alert-subscription-form-compact">
        <Input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          data-testid="alert-email-input"
          required
        />
        <Button type="submit" disabled={loading} data-testid="alert-subscribe-btn">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4 mr-1" />}
          Suscribirse
        </Button>
      </form>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white ${className}`} data-testid="alert-subscription-inline">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 rounded-full p-3">
            <Shield className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Alertas de Seguridad Gratuitas</h3>
            <p className="text-white/80 text-sm mt-1 mb-3">
              Recibe notificaciones sobre nuevas estafas y amenazas detectadas
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="Tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-white/60"
                data-testid="alert-email-input"
                required
              />
              <Button type="submit" disabled={loading} variant="secondary" className="bg-white text-indigo-600 hover:bg-white/90" data-testid="alert-subscribe-btn">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Suscribirse'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Default variant - full card
  return (
    <div className={`bg-white border border-zinc-200 rounded-xl p-6 shadow-sm ${className}`} data-testid="alert-subscription-card">
      <div className="text-center mb-6">
        <div className="bg-indigo-100 rounded-full p-4 w-fit mx-auto mb-4">
          <Bell className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900">Alertas de Seguridad</h3>
        <p className="text-zinc-600 text-sm mt-2">
          Suscríbete gratis para recibir notificaciones sobre nuevas estafas y amenazas detectadas en España
        </p>
      </div>

      <form onSubmit={handleSubscribe} className="space-y-3">
        <div>
          <Input
            type="text"
            placeholder="Tu nombre (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="alert-name-input"
          />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="alert-email-input"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading} data-testid="alert-subscribe-btn">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Procesando...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Suscribirse a Alertas Gratuitas
            </>
          )}
        </Button>
      </form>

      <div className="mt-4 pt-4 border-t border-zinc-100">
        <p className="text-xs text-zinc-500 text-center">
          Recibirás alertas sobre phishing, smishing, vishing y otras amenazas. 
          Puedes darte de baja en cualquier momento.
        </p>
      </div>
    </div>
  );
}
