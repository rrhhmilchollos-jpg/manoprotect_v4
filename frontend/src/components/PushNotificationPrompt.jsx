/**
 * PushNotificationPrompt - Component to request push notification permission
 * Shows after login to register FCM token
 */
import { useState, useEffect } from 'react';
import { Bell, BellOff, X, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { setupPushNotifications, onForegroundMessage } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';

const PushNotificationPrompt = () => {
  const { user, isAuthenticated } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');

  useEffect(() => {
    // Check if we should show the prompt
    if (!isAuthenticated || !user) return;
    
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }
    
    // Check current permission status
    const currentPermission = Notification.permission;
    setPermissionStatus(currentPermission);
    
    // If already granted, register token silently
    if (currentPermission === 'granted') {
      registerTokenSilently();
      return;
    }
    
    // If denied, don't show prompt
    if (currentPermission === 'denied') {
      return;
    }
    
    // Check if we've already asked (stored in localStorage)
    const hasAsked = localStorage.getItem('push_notification_asked');
    const lastAsked = localStorage.getItem('push_notification_last_asked');
    const daysSinceLastAsk = lastAsked ? (Date.now() - parseInt(lastAsked)) / (1000 * 60 * 60 * 24) : 999;
    
    // Show prompt if never asked or asked more than 7 days ago
    if (!hasAsked || daysSinceLastAsk > 7) {
      setTimeout(() => setShowPrompt(true), 2000); // Delay to not interrupt login
    }
  }, [isAuthenticated, user]);

  // Setup foreground message handler
  useEffect(() => {
    if (permissionStatus !== 'granted') return;
    
    const unsubscribe = onForegroundMessage((payload) => {
      console.log('Foreground message:', payload);
      
      const { notification, data } = payload;
      const isSOS = data?.type === 'sos_alert';
      
      // Show toast notification
      if (isSOS) {
        toast.error(
          <div className="flex flex-col">
            <span className="font-bold">🆘 {notification?.title || 'ALERTA SOS'}</span>
            <span className="text-sm">{notification?.body}</span>
            <Button 
              size="sm" 
              className="mt-2 bg-red-600"
              onClick={() => window.location.href = `/sos-alert?alert=${data.alert_id}`}
            >
              Ver Ubicación
            </Button>
          </div>,
          { duration: 30000 }
        );
        
        // Play siren sound
        playSirenSound();
      } else {
        toast.info(notification?.title || 'Nueva notificación', {
          description: notification?.body
        });
      }
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [permissionStatus]);

  const playSirenSound = () => {
    try {
      const audio = new Audio('/sounds/sos-siren.mp3');
      audio.loop = true;
      audio.play().catch(e => console.log('Cannot play sound:', e));
      
      // Stop after 30 seconds
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 30000);
    } catch (e) {
      console.error('Error playing siren:', e);
    }
  };

  const registerTokenSilently = async () => {
    try {
      const result = await setupPushNotifications(user?.user_id);
      if (result.success) {
        console.log('FCM token registered silently');
      }
    } catch (e) {
      console.error('Silent token registration failed:', e);
    }
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    
    try {
      const result = await setupPushNotifications(user?.user_id);
      
      if (result.success) {
        setPermissionStatus('granted');
        setShowPrompt(false);
        localStorage.setItem('push_notification_asked', 'true');
        localStorage.setItem('push_notification_last_asked', Date.now().toString());
        toast.success('¡Notificaciones activadas! Recibirás alertas SOS al instante.');
      } else if (result.reason === 'denied') {
        setPermissionStatus('denied');
        setShowPrompt(false);
        toast.error('Has bloqueado las notificaciones. Actívalas en la configuración del navegador.');
      } else {
        toast.error('No se pudieron activar las notificaciones. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Error al activar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('push_notification_asked', 'true');
    localStorage.setItem('push_notification_last_asked', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in slide-in-from-bottom-4">
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 border-0 shadow-2xl">
        <CardContent className="p-4">
          <button 
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Bell className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg mb-1">
                Activa las Notificaciones
              </h3>
              <p className="text-white/80 text-sm mb-4">
                Recibe <strong>alertas SOS instantáneas</strong> cuando un familiar necesite ayuda. 
                No te perderás ninguna emergencia.
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleEnableNotifications}
                  disabled={loading}
                  className="flex-1 bg-white text-indigo-700 hover:bg-white/90 font-semibold"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Activando...</>
                  ) : (
                    <><Shield className="w-4 h-4 mr-2" /> Activar Alertas</>
                  )}
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Después
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PushNotificationPrompt;
