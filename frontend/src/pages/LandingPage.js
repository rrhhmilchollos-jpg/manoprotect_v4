/**
 * ManoProtect - Landing Page
 * Diseño basado en la imagen proporcionada
 * GPS Localizador para familias
 */
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, ShoppingCart, Search, Play, Check, Star, 
  MapPin, Phone, Clock, CreditCard, MessageCircle,
  ChevronRight, Users, Award, Truck, Lock
} from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

// Logos de medios
const MediaLogos = () => (
  <div className="flex items-center justify-center gap-8 flex-wrap py-4">
    <span className="text-xl font-serif font-bold text-gray-800 tracking-wide">EL PAÍS</span>
    <span className="text-2xl font-serif font-black text-gray-800">ABC</span>
    <span className="text-xl font-serif font-bold text-gray-800 tracking-wider">LA RAZÓN</span>
    <span className="text-xl font-sans font-bold text-gray-800 lowercase">cuatro</span>
  </div>
);

// Testimonios
const testimonials = [
  {
    name: "Laura S.",
    image: "https://images.unsplash.com/photo-1634552516330-ab1ccc0f605e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "Gracias a ManoProtect, siempre sé dónde están mis hijos. Estoy mucho más tranquila..."
  },
  {
    name: "Pedro M.",
    image: "https://images.unsplash.com/photo-1698270949515-47a2618727a0?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "Un GPS que salva vidas. Lo recomiendo 100%."
  },
  {
    name: "Marta G.",
    image: "https://images.unsplash.com/photo-1752084794888-0b27a762b6fd?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "Mis padres mayores ahora están mucho más seguros. ¡Muy contenta!"
  },
  {
    name: "Carlos R.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "Mis padres mayores ahora están mucho más seguros. ¡Muy contento!"
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>ManoProtect - Localizador GPS para Familias | #1 en España</title>
        <meta name="description" content="Localizador GPS para familias que protege lo que más quieres. Sabe dónde están tus hijos y mayores y recibe alertas en tiempo real. +2,000 familias protegidas en España." />
        <meta name="keywords" content="localizador GPS, GPS familiar, rastreador GPS, localizar familia, GPS niños, GPS mayores, GPS ancianos, seguridad familiar España" />
        <link rel="canonical" href="https://manoprotect.com" />
      </Helmet>

      {/* ============ HEADER ============ */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">ManoProtect</span>
            </Link>

            {/* Center - Tagline */}
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
              <span className="text-green-600 font-medium">&raquo; Optimizado para SEO</span>
              <span className="italic">Reseña-creativa GPS familiar en mineros, que soluciona en línea</span>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-gray-800 text-gray-800 font-semibold rounded hover:bg-gray-800 hover:text-white transition-colors"
                data-testid="header-login-btn"
              >
                MI CUENTA
              </Link>
              <Link to="/tienda" className="text-gray-600 hover:text-green-600" data-testid="header-cart-btn">
                <ShoppingCart className="w-6 h-6" />
              </Link>
              <button className="text-gray-600 hover:text-green-600">
                <Search className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============ HERO SECTION ============ */}
      <section className="relative" data-testid="hero-section">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/7489081/pexels-photo-7489081.jpeg?auto=compress&cs=tinysrgb&w=1920')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          {/* Trust Banner */}
          <div className="inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm mb-6">
            <div className="flex">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
            </div>
            <span className="font-semibold">$ 00 2885 dd</span>
            <span className="text-gray-300 text-xs">Disponibles en Stock</span>
          </div>

          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-4">
              Localizador GPS<br />
              <span className="text-green-600">para familias</span> que<br />
              protege lo que más quieres
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              Sabe dónde están tus hijos y mayores<br />
              y recibe alertas en tiempo real.
            </p>

            {/* #1 Badge */}
            <div className="inline-flex items-center gap-2 bg-white border-2 border-red-500 px-4 py-2 rounded-lg mb-8">
              <span className="text-gray-800 font-bold">#1 en localizadores GPS para familias en España</span>
              <span className="text-2xl">🇪🇸</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Link 
                to="/tienda"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full transition-colors shadow-lg"
                data-testid="hero-cta-gps"
              >
                VER GPS PARA FAMILIAS
              </Link>
              <Link 
                to="/como-funciona"
                className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-3 rounded-full transition-colors border border-gray-300"
                data-testid="hero-cta-how"
              >
                CÓMO FUNCIONA
              </Link>
            </div>

            {/* Trust Elements */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <span className="font-semibold">4,8/5 en 327 familias</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <span>Basado en 327 opiniones.</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Lock className="w-4 h-4" />
                <span className="font-semibold">Pago 100% Seguro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative bg-white/90 backdrop-blur-sm border-t border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Optimizado</span>
                <span className="text-gray-500">para SEO</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-bold text-lg">+2,000 familias protegidas en España</span>
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Pop c das sesvics GOS SEO:</span>
                <span>be localı para en cuentas, eguales MD, GPS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Media Mentions */}
        <div className="relative bg-white py-6">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-center text-gray-500 mb-4">Nos encontrà en</p>
            <MediaLogos />
          </div>
        </div>
      </section>

      {/* ============ LOCALIZA Y PROTEGE SECTION ============ */}
      <section className="relative py-16 bg-gradient-to-br from-green-50 to-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Image with Video */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.pexels.com/photos/7489081/pexels-photo-7489081.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Familia usando ManoProtect GPS"
                  className="w-full h-auto"
                />
                {/* Play Button Overlay */}
                <button 
                  onClick={() => setShowVideo(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
                  data-testid="video-play-btn"
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-green-600 ml-1" fill="currentColor" />
                  </div>
                </button>
              </div>
              
              {/* CTA Below Image */}
              <div className="mt-6">
                <Link 
                  to="/tienda"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-lg transition-colors w-full justify-center text-lg"
                  data-testid="features-cta"
                >
                  VER DISPOSITIVOS DISPONIBLES
                </Link>
              </div>

              {/* Feature Icons */}
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Pssymape</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Desvecciones</span>
                <span className="flex items-center gap-1"><Award className="w-4 h-4" /> Essppreciasconas con torpets</span>
              </div>
            </div>

            {/* Right - Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
                Localiza y Protege<br />
                <span className="text-green-600">a tus Seres Queridos</span>
              </h2>

              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-700 text-lg">
                    Encuentra a tus seres queridos al instante, sin cuotas fijas.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-700 text-lg">
                    Tus hijos o mayores te alertan al instante si necesitan ayuda
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-700 text-lg">
                    Recibe avisos si salen de zona seguras configuradas al instante al móvil, email o SMS
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ COMPRA SIN RIESGOS SECTION ============ */}
      <section className="py-16 bg-white" data-testid="garantias-section">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Compra sin riesgos, <span className="text-green-600">tranquilidad garantizada</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Guarantees */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">30 DÍAS SIN RIESGOS</h3>
                  <p className="text-gray-600">• Prueba el GPS durante 30 días.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">ENVÍO RÁPIDO <span className="font-normal text-gray-600">DESDE ESPAÑA</span></h3>
                  <p className="text-gray-600">Entrega en 24-48h desde España, seguimiento del pedido.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">PAGO SEGURO <span className="font-normal text-gray-600">GARANTIZADO</span></h3>
                  <p className="text-gray-600">Transacciones cifradas SSL - / DiS</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">SOPORTE REAL <span className="font-normal text-gray-600">POR WHATSAPP</span></h3>
                  <p className="text-gray-600">Asistencia personalizada: 24/7</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-bold">¿Qué garantía ofrecen?</span> 30 días de prueba, sin utilizar de escasez.
                  <ChevronRight className="w-4 h-4 inline text-green-500 ml-2" />
                </p>
              </div>
            </div>

            {/* Right - Image with CTA */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.pexels.com/photos/4625010/pexels-photo-4625010.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Madre e hijo usando ManoProtect"
                  className="w-full h-auto"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <Link 
                    to="/tienda"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-lg transition-colors w-full justify-center text-lg"
                    data-testid="garantias-cta"
                  >
                    COMPRAR GPS AHORA
                  </Link>
                </div>
              </div>

              {/* WhatsApp Floating Button */}
              <a 
                href="https://wa.me/34601510950" 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute -right-4 bottom-32 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
                data-testid="whatsapp-btn"
              >
                <MessageCircle className="w-7 h-7 text-white" fill="white" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIOS SECTION ============ */}
      <section className="py-16 bg-gradient-to-b from-green-50 to-white" data-testid="testimonios-section">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Opiniones Reales <span className="text-green-600">de Nuestros Clientes</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                data-testid={`testimonial-${index}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{testimonial.text}</p>
                <div className="mt-4 flex justify-end">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="text-green-600 hover:text-green-700 font-medium">
              Ver otros &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* ============ QUIÉNES SOMOS SECTION ============ */}
      <section className="py-16 bg-white" data-testid="about-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-green-600">Quiénes Somos</h2>
              </div>

              <p className="text-gray-600 text-lg mb-8">
                Fuimos creados para ofrecer tranquilidad a las familias españolas. 
                Creamos soluciones GPS de alta calidad que permiten localizar 
                y proteger a tus seres queridos en todo momento.
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">Empresa de Prevención</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">Somos dedicados</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">Vía sensores</p>
                </div>
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/7489081/pexels-photo-7489081.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Equipo ManoProtect"
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA SECTION ============ */}
      <section className="py-12 bg-gray-800" data-testid="final-cta-section">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Empieza a proteger a tu familia hoy mismo
          </h2>
          <Link 
            to="/tienda"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-10 py-4 rounded-lg transition-colors text-xl shadow-lg"
            data-testid="final-cta-btn"
          >
            COMPRAR GPS AHORA
            <ChevronRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />

      {/* Video Modal */}
      {showVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <div className="relative max-w-4xl w-full aspect-video bg-black rounded-lg overflow-hidden">
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <span className="text-3xl">&times;</span>
            </button>
            <div className="w-full h-full flex items-center justify-center text-white">
              <p>Video de demostración</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button (Mobile) */}
      <a 
        href="https://wa.me/34601510950" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-xl hover:bg-green-600 transition-colors z-40 md:hidden"
      >
        <MessageCircle className="w-8 h-8 text-white" fill="white" />
      </a>
    </div>
  );
};

export default LandingPage;
