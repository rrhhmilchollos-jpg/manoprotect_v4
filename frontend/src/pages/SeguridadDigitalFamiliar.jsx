/**
 * ManoProtect - Seguridad Digital Familiar
 * SEO SILO Page: seguridad digital familiar, family digital security
 */
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Baby, Heart, Smartphone, MapPin, Bell, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const SeguridadDigitalFamiliar = () => {
  const navigate = useNavigate();

  const familyFeatures = [
    {
      icon: Baby,
      title: "Protección Infantil",
      description: "Control parental inteligente, filtrado de contenido y alertas de actividad sospechosa.",
      color: "bg-pink-100 text-pink-600"
    },
    {
      icon: Heart,
      title: "Cuidado de Mayores",
      description: "Botón SOS, localización GPS y alertas de emergencia para personas mayores.",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: Users,
      title: "Panel Familiar Único",
      description: "Gestiona la seguridad de toda tu familia desde una sola aplicación.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Smartphone,
      title: "Multi-Dispositivo",
      description: "Protege hasta 10 dispositivos: móviles, tablets y ordenadores.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: MapPin,
      title: "Localización Familiar",
      description: "Sabe dónde está tu familia en todo momento con GPS en tiempo real.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Bell,
      title: "Alertas Personalizadas",
      description: "Configura alertas para cada miembro según sus necesidades.",
      color: "bg-orange-100 text-orange-600"
    }
  ];

  const plans = [
    {
      name: "Familiar Básico",
      price: "9.99",
      devices: "5 dispositivos",
      features: ["Protección anti-phishing", "Fraud prevention", "Panel familiar", "Alertas básicas"]
    },
    {
      name: "Familiar Premium",
      price: "14.99",
      devices: "10 dispositivos",
      features: ["Todo lo básico", "Botón SOS con GPS", "Localización familiar", "Control parental", "Soporte prioritario"],
      recommended: true
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Seguridad Digital Familiar - Protege a Tu Familia Online | ManoProtect</title>
        <meta name="description" content="Seguridad digital para toda la familia. Protección infantil, cuidado de mayores, localización GPS y fraud prevention. Un plan familiar para proteger a todos." />
        <meta name="keywords" content="seguridad digital familiar, protección familiar online, control parental, cuidado mayores, localización familiar, seguridad niños internet" />
        <link rel="canonical" href="https://manoprotectt.com/seguridad-digital-familiar" />
      </Helmet>

      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-slate-900 text-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur px-4 py-2 rounded-full text-sm mb-6">
                  <Users className="w-4 h-4" />
                  <span>Plan Familiar</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                  Seguridad Digital
                  <span className="block text-purple-300">para Toda tu Familia</span>
                </h1>
                
                <p className="text-xl text-purple-100 mb-8 max-w-xl">
                  Desde los más pequeños hasta los mayores. ManoProtect protege a cada miembro de tu familia contra amenazas digitales, fraudes y emergencias.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="bg-white text-purple-900 hover:bg-purple-50 rounded-full px-8 h-14 text-lg font-semibold"
                  >
                    Proteger a mi Familia
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/pricing')}
                    className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-14"
                  >
                    Ver Planes Familiares
                  </Button>
                </div>
              </div>
              
              <div className="hidden lg:grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                  <Baby className="w-12 h-12 mx-auto mb-3 text-pink-300" />
                  <div className="font-semibold">Niños Seguros</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-red-300" />
                  <div className="font-semibold">Mayores Protegidos</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-blue-300" />
                  <div className="font-semibold">Adultos Seguros</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-green-300" />
                  <div className="font-semibold">Todos Localizados</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Protección Completa para Cada Miembro
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Funciones diseñadas para las necesidades de toda la familia
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {familyFeatures.map((feature, index) => (
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

        {/* Pricing Section */}
        <section className="py-20 lg:py-28 bg-slate-50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Planes Familiares
              </h2>
              <p className="text-xl text-slate-600">
                Un precio, toda la familia protegida
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {plans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-2xl p-8 shadow-lg border-2 ${
                    plan.recommended ? 'border-purple-500 relative' : 'border-slate-200'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Recomendado
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <div className="text-sm text-slate-500">{plan.devices}</div>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-slate-900">€{plan.price}</span>
                      <span className="text-slate-500">/mes</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full h-12 rounded-xl ${
                      plan.recommended 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                    }`}
                    onClick={() => navigate('/register')}
                  >
                    Comenzar 7 Días Gratis
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Tu familia merece la mejor protección
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Empieza hoy con 7 días GRATIS. Sin tarjeta de crédito.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-purple-600 hover:bg-purple-50 rounded-full px-10 h-14 text-lg font-semibold"
            >
              Activar Plan Familiar Gratis
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default SeguridadDigitalFamiliar;
