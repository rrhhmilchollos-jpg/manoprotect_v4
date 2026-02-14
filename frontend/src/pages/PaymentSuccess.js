import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Mail, Shield, ArrowRight, Loader2, XCircle, Home, Clock, Award, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import NoAdsPage from '@/components/NoAdsPage';

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

  // Verifying state - wrapped in NoAdsPage
  if (status === 'verifying') {
    return (
      <NoAdsPage reason="payment-verification">
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-emerald-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <Card className="bg-white shadow-xl">
              <CardContent className="pt-12 pb-8 text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Verificando tu pago...</h2>
                <p className="text-zinc-600 mb-6">Por favor, espera un momento mientras confirmamos tu transacción de forma segura.</p>
                
                {/* Progress steps */}
                <div className="space-y-3 text-left max-w-xs mx-auto">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-zinc-600">Pago recibido</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    <span className="text-sm text-zinc-600">Verificando transacción...</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-zinc-300" />
                    <span className="text-sm text-zinc-400">Activando suscripción</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Pago seguro</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>Garantía 7 días</span>
              </div>
            </div>
          </div>
        </div>
      </NoAdsPage>
    );
  }

  // Failed state
  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <Card className="bg-white shadow-xl">
            <CardContent className="pt-12 pb-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-red-800">Error en el pago</h2>
              <p className="text-zinc-600 mb-6">
                No pudimos verificar tu pago. Esto puede deberse a una interrupción temporal. 
                Por favor, intenta de nuevo o contacta con soporte.
              </p>
              
              {/* Help section */}
              <div className="bg-zinc-50 rounded-xl p-4 mb-6 text-left">
                <h4 className="font-semibold text-sm mb-2">¿Qué puedes hacer?</h4>
                <ul className="space-y-2 text-sm text-zinc-600">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600">•</span>
                    Verifica que tu tarjeta tenga fondos suficientes
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600">•</span>
                    Intenta con otra tarjeta o método de pago
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600">•</span>
                    Contacta con tu banco si el problema persiste
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => navigate('/pricing')}
                  className="bg-indigo-600 hover:bg-indigo-700 w-full"
                >
                  Intentar de nuevo
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir al Dashboard
                </Button>
              </div>
              
              <p className="text-xs text-zinc-500 mt-6">
                ¿Necesitas ayuda? <a href="mailto:soporte@manoprotect.com" className="text-indigo-600 hover:underline">soporte@manoprotect.com</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success state - Full content page
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <Card className="bg-white shadow-xl overflow-hidden mb-8">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 py-10 px-6 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-14 h-14 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">¡Gracias por tu pedido!</h1>
            <p className="text-emerald-100 text-lg">Tu suscripción Premium está activa</p>
          </div>

          <CardContent className="pt-8 pb-8">
            {/* Order Details */}
            {paymentData && (
              <div className="bg-zinc-50 rounded-xl p-5 mb-6">
                <h3 className="font-semibold mb-4 text-zinc-700 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Detalles de tu pedido
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-200">
                    <span className="text-zinc-600">Plan contratado:</span>
                    <span className="font-semibold text-indigo-600">{paymentData.metadata?.plan_name || 'Premium'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-200">
                    <span className="text-zinc-600">Importe total:</span>
                    <span className="font-bold text-lg text-emerald-600">
                      €{(paymentData.amount_total / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-600">Estado:</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      Activo
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Email Notice */}
            <div className="flex items-start gap-4 p-5 bg-indigo-50 rounded-xl mb-6">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900 mb-1">Recibo enviado por email</h3>
                <p className="text-sm text-indigo-700">
                  Hemos enviado el recibo de tu compra a tu correo electrónico. 
                  Si no lo encuentras, revisa tu carpeta de spam o promociones.
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4 text-zinc-700 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Ahora tienes acceso completo a:
              </h3>
              <div className="grid gap-3">
                {[
                  { icon: Shield, text: 'Análisis ilimitados con IA avanzada', desc: 'Sin límites diarios ni restricciones' },
                  { icon: Clock, text: 'Protección 24/7 contra fraudes', desc: 'Monitoreo continuo de amenazas' },
                  { icon: Users, text: 'Protección familiar completa', desc: 'Hasta 5 miembros en plan familiar' },
                  { icon: Award, text: 'Soporte prioritario', desc: 'Respuesta en menos de 24 horas' },
                  { icon: Zap, text: 'Alertas instantáneas', desc: 'Notificaciones en tiempo real' }
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-white border border-zinc-100 rounded-lg">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">{benefit.text}</p>
                      <p className="text-xs text-zinc-500">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg rounded-xl"
              data-testid="go-to-dashboard-btn"
            >
              Empezar a usar ManoProtect Premium
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
        
        {/* Additional Info */}
        <div className="text-center">
          <h4 className="font-semibold text-zinc-700 mb-3">¿Necesitas ayuda?</h4>
          <p className="text-sm text-zinc-500 mb-4">
            Nuestro equipo de soporte está disponible para resolver cualquier duda.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <a href="mailto:soporte@manoprotect.com" className="text-indigo-600 hover:underline flex items-center gap-1">
              <Mail className="w-4 h-4" />
              soporte@manoprotect.com
            </a>
          </div>
          
          {/* Company info */}
          <p className="text-xs text-zinc-400 mt-8">
            Manoprotect.com
            <br />
            Todos los pagos son procesados de forma segura por Stripe
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
