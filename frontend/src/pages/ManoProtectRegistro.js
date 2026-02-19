import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import LandingFooter from '@/components/landing/LandingFooter';
import { 
  Shield, Lock, Eye, EyeOff, User, Mail, Phone,
  CheckCircle, AlertTriangle, ArrowRight, ChevronRight,
  Users, Smartphone, Globe, Zap, Heart, Star
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// SEO Schema for Registration Page
const registrationSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Registro ManoProtect - Crea tu cuenta de seguridad digital",
  "description": "Regístrate en ManoProtect y protege a tu familia con nuestra plataforma de seguridad digital. 7 días gratis, sin tarjeta requerida.",
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

const ManoProtectRegistro = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Plan selection
    plan: 'individual',
    
    // Step 2: Personal info
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Step 3: Family members (optional)
    familyMembers: [],
    
    // Consents
    acceptTerms: false,
    acceptPrivacy: false,
    acceptCommunications: false
  });

  const plans = [
    {
      id: 'basico',
      name: 'Básico',
      price: '0€',
      priceDetail: '7 días gratis para probar',
      description: 'Sin tarjeta requerida',
      features: [
        '7 días de prueba GRATIS',
        'Protección básica 24/7',
        '10 análisis de amenazas',
        'Alertas de seguridad',
        'Soporte por email'
      ],
      isFree: true,
      badge: 'Sin compromiso'
    },
    {
      id: 'individual',
      name: 'Individual',
      price: '20,83€/mes',
      priceDetail: '249,99€/año - Ahorras 110€',
      description: 'La mejor opción para ti',
      features: [
        '7 días de prueba GRATIS',
        'Protección 24/7 avanzada',
        'Análisis ilimitados con IA',
        'Bloqueo automático amenazas',
        'Soporte prioritario'
      ],
      popular: true,
      requiresCard: true
    },
    {
      id: 'familiar',
      name: 'Familiar',
      price: '33,33€/mes',
      priceDetail: '399,99€/año - Ahorras 200€',
      description: 'Protección para toda la familia',
      features: [
        '7 días de prueba GRATIS',
        'Todo de Individual +',
        'Hasta 5 miembros familia',
        'Localización GPS emergencias',
        'Soporte 24/7 dedicado'
      ],
      requiresCard: true
    }
  ];

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      toast.error('Debe aceptar los términos y política de privacidad');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          plan: formData.plan,
          source: 'manoprotect_registration'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error en el registro');
      }

      toast.success('¡Cuenta creada! Ya puedes iniciar sesión.');
      navigate('/login');
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Elige tu plan</h2>
        <p className="text-gray-500 mt-2">Selecciona el nivel de protección que necesitas</p>
        <p className="text-xs text-indigo-600 mt-1">✨ Todos los planes incluyen 7 días de prueba gratis</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setFormData({ ...formData, plan: plan.id })}
            className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${
              formData.plan === plan.id
                ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-[1.02]'
                : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  MÁS POPULAR
                </span>
              </div>
            )}
            
            {plan.badge && !plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {plan.badge.toUpperCase()}
                </span>
              </div>
            )}
            
            <div className="text-center pt-2">
              <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
              <div className="mt-3">
                <span className="text-3xl font-bold text-indigo-600">{plan.price.split('/')[0]}</span>
                {plan.price.includes('/') && <span className="text-gray-500 text-sm">/{plan.price.split('/')[1]}</span>}
              </div>
              {plan.priceDetail && (
                <p className="text-xs text-green-600 font-semibold mt-1">{plan.priceDetail}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
              
              {/* Indicador de tarjeta requerida */}
              {plan.requiresCard && (
                <p className="text-xs text-amber-600 mt-2 flex items-center justify-center gap-1">
                  <span>💳</span> Requiere tarjeta de débito/crédito
                </p>
              )}
            </div>
            
            <ul className="mt-5 space-y-2">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            
            {formData.plan === plan.id && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="w-6 h-6 text-indigo-600" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <Button 
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700"
        onClick={() => setStep(2)}
      >
        Continuar
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Crea tu cuenta</h2>
        <p className="text-gray-500 mt-2">Plan seleccionado: <strong className="text-indigo-600">{plans.find(p => p.id === formData.plan)?.name}</strong></p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            placeholder="Tu nombre completo"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono móvil</label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            placeholder="+34 600 000 000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              placeholder="Mín. 8 caracteres"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              placeholder="Repetir"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
            className="w-4 h-4 mt-1 text-indigo-600 rounded border-gray-300"
          />
          <span className="text-sm text-gray-600">
            Acepto los <a href="/terminos" className="text-indigo-600 underline">Términos y Condiciones</a>
          </span>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptPrivacy}
            onChange={(e) => setFormData({ ...formData, acceptPrivacy: e.target.checked })}
            className="w-4 h-4 mt-1 text-indigo-600 rounded border-gray-300"
          />
          <span className="text-sm text-gray-600">
            Acepto la <a href="/privacidad" className="text-indigo-600 underline">Política de Privacidad</a>
          </span>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptCommunications}
            onChange={(e) => setFormData({ ...formData, acceptCommunications: e.target.checked })}
            className="w-4 h-4 mt-1 text-indigo-600 rounded border-gray-300"
          />
          <span className="text-sm text-gray-600">
            Deseo recibir comunicaciones sobre ofertas y novedades
          </span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => setStep(1)}
        >
          Atrás
        </Button>
        <Button 
          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          onClick={handleSubmit}
          disabled={isLoading || !formData.acceptTerms || !formData.acceptPrivacy}
        >
          {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>
      </div>
    </div>
  );

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
        {/* Left Side - Features */}
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
                  <h3 className="font-semibold text-white">Detección de estafas</h3>
                  <p className="text-sm text-indigo-200/70">Analiza mensajes, llamadas y webs sospechosas</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Protección familiar</h3>
                  <p className="text-sm text-indigo-200/70">Control parental y seguimiento de menores</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Alertas en tiempo real</h3>
                  <p className="text-sm text-indigo-200/70">Notificaciones instantáneas de amenazas</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-xs text-indigo-300">Protección continua</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">IA</p>
                <p className="text-xs text-indigo-300">Análisis inteligente</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">SMS</p>
                <p className="text-xs text-indigo-300">Alertas instantáneas</p>
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
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
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
