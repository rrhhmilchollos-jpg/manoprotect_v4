import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Check, Loader2, Calendar, CreditCard, Shield, AlertTriangle, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Plan info mapping
const PLAN_INFO = {
  basico: { name: 'Básico', price: { mensual: 0, anual: 0 } },
  individual: { name: 'Individual', price: { mensual: 29.99, anual: 249.99 } },
  familiar: { name: 'Familiar', price: { mensual: 49.99, anual: 399.99 } }
};

const TrialSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [trialInfo, setTrialInfo] = useState(null);
  const [error, setError] = useState(null);

  const checkTrialStatus = useCallback(async (sessionId) => {
    try {
      const response = await fetch(`${API}/trial/status/${sessionId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al verificar el trial');
      }

      const data = await response.json();
      setTrialInfo(data);

      if (data.status === 'trialing') {
        toast.success('¡Trial activado exitosamente!');
      } else if (data.status === 'pending_verification') {
        // Poll again
        setTimeout(() => checkTrialStatus(sessionId), 2000);
        return;
      }
    } catch (err) {
      console.error('Error checking trial status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // First check if we have state from registration
    const stateData = location.state;
    
    if (stateData && stateData.plan) {
      // We came from registration page with data
      const planInfo = PLAN_INFO[stateData.plan] || PLAN_INFO.individual;
      const price = planInfo.price[stateData.periodo || 'mensual'];
      
      setTrialInfo({
        status: 'trialing',
        trial_end: stateData.trialEnd,
        plan_after_trial: `${planInfo.name} ${stateData.periodo === 'anual' ? 'Anual' : 'Mensual'}`,
        amount_after_trial: price,
        email: stateData.email,
        periodo: stateData.periodo,
        message: price === 0 
          ? 'Después del trial, deberás elegir un plan de pago para continuar.'
          : 'Si no cancelas antes de que termine el trial, se cobrará automáticamente el plan seleccionado.'
      });
      setLoading(false);
      toast.success('¡Cuenta creada exitosamente!');
      return;
    }
    
    // Otherwise, check via session_id
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      checkTrialStatus(sessionId);
    } else {
      // If no session_id and no state, show generic success
      setTrialInfo({
        status: 'trialing',
        trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        plan_after_trial: 'Tu plan seleccionado',
        message: 'Disfruta de tu periodo de prueba de 7 días.'
      });
      setLoading(false);
    }
  }, [searchParams, location.state, checkTrialStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Verificando tu trial...</h2>
          <p className="text-zinc-600">Esto solo tomará un momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-red-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-zinc-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/pricing')} className="w-full">
              Volver a Planes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full border-amber-300 border-2">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">¡Trial Activado!</CardTitle>
          <p className="text-zinc-600">Tu periodo de prueba de 7 días ha comenzado</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trial Details */}
          <div className="bg-white rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-zinc-500">Fecha de fin del trial</div>
                <div className="font-semibold">{formatDate(trialInfo?.trial_end)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-sm text-zinc-500">Plan después del trial</div>
                <div className="font-semibold">{trialInfo?.plan_after_trial || 'Premium Mensual'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm text-zinc-500">Cargo después del trial</div>
                <div className="font-semibold">€{trialInfo?.amount_after_trial || '29.99'}/mes</div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-800 mb-1">Importante</p>
                <p className="text-amber-700">
                  {trialInfo?.message || 'Si no cancelas antes de que termine el trial, se cobrará automáticamente el plan seleccionado.'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12"
            >
              Ir al Dashboard
            </Button>
            <Button
              onClick={() => navigate('/pricing')}
              variant="outline"
              className="w-full h-12"
            >
              Ver otros planes
            </Button>
          </div>

          <p className="text-center text-xs text-zinc-500">
            Puedes cancelar tu trial en cualquier momento desde tu panel de usuario sin ningún cargo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialSuccess;
