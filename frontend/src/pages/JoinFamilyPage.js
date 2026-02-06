import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Users, Check, X, Loader2, Heart, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

/**
 * Página para unirse a una familia
 * El familiar llega aquí desde el SMS de invitación
 */
const JoinFamilyPage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [memberId]);

  const loadInvitation = async () => {
    try {
      // Get invitation info (public endpoint)
      const response = await fetch(`${API}/family/invitation/${memberId}`);
      
      if (response.ok) {
        const data = await response.json();
        setInvitation(data);
      } else {
        const err = await response.json();
        setError(err.detail || 'Invitación no encontrada o ya utilizada');
      }
    } catch (err) {
      setError('Error al cargar la invitación');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      // Save the invite URL and redirect to login
      localStorage.setItem('pendingInvite', memberId);
      toast.info('Inicia sesión o regístrate para unirte a la familia');
      navigate('/login');
      return;
    }

    setJoining(true);
    try {
      const response = await fetch(`${API}/family/join/${memberId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess(true);
        toast.success('¡Te has unido a la familia!');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        const err = await response.json();
        toast.error(err.detail || 'Error al unirse');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-zinc-800/50 border-zinc-700">
          <CardContent className="pt-8 text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Invitación no válida</h2>
            <p className="text-zinc-400 mb-6">{error}</p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Ir al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-zinc-800/50 border-zinc-700">
          <CardContent className="pt-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido a la familia!</h2>
            <p className="text-zinc-400 mb-2">
              Te has unido correctamente a la familia de <strong className="text-white">{invitation?.owner_name}</strong>
            </p>
            <p className="text-emerald-400 text-sm">
              Ahora recibirás alertas SOS cuando un familiar te necesite
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-zinc-800/50 border-zinc-700">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl text-white">Invitación Familiar</CardTitle>
          <CardDescription className="text-zinc-400">
            Te han invitado a unirte a ManoProtect
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Invitation details */}
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
            <p className="text-zinc-300 text-center">
              <strong className="text-white text-lg">{invitation?.owner_name}</strong>
              <br />
              te ha añadido como <span className="text-emerald-400">{invitation?.relationship || 'familiar'}</span>
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-400">Al unirte podrás:</h3>
            <div className="flex items-center gap-3 text-zinc-300">
              <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Recibir alertas SOS de tu familia</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <Users className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Ver la ubicación en caso de emergencia</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <Heart className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Proteger a tus seres queridos</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleJoin}
              disabled={joining}
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg"
            >
              {joining ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Unirme a la familia
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            {!isAuthenticated && (
              <p className="text-xs text-zinc-500 text-center">
                Necesitarás crear una cuenta o iniciar sesión
              </p>
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-zinc-500 text-center pt-2">
            Este es un servicio privado de avisos entre familiares.
            <br />No es un servicio de emergencias oficial.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinFamilyPage;
