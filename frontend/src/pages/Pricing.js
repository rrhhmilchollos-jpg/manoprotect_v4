import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Check, Users, ArrowRight, Loader2, HelpCircle, Building2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAnnual, setIsAnnual] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Poll payment status function
  const pollPaymentStatus = useCallback(async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      toast.info('Verificación de pago en progreso. Revisa tu email para confirmación.');
      setCheckingPayment(false);
      return;
    }

    try {
      const response = await fetch(`${API}/checkout/status/${sessionId}`);
      if (!response.ok) throw new Error('Error al verificar estado del pago');

      const data = await response.json();

      if (data.payment_status === 'paid') {
        toast.success('¡Pago exitoso! Tu suscripción está activa.');
        setCheckingPayment(false);
        setTimeout(() => navigate('/dashboard?success=true'), 1500);
        return;
      } else if (data.status === 'expired') {
        toast.error('La sesión de pago ha expirado. Inténtalo de nuevo.');
        setCheckingPayment(false);
        return;
      }

      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error('Error verificando el pago. Por favor, contacta soporte.');
      setCheckingPayment(false);
    }
  }, [navigate]);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (sessionId && success === 'true') {
      setCheckingPayment(true);
      toast.info('Verificando estado del pago...');
      pollPaymentStatus(sessionId);
      setSearchParams({});
    } else if (canceled === 'true') {
      toast.info('Pago cancelado. Puedes intentarlo de nuevo cuando quieras.');
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, pollPaymentStatus]);

  // Precios simplificados - 3 planes claros
  const plans = [
    {
      id: 'free',
      name: 'Básico',
      description: 'Para empezar a protegerte',
      monthlyPrice: 0,
      annualPrice: 0,
      icon: Shield,
      color: 'zinc',
      features: [
        'Protección 24/7 básica',
        '10 análisis de amenazas/mes',
        'Alertas de seguridad',
        'Base de conocimiento',
        'Soporte por email'
      ],
      cta: 'Comenzar Gratis',
      popular: false
    },
    {
      id: isAnnual ? 'yearly' : 'monthly',
      name: 'Individual',
      description: 'La mejor opción para ti y tu familia cercana',
      monthlyPrice: 29.99,
      annualPrice: 249.99, // ~20.83/mes
      annualSavings: 110,
      icon: Shield,
      color: 'indigo',
      features: [
        'Protección 24/7 avanzada',
        'Análisis ilimitados con IA',
        'Bloqueo automático de amenazas',
        'Hasta 2 familiares incluidos',
        'Botón SOS de emergencia',
        'Historial completo',
        'Sin anuncios',
        'Soporte prioritario'
      ],
      cta: isAnnual ? 'Ahorrar €110/año' : 'Suscribirse',
      popular: true
    },
    {
      id: isAnnual ? 'family-yearly' : 'family-monthly',
      name: 'Familiar',
      description: 'Protección completa para toda la familia',
      monthlyPrice: 49.99,
      annualPrice: 399.99, // ~33.33/mes
      annualSavings: 200,
      icon: Users,
      color: 'emerald',
      features: [
        'Todo de Individual +',
        'Hasta 5 miembros familia',
        'Localización GPS en emergencias',
        'Tracking de niños bajo demanda',
        'Historial de ubicaciones',
        'Modo Senior simplificado',
        'Panel familiar centralizado',
        'Garantía satisfacción 15 días'
      ],
      cta: isAnnual ? 'Ahorrar €200/año' : 'Proteger Familia',
      popular: false
    }
  ];

  const handleSubscribe = async (planId) => {
    if (planId === 'free') {
      navigate('/register');
      return;
    }

    if (checkingPayment) {
      toast.info('Verificando pago en progreso...');
      return;
    }

    setLoadingPlan(planId);
    toast.info('Conectando con pasarela de pago...');

    try {
      const originUrl = window.location.origin;

      const response = await fetch(`${API}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan_type: planId,
          origin_url: originUrl
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al crear sesión de pago');
      }

      const data = await response.json();
      
      if (data.checkout_url) {
        toast.success('Redirigiendo al pago seguro...');
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No se recibió URL de checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoadingPlan(null);
    }
  };

  const faqs = [
    {
      q: '¿Puedo cancelar en cualquier momento?',
      a: 'Sí, sin preguntas. Cancela desde tu perfil y seguirás teniendo acceso hasta el final del período pagado.'
    },
    {
      q: '¿Qué incluye la garantía de 15 días?',
      a: 'Si no estás satisfecho, te devolvemos el 100% del importe. Sin letra pequeña, sin complicaciones.'
    },
    {
      q: '¿Cómo funciona el botón SOS?',
      a: 'Al pulsarlo, se envía tu ubicación GPS a tus contactos de emergencia y suena una alarma en sus dispositivos.'
    },
    {
      q: '¿Puedo cambiar de plan después?',
      a: 'Sí, puedes subir o bajar de plan cuando quieras. El saldo restante se aplica automáticamente.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/manoprotect_logo.png" alt="ManoProtect" className="h-8 w-auto" />
          </div>
          <Button
            onClick={() => navigate('/login')}
            variant="outline"
            className="rounded-full px-6"
            data-testid="header-login-btn"
          >
            Iniciar Sesión
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Elige tu protección
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Protección contra fraudes y seguridad familiar. Sin sorpresas, cancela cuando quieras.
          </p>
          
          {/* Toggle Mensual/Anual */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
              Mensual
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-indigo-600"
              data-testid="billing-toggle"
            />
            <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
              Anual
            </span>
            {isAnnual && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                Ahorra hasta 33%
              </Badge>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const monthlyEquivalent = isAnnual && plan.annualPrice > 0 
              ? (plan.annualPrice / 12).toFixed(2) 
              : null;

            return (
              <Card 
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-2 border-indigo-500 shadow-lg scale-[1.02]' 
                    : 'border border-slate-200 hover:border-slate-300'
                }`}
                data-testid={`plan-card-${plan.name.toLowerCase()}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white px-4 py-1 text-sm font-semibold shadow-lg">
                      Más Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pt-8 pb-4">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    plan.popular ? 'bg-indigo-100' : 'bg-slate-100'
                  }`}>
                    <plan.icon className={`w-7 h-7 ${
                      plan.popular ? 'text-indigo-600' : 'text-slate-600'
                    }`} />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-slate-500 text-sm mt-1">{plan.description}</p>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-slate-900">
                        €{price === 0 ? '0' : price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-slate-500">
                        /{isAnnual ? 'año' : 'mes'}
                      </span>
                    </div>
                    {monthlyEquivalent && price > 0 && (
                      <p className="text-sm text-emerald-600 font-medium mt-1">
                        Solo €{monthlyEquivalent.replace('.', ',')}/mes
                      </p>
                    )}
                    {isAnnual && plan.annualSavings && (
                      <p className="text-xs text-slate-500 mt-1">
                        Ahorras €{plan.annualSavings}/año
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          plan.popular ? 'text-indigo-500' : 'text-emerald-500'
                        }`} />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loadingPlan === plan.id}
                    className={`w-full h-12 rounded-xl font-semibold transition-all ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
                        : plan.id === 'free'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                    data-testid={`subscribe-${plan.name.toLowerCase()}-btn`}
                  >
                    {loadingPlan === plan.id ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
                    ) : (
                      <>{plan.cta} <ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-20 py-8 border-y border-slate-200">
          <div className="flex items-center gap-2 text-slate-600">
            <Check className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium">Sin permanencia</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Check className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium">Garantía 15 días</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Check className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium">Pago seguro con Stripe</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Check className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium">Soporte en español</span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-10">
            <HelpCircle className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900">Preguntas Frecuentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="border-slate-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600 text-sm">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enterprise & Investors - Footer Section */}
        <div className="border-t border-slate-200 pt-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Enterprise */}
            <Card className="border-slate-200 hover:border-amber-300 transition-all">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Enterprise</h3>
                    <p className="text-sm text-slate-500">Para bancos y corporaciones</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm mb-4">
                  Integración API, compliance regulatorio, y soporte dedicado para grandes organizaciones.
                </p>
                <Button
                  onClick={() => window.open('mailto:enterprise@manoprotect.com', '_blank')}
                  variant="outline"
                  className="w-full rounded-lg border-amber-300 hover:bg-amber-50 text-amber-700"
                >
                  Contactar Ventas
                </Button>
              </CardContent>
            </Card>

            {/* Investors */}
            <Card className="border-slate-200 hover:border-indigo-300 transition-all">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Inversores</h3>
                    <p className="text-sm text-slate-500">Oportunidad de inversión</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm mb-4">
                  Accede a nuestro plan de negocio, modelo financiero y pitch deck para inversores.
                </p>
                <Button
                  onClick={() => navigate('/investor/register')}
                  variant="outline"
                  className="w-full rounded-lg border-indigo-300 hover:bg-indigo-50 text-indigo-700"
                >
                  Acceso Inversores
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-slate-500">
          <p>© 2026 ManoProtect. Todos los derechos reservados.</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <button onClick={() => navigate('/privacy')} className="hover:text-slate-700">
              Privacidad
            </button>
            <button onClick={() => navigate('/terms')} className="hover:text-slate-700">
              Términos
            </button>
            <button onClick={() => navigate('/contact')} className="hover:text-slate-700">
              Contacto
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
