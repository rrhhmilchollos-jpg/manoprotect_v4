/**
 * ManoProtect Enterprise - B2B Landing Page
 * Landing page focused on generating enterprise leads
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Award, Building2, Users, CheckCircle, ArrowRight, 
  Phone, Mail, Lock, Zap, BarChart3, Globe, Brain, Fingerprint,
  ChevronRight, Star, TrendingUp, AlertTriangle
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FEATURES = [
  {
    icon: Award,
    title: 'Sello de Confianza',
    description: 'Badge verificable en tiempo real que demuestra que tu empresa está protegida',
    color: 'bg-amber-100 text-amber-600'
  },
  {
    icon: Fingerprint,
    title: 'DNA Digital Corporativo',
    description: 'Identidad digital única para que tus clientes verifiquen que eres tú',
    color: 'bg-cyan-100 text-cyan-600'
  },
  {
    icon: Brain,
    title: 'Escudo de Voz AI',
    description: 'Protege a tus empleados de llamadas fraudulentas con IA',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    icon: AlertTriangle,
    title: 'Simulacro de Phishing',
    description: 'Entrena a tus empleados con ataques simulados y mide su preparación',
    color: 'bg-red-100 text-red-600'
  },
  {
    icon: BarChart3,
    title: 'Dashboard de Amenazas',
    description: 'Visualiza en tiempo real los intentos de fraude contra tu empresa',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Lock,
    title: 'Verificador de Transacciones',
    description: 'Analiza el riesgo de cada transacción antes de aprobarla',
    color: 'bg-emerald-100 text-emerald-600'
  }
];

const PLANS = [
  {
    name: 'Básico',
    price: '29',
    period: '/mes',
    description: 'Para pequeñas empresas',
    features: [
      'Sello de Confianza',
      'DNA Digital Corporativo',
      'Hasta 10 empleados',
      'Verificador Universal',
      'Soporte por email'
    ],
    popular: false,
    cta: 'Empezar'
  },
  {
    name: 'Profesional',
    price: '99',
    period: '/mes',
    description: 'Para empresas en crecimiento',
    features: [
      'Todo lo de Básico',
      'Escudo de Voz AI',
      'Hasta 50 empleados',
      'Simulacro de Phishing (1/mes)',
      'Dashboard de Amenazas',
      'Soporte prioritario'
    ],
    popular: true,
    cta: 'Más Popular'
  },
  {
    name: 'Enterprise',
    price: '299',
    period: '/mes',
    description: 'Para grandes corporaciones',
    features: [
      'Todo lo de Profesional',
      'Empleados ilimitados',
      'Simulacros ilimitados',
      'Verificador de Transacciones',
      'API completa',
      'Certificados Blockchain',
      'Account Manager dedicado',
      'SLA 99.9%'
    ],
    popular: false,
    cta: 'Contactar Ventas'
  }
];

const TESTIMONIALS = [
  {
    quote: "Desde que implementamos ManoProtect, los intentos de phishing contra nuestros empleados se redujeron un 87%",
    author: "María García",
    role: "CISO, TechCorp España",
    avatar: "MG"
  },
  {
    quote: "El Sello de Confianza aumentó nuestra tasa de conversión en un 23%. Los clientes confían más en nosotros.",
    author: "Carlos Rodríguez",
    role: "CEO, E-commerce Plus",
    avatar: "CR"
  },
  {
    quote: "Los simulacros de phishing nos mostraron que el 45% de nuestros empleados caían en ataques. Ahora es menos del 5%.",
    author: "Ana Martínez",
    role: "Directora de Seguridad, BancoSeguro",
    avatar: "AM"
  }
];

const STATS = [
  { value: '0', label: 'Empresas protegidas' },
  { value: '0', label: 'Amenazas bloqueadas' },
  { value: '99.9%', label: 'Uptime garantizado' },
  { value: '< 1s', label: 'Tiempo de verificación' }
];

const EnterpriseLanding = () => {
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    employees: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would send to backend
    console.log('Enterprise lead:', contactForm);
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 relative">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <span className="text-xl font-bold">ManoProtect Enterprise</span>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10"
                onClick={() => navigate('/')}
              >
                Para Particulares
              </Button>
              <Button 
                className="bg-white text-indigo-600 hover:bg-white/90"
                onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
              >
                Contactar Ventas
              </Button>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-amber-500 mb-4">Para Empresas</Badge>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Protege tu empresa y genera 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500"> confianza</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                El sistema de ciberseguridad que protege a tus empleados del fraude 
                y demuestra a tus clientes que pueden confiar en ti.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg px-8"
                  onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                >
                  Ver Planes
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8"
                  onClick={() => navigate('/shield')}
                >
                  Demo Gratis
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((stat, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                  <p className="text-4xl font-bold text-amber-400">{stat.value}</p>
                  <p className="text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-100 text-indigo-700 mb-4">Funcionalidades</Badge>
            <h2 className="text-4xl font-bold text-zinc-900 mb-4">
              Todo lo que necesitas para proteger tu empresa
            </h2>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
              Herramientas de última generación que ninguna otra empresa ofrece
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => (
              <Card key={idx} className="border-zinc-200 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">{feature.title}</h3>
                  <p className="text-zinc-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 mb-4">Cómo Funciona</Badge>
            <h2 className="text-4xl font-bold text-zinc-900 mb-4">
              Implementación en 3 pasos
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Registro', description: 'Crea tu cuenta enterprise y añade los datos de tu empresa' },
              { step: '2', title: 'Configuración', description: 'Añade empleados, configura el sello y activa las protecciones' },
              { step: '3', title: 'Protección Activa', description: 'Tu empresa y clientes están protegidos 24/7' }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">{item.title}</h3>
                <p className="text-zinc-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 mb-4">Precios</Badge>
            <h2 className="text-4xl font-bold text-zinc-900 mb-4">
              Planes adaptados a tu empresa
            </h2>
            <p className="text-xl text-zinc-600">
              Sin permanencia. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan, idx) => (
              <Card 
                key={idx} 
                className={`relative ${plan.popular ? 'border-2 border-indigo-500 shadow-xl scale-105' : 'border-zinc-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600">Más Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-zinc-500">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-zinc-900">{plan.price}€</span>
                    <span className="text-zinc-500">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-zinc-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-amber-100 text-amber-700 mb-4">Testimonios</Badge>
            <h2 className="text-4xl font-bold text-zinc-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, idx) => (
              <Card key={idx} className="border-zinc-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-zinc-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900">{testimonial.author}</p>
                      <p className="text-sm text-zinc-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-20 bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              ¿Listo para proteger tu empresa?
            </h2>
            <p className="text-xl text-white/80">
              Déjanos tus datos y un especialista te contactará en menos de 24h
            </p>
          </div>

          {formSubmitted ? (
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">¡Gracias por tu interés!</h3>
                <p className="text-white/80">
                  Un especialista se pondrá en contacto contigo en menos de 24 horas.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Nombre de la empresa"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      required
                    />
                    <Input
                      placeholder="Tu nombre"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      type="email"
                      placeholder="Email corporativo"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      required
                    />
                    <Input
                      placeholder="Teléfono"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <Input
                    placeholder="Número de empleados"
                    value={contactForm.employees}
                    onChange={(e) => setContactForm({...contactForm, employees: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <Button 
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg"
                  >
                    Solicitar Demo Gratuita
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-white/60">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span>ManoProtect Enterprise</span>
          </div>
          <p>© 2026 ManoProtect. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default EnterpriseLanding;
