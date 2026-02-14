import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { 
  Shield, Lock, Eye, EyeOff, User, Mail, Phone,
  CheckCircle, AlertTriangle, ArrowRight, ChevronRight,
  Users, Smartphone, Globe, Zap, Heart, Star
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ManoProtectRegistro = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Plan selection
    plan: 'familiar',
    
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
      id: 'individual',
      name: 'Individual',
      price: '4,99€/mes',
      description: 'Protección personal completa',
      features: ['1 usuario', 'Detección de estafas', 'Alertas en tiempo real', 'Soporte por email']
    },
    {
      id: 'familiar',
      name: 'Familiar',
      price: '9,99€/mes',
      description: 'Protege a toda tu familia',
      features: ['Hasta 5 usuarios', 'Control parental', 'Seguimiento GPS', 'Soporte prioritario'],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '19,99€/mes',
      description: 'Máxima protección',
      features: ['Usuarios ilimitados', 'Todas las funciones', 'Gestor personal', 'Soporte 24/7']
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
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setFormData({ ...formData, plan: plan.id })}
            className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all ${
              formData.plan === plan.id
                ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MÁS POPULAR
                </span>
              </div>
            )}
            
            <div className="text-center">
              <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-indigo-600">{plan.price.split('/')[0]}</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
            </div>
            
            <ul className="mt-6 space-y-2">
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
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-white/50">
          © 2025 Manoprotect.com | Calle de la Innovación, 15 - Valencia
        </div>
      </footer>
    </div>
  );
};

export default ManoProtectRegistro;
