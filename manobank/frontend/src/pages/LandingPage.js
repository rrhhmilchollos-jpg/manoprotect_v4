import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Landmark, Shield, CreditCard, Smartphone, ArrowRight, 
  Check, Star, Users, Zap, Lock, Send, PiggyBank
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: CreditCard, title: "Tarjeta VISA Gratis", desc: "Sin cuota de mantenimiento" },
    { icon: Send, title: "Transferencias €0", desc: "SEPA y Bizum incluidos" },
    { icon: Shield, title: "Protección Antifraude", desc: "Powered by ManoProtect" },
    { icon: Smartphone, title: "100% Digital", desc: "Sin comisiones ocultas" },
  ];

  const stats = [
    { value: "€0", label: "Comisiones" },
    { value: "24/7", label: "Soporte" },
    { value: "2.5%", label: "TAE Ahorro" },
    { value: "100%", label: "Digital" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ManoBank</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#productos" className="text-gray-600 hover:text-gray-900 font-medium">Productos</a>
              <a href="#seguridad" className="text-gray-600 hover:text-gray-900 font-medium">Seguridad</a>
              <a href="https://manoprotect.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1">
                <Shield className="w-4 h-4" />
                ManoProtect
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="hidden sm:flex text-gray-600 hover:text-gray-900 font-medium"
              >
                Iniciar sesión
              </button>
              <button 
                onClick={() => navigate('/registro')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Abrir Cuenta
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Tu banco digital sin comisiones
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Tu dinero,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  protegido
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-xl">
                El primer banco digital español con protección antifraude integrada. 
                Sin comisiones, 100% digital y con la seguridad de ManoProtect.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={() => navigate('/registro')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  Abrir Cuenta Gratis
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
                >
                  Ya tengo cuenta
                </button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Sin comisiones
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  IBAN español
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Banco de España
                </span>
              </div>
            </div>

            {/* Card Preview */}
            <div className="relative">
              <div className="relative mx-auto max-w-sm">
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform">
                  <div className="flex justify-between items-start mb-12">
                    <Landmark className="w-10 h-10 text-white/80" />
                    <div className="text-right">
                      <p className="text-xs text-white/70">Virtual Card</p>
                      <p className="font-semibold text-white">ManoBank</p>
                    </div>
                  </div>
                  <div className="mb-8">
                    <p className="font-mono text-2xl text-white tracking-wider">•••• •••• •••• 4821</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-white/70">Titular</p>
                      <p className="font-semibold text-white">TU NOMBRE</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/70">Válida hasta</p>
                      <p className="font-semibold text-white">12/29</p>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="absolute -right-4 -bottom-4 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Protegido por</p>
                    <p className="font-bold text-gray-900">ManoProtect</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl font-bold text-blue-400">{stat.value}</p>
                <p className="text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="productos" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas de un banco
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sin letras pequeñas, sin comisiones ocultas, sin sorpresas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="seguridad" className="py-20 px-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Integración con ManoProtect
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Tu dinero protegido con la mejor tecnología antifraude
              </h2>
              
              <p className="text-lg text-indigo-200 mb-8">
                ManoBank es el único banco en España con integración nativa con ManoProtect. 
                Cada transacción es verificada en tiempo real contra nuestra base de datos de fraudes.
              </p>

              <div className="space-y-4">
                {[
                  "Verificación de transacciones en tiempo real",
                  "Bloqueo automático de operaciones sospechosas",
                  "Alertas instantáneas de actividad fraudulenta",
                  "Base de datos de estafadores compartida"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-indigo-100">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <a 
                  href="https://manoprotect.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-indigo-900 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Conocer ManoProtect
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Transacción Verificada</p>
                    <p className="text-indigo-300 text-sm">hace 2 segundos</p>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-indigo-300">Destinatario</span>
                    <span className="text-white font-medium">✓ Verificado</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-indigo-300">IBAN</span>
                    <span className="text-white font-medium">✓ Sin alertas</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-indigo-300">Riesgo de fraude</span>
                    <span className="text-green-400 font-medium">0% - Seguro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Abre tu cuenta en 5 minutos
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Sin papeleos, sin colas, sin comisiones. Solo necesitas tu DNI y un selfie.
          </p>
          <button 
            onClick={() => navigate('/registro')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors"
          >
            Empezar Ahora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ManoBank</span>
            </div>
            
            <p className="text-sm text-center md:text-left">
              ManoBank S.A. · CIF: B19427723 · Entidad supervisada por el Banco de España
            </p>
            
            <div className="flex items-center gap-4 text-sm">
              <a href="/privacy" className="hover:text-white">Privacidad</a>
              <a href="/terms" className="hover:text-white">Términos</a>
              <a href="mailto:info@manobank.es" className="hover:text-white">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
