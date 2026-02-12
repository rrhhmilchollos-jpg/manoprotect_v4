/**
 * ManoProtect - Order Confirmation Page
 * Página de agradecimiento después de la compra del dispositivo SOS
 * Incluye redirección automática al dashboard
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Clock, 
  ArrowRight, 
  Phone, 
  Mail,
  MapPin,
  Shield,
  Home,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(true);
  
  const sessionId = searchParams.get('session_id');
  const paymentStatus = searchParams.get('payment');
  
  // Fetch order details from Stripe session
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${API}/payments/device/status/${sessionId}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setOrderDetails(data);
          
          // Trigger confetti on successful payment
          if (data.payment_status === 'paid') {
            triggerConfetti();
          }
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [sessionId]);
  
  // Countdown timer for auto-redirect
  useEffect(() => {
    if (!autoRedirect || countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard?tab=pedidos');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [autoRedirect, navigate]);
  
  // Confetti effect
  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    
    const colors = ['#dc2626', '#f97316', '#10b981', '#3b82f6'];
    
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };
  
  const handleGoToDashboard = () => {
    setAutoRedirect(false);
    navigate('/dashboard?tab=pedidos');
  };
  
  const handleStayHere = () => {
    setAutoRedirect(false);
    setCountdown(0);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-zinc-500">Cargando detalles del pedido...</p>
        </div>
      </div>
    );
  }
  
  // Payment cancelled
  if (paymentStatus === 'cancelled') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-4">Pago Cancelado</h1>
          <p className="text-lg text-zinc-600 mb-8">
            El proceso de pago ha sido cancelado. No se ha realizado ningún cargo.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/servicios-sos')} className="bg-red-600 hover:bg-red-700">
              <ArrowRight className="w-4 h-4 mr-2" />
              Volver a intentar
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Ir al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-zinc-50">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center animate-bounce">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">¡Gracias por tu pedido!</h1>
          <p className="text-xl text-emerald-100 max-w-xl mx-auto">
            Tu dispositivo SOS ManoProtect está en camino. Pronto tu familia estará más protegida.
          </p>
          
          {/* Order ID Badge */}
          {sessionId && (
            <div className="mt-6">
              <Badge className="bg-white/20 text-white text-sm px-4 py-2">
                <Package className="w-4 h-4 mr-2" />
                Pedido #{sessionId.slice(0, 8).toUpperCase()}
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 -mt-8">
        {/* Auto-redirect Card */}
        {autoRedirect && countdown > 0 && (
          <Card className="mb-8 border-2 border-emerald-200 bg-emerald-50/50">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-emerald-600 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900">
                      Redireccionando al panel de seguimiento...
                    </p>
                    <p className="text-sm text-emerald-700">
                      En <span className="font-bold text-2xl">{countdown}</span> segundos
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleGoToDashboard} className="bg-emerald-600 hover:bg-emerald-700">
                    Ir ahora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="outline" onClick={handleStayHere}>
                    Quedarme aquí
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Order Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* What Happens Next */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                ¿Qué pasa ahora?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-600 font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Preparación del pedido</p>
                    <p className="text-sm text-zinc-500">Estamos preparando tu dispositivo SOS</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-zinc-400 font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-zinc-500">Envío Express</p>
                    <p className="text-sm text-zinc-400">Entrega en 24-48h laborables</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-zinc-400 font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-zinc-500">Activación</p>
                    <p className="text-sm text-zinc-400">Activa tu dispositivo desde la app</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Order Details */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                Detalles del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                  <span className="text-zinc-600">Dispositivo SOS</span>
                  <Badge className="bg-emerald-100 text-emerald-700">GRATIS</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                  <span className="text-zinc-600">Envío Express</span>
                  <span className="font-medium">
                    {orderDetails?.amount_total ? `${orderDetails.amount_total.toFixed(2)}€` : '4,95€'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-lg">Total pagado</span>
                  <span className="font-bold text-lg text-emerald-600">
                    {orderDetails?.amount_total ? `${orderDetails.amount_total.toFixed(2)}€` : '4,95€'}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Email de confirmación</p>
                    <p className="text-sm text-amber-700">
                      Recibirás un email con los detalles del pedido y el número de seguimiento.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Track Your Order CTA */}
        <Card className="bg-gradient-to-r from-red-600 to-orange-500 text-white border-0 shadow-xl">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <MapPin className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Sigue tu pedido</h3>
                  <p className="text-red-100">
                    Accede al panel de seguimiento para ver el estado de tu envío en tiempo real
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleGoToDashboard}
                className="bg-white text-red-600 hover:bg-zinc-100 h-14 px-8 text-lg font-bold shadow-lg"
                data-testid="go-to-dashboard-btn"
              >
                <Shield className="w-6 h-6 mr-2" />
                Ir al Panel de Seguimiento
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Support Info */}
        <div className="mt-8 text-center">
          <p className="text-zinc-500 mb-4">¿Tienes alguna pregunta sobre tu pedido?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="tel:+34601510950" 
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
            >
              <Phone className="w-4 h-4" />
              601 510 950
            </a>
            <a 
              href="mailto:soporte@manoprotect.com" 
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
            >
              <Mail className="w-4 h-4" />
              soporte@manoprotect.com
            </a>
          </div>
        </div>
      </div>
      
      {/* Promo Footer */}
      <div className="bg-zinc-900 text-white py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-4 text-amber-400" />
          <h3 className="text-xl font-bold mb-2">¿Conoces a alguien que necesite protección?</h3>
          <p className="text-zinc-400 mb-4">
            Comparte ManoProtect con tus familiares y amigos. Juntos estamos más seguros.
          </p>
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-zinc-900"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'ManoProtect - Protección familiar',
                  text: '¡Protege a tu familia con ManoProtect! Dispositivo SOS GRATIS',
                  url: window.location.origin
                });
              }
            }}
          >
            Compartir ManoProtect
          </Button>
        </div>
      </div>
    </div>
  );
}
