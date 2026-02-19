/**
 * ManoProtect - Seguridad Digital para Mayores
 * SEO SILO Page: seguridad mayores, protección personas mayores online
 */
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Heart, Phone, MapPin, AlertTriangle, Bell, Users, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const SeguridadMayores = () => {
  const navigate = useNavigate();

  const elderlyThreats = [
    {
      icon: Phone,
      title: "Estafas Telefónicas",
      description: "El 67% de las víctimas de vishing (estafas por teléfono) en España son mayores de 65 años.",
      protection: "Detección de llamadas fraudulentas en tiempo real"
    },
    {
      icon: AlertTriangle,
      title: "Fraudes Bancarios",
      description: "Los mayores son el objetivo preferido de estafadores que se hacen pasar por bancos.",
      protection: "Alertas instantáneas de movimientos sospechosos"
    },
    {
      icon: Users,
      title: "Suplantación de Identidad",
      description: "Delincuentes que llaman haciéndose pasar por familiares pidiendo dinero urgente.",
      protection: "Verificación de identidad con contactos de confianza"
    }
  ];

  const features = [
    {
      icon: Heart,
      title: "Botón SOS",
      description: "Un solo toque para alertar a familiares y emergencias con ubicación GPS exacta.",
      color: "bg-green-100 text-[#4CAF50]"
    },
    {
      icon: MapPin,
      title: "Localización GPS",
      description: "Los familiares pueden ver la ubicación en tiempo real para mayor tranquilidad.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Bell,
      title: "Alertas Simples",
      description: "Notificaciones claras y fáciles de entender ante cualquier amenaza detectada.",
      color: "bg-amber-100 text-amber-600"
    },
    {
      icon: Clock,
      title: "Check-ins Diarios",
      description: "Recordatorios amigables para confirmar que todo está bien cada día.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Phone,
      title: "Línea de Ayuda",
      description: "Soporte telefónico 24/7 en español con personal especializado en mayores.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Shield,
      title: "Interfaz Simplificada",
      description: "App diseñada con botones grandes y texto legible para facilitar su uso.",
      color: "bg-indigo-100 text-indigo-600"
    }
  ];

  const testimonials = [
    {
      quote: "Desde que mi madre tiene ManoProtect, estoy mucho más tranquila. El botón SOS le da seguridad y yo puedo ver que está bien.",
      author: "Carmen García",
      relation: "Hija de usuaria de 78 años",
      location: "Madrid"
    },
    {
      quote: "Bloquearon una llamada de estafa a mi padre antes de que pudiera caer. ¡Le querían sacar 2.000€! Gracias ManoProtect.",
      author: "José Luis Martínez",
      relation: "Hijo de usuario de 82 años",
      location: "Barcelona"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Seguridad Digital para Mayores - Protección contra Estafas | ManoProtect</title>
        <meta name="description" content="Protección digital especializada para personas mayores. Botón SOS, localización GPS, detección de estafas telefónicas y fraudes bancarios. Tranquilidad para toda la familia." />
        <meta name="keywords" content="seguridad mayores, protección personas mayores online, estafas mayores, fraude mayores, botón SOS mayores, localización GPS mayores, seguridad tercera edad" />
        <link rel="canonical" href="https://manoprotect.com/seguridad-mayores" />
        
        <meta property="og:title" content="Seguridad Digital para Mayores - ManoProtect" />
        <meta property="og:description" content="Protección especializada para personas mayores contra estafas y fraudes digitales." />
        <meta property="og:url" content="https://manoprotect.com/seguridad-mayores" />
        <meta property="og:type" content="website" />
      </Helmet>

      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-rose-900 via-rose-800 to-slate-900 text-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-rose-500/20 backdrop-blur px-4 py-2 rounded-full text-sm mb-6">
                  <Heart className="w-4 h-4" />
                  <span>Protección para Mayores</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                  Seguridad Digital
                  <span className="block text-rose-300">para Nuestros Mayores</span>
                </h1>
                
                <p className="text-xl text-rose-100 mb-8 max-w-xl">
                  Protección especializada contra estafas y fraudes para personas mayores. Con botón SOS, localización GPS y soporte 24/7. Tranquilidad para toda la familia.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="bg-white text-rose-900 hover:bg-rose-50 rounded-full px-8 h-14 text-lg font-semibold"
                    data-testid="cta-protect-elderly"
                  >
                    Proteger a mis Mayores
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/servicios-sos')}
                    className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-14"
                  >
                    Ver Botón SOS
                  </Button>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="space-y-4 text-center">
                    <Heart className="w-16 h-16 mx-auto text-rose-300" />
                    <div className="text-3xl font-bold">+25.000</div>
                    <div className="text-rose-200">mayores protegidos en España</div>
                    <div className="pt-4 grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-xl p-3">
                        <div className="text-xl font-bold">€1.2M</div>
                        <div className="text-xs text-rose-200">Estafas evitadas</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3">
                        <div className="text-xl font-bold">99.8%</div>
                        <div className="text-xs text-rose-200">Satisfacción</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Elderly-Specific Threats */}
        <section className="py-20 lg:py-28 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Amenazas que Afectan a Nuestros Mayores
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Los ciberdelincuentes atacan especialmente a las personas mayores. Así es como les protegemos.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {elderlyThreats.map((threat, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                  <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center mb-6">
                    <threat.icon className="w-7 h-7 text-rose-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{threat.title}</h3>
                  <p className="text-slate-600 mb-4">{threat.description}</p>
                  <div className="flex items-start gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium">{threat.protection}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Funciones Diseñadas para Mayores
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Tecnología sencilla y efectiva para proteger a quien más quieres
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                  <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 lg:py-28 bg-rose-50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Familias que Confían en ManoProtect
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-700 text-lg mb-6 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-bold text-slate-900">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">{testimonial.relation}</div>
                    <div className="text-sm text-slate-400">{testimonial.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Internal Links Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Más Soluciones de Protección Digital
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link to="/seguridad-digital-familiar" className="group bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors">
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-purple-600 flex items-center gap-2">
                  Plan Familiar Completo
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-slate-600">Protección para niños, adultos y mayores</p>
              </Link>
              <Link to="/servicios-sos" className="group bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors">
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-[#4CAF50] flex items-center gap-2">
                  Botón SOS con GPS
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-slate-600">Alertas de emergencia con localización</p>
              </Link>
              <Link to="/proteccion-phishing" className="group bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors">
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-[#4CAF50] flex items-center gap-2">
                  Anti-Phishing
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-slate-600">Bloquea estafas por email y SMS</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-rose-600 to-rose-700">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Dale tranquilidad a quien más quieres
            </h2>
            <p className="text-xl text-rose-100 mb-8">
              Protege a tus mayores de estafas y fraudes. 7 días GRATIS sin compromiso.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-rose-600 hover:bg-rose-50 rounded-full px-10 h-14 text-lg font-semibold"
              data-testid="cta-start-elderly-protection"
            >
              Comenzar Protección Gratuita
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default SeguridadMayores;
