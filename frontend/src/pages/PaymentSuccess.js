import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Mail, Shield, ArrowRight, Loader2, XCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setStatus('failed');
      return;
    }

    const verifyPayment = async (attempts = 0) => {
      try {
        const response = await fetch(`${API}/checkout/status/${sessionId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Error al verificar pago');
        
        const data = await response.json();
        setPaymentData(data);
        
        if (data.payment_status === 'paid') {
          setStatus('success');
          toast.success('¡Pago completado con éxito!');
        } else if (data.status === 'expired') {
          setStatus('failed');
          toast.error('La sesión de pago ha expirado');
        } else if (attempts < 10) {
          // Keep polling for pending payments
          setTimeout(() => verifyPayment(attempts + 1), 2000);
        } else {
          setStatus('failed');
        }
      } catch (error) {
        console.error('Error:', error);
        if (attempts < 3) {
          setTimeout(() => verifyPayment(attempts + 1), 2000);
        } else {
          setStatus('failed');
        }
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white shadow-xl">
          <CardContent className="pt-12 pb-8 text-center">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Verificando tu pago...</h2>
            <p className="text-zinc-600">Por favor, espera un momento mientras confirmamos tu transacción.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white shadow-xl">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-800">Error en el pago</h2>
            <p className="text-zinc-600 mb-6">
              No pudimos verificar tu pago. Si crees que esto es un error, 
              por favor contacta con soporte.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => navigate('/pricing')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Intentar de nuevo
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                <Home className="w-4 h-4 mr-2" />
                Ir al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-white shadow-xl overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 py-8 px-6 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">¡Gracias por tu pedido!</h1>
          <p className="text-emerald-100 text-lg">Tu suscripción Premium está activa</p>
        </div>

        <CardContent className="pt-8 pb-8">
          {/* Order Details */}
          {paymentData && (
            <div className="bg-zinc-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold mb-3 text-zinc-700">Detalles del pedido:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Plan:</span>
                  <span className="font-medium">{paymentData.metadata?.plan_name || 'Premium'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Importe:</span>
                  <span className="font-bold text-emerald-600">
                    €{(paymentData.amount_total / 100).toFixed(2)} {paymentData.currency?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Email Notice */}
          <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-xl mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-indigo-900 mb-1">Recibo por email</h3>
              <p className="text-sm text-indigo-700">
                En breve recibirás tu recibo e instrucciones por correo electrónico. 
                Revisa también tu carpeta de spam.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-8">
            <h3 className="font-semibold mb-3 text-zinc-700">Ahora tienes acceso a:</h3>
            <ul className="space-y-2">
              {[
                'Análisis ilimitados con IA avanzada',
                'Protección 24/7 contra fraudes',
                'Bloqueo automático de amenazas',
                'Soporte prioritario',
                'Panel de control completo'
              ].map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-zinc-600">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg"
            data-testid="go-to-dashboard-btn"
          >
            Empezar a usar MANO Premium
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Support */}
          <p className="text-center text-xs text-zinc-500 mt-6">
            ¿Tienes alguna pregunta? Contacta con <a href="mailto:soporte@manoprotect.com" className="text-indigo-600 hover:underline">soporte@manoprotect.com</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
