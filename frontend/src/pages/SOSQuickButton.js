import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Phone, MapPin, Share2, Download, AlertTriangle, Shield, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import sosWebSocket from '@/services/sosWebSocket';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const SOSQuickButton = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isActivating, setIsActivating] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [location, setLocation] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [helpOnWay, setHelpOnWay] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const countdownRef = useRef(null);
  const alertIdRef = useRef(null);

  // Connect WebSocket when user is authenticated
  useEffect(() => {
    if (user?.user_id) {
      sosWebSocket.connect(user.user_id, user.name || user.email);
      
      // Set callback for acknowledgments
      sosWebSocket.setOnSOSAcknowledged((data) => {
        setHelpOnWay(data.acknowledged_by);
        toast.success(`${data.acknowledged_by} ha recibido tu alerta`);
      });

      // Check connection status
      const checkConnection = setInterval(() => {
        setWsConnected(sosWebSocket.isSocketConnected());
      }, 2000);

      return () => {
        clearInterval(checkConnection);
        sosWebSocket.disconnect();
      };
    }
  }, [user]);

  // Get current location with high accuracy
  useEffect(() => {
    if (navigator.geolocation) {
      // Watch position for continuous updates
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newLocation = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          setLocation(newLocation);
          
          // Send location update if SOS is active
          if (sosActive && alertIdRef.current) {
            sosWebSocket.updateLocation(alertIdRef.current, newLocation);
          }
        },
        (err) => console.error('Location error:', err),
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [sosActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(3);
    setIsActivating(true);

    // Vibrate pattern
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          activateSOS();
          return null;
        }
        // Vibrate each second
        if ('vibrate' in navigator) navigator.vibrate(200);
        return prev - 1;
      });
    }, 1000);
  };

  const cancelCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(null);
    setIsActivating(false);
    if ('vibrate' in navigator) navigator.vibrate(0);
  };

  const activateSOS = async () => {
    setIsActivating(false);
    setSosActive(true);
    setHelpOnWay(null);
    
    // Generate alert ID
    const alertId = `sos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    alertIdRef.current = alertId;

    // Vibrate continuously
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500, 200, 500, 200, 500]);
    }

    try {
      // Send via API (for push notifications and database)
      const response = await fetch(`${API}/sos/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          accuracy: location?.accuracy || 0,
          message: '¡EMERGENCIA! Necesito ayuda urgente.'
        })
      });

      if (response.ok) {
        const data = await response.json();
        alertIdRef.current = data.alert_id || alertId;
        
        // Also send via WebSocket for real-time delivery
        sosWebSocket.activateSOS(alertIdRef.current, location, '¡EMERGENCIA! Necesito ayuda urgente.');
        
        toast.success(`SOS enviado a ${data.contacts_notified} contactos`);
        
        if (data.push_notifications_sent > 0) {
          toast.info(`${data.push_notifications_sent} notificaciones push enviadas`);
        }
      } else {
        toast.error('Error al enviar SOS. Llama al 112.');
      }
    } catch (error) {
      console.error('SOS Error:', error);
      // Still try WebSocket even if API fails
      sosWebSocket.activateSOS(alertId, location, '¡EMERGENCIA! Necesito ayuda urgente.');
      toast.error('Error de conexión. SOS enviado por WebSocket. Llama al 112.');
    }
  };

  const deactivateSOS = () => {
    setSosActive(false);
    setHelpOnWay(null);
    stopSiren();
    
    // Notify via WebSocket
    if (alertIdRef.current) {
      sosWebSocket.deactivateSOS(alertIdRef.current);
    }
    
    if ('vibrate' in navigator) navigator.vibrate(0);
  };

  const callEmergency = () => {
    window.location.href = 'tel:112';
  };

  const installToHomeScreen = async () => {
    // Check if the app can be installed
    if ('BeforeInstallPromptEvent' in window || window.deferredPrompt) {
      try {
        const promptEvent = window.deferredPrompt;
        if (promptEvent) {
          promptEvent.prompt();
          const result = await promptEvent.userChoice;
          if (result.outcome === 'accepted') {
            toast.success('¡App instalada en tu pantalla de inicio!');
          }
        } else {
          showInstallInstructions();
        }
      } catch (e) {
        showInstallInstructions();
      }
    } else {
      showInstallInstructions();
    }
  };

  const showInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      toast.info(
        <div className="text-sm">
          <p className="font-bold mb-2">📱 Para instalar en iPhone:</p>
          <ol className="list-decimal ml-4 space-y-1">
            <li>Pulsa el botón <strong>Compartir</strong> (📤)</li>
            <li>Selecciona <strong>"Añadir a pantalla de inicio"</strong></li>
            <li>Pulsa <strong>"Añadir"</strong></li>
          </ol>
        </div>,
        { duration: 10000 }
      );
    } else if (isAndroid) {
      toast.info(
        <div className="text-sm">
          <p className="font-bold mb-2">📱 Para instalar en Android:</p>
          <ol className="list-decimal ml-4 space-y-1">
            <li>Abre el menú (⋮) del navegador</li>
            <li>Selecciona <strong>"Instalar app"</strong> o <strong>"Añadir a pantalla de inicio"</strong></li>
          </ol>
        </div>,
        { duration: 10000 }
      );
    } else {
      toast.info('Abre esta página en tu móvil para instalar el botón SOS');
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-800 flex flex-col items-center justify-center p-4">
        <div className="text-center text-white mb-8">
          <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <img src="/manoprotect_icon_512x512.png" alt="SOS" className="w-24 h-24" />
          </div>
          <h1 className="text-3xl font-black mb-2">Botón SOS</h1>
          <p className="text-red-100">Inicia sesión para activar el botón de emergencia</p>
        </div>
        <Button
          onClick={() => navigate('/login?redirect=/sos-quick')}
          className="bg-white text-red-600 hover:bg-red-50 text-xl px-12 py-6 rounded-2xl font-bold shadow-xl"
        >
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black flex flex-col">
      {/* Header */}
      <div className="bg-red-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-white" />
          <span className="text-white font-bold">ManoProtect SOS</span>
        </div>
        <div className="flex items-center gap-2">
          {sirenPlaying && (
            <Button
              onClick={stopSiren}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
          )}
          <Button
            onClick={installToHomeScreen}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        
        {/* SOS Button */}
        <div className="relative mb-8">
          {/* Pulsing ring animation when active */}
          {(sosActive || isActivating) && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" style={{transform: 'scale(1.3)'}} />
              <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse opacity-20" style={{transform: 'scale(1.5)'}} />
            </>
          )}
          
          <button
            onClick={sosActive ? deactivateSOS : (isActivating ? cancelCountdown : startCountdown)}
            disabled={false}
            className={`
              relative w-56 h-56 rounded-full 
              flex flex-col items-center justify-center
              text-white font-black text-3xl
              shadow-2xl transform transition-all duration-200
              ${sosActive 
                ? 'bg-gradient-to-b from-green-500 to-green-700 scale-95' 
                : isActivating 
                  ? 'bg-gradient-to-b from-orange-500 to-orange-700 scale-105'
                  : 'bg-gradient-to-b from-red-500 to-red-700 hover:scale-105 active:scale-95'
              }
            `}
            style={{
              boxShadow: sosActive 
                ? '0 0 60px rgba(34, 197, 94, 0.6)' 
                : '0 0 60px rgba(239, 68, 68, 0.6)'
            }}
          >
            {/* SOS Icon/Logo */}
            <div className="mb-2">
              {sosActive ? (
                <Shield className="w-16 h-16" />
              ) : (
                <AlertTriangle className="w-16 h-16" />
              )}
            </div>
            
            {/* Text */}
            {countdown !== null ? (
              <span className="text-6xl">{countdown}</span>
            ) : sosActive ? (
              <>
                <span className="text-2xl">DESACTIVAR</span>
                <span className="text-sm font-normal mt-1">Pulsa para parar</span>
              </>
            ) : (
              <>
                <span className="text-4xl tracking-widest">SOS</span>
                <span className="text-sm font-normal mt-1">MANTÉN PULSADO</span>
              </>
            )}
          </button>
        </div>

        {/* Status Info */}
        <div className="text-center text-white mb-6">
          {sosActive ? (
            <div className="space-y-3">
              <div className="bg-green-600/30 rounded-xl px-6 py-4">
                <p className="text-xl font-bold text-green-400">✓ ALERTA ENVIADA</p>
                <p className="text-green-200 text-sm">Tus contactos han sido notificados</p>
              </div>
              {helpOnWay && (
                <div className="bg-blue-600/30 rounded-xl px-6 py-4 animate-pulse">
                  <p className="text-xl font-bold text-blue-400">🚨 AYUDA EN CAMINO</p>
                  <p className="text-blue-200 text-sm">{helpOnWay} ha recibido tu alerta</p>
                </div>
              )}
            </div>
          ) : isActivating ? (
            <div className="bg-orange-600/30 rounded-xl px-6 py-4">
              <p className="text-xl font-bold text-orange-400">Activando en {countdown}...</p>
              <p className="text-orange-200 text-sm">Pulsa de nuevo para cancelar</p>
            </div>
          ) : (
            <div className="bg-zinc-800/50 rounded-xl px-6 py-4">
              <p className="text-zinc-300">Pulsa el botón en caso de emergencia</p>
              <p className="text-zinc-500 text-sm">Se alertará a tus contactos con tu ubicación</p>
            </div>
          )}
        </div>

        {/* Connection & Location Status */}
        <div className="flex flex-col items-center gap-2 mb-6">
          {location && (
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <MapPin className="w-4 h-4 text-green-500" />
              <span>GPS activo • Precisión: {Math.round(location.accuracy)}m</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span>{wsConnected ? 'Conexión en tiempo real activa' : 'Conectando...'}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="w-full max-w-xs space-y-3">
          <Button
            onClick={callEmergency}
            className="w-full h-14 bg-red-600 hover:bg-red-700 text-lg font-bold"
          >
            <Phone className="w-6 h-6 mr-3" />
            LLAMAR AL 112
          </Button>

          <Button
            onClick={installToHomeScreen}
            variant="outline"
            className="w-full h-12 border-zinc-600 text-zinc-300 hover:bg-zinc-800"
          >
            <Download className="w-5 h-5 mr-2" />
            Instalar en pantalla de inicio
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-zinc-500 text-xs">
        <p>Usuario: {user?.name || user?.email}</p>
        <p className="mt-1">ManoProtect © 2025 - Protección 24/7</p>
      </div>
    </div>
  );
};

export default SOSQuickButton;
