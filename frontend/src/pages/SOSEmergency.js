import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  AlertTriangle, MapPin, Mic, MicOff, Phone, Users, 
  Volume2, VolumeX, X, Check, Loader2, Shield,
  Radio, Navigation, Clock, CheckCircle2, Trash2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';

const API = process.env.REACT_APP_BACKEND_URL;

export default function SOSEmergency() {
  const navigate = useNavigate();
  
  // SOS State
  const [sosActive, setSosActive] = useState(false);
  const [sosId, setSosId] = useState(null);
  const [sosStatus, setSosStatus] = useState('idle'); // idle, recording, sending, active, resolved
  
  // Location State
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  
  // Settings
  const [settings, setSettings] = useState({
    alertNearby: true,
    soundEnabled: true,
    autoRecord: true
  });
  
  // Email status
  const [emailsSent, setEmailsSent] = useState(0);
  
  // Notifications
  const [familyNotified, setFamilyNotified] = useState(0);
  const [nearbyNotified, setNearbyNotified] = useState(0);
  
  // Active alerts from family
  const [familyAlerts, setFamilyAlerts] = useState([]);

  // Track if siren has been played for current family alerts
  const sirenPlayedRef = useRef(new Set());

  useEffect(() => {
    checkActiveAlerts();
    getCurrentLocation();
    
    // Poll for new alerts every 15 seconds
    const alertInterval = setInterval(checkActiveAlerts, 15000);
    
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      clearInterval(alertInterval);
      stopAlertSound();
    };
  }, []);

  // Play siren when new family alerts arrive
  useEffect(() => {
    if (familyAlerts.length > 0) {
      // Check if there are new alerts we haven't played siren for
      const newAlerts = familyAlerts.filter(alert => !sirenPlayedRef.current.has(alert.sos_id));
      
      if (newAlerts.length > 0) {
        // Play emergency siren for new alerts
        playAlertSound();
        
        // Mark these alerts as siren-played
        newAlerts.forEach(alert => sirenPlayedRef.current.add(alert.sos_id));
        
        // Also show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          newAlerts.forEach(alert => {
            new Notification('🚨 ALERTA SOS FAMILIAR', {
              body: `${alert.user_name} necesita ayuda urgente!`,
              icon: '/manoprotect_logo.webp',
              requireInteraction: true,
              tag: `sos-${alert.sos_id}`
            });
          });
        }
      }
    }
  }, [familyAlerts]);

  const checkActiveAlerts = async () => {
    try {
      const response = await axios.get(`${API}/api/sos/premium/active`, {
        withCredentials: true
      });
      setFamilyAlerts(response.data.family_alerts || []);
      
      if (response.data.own_alerts?.length > 0) {
        const activeAlert = response.data.own_alerts[0];
        setSosActive(true);
        setSosId(activeAlert.sos_id);
        setSosStatus('active');
      }
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocalización no soportada');
      setGettingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        });
        setGettingLocation(false);
      },
      (error) => {
        setLocationError('No se pudo obtener la ubicación');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Auto-stop after 20 seconds
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 20) {
            stopRecording();
            return 20;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (error) {
      toast.error('No se pudo acceder al micrófono');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const triggerSOS = async () => {
    setSosStatus('sending');
    
    // Get fresh location
    getCurrentLocation();
    
    // Start recording if enabled
    if (settings.autoRecord && !audioBlob) {
      await startRecording();
      // Wait for recording
      setTimeout(async () => {
        stopRecording();
        await sendSOSAlert();
      }, 5000); // Record 5 seconds then send
    } else {
      await sendSOSAlert();
    }
  };

  const sendSOSAlert = async () => {
    try {
      const payload = {
        location: location,
        message: "¡EMERGENCIA! Necesito ayuda urgente.",
        alert_nearby: settings.alertNearby,
        audio_duration: recordingTime
      };
      
      const response = await axios.post(`${API}/api/sos/premium/trigger`, payload, {
        withCredentials: true
      });
      
      setSosId(response.data.sos_id);
      setSosActive(true);
      setSosStatus('active');
      setFamilyNotified(response.data.family_notified_count);
      setNearbyNotified(response.data.nearby_notified_count);
      setEmailsSent(response.data.emails_sent || 0);
      
      const emailMsg = response.data.emails_sent > 0 
        ? `¡Alerta SOS enviada! Se enviaron ${response.data.emails_sent} emails a tu familia.`
        : '¡Alerta SOS enviada! Tu familia ha sido notificada.';
      toast.success(emailMsg);
      
      // NOTE: Siren should NOT play here - it plays on RECEIVER's device only
      
    } catch (error) {
      setSosStatus('idle');
      toast.error(error.response?.data?.detail || 'Error al enviar SOS');
    }
  };

  const cancelSOS = async () => {
    if (!sosId) return;
    
    try {
      await axios.post(`${API}/api/sos/premium/${sosId}/cancel`, {
        reason: 'cancelled_by_user'
      }, { withCredentials: true });
      
      setSosActive(false);
      setSosId(null);
      setSosStatus('resolved');
      setAudioBlob(null);
      setRecordingTime(0);
      
      toast.success('Alerta SOS cancelada');
      
    } catch (error) {
      toast.error('Error al cancelar SOS');
    }
  };

  const confirmFamilyAlert = async (alertId) => {
    try {
      await axios.post(`${API}/api/sos/premium/${alertId}/confirm`, {}, {
        withCredentials: true
      });
      toast.success('Has confirmado que vas en camino');
      checkActiveAlerts();
    } catch (error) {
      toast.error('Error al confirmar');
    }
  };

  const playAlertSound = () => {
    // Create powerful emergency siren sound - much longer and louder
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create multiple oscillators for a more realistic siren
    const createSirenCycle = (startTime, duration) => {
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const masterGain = audioContext.createGain();
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(masterGain);
      masterGain.connect(audioContext.destination);
      
      // Main siren frequency sweep
      oscillator1.type = 'sawtooth';
      oscillator1.frequency.setValueAtTime(600, startTime);
      oscillator1.frequency.linearRampToValueAtTime(1400, startTime + duration/2);
      oscillator1.frequency.linearRampToValueAtTime(600, startTime + duration);
      
      // Secondary oscillator for fuller sound
      oscillator2.type = 'square';
      oscillator2.frequency.setValueAtTime(400, startTime);
      oscillator2.frequency.linearRampToValueAtTime(1000, startTime + duration/2);
      oscillator2.frequency.linearRampToValueAtTime(400, startTime + duration);
      
      // Set volume - MUCH LOUDER (0.8 instead of 0.3)
      masterGain.gain.setValueAtTime(0.8, startTime);
      gainNode.gain.setValueAtTime(0.6, startTime);
      
      oscillator1.start(startTime);
      oscillator2.start(startTime);
      oscillator1.stop(startTime + duration);
      oscillator2.stop(startTime + duration);
    };
    
    // Play 8 seconds of siren (4 cycles of 2 seconds each)
    for (let i = 0; i < 4; i++) {
      createSirenCycle(audioContext.currentTime + (i * 2), 2);
    }
    
    // Store context to stop later if needed
    window.sosAudioContext = audioContext;
  };
  
  const stopAlertSound = () => {
    if (window.sosAudioContext) {
      window.sosAudioContext.close();
      window.sosAudioContext = null;
    }
  };
  
  // Generate Google Maps link for location
  const getGoogleMapsLink = (lat, lng) => {
    return `https://www.google.com/maps?q=${lat},${lng}&z=18`;
  };
  
  // Generate Google Maps directions link
  const getGoogleMapsDirections = (lat, lng) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-white">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">Emergencia Familiar</h1>
        <Badge className="bg-amber-500 text-black">Premium</Badge>
      </div>

      {/* Active Family Alerts */}
      {familyAlerts.length > 0 && (
        <Card className="mb-6 border-2 border-red-500 bg-red-950/50 animate-pulse">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              ¡Alerta de Familiar!
            </CardTitle>
          </CardHeader>
          <CardContent>
            {familyAlerts.map((alert) => (
              <div key={alert.sos_id} className="mb-4 p-4 bg-red-900/30 rounded-lg">
                <p className="text-white font-bold text-lg">{alert.user_name} necesita ayuda</p>
                <p className="text-red-200 text-sm mb-3">{alert.message}</p>
                
                {alert.location && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-red-200">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">
                        {alert.location.latitude?.toFixed(6)}, {alert.location.longitude?.toFixed(6)}
                      </span>
                    </div>
                    
                    {/* Google Maps buttons */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => window.open(getGoogleMapsLink(alert.location.latitude, alert.location.longitude), '_blank')}
                      >
                        <MapPin className="w-4 h-4 mr-1" />
                        Ver Ubicación
                      </Button>
                      <Button 
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => window.open(getGoogleMapsDirections(alert.location.latitude, alert.location.longitude), '_blank')}
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        Cómo Llegar
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Audio message if available */}
                {alert.audio_duration > 0 && (
                  <div className="mb-3 p-3 bg-red-800/30 rounded-lg">
                    <p className="text-red-200 text-xs mb-2 flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      Mensaje de voz ({alert.audio_duration}s)
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full border-red-500 text-red-300"
                      onClick={() => toast.info('Reproduciendo mensaje de emergencia...')}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Escuchar Mensaje
                    </Button>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => confirmFamilyAlert(alert.sos_id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Voy en camino
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-red-500 text-red-400"
                    onClick={() => window.open(`tel:112`, '_self')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Llamar 112
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main SOS Button */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative">
          {/* Pulse Animation when active */}
          {sosActive && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" style={{animationDuration: '1.5s'}} />
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" style={{animationDuration: '2s', animationDelay: '0.5s'}} />
            </>
          )}
          
          {/* SOS Button */}
          <button
            onClick={sosActive ? cancelSOS : triggerSOS}
            disabled={sosStatus === 'sending'}
            className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all transform hover:scale-105 ${
              sosActive 
                ? 'bg-gradient-to-br from-red-600 to-red-800 shadow-lg shadow-red-500/50' 
                : 'bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/30'
            }`}
            data-testid="sos-button"
          >
            {sosStatus === 'sending' ? (
              <Loader2 className="w-16 h-16 text-white animate-spin" />
            ) : (
              <>
                <span className="text-5xl font-black text-white">SOS</span>
                <span className="text-sm text-red-100 mt-2">
                  {sosActive ? 'CANCELAR' : 'EMERGENCIA'}
                </span>
              </>
            )}
          </button>
        </div>
        
        <p className="text-zinc-400 text-center mt-6 max-w-xs">
          {sosActive 
            ? '⚠️ Alerta activa. Tu familia ha sido notificada.' 
            : 'Pulsa el botón para enviar tu ubicación exacta a todos tus familiares'}
        </p>
      </div>

      {/* Status Cards */}
      {sosActive && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-emerald-950/50 border-emerald-700">
            <CardContent className="p-3 text-center">
              <Users className="w-6 h-6 mx-auto text-emerald-400 mb-1" />
              <p className="text-xl font-bold text-white">{familyNotified}</p>
              <p className="text-xs text-emerald-300">Familiares</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-950/50 border-purple-700">
            <CardContent className="p-3 text-center">
              <svg className="w-6 h-6 mx-auto text-purple-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-xl font-bold text-white">{emailsSent}</p>
              <p className="text-xs text-purple-300">Emails</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-950/50 border-blue-700">
            <CardContent className="p-3 text-center">
              <Radio className="w-6 h-6 mx-auto text-blue-400 mb-1" />
              <p className="text-xl font-bold text-white">{nearbyNotified}</p>
              <p className="text-xs text-blue-300">Cercanos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Location Status */}
      <Card className="mb-4 bg-zinc-800/50 border-zinc-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                location ? 'bg-emerald-500/20' : 'bg-amber-500/20'
              }`}>
                {gettingLocation ? (
                  <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                ) : location ? (
                  <MapPin className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Navigation className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-white">GPS Preciso</p>
                <p className="text-xs text-zinc-400">
                  {location 
                    ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                    : locationError || 'Obteniendo ubicación...'}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="text-white"
            >
              Actualizar
            </Button>
          </div>
          
          {/* Google Maps Link - Show when we have location */}
          {location && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-700">
              <Button
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => window.open(getGoogleMapsLink(location.latitude, location.longitude), '_blank')}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Ver en Google Maps
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-zinc-600 text-white hover:bg-zinc-700"
                onClick={() => {
                  const link = getGoogleMapsLink(location.latitude, location.longitude);
                  navigator.clipboard.writeText(link);
                  toast.success('Enlace de ubicación copiado');
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar Enlace
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audio Recording - WhatsApp Style */}
      <Card className="mb-4 bg-zinc-800/50 border-zinc-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isRecording ? 'bg-red-500 animate-pulse' : audioBlob ? 'bg-emerald-500/20' : 'bg-zinc-700'
              }`}>
                {isRecording ? (
                  <Mic className="w-5 h-5 text-white" />
                ) : audioBlob ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <MicOff className="w-5 h-5 text-zinc-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-white">Mensaje de Emergencia</p>
                <p className="text-xs text-zinc-400">
                  {isRecording 
                    ? `🔴 Grabando... ${recordingTime}s`
                    : audioBlob 
                      ? `✅ Audio grabado (${recordingTime}s)`
                      : 'Graba un mensaje de voz (máx 20s)'}
                </p>
              </div>
            </div>
          </div>
          
          {/* WhatsApp-style recording interface */}
          <div className="bg-zinc-900 rounded-xl p-4">
            {isRecording ? (
              // Recording in progress - WhatsApp style
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  {/* Waveform animation */}
                  <div className="flex items-center justify-center gap-1 h-12">
                    {[...Array(20)].map((_, i) => (
                      <div 
                        key={i}
                        className="w-1 bg-red-500 rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${i * 50}ms`,
                          animationDuration: '0.5s'
                        }}
                      />
                    ))}
                  </div>
                  {/* Timer */}
                  <div className="text-center mt-2">
                    <span className="text-2xl font-mono text-red-400">
                      {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </span>
                    <span className="text-zinc-500 text-sm ml-2">/ 00:20</span>
                  </div>
                </div>
                
                {/* Stop button */}
                <button
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg"
                >
                  <div className="w-6 h-6 bg-white rounded" />
                </button>
              </div>
            ) : audioBlob ? (
              // Audio recorded - playback interface
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const audio = new Audio(URL.createObjectURL(audioBlob));
                      audio.play();
                    }}
                    className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center"
                  >
                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                  <div className="flex-1">
                    <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{width: '100%'}} />
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{recordingTime} segundos grabados</p>
                  </div>
                  <button
                    onClick={() => {
                      setAudioBlob(null);
                      setRecordingTime(0);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-emerald-400 text-center">
                  ✓ Este audio se enviará junto con tu ubicación a tu familia
                </p>
              </div>
            ) : (
              // No recording - start button
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-zinc-400 text-center">
                  Mantén pulsado para grabar un mensaje de voz describiendo tu emergencia
                </p>
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                  <Mic className="w-8 h-8 text-white" />
                </button>
                <p className="text-xs text-zinc-500">Pulsa y mantén para grabar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="mb-4 bg-zinc-800/50 border-zinc-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-300">Configuración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Alertar usuarios cercanos</Label>
              <p className="text-xs text-zinc-400">Notificar a usuarios premium en 5km</p>
            </div>
            <Switch 
              checked={settings.alertNearby}
              onCheckedChange={(checked) => setSettings({...settings, alertNearby: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Sonido de alerta</Label>
              <p className="text-xs text-zinc-400">Reproducir sirena al enviar SOS</p>
            </div>
            <Switch 
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => setSettings({...settings, soundEnabled: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Grabar automáticamente</Label>
              <p className="text-xs text-zinc-400">Grabar audio al pulsar SOS</p>
            </div>
            <Switch 
              checked={settings.autoRecord}
              onCheckedChange={(checked) => setSettings({...settings, autoRecord: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="bg-zinc-800/30 border-zinc-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-400">¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-zinc-300">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">1</span>
              <span>Pulsa el botón SOS para enviar alerta</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">2</span>
              <span>Se graba audio y detecta tu ubicación GPS</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">3</span>
              <span>Tu familia recibe notificación crítica con sirena</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">4</span>
              <span>Usuarios premium cercanos (5km) son alertados</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Emergency Call Button */}
      <div className="fixed bottom-20 left-4 right-4">
        <Button 
          className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold h-14"
          onClick={() => window.open('tel:112', '_self')}
        >
          <Phone className="w-5 h-5 mr-2" />
          Llamar al 112 (Emergencias)
        </Button>
      </div>
    </div>
  );
}
