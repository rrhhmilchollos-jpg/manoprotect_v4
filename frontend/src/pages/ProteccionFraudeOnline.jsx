/**
 * ManoProtect - Protección contra Fraude Online
 * SEO SILO Page: fraude online, fraud prevention
 */
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, CreditCard, Smartphone, Globe, CheckCircle, TrendingUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const ProteccionFraudeOnline = () => {
  const navigate = useNavigate();

  const fraudTypes = [
    {
      icon: CreditCard,
      title: "Fraude con Tarjetas",
      description: "Protección contra clonación, robo de datos y cargos no autorizados en tus tarjetas.",
      stat: "€4.5M",
      statLabel: "Evitados en fraudes"
    },
    {
      icon: Globe,
      title: "Estafas en Compras Online",
      description: "Detectamos tiendas falsas y webs fraudulentas antes de que compres.",
      stat: "2.500+",
      statLabel: "Webs fraudulentas detectadas"
    },
    {
      icon: Smartphone,
      title: "Fraude en Apps y SMS",
      description: "Analizamos apps sospechosas y SMS fraudulentos en tiempo real.",
      stat: "15.000+",
      statLabel: "Amenazas bloqueadas/mes"
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Monitorización Continua",
      description: "Escaneamos constantemente tus transacciones, mensajes y actividad online."
    },
    {
      step: "02",
      title: "Análisis con IA",
      description: "Nuestra inteligencia artificial detecta patrones sospechosos en milisegundos."
    },
    {
      step: "03",
      title: "Alerta Inmediata",
      description: "Te notificamos al instante cuando detectamos actividad fraudulenta."
    },
    {
      step: "04",
      title: "Bloqueo y Protección",
      description: "Bloqueamos la amenaza y te guiamos para proteger tus cuentas."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Protección contra Fraude Online - Fraud Prevention con IA | ManoProtect</title>
        <meta name="description" content="Protección contra fraude online con inteligencia artificial. Detectamos estafas, fraudes con tarjetas y compras falsas en tiempo real. Fraud prevention avanzado." />
        <meta name="keywords" content="fraude online, fraud prevention, protección fraude, estafas internet, fraude tarjetas, compras seguras, antifraude" />
        <link rel="canonical" href="https://manoprotectt.com/proteccion-fraude-online" />
      </Helmet>

      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-orange-900 via-orange-800 to-slate-900 text-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur px-4 py-2 rounded-full text-sm mb-6">
                <Shield className="w-4 h-4" />
                <span>Fraud Prevention Avanzado</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Protección contra
                <span className="block text-orange-300">Fraude Online</span>
              </h1>
              
              <p className="text-xl text-orange-100 mb-8 max-w-xl">
                El fraude online cuesta millones a los españoles cada año. ManoProtect detecta y bloquea estafas antes de que pierdas un euro.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">€1.2B</div>
                  <div className="text-sm text-orange-200">Fraudes en España/año</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">+300%</div>
                  <div className="text-sm text-orange-200">Aumento desde 2020</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">99.7%</div>
                  <div className="text-sm text-orange-200">Detección ManoProtect</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-white text-orange-900 hover:bg-orange-50 rounded-full px-8 h-14 text-lg font-semibold"
                >
                  Activar Fraud Prevention
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Fraud Types */}
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Tipos de Fraude que Prevenimos
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Protección completa contra todas las formas de fraude digital
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {fraudTypes.map((fraud, index) => (
                <div key={index} className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                    <fraud.icon className="w-7 h-7 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{fraud.title}</h3>
                  <p className="text-slate-600 mb-6">{fraud.description}</p>
                  <div className="pt-4 border-t border-slate-200">
                    <div className="text-3xl font-bold text-orange-600">{fraud.stat}</div>
                    <div className="text-sm text-slate-500">{fraud.statLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 lg:py-28 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Cómo Funciona Nuestro Fraud Prevention
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                4 capas de protección trabajando 24/7 para mantenerte seguro
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => (
                <div key={index} className="relative">
                  <div className="text-6xl font-bold text-slate-800 mb-4">{step.step}</div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-400">{step.description}</p>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-8 right-0 w-full h-0.5 bg-gradient-to-r from-orange-500/50 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-orange-600">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              <div>
                <div className="text-4xl font-bold">€4.5M+</div>
                <div className="text-orange-100">Evitados en fraudes</div>
              </div>
              <div>
                <div className="text-4xl font-bold">50.000+</div>
                <div className="text-orange-100">Familias protegidas</div>
              </div>
              <div>
                <div className="text-4xl font-bold">99.7%</div>
                <div className="text-orange-100">Tasa de detección</div>
              </div>
              <div>
                <div className="text-4xl font-bold">24/7</div>
                <div className="text-orange-100">Monitorización activa</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Lock className="w-16 h-16 text-orange-600 mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              No dejes que el fraude online te afecte
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Activa el fraud prevention más avanzado de España. 7 días GRATIS.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-10 h-14 text-lg font-semibold"
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

export default ProteccionFraudeOnline;
