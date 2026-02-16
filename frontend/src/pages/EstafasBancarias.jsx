/**
 * ManoProtect - Protección contra Estafas Bancarias
 * SEO SILO Page: estafas bancarias, banking fraud protection
 */
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, CreditCard, Building2, Smartphone, Lock, AlertTriangle, CheckCircle, Phone, Mail, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const EstafasBancarias = () => {
  const navigate = useNavigate();

  const scamTypes = [
    {
      icon: Phone,
      title: "Vishing Bancario",
      description: "Llamadas de estafadores haciéndose pasar por tu banco para obtener claves y PINs.",
      examples: ["'Llamo de Santander, su cuenta ha sido bloqueada'", "'Soy de BBVA Seguridad, necesito verificar su identidad'"],
      stat: "45%",
      statLabel: "de estafas en España"
    },
    {
      icon: Mail,
      title: "Phishing Bancario",
      description: "Emails falsos que imitan a tu banco pidiendo que 'verifiques' tus datos.",
      examples: ["Emails con logos de bancos pidiendo actualizar datos", "Links a webs falsas que copian la banca online"],
      stat: "32%",
      statLabel: "de estafas en España"
    },
    {
      icon: MessageSquare,
      title: "Smishing Bancario",
      description: "SMS fraudulentos con alertas falsas de seguridad o cargos no autorizados.",
      examples: ["'BBVA: Se ha realizado un cargo de 899€. Si no lo reconoce pulse aquí'", "'CaixaBank: Su tarjeta ha sido bloqueada'"],
      stat: "23%",
      statLabel: "de estafas en España"
    }
  ];

  const protectionFeatures = [
    {
      icon: Lock,
      title: "Verificación de Remitentes",
      description: "Comprobamos si las llamadas, emails y SMS provienen realmente de tu banco."
    },
    {
      icon: AlertTriangle,
      title: "Alertas en Tiempo Real",
      description: "Te avisamos al instante cuando detectamos un intento de estafa bancaria."
    },
    {
      icon: Shield,
      title: "Bloqueo de Webs Falsas",
      description: "Impedimos el acceso a páginas que imitan a bancos reales."
    },
    {
      icon: CreditCard,
      title: "Monitor de Transacciones",
      description: "Seguimiento de movimientos sospechosos en tus cuentas y tarjetas."
    }
  ];

  const realCases = [
    {
      title: "Estafa del 'Técnico de Seguridad'",
      description: "Un hombre recibe llamada de 'su banco' alertando de un cargo fraudulento. Le piden instalar una app de 'seguridad' que da control remoto a los estafadores.",
      loss: "€4.500 robados",
      prevention: "ManoProtect detectó la llamada como fraudulenta y bloqueó el intento"
    },
    {
      title: "SMS del 'Bizum Incorrecto'",
      description: "Una mujer recibe SMS diciendo que ha recibido un Bizum por error y que debe devolverlo. El enlace lleva a una web falsa que roba sus credenciales.",
      loss: "€2.800 robados",
      prevention: "ManoProtect identificó el SMS como phishing y alertó a la usuaria"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Protección contra Estafas Bancarias - Banking Fraud Protection | ManoProtect</title>
        <meta name="description" content="Protección contra estafas bancarias: vishing, phishing y smishing. Detectamos llamadas falsas de bancos, emails y SMS fraudulentos. Protege tu dinero con IA avanzada." />
        <meta name="keywords" content="estafas bancarias, fraude bancario, vishing banco, phishing bancario, smishing, protección cuenta bancaria, fraud prevention banking, seguridad bancaria" />
        <link rel="canonical" href="https://manoprotect.com/estafas-bancarias" />
        
        <meta property="og:title" content="Protección contra Estafas Bancarias - ManoProtect" />
        <meta property="og:description" content="Detectamos y bloqueamos estafas bancarias: llamadas falsas, emails y SMS fraudulentos." />
        <meta property="og:url" content="https://manoprotect.com/estafas-bancarias" />
        <meta property="og:type" content="website" />
      </Helmet>

      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur px-4 py-2 rounded-full text-sm mb-6">
                  <Building2 className="w-4 h-4" />
                  <span>Banking Fraud Protection</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                  Protección contra
                  <span className="block text-blue-300">Estafas Bancarias</span>
                </h1>
                
                <p className="text-xl text-blue-100 mb-8 max-w-xl">
                  Las estafas bancarias causan pérdidas de más de €500 millones al año en España. ManoProtect detecta y bloquea llamadas falsas, emails y SMS fraudulentos antes de que pierdas un euro.
                </p>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold">€500M</div>
                    <div className="text-xs text-blue-200">Fraudes bancarios/año</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold">+280%</div>
                    <div className="text-xs text-blue-200">Aumento desde 2020</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold">99.9%</div>
                    <div className="text-xs text-blue-200">Detección ManoProtect</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="bg-white text-blue-900 hover:bg-blue-50 rounded-full px-8 h-14 text-lg font-semibold"
                    data-testid="cta-banking-protection"
                  >
                    Proteger mis Cuentas
                  </Button>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold">Alerta de Estafa Detectada</div>
                      <div className="text-sm text-blue-200">Hace 2 minutos</div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 mb-4">
                    <div className="text-sm text-blue-200 mb-1">Llamada entrante</div>
                    <div className="font-semibold">+34 91 XXX XXXX</div>
                    <div className="text-sm text-red-300 mt-2">⚠️ Detectado: Vishing bancario</div>
                  </div>
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-red-500 hover:bg-red-600 text-sm">Bloquear</Button>
                    <Button variant="outline" className="flex-1 border-white/30 text-sm">Reportar</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scam Types */}
        <section className="py-20 lg:py-28 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Tipos de Estafas Bancarias más Comunes
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Los estafadores usan múltiples técnicas. ManoProtect te protege de todas.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {scamTypes.map((scam, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <scam.icon className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{scam.stat}</div>
                      <div className="text-xs text-slate-500">{scam.statLabel}</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{scam.title}</h3>
                  <p className="text-slate-600 mb-4">{scam.description}</p>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-slate-700">Ejemplos reales:</div>
                    {scam.examples.map((example, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-600 bg-red-50 p-2 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="italic">{example}</span>
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
                Cómo te Protegemos de las Estafas Bancarias
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Tecnología avanzada para mantener tu dinero seguro
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {protectionFeatures.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Real Cases */}
        <section className="py-20 lg:py-28 bg-blue-900 text-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Casos Reales de Estafas Bancarias
              </h2>
              <p className="text-xl text-blue-200">
                Historias reales que ManoProtect ha prevenido
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {realCases.map((caseStudy, index) => (
                <div key={index} className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                  <h3 className="text-xl font-bold mb-4">{caseStudy.title}</h3>
                  <p className="text-blue-100 mb-4">{caseStudy.description}</p>
                  <div className="flex items-center gap-2 text-red-300 mb-4">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">{caseStudy.loss}</span>
                  </div>
                  <div className="flex items-start gap-2 bg-green-500/20 p-4 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-300 mt-0.5" />
                    <span className="text-green-100">{caseStudy.prevention}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Internal Links Section */}
        <section className="py-16 bg-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Protección Completa contra Fraudes
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link to="/proteccion-phishing" className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-red-600 flex items-center gap-2">
                  Anti-Phishing General
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-slate-600">Protección contra todo tipo de phishing</p>
              </Link>
              <Link to="/proteccion-fraude-online" className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-orange-600 flex items-center gap-2">
                  Fraud Prevention
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-slate-600">Prevención completa de fraudes online</p>
              </Link>
              <Link to="/secure-payments" className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-green-600 flex items-center gap-2">
                  Pagos Seguros Online
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-slate-600">Protección para compras y transacciones</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              No dejes que te roben tus ahorros
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Activa la protección contra estafas bancarias. 7 días GRATIS.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-10 h-14 text-lg font-semibold"
              data-testid="cta-banking-start"
            >
              Proteger mis Cuentas Gratis
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default EstafasBancarias;
