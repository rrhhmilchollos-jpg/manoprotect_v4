/**
 * ManoProtect - Protección de Identidad Digital
 * SEO SILO Page: protección identidad digital, identity theft protection
 */
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, Eye, Lock, AlertTriangle, Database, Fingerprint, Search, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const ProteccionIdentidadDigital = () => {
  const navigate = useNavigate();

  const threats = [
    {
      icon: User,
      title: "Suplantación de Identidad",
      description: "Delincuentes que se hacen pasar por ti para cometer fraudes, solicitar créditos o acceder a tus cuentas.",
      impact: "Pérdida media: €3.500"
    },
    {
      icon: Database,
      title: "Filtración de Datos",
      description: "Tus datos personales expuestos en brechas de seguridad de empresas y webs que has usado.",
      impact: "+150 brechas/mes en España"
    },
    {
      icon: Eye,
      title: "Monitoreo No Autorizado",
      description: "Rastreo de tu actividad online, geolocalización y hábitos de navegación sin tu consentimiento.",
      impact: "El 78% de apps rastrean usuarios"
    }
  ];

  const protectionLayers = [
    {
      step: "1",
      title: "Monitorización Dark Web",
      description: "Escaneamos la dark web 24/7 buscando tus datos personales, emails, contraseñas y documentos filtrados."
    },
    {
      step: "2",
      title: "Alertas de Brechas",
      description: "Te notificamos inmediatamente cuando tus datos aparecen en una nueva filtración de seguridad."
    },
    {
      step: "3",
      title: "Protección Proactiva",
      description: "Bloqueamos intentos de uso fraudulento de tu identidad antes de que causen daño."
    },
    {
      step: "4",
      title: "Recuperación Asistida",
      description: "Si tu identidad es comprometida, te guiamos paso a paso para recuperar el control."
    }
  ];

  const features = [
    { icon: Fingerprint, title: "Verificación Biométrica", description: "Autenticación segura con huella o reconocimiento facial" },
    { icon: Lock, title: "Gestor de Contraseñas", description: "Contraseñas únicas y seguras para cada servicio" },
    { icon: Search, title: "Scanner de Exposición", description: "Analiza qué información tuya está expuesta online" },
    { icon: Shield, title: "VPN Integrada", description: "Navegación anónima y cifrada en cualquier red" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Protección de Identidad Digital - Evita el Robo de Identidad | ManoProtect</title>
        <meta name="description" content="Protección de identidad digital completa. Monitorización dark web, alertas de brechas de datos, prevención de suplantación. Protege tu identidad online 24/7." />
        <meta name="keywords" content="protección identidad digital, robo identidad, identity theft protection, suplantación identidad, dark web monitoring, brechas datos, seguridad identidad online" />
        <link rel="canonical" href="https://manoprotectt.com/proteccion-identidad-digital" />
        
        <meta property="og:title" content="Protección de Identidad Digital - ManoProtect" />
        <meta property="og:description" content="Protege tu identidad digital del robo y la suplantación. Monitorización 24/7 de la dark web." />
        <meta property="og:url" content="https://manoprotectt.com/proteccion-identidad-digital" />
        <meta property="og:type" content="website" />
      </Helmet>

      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur px-4 py-2 rounded-full text-sm mb-6">
                  <Fingerprint className="w-4 h-4" />
                  <span>Identity Theft Protection</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                  Protección de
                  <span className="block text-emerald-300">Identidad Digital</span>
                </h1>
                
                <p className="text-xl text-emerald-100 mb-8 max-w-xl">
                  Tu identidad es tu activo más valioso. ManoProtect la protege contra robos, suplantaciones y filtraciones de datos en la dark web.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="bg-white text-emerald-900 hover:bg-emerald-50 rounded-full px-8 h-14 text-lg font-semibold"
                    data-testid="cta-protect-identity"
                  >
                    Proteger mi Identidad
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/pricing')}
                    className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-14"
                  >
                    Ver Planes
                  </Button>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-white">+2.3M</div>
                    <div className="text-emerald-200">identidades protegidas en España</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold">24/7</div>
                      <div className="text-sm text-emerald-200">Monitorización</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold">0€</div>
                      <div className="text-sm text-emerald-200">Pérdidas garantizadas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Identity Threats */}
        <section className="py-20 lg:py-28 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Amenazas a tu Identidad Digital
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Tu identidad está constantemente en riesgo. Conoce las amenazas más comunes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {threats.map((threat, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                  <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                    <threat.icon className="w-7 h-7 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{threat.title}</h3>
                  <p className="text-slate-600 mb-4">{threat.description}</p>
                  <div className="flex items-center gap-2 text-red-600 font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{threat.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Protection Layers */}
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                4 Capas de Protección de Identidad
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Sistema multicapa para proteger tu identidad digital
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {protectionLayers.map((layer, index) => (
                <div key={index} className="relative text-center">
                  <div className="text-7xl font-bold text-emerald-100 mb-4">{layer.step}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{layer.title}</h3>
                  <p className="text-slate-600">{layer.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 lg:py-28 bg-emerald-900 text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Herramientas de Protección Incluidas
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                  <div className="w-14 h-14 bg-emerald-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-emerald-200 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Internal Links Section */}
        <section className="py-16 bg-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Protección Completa contra Amenazas Digitales
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link to="/proteccion-phishing" className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-red-600 flex items-center gap-2">
                  Protección contra Phishing
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-slate-600">Detecta y bloquea emails y SMS fraudulentos</p>
              </Link>
              <Link to="/proteccion-fraude-online" className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-orange-600 flex items-center gap-2">
                  Fraud Prevention
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-slate-600">Prevención de fraudes con tarjetas y compras</p>
              </Link>
              <Link to="/seguridad-digital-familiar" className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-purple-600 flex items-center gap-2">
                  Seguridad Familiar
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-slate-600">Protección digital para toda la familia</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-700">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Tu identidad digital merece la mejor protección
            </h2>
            <p className="text-xl text-emerald-100 mb-8">
              Activa la protección ahora y duerme tranquilo. 7 días GRATIS.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-emerald-600 hover:bg-emerald-50 rounded-full px-10 h-14 text-lg font-semibold"
              data-testid="cta-start-protection"
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

export default ProteccionIdentidadDigital;
