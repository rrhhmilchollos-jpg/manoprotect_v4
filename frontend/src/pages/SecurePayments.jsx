/**
 * ManoProtect - Secure Online Payments Page
 * SEO Landing Page for: secure online payments, online payment protection
 */
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Shield, CreditCard, Lock, CheckCircle, AlertTriangle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const SecurePayments = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Fraud Prevention en Tiempo Real",
      description: "Nuestra IA analiza cada transacción para detectar patrones sospechosos antes de que ocurra el fraude."
    },
    {
      icon: CreditCard,
      title: "Online Payment Protection",
      description: "Protección completa para tus compras online. Verificamos sitios web y detectamos páginas fraudulentas."
    },
    {
      icon: Lock,
      title: "Encriptación Avanzada",
      description: "Tus datos de pago están protegidos con encriptación de nivel bancario."
    },
    {
      icon: AlertTriangle,
      title: "Alertas de Transacciones",
      description: "Recibe notificaciones instantáneas de cualquier actividad sospechosa en tus cuentas."
    },
    {
      icon: Smartphone,
      title: "Verificación en Dos Pasos",
      description: "Autenticación adicional para transacciones de alto riesgo."
    },
    {
      icon: CheckCircle,
      title: "Garantía Anti-Fraude",
      description: "Si eres víctima de fraude usando ManoProtect, te ayudamos en el proceso de reclamación."
    }
  ];

  const stats = [
    { value: "99.7%", label: "Fraudes detectados" },
    { value: "< 0.1s", label: "Tiempo de análisis" },
    { value: "500K+", label: "Transacciones protegidas" },
    { value: "24/7", label: "Monitoreo activo" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Secure Online Payments - Online Payment Protection | ManoProtect</title>
        <meta name="description" content="Protege tus pagos online con ManoProtect. Secure online payments con fraud prevention avanzado y online payment protection. Detección de fraudes en tiempo real." />
        <meta name="keywords" content="secure online payments, online payment protection, fraud prevention, pagos seguros, protección pagos online, antifraude, seguridad transacciones" />
        <link rel="canonical" href="https://manoprotect.com/secure-payments" />
      </Helmet>

      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white py-20 lg:py-28">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNjAgMTAgTSAxMCAwIEwgMTAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
          
          <div className="relative max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm mb-8">
              <Lock className="w-4 h-4" />
              <span>Secure Online Payments</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Online Payment Protection
              <br />
              <span className="text-indigo-300">para todas tus compras</span>
            </h1>
            
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
              Protege cada transacción online con fraud prevention avanzado. 
              ManoProtect detecta y bloquea intentos de fraude en tiempo real.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-white text-indigo-900 hover:bg-indigo-50 rounded-full px-8 h-14 text-lg font-semibold"
              >
                Activar Protección Gratis
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/como-funciona')}
                className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-14 text-lg"
              >
                Cómo Funciona
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-indigo-600">{stat.value}</div>
                  <div className="text-slate-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Digital Security para tus Pagos Online
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Fraud prevention completo con tecnología de última generación
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-indigo-600">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Empieza con Secure Online Payments Hoy
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              7 días gratis de online payment protection completo
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-full px-10 h-14 text-lg font-semibold"
            >
              Comenzar Prueba Gratis
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default SecurePayments;
