import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  AlertTriangle, Phone, MapPin, X, Volume2, VolumeX,
  Navigation, Clock, User, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const SOSAlertReceived = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const alertId = searchParams.get('alert');
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sirenPlaying, setSirenPlaying] = useState(true);
  const [acknowledged, setAcknowledged] = useState(false);
  const audioContextRef = useRef(null);
  const sirenIntervalRef = useRef(null);

  // Play emergency siren sound for family members
  const playSiren = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const createSirenCycle = (startTime, duration) => {
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const masterGain = audioContext.createGain();

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(masterGain);
        masterGain.connect(audioContext.destination);

        // Main siren - European ambulance style
        oscillator1.type = 'sawtooth';
        oscillator1.frequency.setValueAtTime(600, startTime);
        oscillator1.frequency.linearRampToValueAtTime(1200, startTime + duration / 2);
        oscillator1.frequency.linearRampToValueAtTime(600, startTime + duration);

        // Secondary oscillator for fuller sound
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(400, startTime);
        oscillator2.frequency.linearRampToValueAtTime(800, startTime + duration / 2);
        oscillator2.frequency.linearRampToValueAtTime(400, startTime + duration);

        // Volume envelope - LOUD
        gainNode.gain.setValueAtTime(0.5, startTime);
        masterGain.gain.setValueAtTime(0.8, startTime);

        oscillator1.start(startTime);
        oscillator2.start(startTime);
        oscillator1.stop(startTime + duration);
        oscillator2.stop(startTime + duration);
      };

      // Play continuous siren cycles
      const playLoop = () => {
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          for (let i = 0; i < 4; i++) {
            createSirenCycle(audioContextRef.current.currentTime + (i * 1.5), 1.5);
          }
        }
      };

      playLoop();
      sirenIntervalRef.current = setInterval(playLoop, 6000);
      setSirenPlaying(true);

    } catch (error) {
      console.error('Error playing siren:', error);
    }
  };

  const stopSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setSirenPlaying(false);
  };

  const toggleSiren = () => {
    if (sirenPlaying) {
      stopSiren();
    } else {
      playSiren();
    }
  };

  // Load alert data
  useEffect(() => {
    const loadAlert = async () => {
      if (!alertId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API}/sos/alert/${alertId}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setAlertData(data);
        }
      } catch (error) {
        console.error('Error loading alert:', error);
      }
      setLoading(false);
    };

    loadAlert();
    
    // Auto-play siren when page loads
    playSiren();

    // Vibrate device if supported
    if ('vibrate' in navigator) {
      // Vibration pattern: vibrate 500ms, pause 200ms, repeat
      const vibratePattern = () => {
        navigator.vibrate([500, 200, 500, 200, 500, 200, 500]);
      };
      vibratePattern();
      const vibrateInterval = setInterval(vibratePattern, 3000);
      
      return () => {
        clearInterval(vibrateInterval);
        stopSiren();
      };
    }

    return () => stopSiren();
  }, [alertId]);

  const acknowledgeAlert = async () => {
    stopSiren();
    setAcknowledged(true);
    
    // Mark alert as acknowledged in backend
    try {
      await fetch(`${API}/sos/alert/${alertId}/acknowledge`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const callEmergency = () => {
    window.location.href = 'tel:112';
  };

  const openMaps = () => {
    if (alertData?.location) {
      const { latitude, longitude } = alertData.location;
      window.open(`https://maps.google.com/?q=${latitude},${longitude}`, '_blank');
    }
  };

  const callPerson = () => {
    if (alertData?.user_phone) {
      window.location.href = `tel:${alertData.user_phone}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center">
        <div className="animate-pulse text-white text-2xl">Cargando alerta...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${acknowledged ? 'bg-emerald-600' : 'bg-red-600'} flex flex-col`}>
      {/* Flashing Header */}
      <div className={`${!acknowledged && sirenPlaying ? 'animate-pulse' : ''} bg-black/30 px-4 py-6`}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-10 h-10 text-yellow-300" />
            <div>
              <h1 className="text-2xl font-black text-white">
                {acknowledged ? '✓ ALERTA RECIBIDA' : '🚨 ¡ALERTA SOS!'}
              </h1>
              <p className="text-white/80">
                {acknowledged ? 'Has confirmado la emergencia' : 'Un familiar necesita ayuda'}
              </p>
            </div>
          </div>
          <Button
            onClick={toggleSiren}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            {sirenPlaying ? <Volume2 className="w-8 h-8" /> : <VolumeX className="w-8 h-8" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-lg mx-auto space-y-4">
          
          {/* Person Info Card */}
          <Card className={`${!acknowledged ? 'animate-pulse' : ''} border-4 border-yellow-400 bg-white`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <User className="w-10 h-10 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {alertData?.user_name || 'Familiar'}
                  </h2>
                  <p className="text-gray-600">{alertData?.user_email || ''}</p>
                </div>
              </div>
              
              {alertData?.message && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
                  <p className="text-red-800 font-medium">"{alertData.message}"</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>
                  {alertData?.created_at 
                    ? new Date(alertData.created_at).toLocaleString('es-ES')
                    : 'Hace unos momentos'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          {alertData?.location && (
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-8 h-8 text-red-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Ubicación GPS</p>
                      <p className="text-sm text-gray-600">
                        {alertData.location.latitude?.toFixed(6)}, {alertData.location.longitude?.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={openMaps}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Navigation className="w-5 h-5 mr-2" />
                    Abrir Mapa
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!acknowledged && (
              <Button
                onClick={acknowledgeAlert}
                className="w-full h-16 text-xl font-bold bg-emerald-600 hover:bg-emerald-700"
              >
                <Shield className="w-6 h-6 mr-3" />
                CONFIRMAR RECIBIDO
              </Button>
            )}

            <Button
              onClick={callPerson}
              className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700"
              disabled={!alertData?.user_phone}
            >
              <Phone className="w-6 h-6 mr-3" />
              LLAMAR A {alertData?.user_name?.toUpperCase() || 'FAMILIAR'}
            </Button>

            <Button
              onClick={callEmergency}
              className="w-full h-14 text-lg font-bold bg-red-700 hover:bg-red-800"
            >
              <Phone className="w-6 h-6 mr-3" />
              LLAMAR AL 112
            </Button>

            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full border-white text-white hover:bg-white/20"
            >
              <X className="w-5 h-5 mr-2" />
              Cerrar Alerta
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-white/80 text-sm mt-6">
            <p>Esta alerta fue enviada desde la app ManoProtect.</p>
            <p>Si es una falsa alarma, contacta a tu familiar.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOSAlertReceived;
