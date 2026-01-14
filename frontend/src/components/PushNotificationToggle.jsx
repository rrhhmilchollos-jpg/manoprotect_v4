import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import pushNotificationService from '@/services/pushNotifications';

const PushNotificationToggle = ({ showLabel = true, variant = 'default' }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const supported = pushNotificationService.isSupported();
    setIsSupported(supported);

    if (supported) {
      setPermission(pushNotificationService.getPermissionStatus());
      const subscribed = await pushNotificationService.isSubscribed();
      setIsSubscribed(subscribed);
    }
  };

  const handleToggle = async () => {
    if (!isSupported) {
      toast.error('Tu navegador no soporta notificaciones push');
      return;
    }

    setLoading(true);
    try {
      if (isSubscribed) {
        await pushNotificationService.unsubscribe();
        setIsSubscribed(false);
        toast.success('Notificaciones desactivadas');
      } else {
        await pushNotificationService.subscribe();
        setIsSubscribed(true);
        setPermission('granted');
        toast.success('¡Notificaciones activadas! Recibirás alertas de seguridad en tiempo real.');
      }
    } catch (error) {
      console.error('Push toggle error:', error);
      
      if (error.message.includes('denied')) {
        setPermission('denied');
        toast.error('Permiso de notificaciones denegado. Actívalo en la configuración del navegador.');
      } else {
        toast.error('Error al configurar notificaciones');
      }
    } finally {
      setLoading(false);
    }
  };

  // Compact button variant for header
  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={loading || !isSupported}
        className={`relative ${isSubscribed ? 'text-indigo-600' : 'text-zinc-500'}`}
        title={isSubscribed ? 'Notificaciones activadas' : 'Activar notificaciones'}
        data-testid="push-toggle-compact"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isSubscribed ? (
          <Bell className="w-5 h-5" />
        ) : (
          <BellOff className="w-5 h-5" />
        )}
        {isSubscribed && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full" />
        )}
      </Button>
    );
  }

  // Default full variant
  return (
    <div className="flex items-center justify-between" data-testid="push-notification-toggle">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isSubscribed ? 'bg-indigo-100' : 'bg-zinc-100'
        }`}>
          {isSubscribed ? (
            <Bell className="w-5 h-5 text-indigo-600" />
          ) : (
            <BellOff className="w-5 h-5 text-zinc-500" />
          )}
        </div>
        {showLabel && (
          <div>
            <div className="font-semibold">Notificaciones Push</div>
            <div className="text-sm text-zinc-600">
              {!isSupported ? (
                'No soportado en este navegador'
              ) : permission === 'denied' ? (
                <span className="text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Bloqueadas por el navegador
                </span>
              ) : isSubscribed ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Activas - Recibirás alertas
                </span>
              ) : (
                'Recibe alertas en tiempo real'
              )}
            </div>
          </div>
        )}
      </div>
      
      <Switch
        checked={isSubscribed}
        onCheckedChange={handleToggle}
        disabled={loading || !isSupported || permission === 'denied'}
        data-testid="push-toggle-switch"
      />
    </div>
  );
};

export default PushNotificationToggle;
