import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Shield, Check, Loader2, MapPin, Users, AlertTriangle,
  Smartphone, CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const API = process.env.REACT_APP_BACKEND_URL;

export default function VincularDispositivo() {
  const { memberId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [inviteInfo, setInviteInfo] = useState(null);
  const [error, setError] = useState(null);
  const [linking, setLinking] = useState(false);
  const [linked, setLinked] = useState(false);

  useEffect(() => {
    if (memberId && token) {
      loadInviteInfo();
    } else {
      setError('Enlace de invitación no válido');
      setLoading(false);
    }
  }, [memberId, token]);

  const loadInviteInfo = async () => {
    try {
      const response = await axios.get(`${API}/api/family/invite/${memberId}?token=${token}`);
      setInviteInfo(response.data);
      
      if (response.data.already_linked) {
        setLinked(true);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invitación no válida o expirada');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkDevice = async () => {
    setLinking(true);
    
    try {
      // Get device info
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        linkedAt: new Date().toISOString()
      };
      
      const response = await axios.post(`${API}/api/family/link-device/${memberId}`, {
        token,
        device_info: deviceInfo
      });
      
      toast.success(response.data.message);
      setLinked(true);
      
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al vincular dispositivo');
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-red-950/50 border-red-800">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Enlace no válido</h2>
            <p className="text-red-200 mb-6">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline" className="border-red-500 text-red-400">
              Ir al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (linked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-emerald-950/50 border-emerald-700">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Dispositivo Vinculado!</h2>
            <p className="text-emerald-200 mb-6">
              Ya estás conectado con la familia de <strong>{inviteInfo?.owner_name}</strong>.
              Podrán localizarte en caso de emergencia.
            </p>
            
            <div className="bg-emerald-900/30 rounded-lg p-4 mb-6 text-left">
              <p className="text-emerald-300 text-sm mb-2">✅ Recibirás alertas SOS de tu familia</p>
              <p className="text-emerald-300 text-sm mb-2">✅ Podrán ver tu ubicación cuando la soliciten</p>
              <p className="text-emerald-300 text-sm">✅ Estarás protegido contra fraudes</p>
            </div>
            
            <Button 
              onClick={() => navigate('/registro')} 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Crear mi cuenta en ManoProtect
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-slate-900/90 border-emerald-700/50">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-emerald-400" />
          </div>
          <CardTitle className="text-2xl text-white">Invitación Familiar</CardTitle>
          <p className="text-slate-400">ManoProtect - Protección Digital</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-6 text-center">
            <p className="text-emerald-200 mb-2">
              <strong className="text-white text-lg">{inviteInfo?.owner_name}</strong>
            </p>
            <p className="text-emerald-300">
              te ha añadido a su familia como
            </p>
            <p className="text-2xl font-bold text-white mt-2">
              {inviteInfo?.member_name}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-300">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span>Podrán ver tu ubicación en emergencias</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Recibirás alertas SOS de tu familia</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Protección contra fraudes y estafas</span>
            </div>
          </div>
          
          <Button
            onClick={handleLinkDevice}
            disabled={linking}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-lg"
            data-testid="link-device-btn"
          >
            {linking ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Vinculando...
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5 mr-2" />
                Vincular mi dispositivo
              </>
            )}
          </Button>
          
          <p className="text-center text-xs text-slate-500">
            Al vincular tu dispositivo, aceptas que tu familiar pueda
            solicitar tu ubicación en caso de emergencia.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
