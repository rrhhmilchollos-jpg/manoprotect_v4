import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import LandingFooter from '@/components/landing/LandingFooter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  Shield, Lock, Eye, EyeOff, User, Mail, Phone,
  CheckCircle, ArrowRight, ArrowLeft, CreditCard,
  Loader2, AlertCircle, Sparkles, Star
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const STRIPE_PK = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PK);

// SEO Schema for Registration Page
const registrationSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Registro ManoProtect - Crea tu cuenta de seguridad digital",
  "description": "Regístrate en ManoProtect y protege a tu familia con nuestra plataforma de seguridad digital. 7 días gratis.",
  "url": "https://manoprotect.com/registro",
  "mainEntity": {
    "@type": "Product",
    "name": "ManoProtect Suscripción",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "0",
      "highPrice": "399.99",
      "priceCurrency": "EUR",
      "offerCount": "3"
    }
  }
};

// Stripe CardElement styles
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: 'Inter, system-ui, sans-serif',
      '::placeholder': {
        color: '#9ca3af',
      },
      iconColor: '#6366f1',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: true,
};

// Plan definitions
const PLANS = [
  {
    id: 'basico',
    name: 'Básico',
    price: { mensual: 0, anual: 0 },
    description: '7 días gratis para probar',
    features: [
      '7 días de prueba GRATIS',
      'Protección básica 24/7',
      '10 análisis de amenazas',
      'Alertas de seguridad',
      'Soporte por email'
    ],
    requiresCard: false,
    badge: 'Sin compromiso',
    badgeColor: 'emerald'
  },
  {
    id: 'individual',
    name: 'Individual',
    price: { mensual: 29.99, anual: 249.99 },
    monthlyEquivalent: { anual: 20.83 },
    savings: { anual: 110 },
    description: 'La mejor opci\u00f3n para ti',
    features: [
      '7 d\u00edas de prueba GRATIS',
      'Protecci\u00f3n 24/7 avanzada',
      'An\u00e1lisis ilimitados con IA',
      'Bloqueo autom\u00e1tico amenazas',
      'Hasta 2 familiares',
      'Soporte prioritario'
    ],
    requiresCard: true,
    badge: 'Protecci\u00f3n personal',
    badgeColor: 'indigo'
  },
  {
    id: 'familiar',
    name: 'Familiar',
    price: { mensual: 9.99, anual: 99.99 },
    monthlyEquivalent: { anual: 8.33 },
    savings: { anual: 20 },
    description: 'Protecci\u00f3n para toda la familia',
    features: [
      '7 d\u00edas de prueba GRATIS',
      'Todo de Individual +',
      'Hasta 5 miembros familia',
      'Localizaci\u00f3n GPS 24/7',
      'Alertas SOS instant\u00e1neas',
      'Panel familiar centralizado',
      'Dispositivo GRATIS (plan anual)'
    ],
    requiresCard: true,
    popular: true,
    badge: 'M\u00e1s popular',
    badgeColor: 'emerald'
  }
];

