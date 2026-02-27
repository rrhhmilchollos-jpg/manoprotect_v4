/**
 * CompartirUbicacion - Page to share location when requested by family
 * This page opens when a family member requests your location
 */
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Send, Shield, Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getCurrentLocation } from '@/services/backgroundLocation';
import LiveLocationMap from '@/components/LiveLocationMap';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const CompartirUbicacion = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestId = searchParams.get('req');
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [requestInfo, setRequestInfo] = useState(null);
  const [error, setError] = useState(null);

  // Load location on mount
  useEffect(() => {
    const loadLocation = async () => {
      try {
        const loc = await getCurrentLocation();
        if (loc) {
          setLocation({
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracy: loc.accuracy
          });
          // Try to get address from coordinates
          try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.latitude}&lon=${loc.longitude}`);
            const data = await resp.json();
            if (data.display_name) setAddress(data.display_name);
          } catch { /* address is optional */ }
        } else {
          setError('No se pudo obtener la ubicación GPS. Activa los permisos de ubicación.');
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Error obteniendo ubicación');
        setLoading(false);
      }
    };
    
    loadLocation();
    
    // Also fetch request info if we have a request ID
    if (requestId) {
      fetchRequestInfo();
    }
  }, [requestId]);

  const fetchRequestInfo = async () => {
    try {
      const response = await fetch(`${API}/family/location-request/${requestId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRequestInfo(data);
      }
    } catch (err) {
      console.error('Error fetching request info:', err);
    }
  };

  const handleShareLocation = async () => {
    if (!location) {
      toast.error('No se pudo obtener tu ubicación');
      return;
    }

    setSending(true);
    
    try {
      const response = await fetch(`${API}/family/share-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          request_id: requestId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          address: address
        })
      });

      if (response.ok) {
        setSent(true);
        toast.success('Ubicación compartida correctamente');
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Error al compartir ubicación');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setSending(false);
    }
  };

  const handleDecline = () => {
    toast.info('Has rechazado compartir tu ubicación');
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-zinc-600">Obteniendo tu ubicación...</p>
            <p className="text-sm text-zinc-400 mt-2">Esto puede tardar unos segundos</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Error de ubicación</h2>
            <p className="text-zinc-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Ubicación compartida</h2>
            <p className="text-zinc-600 mb-2">
              {requestInfo?.requester_name || 'Tu familiar'} ahora puede ver dónde estás.
            </p>
            <p className="text-sm text-zinc-400 mb-6">{address}</p>
            <Button onClick={() => navigate('/dashboard')} className="bg-green-600 hover:bg-green-700">
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Solicitud de Ubicación</h1>
          {requestInfo?.requester_name && (
            <p className="text-zinc-600 mt-2">
              <strong>{requestInfo.requester_name}</strong> quiere saber dónde estás
            </p>
          )}
        </div>

        {/* Location Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Tu ubicación actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Map */}
            {location && (
              <LiveLocationMap
                latitude={location.latitude}
                longitude={location.longitude}
                accuracy={location.accuracy}
                address={address}
                personName="Tu ubicación"
                height="200px"
                zoom={16}
              />
            )}

            {/* Address */}
            <div className="bg-zinc-50 rounded-lg p-4">
              <p className="text-sm text-zinc-500 mb-1">Dirección detectada:</p>
              <p className="font-medium text-zinc-900">{address || 'Obteniendo dirección...'}</p>
              <p className="text-xs text-zinc-400 mt-2">
                Coordenadas: {location?.latitude?.toFixed(6)}, {location?.longitude?.toFixed(6)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleShareLocation}
            disabled={sending || !location}
            className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700"
          >
            {sending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Compartir mi Ubicación
              </>
            )}
          </Button>
          
          <Button
            onClick={handleDecline}
            variant="outline"
            className="w-full h-12"
          >
            <X className="w-4 h-4 mr-2" />
            No compartir
          </Button>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-zinc-400 text-center mt-6">
          Tu ubicación solo se compartirá una vez con el familiar que la solicitó.
          ManoProtect protege tu privacidad.
        </p>
      </div>
    </div>
  );
};

export default CompartirUbicacion;
