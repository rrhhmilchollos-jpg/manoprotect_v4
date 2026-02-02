import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, AlertOctagon, Phone, Users, Navigation, ArrowLeft, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FamilyMode = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const [sosHistory, setSosHistory] = useState([]);

  useEffect(() => {
    loadEmergencyContacts();
    loadSosHistory();
  }, []);

  const loadEmergencyContacts = async () => {
    try {
      const response = await axios.get(`${API}/contacts?user_id=demo-user`);
      const emergencyContacts = response.data.filter(c => c.is_emergency);
      setContacts(emergencyContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadSosHistory = async () => {
    try {
      const response = await axios.get(`${API}/sos/history`, {
        withCredentials: true
      });
      if (response.data.alerts) {
        setSosHistory(response.data.alerts.slice(0, 5)); // Last 5 alerts
      }
    } catch (error) {
      console.log('No SOS history available');
    }
  };

  // Function to get GPS location
  const getGPSLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada por tu navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let errorMessage = 'Error obteniendo ubicación';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso de ubicación denegado. Por favor, habilita el GPS.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Información de ubicación no disponible.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado al obtener ubicación.';
              break;
            default:
              errorMessage = 'Error desconocido al obtener ubicación.';
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const triggerSOS = async () => {
    if (contacts.length === 0) {
      toast.error('No tienes contactos de emergencia configurados');
      navigate('/contacts');
      return;
    }

    setIsGettingLocation(true);
    toast.info('🔍 Obteniendo tu ubicación GPS...');

    try {
      // Step 1: Get GPS location
      const location = await getGPSLocation();
      setLastLocation(location);
      
      toast.success(`📍 Ubicación obtenida (precisión: ${Math.round(location.accuracy)}m)`);
      
      // Step 2: Send SOS alert with GPS coordinates
      const response = await axios.post(`${API}/sos/alert`, {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        message: '¡Necesito ayuda urgente!'
      }, {
        withCredentials: true
      });
      
      setSosTriggered(true);
      
      if (response.data.success) {
        toast.success(`🆘 ¡Alerta SOS enviada! ${response.data.contacts_notified} contactos notificados con tu ubicación.`);
      } else {
        toast.success(`¡Alerta enviada a ${contacts.length} contactos con tu ubicación GPS!`);
      }
      
      // Reset after 10 seconds
      setTimeout(() => {
        setSosTriggered(false);
        loadSosHistory();
      }, 10000);
      
    } catch (error) {
      console.error('SOS Error:', error);
      
      if (error.message && error.message.includes('ubicación')) {
        toast.error(error.message);
        // Try to send SOS without GPS as fallback
        try {
          await axios.post(`${API}/sos`, {
            user_id: 'demo-user',
            location: 'Ubicación no disponible - GPS desactivado',
            message: 'Alerta SOS activada (sin GPS)'
          });
          setSosTriggered(true);
          toast.warning('⚠️ Alerta enviada SIN ubicación. Activa el GPS para enviar tu localización.');
          setTimeout(() => setSosTriggered(false), 5000);
        } catch (fallbackError) {
          toast.error('Error al enviar alerta SOS');
        }
      } else {
        toast.error('Error al enviar alerta SOS. Inténtalo de nuevo.');
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-zinc-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-6 border-b border-emerald-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-btn"
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="rounded-lg text-xl w-14 h-14"
            >
              <ArrowLeft className="w-7 h-7" />
            </Button>
            <div className="flex items-center gap-3">
              <img src="/manoprotect_logo.png" alt="ManoProtect Logo" className="h-10 w-auto" />
              <span className="text-3xl font-bold">Modo Familiar</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* GPS Info Banner */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-800">Localización GPS Activa</p>
                <p className="text-sm text-blue-600">Al pulsar SOS, tu ubicación exacta se enviará automáticamente a tus contactos de emergencia</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SOS Button - GRANDE */}
        <Card className={`mb-8 border-4 ${
          sosTriggered ? 'border-emerald-500 bg-emerald-50' : isGettingLocation ? 'border-amber-400 bg-amber-50' : 'border-rose-300 bg-white'
        } transition-all duration-300`}>
          <CardContent className="p-12 text-center">
            <Button
              data-testid="sos-button"
              onClick={triggerSOS}
              disabled={sosTriggered || isGettingLocation}
              className={`w-64 h-64 rounded-full text-4xl font-bold shadow-2xl active:scale-95 transition-all ${
                sosTriggered 
                  ? 'bg-emerald-500 cursor-not-allowed' 
                  : isGettingLocation
                    ? 'bg-amber-500 cursor-wait'
                    : 'bg-rose-600 hover:bg-rose-700 animate-pulse'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                {sosTriggered ? (
                  <>
                    <CheckCircle2 className="w-24 h-24" />
                    <span>ENVIADO</span>
                  </>
                ) : isGettingLocation ? (
                  <>
                    <Loader2 className="w-24 h-24 animate-spin" />
                    <span className="text-2xl">GPS...</span>
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-24 h-24" />
                    <span>SOS</span>
                  </>
                )}
              </div>
            </Button>
            
            <p className="text-2xl text-zinc-700 mt-8 font-semibold">
              {sosTriggered 
                ? '¡Tus contactos han recibido tu ubicación!' 
                : isGettingLocation
                  ? 'Obteniendo tu ubicación GPS...'
                  : 'Presiona si necesitas ayuda urgente'
              }
            </p>
            
            {/* GPS Status */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
              <MapPin className={`w-5 h-5 ${sosTriggered ? 'text-emerald-600' : 'text-blue-600'}`} />
              <span className={sosTriggered ? 'text-emerald-600' : 'text-blue-600'}>
                {sosTriggered && lastLocation
                  ? `📍 Ubicación enviada: ${lastLocation.latitude.toFixed(4)}, ${lastLocation.longitude.toFixed(4)}`
                  : 'Tu ubicación GPS se enviará al pulsar SOS'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Last Location Info (if SOS was triggered) */}
        {sosTriggered && lastLocation && (
          <Card className="mb-8 bg-emerald-50 border-emerald-300">
            <CardContent className="p-6">
              <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Ubicación enviada a tus contactos:
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-emerald-600">Latitud:</span>
                  <span className="font-mono ml-2">{lastLocation.latitude.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-emerald-600">Longitud:</span>
                  <span className="font-mono ml-2">{lastLocation.longitude.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-emerald-600">Precisión:</span>
                  <span className="ml-2">{Math.round(lastLocation.accuracy)} metros</span>
                </div>
                <div>
                  <a 
                    href={`https://maps.google.com/?q=${lastLocation.latitude},${lastLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Ver en Google Maps →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contacts */}
        <Card className="bg-white border-2 border-emerald-200 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Phone className="w-7 h-7 text-emerald-600" />
              Contactos de Emergencia
              <span className="text-sm font-normal text-zinc-500">
                (Recibirán tu ubicación GPS)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 mx-auto mb-4 text-zinc-400" />
                <p className="text-xl text-zinc-600 mb-6">No hay contactos de emergencia</p>
                <Button
                  data-testid="add-contacts-btn"
                  onClick={() => navigate('/contacts')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-8 h-14 text-lg"
                >
                  Añadir Contactos
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact, idx) => (
                  <div
                    key={idx}
                    data-testid={`emergency-contact-${idx}`}
                    className="flex items-center gap-4 p-6 rounded-xl bg-emerald-50 border-2 border-emerald-200"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center">
                      <Phone className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-emerald-900">{contact.name}</div>
                      <div className="text-xl text-emerald-700">{contact.phone}</div>
                      <div className="text-lg text-emerald-600 capitalize">{contact.relationship}</div>
                    </div>
                    <MapPin className="w-6 h-6 text-blue-500" title="Recibirá ubicación GPS" />
                  </div>
                ))}
                <Button
                  onClick={() => navigate('/contacts')}
                  variant="outline"
                  className="w-full h-14 text-lg border-2 border-emerald-300 hover:bg-emerald-50 rounded-lg"
                >
                  Gestionar Contactos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How it works */}
        <Card className="bg-blue-50 border-blue-200 mb-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              ¿Cómo funciona el SOS con GPS?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center mx-auto mb-3">
                  <AlertOctagon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold mb-1">1. Pulsa SOS</h4>
                <p className="text-sm text-zinc-600">Presiona el botón cuando necesites ayuda</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold mb-1">2. GPS Automático</h4>
                <p className="text-sm text-zinc-600">Tu ubicación precisa se captura automáticamente</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold mb-1">3. Familia Avisada</h4>
                <p className="text-sm text-zinc-600">Todos tus contactos reciben tu ubicación exacta</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-6">
          <Card 
            className="bg-white border-2 border-indigo-200 cursor-pointer hover:border-indigo-400 transition-all card-hover"
            onClick={() => navigate('/dashboard')}
          >
            <CardContent className="p-8 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-2xl font-bold mb-2">Analizar Amenaza</h3>
              <p className="text-lg text-zinc-600">Verificar llamada o mensaje</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white border-2 border-emerald-200 cursor-pointer hover:border-emerald-400 transition-all card-hover"
            onClick={() => navigate('/knowledge')}
          >
            <CardContent className="p-8 text-center">
              <Navigation className="w-16 h-16 mx-auto mb-4 text-emerald-600" />
              <h3 className="text-2xl font-bold mb-2">Aprender</h3>
              <p className="text-lg text-zinc-600">Consejos de seguridad</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FamilyMode;
