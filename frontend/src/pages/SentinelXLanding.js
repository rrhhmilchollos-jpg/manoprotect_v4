import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Lock, Mic, MapPin, Zap, Check, Clock, Globe, CreditCard, ChevronRight, Star, Play, Users } from 'lucide-react';
import LandingHeader from '../components/landing/LandingHeader';
import LandingFooter from '../components/landing/LandingFooter';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Product images
const SENTINEL_IMAGES = {
  hero: "https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png",
  withPhone: "https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/450nzm76_Reloj%20y%20m%C3%B3vil%20seguros.png",
  lifestyle: "https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/68kjir28_Reloj%20y%20m%C3%B3vil%20seguros.png"
};

// Maximum units for founders edition
const MAX_FOUNDERS_UNITS = 500;

const SentinelXLanding = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [reservedCount, setReservedCount] = useState(143); // Start with base count
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'ES',
    paymentType: 'full' // 'full' or 'partial'
  });

  // Fetch reservation count on mount
  useEffect(() => {
    const fetchReservationCount = async () => {
      try {
        const response = await fetch(`${API_URL}/api/sentinel-x/count`);
        if (response.ok) {
          const data = await response.json();
          // Add base count (143) to actual reservations
          setReservedCount(143 + (data.count || 0));
        }
      } catch (error) {
        console.log('Using default reservation count');
      }
    };
    fetchReservationCount();
  }, []);

  const images = [SENTINEL_IMAGES.hero, SENTINEL_IMAGES.withPhone, SENTINEL_IMAGES.lifestyle];

  const features = [
    {
      icon: <Lock className="w-8 h-8" />,
      title: "SOS Invisible",
      description: "Activación discreta sin alertas visibles. Nadie sabrá que has pedido ayuda."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Modo PIN Falso",
      description: "Seguridad bajo coacción. Un PIN alternativo que simula desbloqueo normal mientras activa protocolos de emergencia."
    },
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Grabación Segura en la Nube",
      description: "Protege tu audio en tiempo real. Grabaciones cifradas y almacenadas automáticamente."
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Trayecto Seguro Automático",
      description: "Comparte rutas con tus contactos y recibe alertas si algo falla en tu camino."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Autonomía 5 Días",
      description: "Uso real, sin recargas constantes. Batería optimizada para tu día a día."
    }
  ];

  const specs = [
    { label: "Pantalla", value: "AMOLED 1.78\"" },
    { label: "Material", value: "Caja metálica negra mate / titanio" },
    { label: "Correas", value: "Intercambiables premium" },
    { label: "Batería", value: "5 días de autonomía" },
    { label: "Conectividad", value: "4G LTE independiente" },
    { label: "Resistencia", value: "IP68 + 5ATM" },
    { label: "GPS", value: "Multi-banda de alta precisión" },
    { label: "Sensores", value: "Ritmo cardíaco, SpO2, acelerómetro" }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePreorder = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/checkout/sentinel-x`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: formData.paymentType === 'full' ? 149 : 10,
          product: 'SENTINEL X - Edición Fundadores',
          paymentType: formData.paymentType
        }),
      });

      const data = await response.json();
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert('Error al procesar el pago. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>SENTINEL X - El Reloj de Seguridad Inteligente | ManoProtect</title>
        <meta name="description" content="SENTINEL X: El reloj inteligente que actúa cuando tú no puedes. SOS invisible, modo PIN falso, grabación en la nube y trayecto seguro. Edición Fundadores 149€." />
        <meta property="og:title" content="SENTINEL X - El Reloj de Seguridad Inteligente | ManoProtect" />
        <meta property="og:description" content="Protección inteligente, elegante y urbana. Seguridad avanzada en tu muñeca. Reserva la Edición Fundadores por solo 149€." />
        <meta property="og:image" content={SENTINEL_IMAGES.hero} />
        <meta property="og:url" content="https://manoprotect.com/sentinel-x" />
        <link rel="canonical" href="https://manoprotect.com/sentinel-x" />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        <LandingHeader />

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
          
          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-500/30 rounded-full animate-pulse" />
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-cyan-400/40 rounded-full animate-ping" />
            <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cyan-600/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text content */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm mb-6">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  Edición Fundadores - Cantidad Limitada
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  <span className="text-white">SENTINEL X</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    El reloj que actúa cuando tú no puedes
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                  Protección inteligente, elegante y urbana. Seguridad avanzada en tu muñeca.
                  <span className="block mt-2 text-cyan-400 font-medium">
                    Funciona independiente del teléfono.
                  </span>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a 
                    href="#reservar"
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25"
                    data-testid="hero-cta-button"
                  >
                    Reserva tu Edición Fundadores
                    <span className="px-3 py-1 bg-white/20 rounded-lg">149€</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>

                {/* Reservation Counter */}
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">Unidades Reservadas</span>
                    </div>
                    <span className="text-white font-bold">{reservedCount} / {MAX_FOUNDERS_UNITS}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((reservedCount / MAX_FOUNDERS_UNITS) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    ¡Solo quedan <span className="text-amber-400 font-bold">{MAX_FOUNDERS_UNITS - reservedCount}</span> unidades de la Edición Fundadores!
                  </p>
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-500" />
                    <span>Garantía 12 meses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-500" />
                    <span>Envío a toda Europa</span>
                  </div>
                </div>
              </div>

              {/* Product image */}
              <div className="relative order-1 lg:order-2">
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl rounded-full transform scale-75" />
                  
                  {/* Main image */}
                  <img 
                    src={images[selectedImage]}
                    alt="ManoProtect SENTINEL X Smartwatch"
                    className="relative z-10 w-full max-w-lg mx-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                    data-testid="hero-product-image"
                  />
                </div>

                {/* Image selector dots */}
                <div className="flex justify-center gap-3 mt-6">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        selectedImage === index 
                          ? 'bg-cyan-500 w-8' 
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                      aria-label={`Ver imagen ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-cyan-500 rounded-full animate-pulse" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-b from-black to-gray-900" id="caracteristicas">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                ¿Por qué <span className="text-cyan-400">SENTINEL X</span>?
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Tecnología wearable de última generación diseñada para protegerte en cualquier situación.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl hover:border-cyan-500/50 transition-all duration-300"
                  data-testid={`feature-card-${index}`}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-cyan-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Callout */}
            <div className="mt-12 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl text-center">
              <p className="text-lg text-cyan-400 font-medium">
                "Funciona independiente del teléfono. Tecnología wearable de última generación."
              </p>
            </div>
          </div>
        </section>

        {/* Design & Specs Section */}
        <section className="py-20 bg-gray-900" id="diseno">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src={SENTINEL_IMAGES.withPhone}
                  alt="SENTINEL X con smartphone"
                  className="rounded-2xl shadow-2xl shadow-cyan-500/10"
                />
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  Diseño <span className="text-cyan-400">Premium</span>
                </h2>
                <p className="text-gray-400 mb-8">
                  Minimalista, elegante y urbano. El SENTINEL X combina materiales premium con un diseño que complementa cualquier estilo.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {specs.map((spec, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50"
                    >
                      <p className="text-sm text-gray-500 mb-1">{spec.label}</p>
                      <p className="text-white font-medium">{spec.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-black border-2 border-gray-600" title="Negro Mate" />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-gray-600" title="Titanio" />
                  </div>
                  <p className="text-sm text-gray-500">Disponible en Negro Mate y Titanio</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pre-order Section */}
        <section className="py-20 bg-black" id="reservar">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm mb-4">
                  <Clock className="w-4 h-4" />
                  Entrega estimada: 90-120 días
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Reserva tu <span className="text-cyan-400">Edición Fundadores</span>
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                  Sé de los primeros en tener el SENTINEL X. Cantidad limitada a los primeros 500 compradores.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Pricing Card */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-cyan-500/30 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">Edición Fundadores</h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white">149€</span>
                      <span className="text-gray-500 line-through">249€</span>
                    </div>
                    <p className="text-green-400 text-sm mt-1">Ahorras 100€ - Oferta Fundadores</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      'SENTINEL X Edición Limitada',
                      'Correa premium incluida',
                      'Cargador magnético',
                      'Garantía oficial 12 meses',
                      'Envío gratuito a España',
                      'Acceso anticipado a actualizaciones',
                      'Soporte prioritario 24/7'
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-300">
                        <Check className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Payment options */}
                  <div className="space-y-3 mb-6">
                    <label className="flex items-center gap-3 p-4 bg-gray-800 rounded-xl border border-gray-700 cursor-pointer hover:border-cyan-500/50 transition-colors">
                      <input 
                        type="radio" 
                        name="paymentType" 
                        value="full"
                        checked={formData.paymentType === 'full'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-cyan-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-white">Pago completo</p>
                        <p className="text-sm text-gray-400">149€ ahora</p>
                      </div>
                      <span className="text-cyan-400 font-bold">149€</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-gray-800 rounded-xl border border-gray-700 cursor-pointer hover:border-cyan-500/50 transition-colors">
                      <input 
                        type="radio" 
                        name="paymentType" 
                        value="partial"
                        checked={formData.paymentType === 'partial'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-cyan-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-white">Reserva con señal</p>
                        <p className="text-sm text-gray-400">10€ ahora + 139€ antes del envío</p>
                      </div>
                      <span className="text-cyan-400 font-bold">10€</span>
                    </label>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handlePreorder} className="space-y-4" data-testid="preorder-form">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nombre completo</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors"
                      placeholder="Tu nombre"
                      data-testid="input-name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors"
                      placeholder="tu@email.com"
                      data-testid="input-email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Dirección de envío</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors"
                      placeholder="Calle, número, piso..."
                      data-testid="input-address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Ciudad</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors"
                        placeholder="Ciudad"
                        data-testid="input-city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Código Postal</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors"
                        placeholder="00000"
                        data-testid="input-postal"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">País</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors"
                      data-testid="input-country"
                    >
                      <option value="ES">España</option>
                      <option value="PT">Portugal</option>
                      <option value="FR">Francia</option>
                      <option value="DE">Alemania</option>
                      <option value="IT">Italia</option>
                      <option value="NL">Países Bajos</option>
                      <option value="BE">Bélgica</option>
                      <option value="AT">Austria</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    data-testid="submit-preorder"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Reserva Ahora - {formData.paymentType === 'full' ? '149€' : '10€'}
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-500 mt-4">
                    Pago 100% seguro con Stripe. Tus datos están protegidos.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 bg-gray-900 border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="p-6">
                <Globe className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Envío Seguro</h4>
                <p className="text-sm text-gray-400">A toda Europa con seguimiento</p>
              </div>
              <div className="p-6">
                <Shield className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Garantía 12 Meses</h4>
                <p className="text-sm text-gray-400">Cobertura total del fabricante</p>
              </div>
              <div className="p-6">
                <CreditCard className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Pago Seguro</h4>
                <p className="text-sm text-gray-400">Stripe + HTTPS cifrado</p>
              </div>
              <div className="p-6">
                <Clock className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Cancelación Flexible</h4>
                <p className="text-sm text-gray-400">Devolución sin preguntas en 14 días</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Mini Section */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4 max-w-3xl">
            <h3 className="text-2xl font-bold text-center mb-8">Preguntas Frecuentes</h3>
            <div className="space-y-4">
              {[
                { q: '¿Cuándo recibiré mi SENTINEL X?', a: 'La entrega estimada es de 90-120 días desde la fecha de reserva. Te mantendremos informado del estado de tu pedido.' },
                { q: '¿Puedo cancelar mi reserva?', a: 'Sí, puedes cancelar tu reserva en cualquier momento antes del envío y recibir un reembolso completo.' },
                { q: '¿Funciona sin móvil?', a: 'Sí, SENTINEL X tiene conectividad 4G LTE independiente. Puede enviar alertas y grabar audio sin necesidad de un smartphone.' },
                { q: '¿Qué pasa si pago solo la señal de 10€?', a: 'Tu reserva queda confirmada. Te contactaremos antes del envío para completar el pago de los 139€ restantes.' }
              ].map((faq, index) => (
                <details key={index} className="group bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <summary className="flex items-center justify-between p-4 cursor-pointer font-medium hover:text-cyan-400 transition-colors">
                    {faq.q}
                    <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="px-4 pb-4 text-gray-400">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
};

export default SentinelXLanding;
