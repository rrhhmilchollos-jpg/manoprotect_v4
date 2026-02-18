/**
 * ManoProtect - Landing Page
 * Réplica exacta de la imagen proporcionada
 * GPS Localizador para familias
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Shield, ShoppingCart, Search, Play, Check, Star, 
  MapPin, Lock, ChevronRight, Phone
} from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

// Imágenes de testimonios
const testimonialImages = {
  laura: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  pedro: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  marta: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  carlos: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
};

const LandingPage = () => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Helmet>
        <title>ManoProtect - Localizador GPS para Familias | #1 en España</title>
        <meta name="description" content="Localizador GPS para familias que protege lo que más quieres. Sabe dónde están tus hijos y mayores y recibe alertas en tiempo real. +2,000 familias protegidas en España." />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      </Helmet>

      {/* ============ HEADER - Verde #009444 ============ */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-10 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#009444] rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#333333]">ManoProtect</span>
          </Link>

          {/* Center Text */}
          <div className="hidden lg:flex items-center gap-3 text-sm">
            <span className="text-[#009444] font-semibold">&raquo; Optimizado para SEO</span>
            <span className="text-gray-500 italic text-xs">Reseña-creativa GPS familiar en meneros, que soluciona en línea</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="hidden sm:block px-5 py-2 border-2 border-[#333333] text-[#333333] font-bold text-sm rounded hover:bg-[#333333] hover:text-white transition-colors"
              data-testid="header-login-btn"
            >
              MI CUENTA
            </Link>
            <Link to="/dispositivo-sos" className="text-gray-600 hover:text-[#009444]">
              <ShoppingCart className="w-5 h-5" />
            </Link>
            <button className="text-gray-600 hover:text-[#009444]">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-[580px]" data-testid="hero-section">
        {/* Background Image - Familia */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/7489081/pexels-photo-7489081.jpeg?auto=compress&cs=tinysrgb&w=1920')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-10 py-20">
          {/* Trust Badge Top */}
          <div className="inline-flex items-center gap-2 bg-[#333333] text-white px-4 py-2 rounded-full text-sm mb-8">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
            </div>
            <span className="font-semibold ml-2">$ co 2885dd</span>
            <span className="text-gray-300 text-xs ml-2">Disponibles en Stock</span>
          </div>

          {/* Main Content */}
          <div className="max-w-[550px]">
            <h1 className="text-[40px] font-bold text-[#333333] leading-[50px] mb-6">
              Localizador GPS<br />
              para familias que<br />
              <span className="text-[#009444]">protege lo que más quieres</span>
            </h1>
            
            <p className="text-lg text-[#555555] mb-8 leading-7">
              Sabe dónde están tus hijos y mayores<br />
              y recibe alertas en tiempo real.
            </p>

            {/* #1 Badge */}
            <div className="inline-flex items-center gap-3 bg-white border-2 border-red-500 px-4 py-3 rounded-lg shadow-sm mb-10">
              <span className="text-[#333333] font-bold text-base">#1 en localizadores GPS para familias en España</span>
              <span className="text-2xl">🇪🇸</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link 
                to="/dispositivo-sos"
                className="inline-flex items-center gap-2 bg-[#7ED321] hover:bg-[#6BC11A] text-white font-bold px-8 py-4 rounded transition-colors text-sm"
                data-testid="hero-cta-gps"
              >
                VER GPS PARA FAMILIAS
              </Link>
              <Link 
                to="/como-funciona"
                className="inline-flex items-center gap-2 bg-transparent border-2 border-[#7ED321] text-[#7ED321] font-bold px-6 py-4 rounded transition-colors text-sm hover:bg-[#7ED321] hover:text-white"
                data-testid="hero-cta-how"
              >
                CÓMO FUNCIONA
              </Link>
            </div>

            {/* Trust Elements Row */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <span className="font-bold text-[#333333]">4,8/5 en 327 familias</span>
              </div>
              <span className="text-gray-400">Basado en 327 opiniones.</span>
              <div className="flex items-center gap-2 text-[#009444]">
                <Lock className="w-4 h-4" />
                <span className="font-semibold">Pago 100% Seguro</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="bg-[#F8F8F8] py-5 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-6 text-sm">
            <div className="flex items-center gap-2 text-[#666666]">
              <span>Optimizado</span>
              <span>para SEO</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#009444] font-bold text-base">+2,000 familias protegidas en España</span>
              <MapPin className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-[#666666] text-xs">
              Pop c das sesvics GOS SEO: be localı para en cuentas, eguales MD, GPS
            </div>
          </div>
        </div>
      </section>

      {/* ============ MEDIA LOGOS ============ */}
      <section className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 lg:px-10">
          <p className="text-center text-[#888888] text-sm mb-4">Nos-encontrà en</p>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            <span className="text-xl font-serif font-bold text-[#333333] tracking-wide">EL PAÍS</span>
            <span className="text-2xl font-serif font-black text-[#333333]">ABC</span>
            <span className="text-xl font-serif font-bold text-[#333333] tracking-wider">LA RAZÓN</span>
            <span className="text-xl font-sans font-bold text-[#333333]">cuatro</span>
          </div>
        </div>
      </section>

      {/* ============ LOCALIZA Y PROTEGE ============ */}
      <section className="py-16 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left - Image with Video */}
            <div>
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="https://images.pexels.com/photos/7489081/pexels-photo-7489081.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Familia usando ManoProtect GPS"
                  className="w-full h-auto"
                />
                {/* Play Button */}
                <button 
                  onClick={() => setShowVideo(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                  data-testid="video-play-btn"
                >
                  <div className="w-24 h-24 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 text-[#7ED321] ml-1" fill="currentColor" />
                  </div>
                </button>
              </div>
              
              {/* CTA Button */}
              <Link 
                to="/dispositivo-sos"
                className="mt-6 inline-flex items-center justify-center w-full bg-[#7ED321] hover:bg-[#6BC11A] text-white font-bold py-4 rounded text-sm transition-colors"
                data-testid="features-cta"
              >
                VER DISPOSITIVOS DISPONIBLES
              </Link>

              {/* Small Links */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#888888]">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Pegymape</span>
                <span>Desvecciones</span>
                <span>Essppreciasconas toriegeis</span>
              </div>
            </div>

            {/* Right - Content */}
            <div className="lg:pt-8">
              <h2 className="text-[30px] font-bold text-[#333333] leading-[40px] mb-10">
                Localiza y Protege<br />
                a tus Seres Queridos
              </h2>

              <ul className="space-y-8">
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-[#7ED321] flex-shrink-0 mt-1" strokeWidth={3} />
                  <p className="text-[#555555] text-base leading-7">
                    Encuentra a tus seres queridos al instante, sin cuotas fijas.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-[#7ED321] flex-shrink-0 mt-1" strokeWidth={3} />
                  <p className="text-[#555555] text-base leading-7">
                    Tus hijos o mayores te alertan al instante si necesitan ayuda
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-[#7ED321] flex-shrink-0 mt-1" strokeWidth={3} />
                  <p className="text-[#555555] text-base leading-7">
                    Recibe avisos si salen de zona seguras configuradas al instante al móvil, email o SMS
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ COMPRA SIN RIESGOS ============ */}
      <section className="py-16 bg-white" data-testid="garantias-section">
        <div className="max-w-7xl mx-auto px-4 lg:px-10">
          <h2 className="text-[30px] font-bold text-center text-[#333333] mb-12">
            Compra sin riesgos, tranquilidad garantizada
          </h2>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Benefits */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-[#7ED321] flex-shrink-0 mt-1" strokeWidth={3} />
                <div>
                  <h3 className="font-bold text-[#333333] text-lg">30 DÍAS SIN RIESGOS</h3>
                  <p className="text-[#666666] text-[15px]">• Prueba el GPS durante 30 días.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-[#7ED321] flex-shrink-0 mt-1" strokeWidth={3} />
                <div>
                  <h3 className="font-bold text-[#333333] text-lg">ENVÍO RÁPIDO <span className="font-normal text-[#666666]">DESDE ESPAÑA</span></h3>
                  <p className="text-[#666666] text-[15px]">Entrega en 24-48h desde España, seguimiento del pedido.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-[#7ED321] flex-shrink-0 mt-1" strokeWidth={3} />
                <div>
                  <h3 className="font-bold text-[#333333] text-lg">PAGO SEGURO <span className="font-normal text-[#666666]">GARANTIZADO</span></h3>
                  <p className="text-[#666666] text-[15px]">Transacciones cifradas SSL - / DiS</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-[#7ED321] flex-shrink-0 mt-1" strokeWidth={3} />
                <div>
                  <h3 className="font-bold text-[#333333] text-lg">SOPORTE REAL <span className="font-normal text-[#666666]">POR WHATSAPP</span></h3>
                  <p className="text-[#666666] text-[15px]">Asistencia personalizada: 24/7</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div>
                  <span className="text-[#888888] text-sm">¿Qué garantía ofrecen?</span>
                  <span className="text-[#888888] text-xs ml-2">30 días de prueba, sin ulijor de escasez.</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#7ED321]" />
              </div>
            </div>

            {/* Right - Image with CTA */}
            <div className="relative">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="https://images.pexels.com/photos/4625010/pexels-photo-4625010.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Madre e hijo usando GPS"
                  className="w-full h-auto"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <Link 
                    to="/dispositivo-sos"
                    className="inline-flex items-center justify-center w-full bg-[#009444] hover:bg-[#007836] text-white font-bold py-4 rounded text-sm transition-colors"
                    data-testid="garantias-cta"
                  >
                    COMPRAR GPS AHORA
                  </Link>
                </div>
              </div>

              {/* WhatsApp Button */}
              <a 
                href="https://wa.me/34601510950" 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute -right-2 bottom-40 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                data-testid="whatsapp-btn"
              >
                <Phone className="w-6 h-6 text-white" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIOS ============ */}
      <section className="py-16 bg-[#F8F8F8]" data-testid="testimonios-section">
        <div className="max-w-7xl mx-auto px-4 lg:px-10">
          <h2 className="text-[30px] font-bold text-center text-[#333333] mb-12">
            Opiniones Reales de Nuestros Clientes
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Testimonio 1 */}
            <div className="bg-white rounded-lg p-5 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <img src={testimonialImages.laura} alt="Laura S." className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-[#333333] text-lg">Laura S.</h4>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                </div>
              </div>
              <p className="text-[#666666] text-[13px] leading-5">
                Gracias a ManoProtect, siempre sé dónde están mis hijos. Estoy mucho más tranquila...
              </p>
              <div className="mt-3 flex justify-end">
                <div className="w-2 h-2 bg-[#7ED321] rounded-full"></div>
              </div>
            </div>

            {/* Testimonio 2 */}
            <div className="bg-white rounded-lg p-5 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <img src={testimonialImages.pedro} alt="Pedro M." className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-[#333333] text-lg">Pedro M.</h4>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                </div>
              </div>
              <p className="text-[#666666] text-[13px] leading-5">
                Un GPS que salva vidas. Lo recomiendo 100%.
              </p>
              <div className="mt-3 flex justify-end">
                <div className="w-2 h-2 bg-[#7ED321] rounded-full"></div>
              </div>
            </div>

            {/* Testimonio 3 */}
            <div className="bg-white rounded-lg p-5 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <img src={testimonialImages.marta} alt="Marta G." className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-[#333333] text-lg">Marta G.</h4>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                </div>
              </div>
              <p className="text-[#666666] text-[13px] leading-5">
                Mis padres mayores ahora están mucho más seguros. ¡Muy contenta!
              </p>
              <div className="mt-3 flex justify-end">
                <div className="w-2 h-2 bg-[#7ED321] rounded-full"></div>
              </div>
            </div>

            {/* Testimonio 4 */}
            <div className="bg-white rounded-lg p-5 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <img src={testimonialImages.carlos} alt="Marta G." className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-[#333333] text-lg">Marta G.</h4>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                </div>
              </div>
              <p className="text-[#666666] text-[13px] leading-5">
                Mis padres mayores ahora están mucho más seguros. ¡Muy contento!
              </p>
              <div className="mt-3 flex justify-end text-xs text-gray-400">
                Ver otros
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ QUIÉNES SOMOS ============ */}
      <section className="py-12 bg-[#009444]" data-testid="about-section">
        <div className="max-w-7xl mx-auto px-4 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Quiénes Somos</h2>
              </div>
              <p className="text-white/90 text-sm leading-6">
                Fuimos creados para ofrecer tranquilidad a las familias españolas. 
                Creamos soluciones GPS de alta calidad que permiten localizar 
                y proteger a tus seres queridos en todo momento.
              </p>
            </div>

            {/* Right - Links */}
            <div className="flex flex-wrap gap-8 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Empresa de Prevención</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Somos dedicados</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Vía sensores</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section 
        className="relative py-16 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.pexels.com/photos/7489081/pexels-photo-7489081.jpeg?auto=compress&cs=tinysrgb&w=1920')`,
        }}
        data-testid="final-cta-section"
      >
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-[28px] font-bold text-white mb-8 leading-[38px]">
            Empieza a proteger a tu familia hoy mismo
          </h2>
          <Link 
            to="/dispositivo-sos"
            className="inline-flex items-center gap-3 bg-[#7ED321] hover:bg-[#6BC11A] text-white font-bold px-12 py-4 rounded text-base transition-colors"
            data-testid="final-cta-btn"
          >
            COMPRAR GPS AHORA
            <ChevronRight className="w-5 h-5" />
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
          <div className="relative max-w-4xl w-full aspect-video bg-black rounded-lg">
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
            >
              &times;
            </button>
            <div className="w-full h-full flex items-center justify-center text-white">
              <p>Video de demostración</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp - Mobile */}
      <a 
        href="https://wa.me/34601510950" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl z-40 lg:hidden"
      >
        <Phone className="w-7 h-7 text-white" />
      </a>
    </div>
  );
};

export default LandingPage;
