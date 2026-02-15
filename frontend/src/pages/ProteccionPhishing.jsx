/**
 * ManoProtect - Protección contra Phishing
 * SEO SILO Page: protección phishing, phishing protection
 */
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Mail, MessageSquare, Phone, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const ProteccionPhishing = () => {
  const navigate = useNavigate();

  const phishingTypes = [
    {
      icon: Mail,
      title: "Email Phishing",
      description: "Correos electrónicos falsos que imitan bancos, empresas o instituciones para robar tus datos.",
      examples: ["Emails de 'tu banco' pidiendo verificar datos", "Facturas falsas de empresas conocidas", "Premios o herencias inexistentes"]
    },
    {
      icon: MessageSquare,
      title: "SMS Phishing (Smishing)",
      description: "Mensajes de texto fraudulentos con enlaces maliciosos o solicitudes urgentes.",
      examples: ["SMS de 'Correos' con paquetes pendientes", "Alertas falsas de seguridad bancaria", "Ofertas de trabajo fraudulentas"]
    },
    {
      icon: Phone,
      title: "Vishing (Phishing por voz)",
      description: "Llamadas telefónicas de estafadores haciéndose pasar por empresas legítimas.",
      examples: ["Llamadas de 'Microsoft' por virus", "Soporte técnico falso", "Encuestas que piden datos personales"]
    }
  ];

  const protectionFeatures = [
    {
      icon: Eye,
      title: "Detección en Tiempo Real",
      description: "Analizamos cada mensaje, email y enlace en tiempo real usando IA avanzada."
    },
    {
      icon: AlertTriangle,
      title: "Alertas Instantáneas",
      description: "Te avisamos inmediatamente cuando detectamos un intento de phishing."
    },
    {
      icon: Shield,
      title: "Bloqueo Automático",
      description: "Bloqueamos enlaces maliciosos antes de que puedas hacer clic."
    },
    {
      icon: CheckCircle,
      title: "Verificación de Remitentes",
      description: "Verificamos la autenticidad de emails y mensajes sospechosos."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Protección contra Phishing - Detecta y Bloquea Estafas | ManoProtect</title>
        <meta name="description" content="Protección contra phishing con IA. Detecta emails falsos, SMS fraudulentos y llamadas de estafa en tiempo real. Protege tu identidad digital. Prueba GRATIS." />
        <meta name="keywords" content="protección phishing, anti phishing, detector phishing, estafas email, smishing, vishing, fraude online, seguridad digital" />
        <link rel="canonical" href="https://manoprotect.com/proteccion-phishing" />
      </Helmet>

      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-red-900 via-red-800 to-slate-900 text-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-red-500/20 backdrop-blur px-4 py-2 rounded-full text-sm mb-6">
                  <Shield className="w-4 h-4" />
                  <span>Protección Anti-Phishing</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                  Protección contra Phishing
                  <span className="block text-red-300">con Inteligencia Artificial</span>
                </h1>
                
                <p className="text-xl text-red-100 mb-8 max-w-xl">
                  Detectamos y bloqueamos intentos de phishing en emails, SMS y llamadas antes de que puedas ser víctima. Protección 24/7 para ti y tu familia.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="bg-white text-red-900 hover:bg-red-50 rounded-full px-8 h-14 text-lg font-semibold"
                  >
                    Protegerme del Phishing
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/how-it-works')}
                    className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-14"
                  >
                    Ver Cómo Funciona
                  </Button>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-white">+15.000</div>
                    <div className="text-red-200">ataques de phishing bloqueados este mes</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold">99.7%</div>
                      <div className="text-sm text-red-200">Tasa de detección</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold">&lt;0.1s</div>
                      <div className="text-sm text-red-200">Tiempo de análisis</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Types of Phishing */}
        <section className="py-20 lg:py-28 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Tipos de Phishing que Detectamos
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Los ciberdelincuentes usan múltiples técnicas. ManoProtect te protege de todas.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {phishingTypes.map((type, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                  <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                    <type.icon className="w-7 h-7 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{type.title}</h3>
                  <p className="text-slate-600 mb-4">{type.description}</p>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-slate-700">Ejemplos comunes:</div>
                    {type.examples.map((example, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Protection Features */}
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Cómo te Protegemos del Phishing
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Tecnología de vanguardia para mantener tus datos seguros
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {protectionFeatures.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              No seas la próxima víctima de phishing
            </h2>
            <p className="text-xl text-red-100 mb-8">
              Activa la protección ahora y navega tranquilo. 7 días GRATIS.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-red-600 hover:bg-red-50 rounded-full px-10 h-14 text-lg font-semibold"
            >
              Activar Protección Anti-Phishing
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default ProteccionPhishing;
