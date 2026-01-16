import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Check, Zap, Users, Crown, ArrowRight, Loader2, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [billingCycle, setBillingCycle] = useState('monthly');
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
        toast.success('¡Pago exitoso! Tu suscripción Premium está activa.');
        setCheckingPayment(false);
        // Clean URL and redirect to dashboard
        setTimeout(() => navigate('/dashboard?success=true'), 1500);
        return;
      } else if (data.status === 'expired') {
        toast.error('La sesión de pago ha expirado. Inténtalo de nuevo.');
        setCheckingPayment(false);
        return;
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error('Error verificando el pago. Por favor, contacta soporte.');
      setCheckingPayment(false);
    }
  }, [navigate]);

  // Check for success/cancel from Stripe redirect
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (sessionId && success === 'true') {
      setCheckingPayment(true);
      toast.info('Verificando estado del pago...');
      pollPaymentStatus(sessionId);
      // Clean URL params
      setSearchParams({});
    } else if (canceled === 'true') {
      toast.info('Pago cancelado. Puedes intentarlo de nuevo cuando quieras.');
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, pollPaymentStatus]);

  const plans = {
    free: {
      name: 'Básico',
      price: 0,
      icon: Shield,
      color: 'zinc',
      features: [
        '10 análisis por mes',
        'Alertas básicas',
        'Historial 7 días',
        'Base de conocimiento',
        'Soporte por email'
      ],
      limitations: [
        'Sin bloqueo automático',
        'Sin modo familiar',
        'Sin exportación'
      ]
    },
    weekly: {
      name: 'Premium Semanal',
      price: 9.99,
      period: '/ semana',
      icon: Zap,
      color: 'indigo',
      badge: 'Prueba',
      users: '2 usuarios',
      features: [
        '👥 Protección para 2 personas',
        'Análisis ilimitados',
        'Bloqueo automático IA',
        'Historial completo',
        'Exportación de datos',
        'Alertas comunitarias',
        'Soporte prioritario',
        'Sin anuncios'
      ]
    },
    monthly: {
      name: 'Premium Mensual',
      price: 29.99,
      period: '/ mes',
      icon: Shield,
      color: 'indigo',
      badge: 'Popular',
      users: '2 usuarios',
      features: [
        '👥 Protección para 2 personas',
        'Todo de Premium Semanal',
        'Protección 24/7',
        'Análisis avanzado IA',
        'Reportes personalizados',
        'Configuración avanzada'
      ],
      savings: null
    },
    quarterly: {
      name: 'Premium Trimestral',
      price: 74.99,
      originalPrice: 89.97,
      period: '/ 3 meses',
      icon: Crown,
      color: 'emerald',
      badge: 'Ahorro 17%',
      users: '2 usuarios',
      features: [
        '👥 Protección para 2 personas',
        'Todo de Premium Mensual',
        'Equivale a €25/mes',
        'Ahorra €15',
        'Sin interrupciones'
      ],
      savings: 15
    },
    yearly: {
      name: 'Premium Anual',
      price: 249.99,
      originalPrice: 359.88,
      period: '/ año',
      icon: Crown,
      color: 'indigo',
      badge: 'Mejor Valor - 31% OFF',
      popular: true,
      users: '2 usuarios',
      features: [
        '👥 Protección para 2 personas',
        'Todo de Premium Mensual',
        'Equivale a €20.83/mes',
        'Ahorra €109.89/año',
        '2 meses GRATIS',
        'Garantía satisfacción 15 días'
      ],
      savings: 109.89
    }
  };

  const familyPlans = {
    monthly: {
      name: 'Familiar Mensual',
      price: 49.99,
      period: '/ mes',
      users: '5 usuarios',
      icon: Users,
      color: 'emerald',
      features: [
        'Hasta 5 miembros familia',
        'Todo Premium incluido',
        'Modo Familiar Senior',
        '🆘 Botón SOS de Emergencia',
        'Panel administración familiar',
        'Soporte prioritario'
      ],
      limitations: [
        'Sin localización GPS',
        'Sin tracking de niños',
        'Sin historial ubicaciones'
      ],
      sosDescription: 'Botón SOS básico sin localización GPS'
    },
    quarterly: {
      name: 'Familiar Trimestral',
      price: 129.99,
      originalPrice: 149.97,
      period: '/ 3 meses',
      users: '5 usuarios',
      icon: Users,
      color: 'emerald',
      badge: 'Ahorro 13%',
      features: [
        'Todo Familiar Mensual',
        '🆘 Botón SOS + GPS incluido',
        '📍 Localización bajo demanda',
        'Equivale a €43.33/mes',
        'Ahorra €19.98',
        '5 personas protegidas'
      ],
      limitations: [
        'Sin tracking continuo de niños',
        'Sin historial de ubicaciones'
      ],
      savings: 19.98,
      sosDescription: 'SOS con GPS pero sin tracking de niños'
    },
    yearly: {
      name: 'Familiar Anual',
      price: 399.99,
      originalPrice: 599.88,
      period: '/ año',
      users: '5 usuarios',
      icon: Users,
      color: 'emerald',
      badge: '⭐ MÁS COMPLETO - 33% OFF',
      popular: true,
      features: [
        'TODO de planes inferiores',
        '🆘 Botón SOS + GPS completo',
        '👶 LOCALIZAR NIÑOS por teléfono',
        '📍 Tracking bajo demanda',
        '📊 Historial de ubicaciones',
        '🔕 Modo silencioso opcional',
        'Equivale a €33.33/mes',
        'Ahorra €199.89/año',
        'Garantía satisfacción 15 días'
      ],
      savings: 199.89,
      sosDescription: 'Plan COMPLETO: SOS + GPS + Localización de niños + Historial',
      isComplete: true
    }
  };

  const handleSubscribe = async (planType) => {
    if (planType === 'free') {
      navigate('/dashboard');
      return;
    }

    if (checkingPayment) {
      toast.info('Verificando pago en progreso...');
      return;
    }

    setLoadingPlan(planType);
    toast.info('Conectando con Stripe...');

    try {
      // Get origin URL from browser (never hardcode)
      const originUrl = window.location.origin;

      const response = await fetch(`${API}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_type: planType,
          origin_url: originUrl,
          user_id: 'demo-user', // En producción, usar ID real del usuario autenticado
          email: 'usuario@demo.com' // En producción, usar email real
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al crear sesión de pago');
      }

      const data = await response.json();
      
      if (data.checkout_url) {
        toast.success('Redirigiendo a Stripe...');
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No se recibió URL de checkout');
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" 
              alt="MANO Logo" 
              className="h-8 w-auto"
            />
          </div>
          <Button
            data-testid="header-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 h-12"
          >
            Ir al Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="bg-indigo-600 text-white px-4 py-2 text-sm mb-6">
            Protección Premium que Vale la Pena
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Invierte en tu <span className="text-indigo-600">Seguridad</span>
          </h1>
          <p className="text-xl text-zinc-600 max-w-3xl mx-auto mb-8">
            Un solo fraude puede costarte €5,000+. MANO Premium te protege 24/7 por menos de lo que gastas en café.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-zinc-600">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              <span>Sin permanencia</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              <span>Cancela cuando quieras</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              <span>Garantía 15 días</span>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <Card className="mb-16 bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-rose-600 mb-2">€25,000</div>
                <div className="text-sm text-zinc-700">Pérdida promedio por fraude</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600 mb-2">2 horas</div>
                <div className="text-sm text-zinc-700">Tiempo para detectar fraude</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-emerald-600 mb-2">€249/año</div>
                <div className="text-sm text-zinc-700">MANO Premium - Protección total</div>
              </div>
            </div>
            <div className="mt-6 text-center text-zinc-700 font-medium">
              💡 Un solo fraude evitado paga 100 años de MANO Premium
            </div>
          </CardContent>
        </Card>

        {/* Premium Plans */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Planes Premium Individual</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Weekly */}
            <Card className="border-2 border-indigo-200 hover:border-indigo-400 transition-all relative">
              <CardHeader>
                <Badge className="absolute top-4 right-4 bg-indigo-600 text-white">
                  {plans.weekly.badge}
                </Badge>
                <plans.weekly.icon className="w-10 h-10 text-indigo-600 mb-3" />
                <CardTitle className="text-xl">{plans.weekly.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">€{plans.weekly.price}</span>
                  <span className="text-zinc-600">{plans.weekly.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plans.weekly.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  data-testid="subscribe-weekly-btn"
                  onClick={() => handleSubscribe('weekly')}
                  disabled={loadingPlan === 'weekly'}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-12"
                >
                  {loadingPlan === 'weekly' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
                  ) : (
                    'Probar 1 Semana'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Monthly */}
            <Card className="border-2 border-indigo-300 hover:border-indigo-500 transition-all relative">
              <CardHeader>
                <Badge className="absolute top-4 right-4 bg-orange-500 text-white">
                  {plans.monthly.badge}
                </Badge>
                <plans.monthly.icon className="w-10 h-10 text-indigo-600 mb-3" />
                <CardTitle className="text-xl">{plans.monthly.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">€{plans.monthly.price}</span>
                  <span className="text-zinc-600">{plans.monthly.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plans.monthly.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  data-testid="subscribe-monthly-btn"
                  onClick={() => handleSubscribe('monthly')}
                  disabled={loadingPlan === 'monthly'}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-12"
                >
                  {loadingPlan === 'monthly' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
                  ) : (
                    'Suscribirse'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quarterly */}
            <Card className="border-2 border-emerald-300 hover:border-emerald-500 transition-all relative">
              <CardHeader>
                <Badge className="absolute top-4 right-4 bg-emerald-600 text-white">
                  {plans.quarterly.badge}
                </Badge>
                <plans.quarterly.icon className="w-10 h-10 text-emerald-600 mb-3" />
                <CardTitle className="text-xl">{plans.quarterly.name}</CardTitle>
                <div className="mt-4">
                  <div className="text-sm text-zinc-500 line-through">€{plans.quarterly.originalPrice}</div>
                  <span className="text-4xl font-bold text-emerald-600">€{plans.quarterly.price}</span>
                  <span className="text-zinc-600">{plans.quarterly.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plans.quarterly.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  data-testid="subscribe-quarterly-btn"
                  onClick={() => handleSubscribe('quarterly')}
                  disabled={loadingPlan === 'quarterly'}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-12"
                >
                  {loadingPlan === 'quarterly' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
                  ) : (
                    `Ahorrar €${plans.quarterly.savings}`
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Yearly - BEST VALUE */}
            <Card className="border-4 border-indigo-500 hover:border-indigo-600 transition-all relative shadow-xl scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-indigo-600 text-white px-4 py-2 text-sm">
                  {plans.yearly.badge}
                </Badge>
              </div>
              <CardHeader>
                <plans.yearly.icon className="w-10 h-10 text-indigo-600 mb-3" />
                <CardTitle className="text-xl">{plans.yearly.name}</CardTitle>
                <div className="mt-4">
                  <div className="text-sm text-zinc-500 line-through">€{plans.yearly.originalPrice}</div>
                  <span className="text-4xl font-bold text-indigo-600">€{plans.yearly.price}</span>
                  <span className="text-zinc-600">{plans.yearly.period}</span>
                  <div className="text-xs text-emerald-600 font-semibold mt-1">Solo €20.83/mes</div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plans.yearly.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  data-testid="subscribe-yearly-btn"
                  onClick={() => handleSubscribe('yearly')}
                  disabled={loadingPlan === 'yearly'}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-12 shadow-lg"
                >
                  {loadingPlan === 'yearly' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
                  ) : (
                    <>Ahorrar €{plans.yearly.savings}<ArrowRight className="ml-2 w-5 h-5" /></>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Family Plans */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Planes Familiares Premium</h2>
            <p className="text-lg text-zinc-600 mb-6">Protege a toda tu familia con un solo plan</p>
            
            {/* Child Tracking Feature Highlight - ANNUAL ONLY */}
            <Card className="max-w-3xl mx-auto bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-300 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge className="bg-indigo-600 text-white px-4 py-2">
                    ⭐ EXCLUSIVO PLAN ANUAL
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-indigo-700 mb-3">👶 Localización de Niños por Teléfono</h3>
                <p className="text-zinc-700 mb-4">
                  <strong>Solo en el Plan Familiar Anual:</strong> Localiza a tus hijos en cualquier momento 
                  desde su número de teléfono. Incluye historial de ubicaciones y modo silencioso opcional.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
                  <div className="bg-white p-3 rounded-lg border border-indigo-200">
                    <MapPin className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                    <div className="font-medium">Bajo demanda</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <Users className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                    <div className="font-medium">Historial</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-pink-200">
                    <AlertTriangle className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                    <div className="font-medium">Modo silencioso</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-200">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    <div className="font-medium">App en niño</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {Object.entries(familyPlans).map(([key, plan]) => (
              <Card 
                key={key}
                className={`border-2 hover:border-emerald-500 transition-all relative ${
                  plan.popular ? 'border-indigo-500 shadow-2xl scale-105 bg-gradient-to-b from-white to-indigo-50' : 'border-emerald-200'
                }`}
              >
                {plan.badge && (
                  <Badge className={`absolute top-4 right-4 ${plan.popular ? 'bg-indigo-600' : 'bg-emerald-600'} text-white`}>
                    {plan.badge}
                  </Badge>
                )}
                <CardHeader>
                  <plan.icon className={`w-10 h-10 ${plan.popular ? 'text-indigo-600' : 'text-emerald-600'} mb-3`} />
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-sm text-emerald-600 font-semibold">{plan.users}</div>
                  <div className="mt-4">
                    {plan.originalPrice && (
                      <div className="text-sm text-zinc-500 line-through">€{plan.originalPrice}</div>
                    )}
                    <span className={`text-4xl font-bold ${plan.popular ? 'text-indigo-600' : 'text-emerald-600'}`}>€{plan.price}</span>
                    <span className="text-zinc-600">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Features */}
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className={
                          feature.includes('LOCALIZAR') || feature.includes('Tracking') || feature.includes('Historial') || feature.includes('silencioso')
                            ? 'font-bold text-indigo-600' 
                            : feature.includes('SOS') || feature.includes('GPS') 
                              ? 'font-semibold text-red-600' 
                              : ''
                        }>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Limitations for non-annual plans */}
                  {plan.limitations && (
                    <div className="mb-4 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                      <p className="text-xs text-zinc-500 font-medium mb-2">No incluye:</p>
                      <ul className="space-y-1">
                        {plan.limitations.map((limit, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-zinc-500">
                            <span className="text-zinc-400">✗</span>
                            <span>{limit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Child Tracking Badge - ANNUAL ONLY */}
                  {plan.isComplete && (
                    <div className="bg-indigo-100 border border-indigo-300 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-xs text-indigo-700 font-medium">
                        <MapPin className="w-4 h-4" />
                        <span>👶 Localización de niños incluida</span>
                      </div>
                    </div>
                  )}
                  
                  {/* SOS Info Badge */}
                  {!plan.limitations?.includes('Sin localización GPS') && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-xs text-red-700">
                        <AlertTriangle className="w-4 h-4" />
                        <span>GPS automático al pulsar SOS</span>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    data-testid={`subscribe-family-${key}-btn`}
                    onClick={() => handleSubscribe(`family-${key}`)}
                    disabled={loadingPlan === `family-${key}`}
                    className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white rounded-lg h-12`}
                  >
                    {loadingPlan === `family-${key}` ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
                    ) : plan.popular ? (
                      <>⭐ Obtener Plan Completo</>
                    ) : (
                      plan.savings ? `Ahorrar €${plan.savings}` : 'Proteger Familia'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Comparison note */}
          <div className="text-center mt-8">
            <p className="text-sm text-zinc-500">
              💡 <strong>Consejo:</strong> El Plan Familiar Anual incluye TODAS las funciones de localización y tracking. 
              ¡Ahorra €199.89 y obtén la protección más completa para tu familia!
            </p>
          </div>
        </div>

        {/* Enterprise Custom Plan */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Plan Enterprise Custom</h2>
            <p className="text-lg text-zinc-600">Soluciones personalizadas para bancos y grandes corporaciones</p>
          </div>
          <Card className="mb-16 max-w-4xl mx-auto border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="bg-amber-600 text-white px-4 py-2 text-sm mb-4">
                    Enterprise Custom
                  </Badge>
                  <CardTitle className="text-3xl mb-2">Protección Bancaria Avanzada</CardTitle>
                  <p className="text-zinc-600 text-lg">Integración completa con sistemas bancarios y compliance regulatorio</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-amber-600">Consultar</div>
                  <div className="text-sm text-zinc-600">Precio personalizado</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4 text-amber-600 text-lg">🏦 Características Enterprise:</h4>
                  <ul className="space-y-3">
                    {[
                      'API integración sistemas bancarios',
                      'Compliance GDPR y PCI-DSS',
                      'Análisis masivo transacciones',
                      'Dashboard ejecutivo personalizado',
                      'Alertas en tiempo real 24/7',
                      'Soporte técnico dedicado',
                      'SLA 99.9% uptime garantizado',
                      'Implementación on-premise disponible'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-amber-600 text-lg">🎯 Casos de Uso:</h4>
                  <ul className="space-y-3 mb-6">
                    {[
                      'Bancos con +100,000 clientes',
                      'Detección fraude wire transfers',
                      'Protección banca online',
                      'Análisis comportamiento usuarios',
                      'Prevención lavado de dinero',
                      'Cumplimiento regulatorio automático'
                    ].map((useCase, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <Crown className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-white p-4 rounded-lg border border-amber-200">
                    <div className="text-sm text-zinc-600 mb-2">Implementación típica:</div>
                    <div className="text-2xl font-bold text-amber-600">2-4 semanas</div>
                    <div className="text-xs text-zinc-500">Incluye migración y training</div>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => toast.info('Contacto comercial próximamente')}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg h-14 text-lg font-semibold"
                >
                  Solicitar Demo Personalizada
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  onClick={() => toast.info('Descarga próximamente')}
                  variant="outline"
                  className="flex-1 border-2 border-amber-300 hover:border-amber-400 rounded-lg h-14 text-lg"
                >
                  Descargar Plan de Negocio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Free Plan */}
        <Card className="mb-16 max-w-3xl mx-auto border-zinc-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Plan Básico Gratuito</CardTitle>
                <p className="text-zinc-600 mt-2">Prueba MANO sin compromiso</p>
              </div>
              <div className="text-3xl font-bold">€0</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-emerald-600">✓ Incluye:</h4>
                <ul className="space-y-2">
                  {plans.free.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-zinc-600">✗ Limitaciones:</h4>
                <ul className="space-y-2">
                  {plans.free.limitations.map((limitation, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-zinc-600">
                      <span className="w-4 h-4 flex items-center justify-center text-zinc-400">✗</span>
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full mt-6 border-2 border-zinc-300 hover:border-indigo-300 rounded-lg h-12"
            >
              Comenzar Gratis
            </Button>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {[
              {
                q: '¿Por qué MANO es más caro que otras apps de seguridad?',
                a: 'MANO no es un antivirus genérico. Es un sistema de protección contra fraudes con IA avanzada (GPT-5.2) que analiza en tiempo real y previene pérdidas de miles de euros. Un solo fraude evitado justifica años de suscripción.'
              },
              {
                q: '¿Puedo cambiar de plan en cualquier momento?',
                a: 'Sí, puedes upgrade o downgrade cuando quieras. Si pasas de mensual a anual, el crédito restante se aplica automáticamente.'
              },
              {
                q: '¿Qué incluye la garantía de satisfacción?',
                a: 'Si no estás satisfecho en los primeros 15 días, te devolvemos el 100% sin preguntas. Sin letra pequeña.'
              },
              {
                q: '¿Cómo funciona el botón SOS con GPS en el plan familiar?',
                a: 'Cuando cualquier miembro de la familia pulsa el botón SOS de emergencia, la aplicación captura automáticamente su ubicación GPS precisa y la envía instantáneamente a todos los demás miembros del grupo familiar. Así pueden ver exactamente dónde está y acudir en su ayuda. La ubicación solo se comparte cuando se pulsa el botón SOS, respetando la privacidad del usuario.'
              },
              {
                q: '¿El plan familiar incluye modo senior?',
                a: 'Sí, todos los miembros pueden activar el Modo Familiar Senior con interfaz simplificada, botón SOS grande con localización GPS, y alertas automáticas a otros miembros de la familia.'
              }
            ].map((faq, idx) => (
              <Card key={idx} className="border-zinc-200">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-0">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">
                ¿Cuánto vale tu tranquilidad?
              </h2>
              <p className="text-indigo-100 text-lg mb-8">
                Protege lo que más importa. Empieza hoy con garantía de satisfacción.
              </p>
              <Button
                data-testid="subscribe-yearly-final-btn"
                onClick={() => handleSubscribe('yearly')}
                disabled={loadingPlan === 'yearly'}
                className="bg-white text-indigo-600 hover:bg-zinc-50 rounded-lg px-10 h-14 text-lg font-semibold"
              >
                {loadingPlan === 'yearly' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
                ) : (
                  <>Comenzar Ahora - Plan Anual<ArrowRight className="ml-2 w-5 h-5" /></>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pricing;