// Registration Form Component (with Stripe)
const RegistrationForm = ({ plan, periodo, onBack, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false,
    acceptCommunications: false
  });

  const selectedPlan = PLANS.find(p => p.id === plan);
  const requiresCard = selectedPlan?.requiresCard;

  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : null);
    setCardComplete(event.complete);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      toast.error('Debes aceptar los términos y la política de privacidad');
      return;
    }

    // For premium plans, validate card
    if (requiresCard) {
      if (!stripe || !elements) {
        toast.error('Stripe no está cargado. Intenta de nuevo.');
        return;
      }
      
      if (!cardComplete) {
        toast.error('Por favor, completa los datos de la tarjeta');
        return;
      }
    }

    setIsLoading(true);

    try {
      let paymentMethodId = null;

      // Create PaymentMethod for premium plans
      if (requiresCard) {
        const cardElement = elements.getElement(CardElement);
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || undefined,
          },
        });

        if (error) {
          toast.error(error.message);
          setIsLoading(false);
          return;
        }

        paymentMethodId = paymentMethod.id;
      }

      // Call registration endpoint
      const response = await fetch(`${API_URL}/api/subscriptions/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nombre: formData.name,
          plan: plan,
          periodo: periodo,
          payment_method_id: paymentMethodId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error en el registro');
      }

      // Handle 3D Secure if required
      if (data.requires_action && data.client_secret) {
        toast.info('Verificando con tu banco...');
        
        const { error: confirmError } = await stripe.confirmCardPayment(data.client_secret);
        
        if (confirmError) {
          throw new Error(confirmError.message);
        }
      }

      // Success!
      toast.success(data.message || '¡Cuenta creada exitosamente!');
      onSuccess(data);
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Crea tu cuenta</h2>
        <p className="text-gray-500 mt-2">
          Plan: <span className="font-semibold text-indigo-600">{selectedPlan?.name}</span>
          {periodo === 'anual' && selectedPlan?.price.anual > 0 && (
            <span className="text-green-600 ml-2">({selectedPlan.monthlyEquivalent.anual.toFixed(2).replace('.', ',')}€/mes)</span>
          )}
        </p>
        {requiresCard && (
          <p className="text-xs text-amber-600 mt-1">
            Se validará tu tarjeta. No se cobrará durante los 7 días de prueba.
          </p>
        )}
      </div>
      
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo *</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Tu nombre completo"
            data-testid="register-name-input"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="tu@email.com"
            data-testid="register-email-input"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono móvil</label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="+34 600 000 000"
            data-testid="register-phone-input"
          />
        </div>
      </div>

      {/* Passwords */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña *</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Mín. 8 caracteres"
              data-testid="register-password-input"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar *</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Repetir"
              data-testid="register-confirm-password-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Credit Card for Premium Plans */}
      {requiresCard && (
        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCard className="w-4 h-4 inline mr-2" />
            Tarjeta de débito/crédito *
          </label>
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-colors">
            <CardElement 
              options={cardElementOptions} 
              onChange={handleCardChange}
              data-testid="card-element"
            />
          </div>
          {cardError && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {cardError}
            </p>
          )}
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> SSL Seguro
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" /> PCI Compliant
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 3D Secure
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            No se realizará ningún cargo durante los 7 días de prueba. 
            Cancela en cualquier momento desde tu perfil.
          </p>
        </div>
      )}

      {/* Consents */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
            className="w-4 h-4 mt-1 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            data-testid="accept-terms-checkbox"
          />
          <span className="text-sm text-gray-600">
            Acepto los <a href="/terms-of-service" target="_blank" className="text-indigo-600 underline hover:text-indigo-700">Términos y Condiciones</a> *
          </span>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptPrivacy}
            onChange={(e) => setFormData({ ...formData, acceptPrivacy: e.target.checked })}
            className="w-4 h-4 mt-1 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            data-testid="accept-privacy-checkbox"
          />
          <span className="text-sm text-gray-600">
            Acepto la <a href="/privacy-policy" target="_blank" className="text-indigo-600 underline hover:text-indigo-700">Política de Privacidad</a> *
          </span>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptCommunications}
            onChange={(e) => setFormData({ ...formData, acceptCommunications: e.target.checked })}
            className="w-4 h-4 mt-1 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            data-testid="accept-communications-checkbox"
          />
          <span className="text-sm text-gray-600">
            Deseo recibir comunicaciones sobre ofertas y novedades
          </span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          type="button"
          variant="outline" 
          className="flex-1 h-12"
          onClick={onBack}
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Atrás
        </Button>
        <Button 
          type="submit"
          className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700"
          disabled={isLoading || !formData.acceptTerms || !formData.acceptPrivacy || (requiresCard && !cardComplete)}
          data-testid="submit-registration-btn"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              {requiresCard ? 'Empezar prueba gratis' : 'Crear cuenta'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

// Main Registration Page
const ManoProtectRegistro = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'individual');
  const [periodo, setPeriodo] = useState('anual');

  // Check if coming from pricing page with a specific plan
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam && PLANS.find(p => p.id === planParam)) {
      setSelectedPlan(planParam);
    }
  }, [searchParams]);

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handleSuccess = (data) => {
    // Redirect to success page or login
    navigate('/trial-success', { 
      state: { 
        plan: selectedPlan,
        periodo: periodo,
        trialEnd: data.trial_end,
        email: data.email
      } 
    });
  };

  const renderPlanSelection = () => {
    const currentPlan = PLANS.find(p => p.id === selectedPlan);
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Elige tu plan</h2>
          <p className="text-gray-500 mt-2">Todos los planes incluyen 7 días de prueba gratis</p>
        </div>
        
        {/* Period Toggle */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setPeriodo('mensual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              periodo === 'mensual' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            data-testid="periodo-mensual-btn"
          >
            Mensual
          </button>
          <button
            onClick={() => setPeriodo('anual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              periodo === 'anual' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            data-testid="periodo-anual-btn"
          >
            Anual
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              -30%
            </span>
          </button>
        </div>
        
        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const price = periodo === 'anual' ? plan.price.anual : plan.price.mensual;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <div
                key={plan.id}
                onClick={() => handlePlanSelect(plan.id)}
                className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-[1.02]'
                    : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                }`}
                data-testid={`plan-card-${plan.id}`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`text-white text-xs font-bold px-3 py-1 rounded-full shadow-md ${
                      plan.badgeColor === 'indigo' ? 'bg-gradient-to-r from-indigo-600 to-purple-600' :
                      plan.badgeColor === 'emerald' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                      'bg-gradient-to-r from-purple-500 to-pink-600'
                    }`}>
                      {plan.badge.toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div className="text-center pt-2">
                  <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-indigo-600">
                      {price === 0 ? '0' : price.toFixed(2).replace('.', ',')}€
                    </span>
                    <span className="text-gray-500 text-sm">/{periodo === 'anual' ? 'año' : 'mes'}</span>
                  </div>
                  
                  {/* Monthly equivalent for annual */}
                  {periodo === 'anual' && plan.monthlyEquivalent?.anual && (
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      Solo {plan.monthlyEquivalent.anual.toFixed(2).replace('.', ',')}€/mes
                    </p>
                  )}
                  {periodo === 'anual' && plan.savings?.anual && (
                    <p className="text-xs text-green-600 mt-0.5">
                      Ahorras {plan.savings.anual}€/año
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                  
                  {/* Card requirement indicator */}
                  {plan.requiresCard ? (
                    <p className="text-xs text-amber-600 mt-2 flex items-center justify-center gap-1">
                      <CreditCard className="w-3 h-3" /> Requiere tarjeta
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 mt-2">Sin tarjeta requerida</p>
                  )}
                </div>
                
                {/* Features */}
                <ul className="mt-5 space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="w-6 h-6 text-indigo-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Continue Button */}
        <Button 
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-700"
          onClick={() => setStep(2)}
          data-testid="continue-to-registration-btn"
        >
          Continuar con {currentPlan?.name}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500 pt-4">
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-green-500" /> Pago seguro
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500" /> 4.9/5 en Trustpilot
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-4 h-4 text-blue-500" /> Cancela cuando quieras
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Registro | ManoProtect - Crea tu cuenta de seguridad digital</title>
        <meta name="description" content="Regístrate en ManoProtect y protege a tu familia. Planes desde 0€. 7 días de prueba gratis. Protección contra phishing, fraud prevention y localización GPS." />
        <meta name="keywords" content="registro manoprotect, crear cuenta seguridad digital, protección familiar, plan básico gratis, plan individual, plan familiar" />
        <link rel="canonical" href="https://manoprotect.com/registro" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Registro | ManoProtect - Crea tu cuenta de seguridad digital" />
        <meta property="og:description" content="Regístrate en ManoProtect y protege a tu familia. Planes desde 0€. 7 días de prueba gratis." />
        <meta property="og:url" content="https://manoprotect.com/registro" />
        <meta property="og:type" content="website" />
        
        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify(registrationSchema)}
        </script>
      </Helmet>
      
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ManoProtect</h1>
              <p className="text-xs text-indigo-300">Protección Digital</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="tel:601510950" className="hidden md:flex items-center gap-2 text-white/70 hover:text-white text-sm">
              <Phone className="w-4 h-4" />
              601 510 950
            </a>
            <a href="/login" className="text-white/70 hover:text-white text-sm">
              Ya tengo cuenta
            </a>
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-80px)]">
        {/* Left Side - Features (Desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 py-12">
          <div className="max-w-lg">
            <h2 className="text-4xl font-bold text-white mb-6">
              Protege lo que más importa
            </h2>
            <p className="text-lg text-indigo-200 mb-8">
              ManoProtect te ayuda a detectar estafas, proteger a tu familia y navegar seguro por internet.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Detección de estafas con IA</h3>
                  <p className="text-sm text-indigo-200/70">Analiza mensajes, llamadas y webs sospechosas al instante</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Sin compromiso</h3>
                  <p className="text-sm text-indigo-200/70">7 días de prueba gratis. Cancela en cualquier momento.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Pago 100% seguro</h3>
                  <p className="text-sm text-indigo-200/70">Encriptación SSL, 3D Secure y certificación PCI DSS</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">+2000</p>
                <p className="text-xs text-indigo-300">Familias protegidas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-xs text-indigo-300">Protección continua</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">4.9★</p>
                <p className="text-xs text-indigo-300">Trustpilot</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-indigo-600 text-white' : 'bg-white/20 text-white/50'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 rounded ${step >= 2 ? 'bg-indigo-600' : 'bg-white/20'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-indigo-600 text-white' : 'bg-white/20 text-white/50'
              }`}>
                2
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8">
              {step === 1 && renderPlanSelection()}
              {step === 2 && (
                <Elements stripe={stripePromise}>
                  <RegistrationForm 
                    plan={selectedPlan}
                    periodo={periodo}
                    onBack={() => setStep(1)}
                    onSuccess={handleSuccess}
                  />
                </Elements>
              )}
            </div>

            {/* Bottom link */}
            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm">
                ¿Ya tienes cuenta?{' '}
                <a href="/login" className="text-white hover:underline font-medium">
                  Inicia sesión
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default ManoProtectRegistro;
