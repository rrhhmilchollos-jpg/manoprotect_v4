import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import SEO from '../components/SEO';
import LandingFooter from '@/components/landing/LandingFooter';
import { 
  Shield, CheckCircle, ArrowRight, Star, Users, 
  TrendingUp, Award, Zap, Lock, Phone, AlertTriangle,
  Mail, Smartphone, Eye, Bell, UserCheck
} from 'lucide-react';

const LandingPromo = () => {
  const navigate = useNavigate();

  const features = [
    { icon: <Shield className="w-6 h-6" />, title: "Protección 24/7", desc: "Monitoreo en tiempo real" },
    { icon: <Zap className="w-6 h-6" />, title: "Alertas Instantáneas", desc: "SMS y Email" },
    { icon: <Smartphone className="w-6 h-6" />, title: "App Móvil", desc: "iOS y Android" },
    { icon: <Lock className="w-6 h-6" />, title: "Pago Seguro", desc: "Con Stripe" },
  ];

  const protectionTypes = [
    { 
      icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
      title: "Phishing y Smishing",
      desc: "Detección automática de enlaces fraudulentos en emails y SMS"
    },
    { 
      icon: <Phone className="w-8 h-8 text-orange-500" />,
      title: "Llamadas Fraudulentas",
      desc: "Bloqueo de números conocidos de estafadores"
    },
    { 
      icon: <Eye className="w-8 h-8 text-purple-500" />,
      title: "Suplantación de Identidad",
      desc: "Alertas si alguien intenta hacerse pasar por ti"
    },
    { 
      icon: <Bell className="w-8 h-8 text-blue-500" />,
      title: "Vigilancia Dark Web",
      desc: "Monitoreo de tus datos en la web oscura"
    },
  ];

  const testimonials = [
    { name: "Selomit", role: "España", text: "Llevo tiempo utilizándola, estoy tranquila. Tengo dos adolescentes y las tengo controladas, sé dónde están.", rating: 5 },
    { name: "María Deseada S.", role: "España", text: "Muy útil con mi madre de 78 años para saber dónde está en todo momento y tener controlado en caso de caída.", rating: 5 },
  ];

  const stats = [
    { value: "IA", label: "Análisis inteligente" },
    { value: "24/7", label: "Protección continua" },
    { value: "7 días", label: "Prueba gratis" },
    { value: "SMS", label: "Alertas instantáneas" },
  ];

  const plans = [
    {
      name: "Personal",
      price: "9,99€",
      period: "/mes",
      features: ["1 usuario", "Protección SMS y Email", "Alertas en tiempo real", "App móvil"],
      popular: false
    },
    {
      name: "Familiar",
      price: "14,99€",
      period: "/mes",
      features: ["Hasta 5 usuarios", "Todo de Personal", "Protección menores", "Soporte prioritario"],
      popular: true
    },
    {
      name: "Premium",
      price: "24,99€",
      period: "/mes",
      features: ["Usuarios ilimitados", "Todo de Familiar", "Vigilancia Dark Web", "Gestor personal"],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="ManoProtect - Protección contra Fraudes y Estafas | España"
        description="Protege a tu familia de phishing, estafas telefónicas y fraudes online. Alertas en tiempo real, bloqueo automático y monitoreo 24/7. ¡7 días GRATIS!"
        keywords="protección fraude, antiphishing, estafas telefónicas, seguridad digital, protección online España"
        canonical="https://manoprotect.com/promo"
      />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ManoProtect</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#proteccion" className="text-gray-600 hover:text-gray-900 font-medium">Protección</a>
              <a href="#planes" className="text-gray-600 hover:text-gray-900 font-medium">Planes</a>
              <a href="#testimonios" className="text-gray-600 hover:text-gray-900 font-medium">Opiniones</a>
            </nav>

            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="hidden sm:flex"
              >
                Iniciar sesión
              </Button>
              <Button 
                onClick={() => navigate('/registro')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Empezar Gratis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              7 días GRATIS - Oferta limitada
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Protege a tu familia de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                estafas y fraudes
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Detección automática de phishing, bloqueo de llamadas fraudulentas y alertas en tiempo real. 
              La protección que tu familia merece.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                onClick={() => navigate('/registro')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-xl"
              >
                Empezar Gratis <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/how-it-works')}
                className="px-8 py-6 text-lg rounded-xl border-2"
              >
                Cómo Funciona
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-3xl font-bold text-indigo-600">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protection Types */}
      <section id="proteccion" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Protección contra todo tipo de fraudes
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nuestro sistema detecta y bloquea las amenazas más comunes en España
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {protectionTypes.map((type, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{type.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{type.title}</h3>
                <p className="text-gray-500 text-sm">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planes" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Planes para cada necesidad
            </h2>
            <p className="text-gray-600">
              Elige el plan que mejor se adapte a tu familia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, idx) => (
              <div 
                key={idx} 
                className={`p-8 rounded-2xl ${plan.popular 
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white ring-4 ring-indigo-200' 
                  : 'bg-white border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    MÁS POPULAR
                  </span>
                )}
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.popular ? 'text-indigo-200' : 'text-gray-500'}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2">
                      <CheckCircle className={`w-5 h-5 ${plan.popular ? 'text-indigo-200' : 'text-indigo-600'}`} />
                      <span className={plan.popular ? 'text-indigo-100' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => navigate('/registro')}
                  className={`w-full py-3 ${plan.popular 
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  Empezar Gratis
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros usuarios
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            ¿Listo para proteger a tu familia?
          </h2>
          <p className="text-xl text-indigo-200 mb-8">
            Protege a tu familia con ManoProtect hoy
          </p>
          <Button 
            onClick={() => navigate('/registro')}
            className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-6 text-lg rounded-xl font-bold"
          >
            Empezar Gratis Ahora <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPromo;
