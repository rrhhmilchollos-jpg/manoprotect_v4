import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import SEO from '../components/SEO';
import { 
  Landmark, CreditCard, Smartphone, Shield, CheckCircle, ArrowRight,
  Star, Users, TrendingUp, Award, Zap, Lock, Globe, Phone,
  ChevronDown, Play, Wallet, PiggyBank, Receipt, Building2, MapPin, Mail
} from 'lucide-react';

const LandingPromo = () => {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

  const features = [
    { icon: <CreditCard className="w-6 h-6" />, title: "Tarjeta VISA Gratis", desc: "Sin cuota de mantenimiento" },
    { icon: <Zap className="w-6 h-6" />, title: "Transferencias €0", desc: "SEPA y Bizum incluidos" },
    { icon: <Smartphone className="w-6 h-6" />, title: "App 5 Estrellas", desc: "iOS y Android" },
    { icon: <Shield className="w-6 h-6" />, title: "100% Seguro", desc: "Garantía hasta 100.000€" },
  ];

  const products = [
    { 
      icon: <Wallet className="w-8 h-8 text-blue-500" />,
      title: "Cuenta Corriente",
      price: "€0/mes",
      features: ["IBAN español", "Sin requisitos de nómina", "Bizum incluido", "Retiros gratis"]
    },
    { 
      icon: <PiggyBank className="w-8 h-8 text-green-500" />,
      title: "Cuenta Ahorro",
      price: "2.5% TAE",
      features: ["Sin penalización", "Liquidez total", "Intereses mensuales", "Sin mínimo"]
    },
    { 
      icon: <CreditCard className="w-8 h-8 text-purple-500" />,
      title: "Tarjetas Premium",
      price: "Desde €0",
      features: ["VISA Gold gratis*", "Mastercard disponible", "Contactless", "Apple/Google Pay"]
    },
    { 
      icon: <Receipt className="w-8 h-8 text-orange-500" />,
      title: "Préstamos",
      price: "TAE 5.9%",
      features: ["Hasta 50.000€", "Sin avales", "Respuesta 24h", "Amortización flexible"]
    },
  ];

  const testimonials = [
    { name: "María G.", role: "Autónoma", text: "Por fin un banco que no me cobra por todo. Llevo 6 meses y estoy encantada.", rating: 5 },
    { name: "Carlos R.", role: "Ingeniero", text: "La app es increíble, puedo hacer todo desde el móvil. Adiós colas en el banco.", rating: 5 },
    { name: "Ana P.", role: "Profesora", text: "Abrí mi cuenta en 5 minutos con la videollamada. Súper fácil y seguro.", rating: 5 },
  ];

  const stats = [
    { value: "50.000+", label: "Clientes activos" },
    { value: "€0", label: "Comisiones ocultas" },
    { value: "4.8★", label: "Valoración App Store" },
    { value: "24/7", label: "Soporte disponible" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ManoBank</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#productos" className="text-gray-600 hover:text-gray-900 font-medium">Productos</a>
              <a href="#seguridad" className="text-gray-600 hover:text-gray-900 font-medium">Seguridad</a>
              <a href="#testimonios" className="text-gray-600 hover:text-gray-900 font-medium">Opiniones</a>
              <a href="/manoprotect" className="text-gray-600 hover:text-gray-900 font-medium">ManoProtect</a>
            </nav>

            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login-seguro')}
                className="hidden sm:flex"
              >
                Iniciar sesión
              </Button>
              <Button 
                onClick={() => navigate('/abrir-cuenta')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Abrir cuenta gratis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                <Award className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Neobanco español #1</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Tu banco digital
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> sin comisiones</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-lg">
                Abre tu cuenta en 5 minutos con videoverificación instantánea. 
                Tarjeta VISA gratis, transferencias €0 y la mejor app de banca móvil.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/abrir-cuenta')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-xl"
                >
                  Abrir cuenta gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => setShowVideo(true)}
                  className="text-lg px-8 py-6 rounded-xl border-gray-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Ver cómo funciona
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Banco de España</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="w-5 h-5 text-green-600" />
                  <span>Garantía 100.000€</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="w-5 h-5 text-green-600" />
                  <span>CIF: B19427723</span>
                </div>
              </div>
            </div>

            {/* Hero Image - Phone mockup */}
            <div className="relative lg:pl-12">
              <div className="relative mx-auto w-72">
                {/* Phone frame */}
                <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Status bar */}
                    <div className="bg-blue-600 px-6 py-4 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm">9:41</span>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-white/30" />
                          <div className="w-4 h-4 rounded-full bg-white/30" />
                        </div>
                      </div>
                      <p className="text-sm opacity-80">Hola, María</p>
                      <p className="text-3xl font-bold">€2.458,32</p>
                      <p className="text-sm opacity-80">Cuenta Corriente</p>
                    </div>
                    {/* Content */}
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-4 gap-2">
                        {['Enviar', 'Bizum', 'Pagar', 'Más'].map((item, i) => (
                          <div key={i} className="text-center">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-1">
                              <div className="w-6 h-6 bg-blue-200 rounded-full" />
                            </div>
                            <span className="text-xs text-gray-600">{item}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-2">Última actividad</p>
                        {[
                          { name: 'Netflix', amount: '-€12,99' },
                          { name: 'Nómina', amount: '+€2.100,00' },
                          { name: 'Supermercado', amount: '-€45,32' },
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                            <span className="text-sm text-gray-700">{item.name}</span>
                            <span className={`text-sm font-medium ${item.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'}`}>
                              {item.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating card */}
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-48 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-xl p-4 text-white">
                  <p className="text-xs opacity-80">ManoBank</p>
                  <p className="font-mono text-sm mt-4">•••• •••• •••• 4532</p>
                  <div className="flex justify-between mt-2 text-xs">
                    <span>MARÍA GARCÍA</span>
                    <span>12/28</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-400">{stat.value}</div>
                <div className="text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas, sin lo que no
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Banca simple, transparente y 100% digital. Sin comisiones ocultas, sin letra pequeña.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="productos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Productos a tu medida
            </h2>
            <p className="text-xl text-gray-600">
              Elige lo que necesitas, paga solo por lo que usas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl transition-all">
                <div className="mb-4">{product.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{product.title}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-4">{product.price}</p>
                <ul className="space-y-2">
                  {product.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="seguridad" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Tu dinero, protegido al máximo nivel
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                ManoBank S.A. es una entidad regulada por el Banco de España. 
                Tu dinero está garantizado hasta 100.000€ por el Fondo de Garantía de Depósitos.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: <Shield className="w-5 h-5" />, title: "Fondo de Garantía de Depósitos", desc: "Hasta 100.000€ garantizados por cliente" },
                  { icon: <Lock className="w-5 h-5" />, title: "Cifrado bancario", desc: "AES-256 en reposo, TLS 1.3 en tránsito" },
                  { icon: <Smartphone className="w-5 h-5" />, title: "Autenticación 2FA", desc: "Verificación en dos pasos obligatoria" },
                  { icon: <Building2 className="w-5 h-5" />, title: "Banco de España", desc: "Entidad supervisada nº registro XXXX" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">100% Seguro</h3>
              <p className="text-gray-600 mb-6">
                La misma seguridad que los grandes bancos, con la agilidad de un neobanco
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Logo_BDE.svg/200px-Logo_BDE.svg.png" alt="Banco de España" className="h-12 object-contain opacity-60" />
                <div className="h-12 px-4 bg-white rounded-lg flex items-center justify-center text-sm font-medium text-gray-700 border">
                  CIF: B19427723
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <div className="flex items-center justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-lg">4.8 en App Store</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/90 mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-white/70">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            ¿Listo para cambiar a ManoBank?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Abre tu cuenta en 5 minutos con videoverificación instantánea. 
            Sin papeleos, sin esperas, sin comisiones.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/abrir-cuenta')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-12 py-6 rounded-xl"
          >
            Abrir mi cuenta gratis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="mt-4 text-sm text-gray-500">
            Proceso 100% online · Videoverificación segura · Sin compromiso
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Landmark className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">ManoBank</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Tu neobanco 100% digital. Banca sin comisiones, sin letra pequeña.
              </p>
              {/* Sede info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-400">
                    <p>C/ Sor Isabel de Villena 82 bajo</p>
                    <p>Novelé, Valencia, España</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-400" />
                  <a href="tel:601510950" className="text-blue-400 hover:text-blue-300">601 510 950</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <a href="mailto:info@manobank.com" className="text-blue-400 hover:text-blue-300">info@manobank.com</a>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Productos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Cuenta Corriente</a></li>
                <li><a href="#" className="hover:text-white">Cuenta Ahorro</a></li>
                <li><a href="#" className="hover:text-white">Tarjetas</a></li>
                <li><a href="#" className="hover:text-white">Préstamos</a></li>
                <li><a href="#" className="hover:text-white">Hipotecas</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Prensa</a></li>
                <li><a href="#" className="hover:text-white">Empleo</a></li>
                <li><a href="/manoprotect" className="hover:text-white">ManoProtect</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Aviso legal</a></li>
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
                <li><a href="#" className="hover:text-white">Tarifas</a></li>
              </ul>
              
              {/* Horarios */}
              <div className="mt-6 p-3 bg-gray-800 rounded-lg">
                <p className="text-xs font-medium text-white mb-2">Horarios de atención</p>
                <div className="space-y-1 text-xs text-gray-400">
                  <p>🟢 Sucursal: 08:00 - 14:00</p>
                  <p>🔵 Gestores: 14:00 - 18:00</p>
                  <p>🔴 Urgencias: 18:00 - 08:00</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © 2026 ManoBank S.A. · CIF: B19427723 · Entidad supervisada por el Banco de España
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="tel:601510950" className="flex items-center gap-2 hover:text-white">
                <Phone className="w-4 h-4" />
                <span>601 510 950</span>
              </a>
              <a href="mailto:info@manobank.com" className="flex items-center gap-2 hover:text-white">
                <Mail className="w-4 h-4" />
                <span>info@manobank.com</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPromo;
