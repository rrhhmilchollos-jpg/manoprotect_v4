import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Shield, Lock, Mic, MapPin, Zap, Check, Clock, Globe, CreditCard, ChevronRight, Star, Users, AlertTriangle, Gift, Truck, RefreshCw, ArrowRight } from 'lucide-react';
import LandingHeader from '../components/landing/LandingHeader';
import LandingFooter from '../components/landing/LandingFooter';
import Testimonials from '../components/cro/Testimonials';
import ProductComparison from '../components/cro/ProductComparison';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SENTINEL_IMAGES = {
  hero: "https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png",
  withPhone: "https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/450nzm76_Reloj%20y%20m%C3%B3vil%20seguros.png",
  lifestyle: "https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/68kjir28_Reloj%20y%20m%C3%B3vil%20seguros.png"
};

const SENTINEL_J_IMG = "https://static.prod-images.emergentagent.com/jobs/d9b76ada-9994-4215-9ba1-31b4da8dc333/images/691c09d64cba84d0a069b7937e6f2e651449be714b394f349f7e64ace5198a3a.png";

const MAX_FREE = 50;

const SentinelXLanding = () => {
  const [selectedModel, setSelectedModel] = useState('fundadores');
  const [isLoading, setIsLoading] = useState(false);
  const [freeRemaining, setFreeRemaining] = useState(() => {
    const saved = sessionStorage.getItem('sentinel_free_units');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (parsed > 0 && parsed <= MAX_FREE) return parsed;
    }
    return Math.floor(Math.random() * 8) + 11; // 11-18 remaining
  });
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: '', postalCode: '', country: 'ES', selectedProduct: 'sentinel-x-fundadores'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setFreeRemaining(prev => {
        let n;
        if (prev <= 2) {
          n = Math.floor(Math.random() * 5) + 8;
        } else {
          n = Math.random() > 0.6 ? prev - 1 : prev;
        }
        sessionStorage.setItem('sentinel_free_units', n.toString());
        return n;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePreorder = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const productNames = {
        'sentinel-x-fundadores': 'SENTINEL X Edición Fundadores (Esfera Cuadrada)',
        'sentinel-x-premium': 'SENTINEL X Premium (Esfera Redonda)',
        'sentinel-j': 'SENTINEL J Junior'
      };
      const shippingCost = formData.selectedProduct === 'sentinel-j' ? 4.95 : 9.95;
      const response = await fetch(`${API_URL}/api/checkout/sentinel-x`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: shippingCost,
          product: `${productNames[formData.selectedProduct]} - GRATIS (Solo envío)`,
          paymentType: 'shipping_only'
        }),
      });
      const data = await response.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert('Error al procesar. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: <Lock className="w-8 h-8" />, title: "SOS Invisible", description: "Activación discreta sin alertas visibles. Nadie sabrá que has pedido ayuda." },
    { icon: <Shield className="w-8 h-8" />, title: "Modo PIN Falso", description: "Un PIN alternativo que simula desbloqueo normal mientras activa protocolos de emergencia." },
    { icon: <Mic className="w-8 h-8" />, title: "Grabación Segura en la Nube", description: "Grabaciones cifradas y almacenadas automáticamente en tiempo real." },
    { icon: <MapPin className="w-8 h-8" />, title: "Trayecto Seguro", description: "Comparte rutas con tus contactos y recibe alertas si algo falla en tu camino." },
    { icon: <Zap className="w-8 h-8" />, title: "Autonomía 5 Días", description: "Batería optimizada para tu día a día. Sin recargas constantes." }
  ];

  const specs = [
    { label: "Pantalla", value: 'AMOLED 1.78"' },
    { label: "Material", value: "Caja metálica negra mate / titanio" },
    { label: "Correas", value: "Intercambiables premium" },
    { label: "Batería", value: "5 días de autonomía" },
    { label: "Conectividad", value: "4G LTE independiente" },
    { label: "Resistencia", value: "IP68 + 5ATM" },
    { label: "GPS", value: "Multi-banda de alta precisión" },
    { label: "Sensores", value: "Ritmo cardíaco, SpO2, acelerómetro" }
  ];

  return (
    <>
      <Helmet>
        <title>SENTINEL X GRATIS - Solo Pagas Envío | Primeros 50 Relojes | ManoProtect</title>
        <meta name="description" content="Los primeros 50 SENTINEL X son GRATIS. Solo pagas gastos de envío. Reloj de seguridad con SOS invisible, GPS y grabación en la nube. 2 modelos: Fundadores (esfera cuadrada) y Premium (esfera redonda)." />
        <meta property="og:title" content="SENTINEL X GRATIS - Solo Pagas Envío | Primeros 50 Relojes" />
        <meta property="og:description" content="Los primeros 50 relojes de seguridad GRATIS. Botón SOS, GPS, grabación en la nube. Solo pagas envío." />
        <meta property="og:image" content={SENTINEL_IMAGES.hero} />
        <meta property="og:url" content="https://manoprotect.com/sentinel-x" />
        <link rel="canonical" href="https://manoprotect.com/sentinel-x" />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        <LandingHeader />

        {/* PROMO BANNER - Top */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 py-3 text-center relative overflow-hidden" data-testid="promo-banner-free">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
          <div className="relative z-10 flex items-center justify-center gap-3 flex-wrap px-4">
            <Gift className="w-5 h-5 text-white animate-bounce" />
            <span className="font-black text-white text-sm md:text-base tracking-wide">
              LOS PRIMEROS 50 RELOJES SON 100% GRATIS – SOLO PAGAS ENVÍO
            </span>
            <span className="bg-white text-green-700 text-xs font-black px-3 py-1 rounded-full animate-pulse">
              Quedan {freeRemaining} de {MAX_FREE}
            </span>
          </div>
        </div>

        {/* HERO */}
        <section className="relative min-h-screen flex items-center overflow-hidden pt-16" data-testid="hero-sentinel-x">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-500/30 rounded-full animate-pulse" />
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-green-400/40 rounded-full animate-ping" />
            <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cyan-600/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left order-2 lg:order-1">
                {/* FREE Badge */}
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500/20 border-2 border-green-400/60 rounded-full text-green-400 text-sm font-black mb-6 animate-pulse">
                  <Gift className="w-5 h-5" />
                  DISPOSITIVO 100% GRATIS – SOLO PAGAS ENVÍO
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  <span className="text-white">SENTINEL X</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    El reloj que actúa cuando tú no puedes
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-400 mb-4 max-w-xl mx-auto lg:mx-0">
                  Protección inteligente, elegante y urbana. Seguridad avanzada en tu muñeca.
                  <span className="block mt-2 text-cyan-400 font-medium">Funciona independiente del teléfono.</span>
                </p>

                {/* PRICE HIGHLIGHT */}
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-400/40 rounded-2xl p-5 mb-6 max-w-xl mx-auto lg:mx-0">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-4xl font-black text-green-400">0€</span>
                    <span className="text-2xl text-gray-500 line-through">249€</span>
                    <span className="bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full">100% GRATIS</span>
                  </div>
                  <p className="text-gray-400 text-sm">Solo pagas gastos de envío (9,95€). Oferta limitada a los primeros 50 compradores. Hasta 30 de Marzo 2026.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a
                    href="#reservar"
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25 text-lg"
                    data-testid="hero-cta-button"
                  >
                    Consigue el Tuyo GRATIS
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>

                {/* Urgency Counter */}
                <div className={`mt-6 p-4 rounded-xl border transition-all duration-500 ${
                  freeRemaining <= 5
                    ? 'bg-red-500/20 border-red-500/50 animate-pulse shadow-lg shadow-red-500/20'
                    : freeRemaining <= 15
                    ? 'bg-orange-500/15 border-orange-500/40'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`} data-testid="free-counter">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`flex items-center gap-2 ${freeRemaining <= 5 ? 'text-red-400' : freeRemaining <= 15 ? 'text-orange-400' : 'text-amber-400'}`}>
                      {freeRemaining <= 5 ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <Users className="w-5 h-5" />}
                      <span className="font-semibold text-sm">
                        {freeRemaining <= 5 ? 'ÚLTIMAS UNIDADES GRATIS' : freeRemaining <= 15 ? 'QUEDAN POCAS UNIDADES' : 'Unidades Gratis Disponibles'}
                      </span>
                    </div>
                    <span className={`text-2xl font-bold tabular-nums ${freeRemaining <= 5 ? 'text-red-400' : freeRemaining <= 15 ? 'text-orange-400' : 'text-white'}`}>
                      {freeRemaining}/{MAX_FREE}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        freeRemaining <= 5 ? 'bg-gradient-to-r from-red-500 to-orange-500' : freeRemaining <= 15 ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'
                      }`}
                      style={{ width: `${(freeRemaining / MAX_FREE) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-6 justify-center lg:justify-start text-sm text-gray-500">
                  <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-400" /><span>Garantía 12 meses</span></div>
                  <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-green-400" /><span>Envío a toda España</span></div>
                </div>
              </div>

              <div className="relative order-1 lg:order-2">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl rounded-full transform scale-75" />
                <img
                  src={SENTINEL_IMAGES.hero}
                  alt="ManoProtect SENTINEL X Smartwatch"
                  className="relative z-10 w-full max-w-lg mx-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                  data-testid="hero-product-image"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3 PRODUCTS SECTION */}
        <section className="py-20 bg-gradient-to-b from-black to-gray-900" id="modelos" data-testid="models-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-bold mb-4">
                <Gift className="w-4 h-4" />
                PROMOCIÓN LANZAMIENTO – PRIMEROS 50 GRATIS
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Elige tu Modelo</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Tres dispositivos de seguridad. Los primeros 50 de cada modelo son 100% GRATIS. Solo pagas los gastos de envío.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* MODEL 1: Sentinel X Fundadores - Square */}
              <div
                className={`relative rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                  selectedModel === 'fundadores' ? 'border-cyan-400 bg-gradient-to-b from-cyan-500/10 to-gray-900 shadow-xl shadow-cyan-500/10' : 'border-gray-700 bg-gray-900/50 hover:border-gray-500'
                }`}
                onClick={() => { setSelectedModel('fundadores'); setFormData({...formData, selectedProduct: 'sentinel-x-fundadores'}); }}
                data-testid="model-fundadores"
              >
                <div className="text-center mb-4">
                  <span className="inline-block bg-cyan-500/20 text-cyan-400 text-xs font-bold px-3 py-1 rounded-full mb-3">EDICIÓN FUNDADORES</span>
                  <img src={SENTINEL_IMAGES.hero} alt="Sentinel X Fundadores - Esfera Cuadrada" className="w-40 h-40 object-contain mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white">SENTINEL X</h3>
                  <p className="text-sm text-gray-400">Esfera Cuadrada</p>
                </div>

                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-black text-green-400">GRATIS</span>
                    <span className="text-lg text-gray-500 line-through">149€</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Solo envío: 9,95€</p>
                </div>

                <ul className="space-y-2 text-sm text-gray-300 mb-4">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 flex-shrink-0" /> Pantalla AMOLED 1.78" cuadrada</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 flex-shrink-0" /> SOS invisible + PIN falso</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 flex-shrink-0" /> GPS + 4G LTE independiente</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 flex-shrink-0" /> Grabación segura en la nube</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 flex-shrink-0" /> Caja metálica negra mate</li>
                </ul>

                <a href="#reservar" className="block w-full text-center py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
                  Pedir GRATIS
                </a>
              </div>

              {/* MODEL 2: Sentinel X Premium - Round */}
              <div
                className={`relative rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                  selectedModel === 'premium' ? 'border-amber-400 bg-gradient-to-b from-amber-500/10 to-gray-900 shadow-xl shadow-amber-500/10' : 'border-gray-700 bg-gray-900/50 hover:border-gray-500'
                }`}
                onClick={() => { setSelectedModel('premium'); setFormData({...formData, selectedProduct: 'sentinel-x-premium'}); }}
                data-testid="model-premium"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black px-4 py-1 rounded-full">
                  MÁS VENDIDO
                </div>

                <div className="text-center mb-4">
                  <span className="inline-block bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full mb-3">PREMIUM</span>
                  <img src={SENTINEL_IMAGES.withPhone} alt="Sentinel X Premium - Esfera Redonda" className="w-40 h-40 object-contain mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white">SENTINEL X</h3>
                  <p className="text-sm text-gray-400">Esfera Redonda – Titanio</p>
                </div>

                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-black text-green-400">GRATIS</span>
                    <span className="text-lg text-gray-500 line-through">199€</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Solo envío: 9,95€</p>
                </div>

                <ul className="space-y-2 text-sm text-gray-300 mb-4">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" /> Pantalla AMOLED 1.9" redonda</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" /> Todo del Fundadores +</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" /> Caja de titanio pulido</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" /> Cristal de zafiro antiarañazos</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" /> Correa de cuero genuino</li>
                </ul>

                <a href="#reservar" className="block w-full text-center py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
                  Pedir GRATIS
                </a>
              </div>

              {/* MODEL 3: Sentinel J Junior */}
              <div
                className={`relative rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                  selectedModel === 'junior' ? 'border-pink-400 bg-gradient-to-b from-pink-500/10 to-gray-900 shadow-xl shadow-pink-500/10' : 'border-gray-700 bg-gray-900/50 hover:border-gray-500'
                }`}
                onClick={() => { setSelectedModel('junior'); setFormData({...formData, selectedProduct: 'sentinel-j'}); }}
                data-testid="model-junior"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs font-black px-4 py-1 rounded-full">
                  NUEVO
                </div>

                <div className="text-center mb-4">
                  <span className="inline-block bg-pink-500/20 text-pink-400 text-xs font-bold px-3 py-1 rounded-full mb-3">PARA JÓVENES 6-14</span>
                  <img src={SENTINEL_J_IMG} alt="Sentinel J Junior - Correas intercambiables" className="w-40 h-40 object-contain mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white">SENTINEL J</h3>
                  <p className="text-sm text-gray-400">Correas intercambiables – 8 colores</p>
                </div>

                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-black text-green-400">GRATIS</span>
                    <span className="text-lg text-gray-500 line-through">99€</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Solo envío: 4,95€</p>
                </div>

                <ul className="space-y-2 text-sm text-gray-300 mb-4">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-pink-400 flex-shrink-0" /> Botón SOS grande y fácil</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-pink-400 flex-shrink-0" /> GPS tiempo real para padres</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-pink-400 flex-shrink-0" /> 8 correas de colores</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-pink-400 flex-shrink-0" /> Sin cámara ni internet</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-pink-400 flex-shrink-0" /> Solo 35g de peso</li>
                </ul>

                <Link to="/sentinel-j" className="block w-full text-center py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
                  Ver Detalles / Pedir GRATIS
                </Link>
              </div>
            </div>

            {/* Urgency bar under products */}
            <div className="mt-8 max-w-2xl mx-auto text-center">
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-sm text-gray-300">
                  <span className="text-red-400 font-bold">Atención:</span> esta promoción es irrepetible. Cuando se agoten las {MAX_FREE} unidades gratuitas, los precios volverán a ser de 149€-199€.
                  <span className="block mt-1 text-amber-400 font-medium">Quedan solo {freeRemaining} unidades gratis. Hasta 30 de Marzo 2026.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-black" id="caracteristicas">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">¿Por qué <span className="text-cyan-400">SENTINEL X</span>?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Tecnología wearable de última generación diseñada para protegerte en cualquier situación.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="group p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl hover:border-cyan-500/50 transition-all duration-300" data-testid={`feature-card-${index}`}>
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Design & Specs */}
        <section className="py-20 bg-gray-900" id="diseno">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <img src={SENTINEL_IMAGES.withPhone} alt="SENTINEL X con smartphone" className="rounded-2xl shadow-2xl shadow-cyan-500/10" />
              </div>
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">Diseño <span className="text-cyan-400">Premium</span></h2>
                <p className="text-gray-400 mb-8">Minimalista, elegante y urbano. El SENTINEL X combina materiales premium con un diseño que complementa cualquier estilo.</p>
                <div className="grid grid-cols-2 gap-4">
                  {specs.map((spec, index) => (
                    <div key={index} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
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

        <Testimonials />
        <ProductComparison />

        {/* ORDER FORM - FREE PROMO */}
        <section className="py-20 bg-black" id="reservar" data-testid="purchase-section">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500/20 border-2 border-green-400/50 rounded-full text-green-400 text-sm font-black mb-4 animate-pulse">
                  <Gift className="w-5 h-5" />
                  PROMOCIÓN LANZAMIENTO – RELOJ 100% GRATIS
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Consigue tu Reloj <span className="text-green-400">GRATIS</span>
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                  Solo pagas los gastos de envío. Oferta limitada a los primeros 50 compradores de cada modelo. Hasta 30 de Marzo 2026.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Product Selection Card */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-green-500/30 rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-6 text-center">Selecciona tu Modelo</h3>

                  <div className="space-y-3 mb-6">
                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.selectedProduct === 'sentinel-x-fundadores' ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`} data-testid="select-fundadores">
                      <input type="radio" name="selectedProduct" value="sentinel-x-fundadores" checked={formData.selectedProduct === 'sentinel-x-fundadores'} onChange={handleInputChange} className="w-4 h-4 text-cyan-500" />
                      <div className="flex-1">
                        <p className="font-bold text-white">SENTINEL X – Edición Fundadores</p>
                        <p className="text-xs text-gray-400">Esfera cuadrada · AMOLED 1.78" · Caja negra mate</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-black">GRATIS</p>
                        <p className="text-xs text-gray-500 line-through">149€</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.selectedProduct === 'sentinel-x-premium' ? 'border-amber-400 bg-amber-500/10' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`} data-testid="select-premium">
                      <input type="radio" name="selectedProduct" value="sentinel-x-premium" checked={formData.selectedProduct === 'sentinel-x-premium'} onChange={handleInputChange} className="w-4 h-4 text-amber-500" />
                      <div className="flex-1">
                        <p className="font-bold text-white">SENTINEL X – Premium <span className="text-xs text-amber-400">(MÁS VENDIDO)</span></p>
                        <p className="text-xs text-gray-400">Esfera redonda · AMOLED 1.9" · Titanio + cristal zafiro</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-black">GRATIS</p>
                        <p className="text-xs text-gray-500 line-through">199€</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.selectedProduct === 'sentinel-j' ? 'border-pink-400 bg-pink-500/10' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`} data-testid="select-junior">
                      <input type="radio" name="selectedProduct" value="sentinel-j" checked={formData.selectedProduct === 'sentinel-j'} onChange={handleInputChange} className="w-4 h-4 text-pink-500" />
                      <div className="flex-1">
                        <p className="font-bold text-white">SENTINEL J – Junior <span className="text-xs text-pink-400">(6-14 AÑOS)</span></p>
                        <p className="text-xs text-gray-400">8 correas de colores intercambiables · GPS</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-black">GRATIS</p>
                        <p className="text-xs text-gray-500 line-through">99€</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.selectedProduct === 'sentinel-s' ? 'border-[#B4A7D6] bg-[#B4A7D6]/10' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`} data-testid="select-sentinel-s">
                      <input type="radio" name="selectedProduct" value="sentinel-s" checked={formData.selectedProduct === 'sentinel-s'} onChange={handleInputChange} className="w-4 h-4 text-purple-400" />
                      <div className="flex-1">
                        <p className="font-bold text-white">SENTINEL S – Niños <span className="text-xs text-[#B4A7D6]">(3-12 AÑOS)</span></p>
                        <p className="text-xs text-gray-400">Cerámica + rose gold · Anti-retirada · Sirena 120dB</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-black">GRATIS</p>
                        <p className="text-xs text-gray-500 line-through">129€</p>
                      </div>
                    </label>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-800/80 rounded-xl p-5 border border-gray-700">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Resumen del Pedido</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-300">
                        <span>{formData.selectedProduct === 'sentinel-s' ? 'SENTINEL S Niños' : formData.selectedProduct === 'sentinel-j' ? 'SENTINEL J Junior' : formData.selectedProduct === 'sentinel-x-premium' ? 'SENTINEL X Premium' : 'SENTINEL X Fundadores'}</span>
                        <span className="text-green-400 font-bold">0,00€</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Gastos de envío</span>
                        <span>{(formData.selectedProduct === 'sentinel-j' || formData.selectedProduct === 'sentinel-s') ? '4,95€' : '9,95€'}</span>
                      </div>
                      <div className="border-t border-gray-600 pt-2 flex justify-between font-bold text-white">
                        <span>Total a pagar</span>
                        <span className="text-green-400 text-lg">{(formData.selectedProduct === 'sentinel-j' || formData.selectedProduct === 'sentinel-s') ? '4,95€' : '9,95€'}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">Ahorras hasta 199€ con esta promoción</p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 justify-center text-xs text-gray-500">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                    <span>4.9/5 (128 valoraciones)</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handlePreorder} className="space-y-4" data-testid="preorder-form">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nombre completo</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors" placeholder="Tu nombre" data-testid="input-name" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors" placeholder="tu@email.com" data-testid="input-email" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors" placeholder="+34 600 000 000" data-testid="input-phone" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Dirección de envío</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors" placeholder="Calle, número, piso..." data-testid="input-address" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Ciudad</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors" placeholder="Ciudad" data-testid="input-city" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Código Postal</label>
                      <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors" placeholder="00000" data-testid="input-postal" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">País</label>
                    <select name="country" value={formData.country} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors" data-testid="input-country">
                      <option value="ES">España</option>
                      <option value="PT">Portugal</option>
                      <option value="FR">Francia</option>
                      <option value="DE">Alemania</option>
                      <option value="IT">Italia</option>
                    </select>
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3" data-testid="submit-preorder">
                    {isLoading ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
                    ) : (
                      <><Gift className="w-5 h-5" /> Pedir GRATIS – Solo {(formData.selectedProduct === 'sentinel-j' || formData.selectedProduct === 'sentinel-s') ? '4,95€' : '9,95€'} de envío</>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Pago seguro</span>
                    <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> Stripe cifrado</span>
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 14 días devolución</span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="py-16 bg-gray-900 border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="p-6">
                <Truck className="w-10 h-10 text-green-400 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Envío Seguro</h4>
                <p className="text-sm text-gray-400">A toda España con seguimiento</p>
              </div>
              <div className="p-6">
                <Shield className="w-10 h-10 text-green-400 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Garantía 12 Meses</h4>
                <p className="text-sm text-gray-400">Cobertura total del fabricante</p>
              </div>
              <div className="p-6">
                <CreditCard className="w-10 h-10 text-green-400 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Pago 100% Seguro</h4>
                <p className="text-sm text-gray-400">Stripe + HTTPS cifrado</p>
              </div>
              <div className="p-6">
                <Clock className="w-10 h-10 text-green-400 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Devolución 14 Días</h4>
                <p className="text-sm text-gray-400">Sin preguntas, garantizado</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4 max-w-3xl">
            <h3 className="text-2xl font-bold text-center mb-8">Preguntas Frecuentes</h3>
            <div className="space-y-4">
              {[
                { q: '¿De verdad es gratis? ¿Cuál es el truco?', a: 'No hay truco. Los primeros 50 relojes de cada modelo son 100% GRATIS como promoción de lanzamiento para dar a conocer ManoProtect. Solo pagas los gastos de envío (4,95€-9,95€). Queremos que pruebes la tecnología y compartas tu experiencia.' },
                { q: '¿Cuántos modelos hay disponibles?', a: 'Tres modelos: SENTINEL X Edición Fundadores (esfera cuadrada, caja negra mate), SENTINEL X Premium (esfera redonda, titanio pulido con cristal de zafiro), y SENTINEL J Junior (para jóvenes de 6-14 años, con correas intercambiables en 8 colores).' },
                { q: '¿Cuándo recibiré mi reloj?', a: 'La entrega estimada es de 90-120 días desde la fecha de pedido. Te mantendremos informado del estado por email y WhatsApp.' },
                { q: '¿Puedo cancelar mi pedido?', a: 'Sí, puedes cancelar en cualquier momento antes del envío y recibir un reembolso completo de los gastos de envío.' },
                { q: '¿Funciona sin móvil?', a: 'Sí, SENTINEL X tiene conectividad 4G LTE independiente. Puede enviar alertas SOS, grabar audio y compartir ubicación sin necesidad de un smartphone.' },
                { q: '¿Qué diferencia hay entre la Edición Fundadores y la Premium?', a: 'La Edición Fundadores tiene esfera cuadrada con pantalla AMOLED 1.78" y caja de aluminio negro mate. La Premium tiene esfera redonda más grande (1.9"), caja de titanio pulido, cristal de zafiro antiarañazos y correa de cuero genuino. Ambas tienen las mismas funciones de seguridad.' }
              ].map((faq, index) => (
                <details key={index} className="group bg-gray-800/50 rounded-xl border border-gray-700/50" data-testid={`faq-item-${index}`}>
                  <summary className="flex items-center justify-between p-4 cursor-pointer font-medium hover:text-green-400 transition-colors">
                    {faq.q}
                    <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                  </summary>
                  <p className="px-4 pb-4 text-gray-400">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <LandingFooter />

        {/* Sticky CTA - Green FREE */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-950/95 to-black/95 backdrop-blur-lg border-t border-green-500/30 py-3 px-4 transform transition-transform duration-300" data-testid="sticky-cta">
          <div className="container mx-auto flex items-center justify-between gap-4 max-w-5xl">
            <div className="hidden sm:flex items-center gap-3">
              <Gift className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-white font-bold text-sm">SENTINEL X – 100% GRATIS</p>
                <p className="text-gray-400 text-xs">Solo pagas envío · Quedan {freeRemaining} unidades</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="text-right hidden sm:block">
                <span className="text-gray-500 line-through text-sm">249€</span>
                <span className="text-green-400 font-black text-xl ml-2">0€</span>
              </div>
              <a
                href="#reservar"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all text-sm"
                data-testid="sticky-cta-button"
              >
                <Gift className="w-4 h-4" />
                Pedir GRATIS
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SentinelXLanding;
