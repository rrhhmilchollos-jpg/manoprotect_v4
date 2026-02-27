import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Shield, Lock, Mic, MapPin, Zap, Check, X, Clock, CreditCard, ChevronRight, Star, Users, AlertTriangle, Gift, Truck, Bluetooth, Wifi, ArrowRight, Smartphone } from 'lucide-react';
import LandingHeader from '../components/landing/LandingHeader';
import LandingFooter from '../components/landing/LandingFooter';
import Testimonials from '../components/cro/Testimonials';
import ProductComparison from '../components/cro/ProductComparison';
import SubscriptionPlanModal from '../components/SubscriptionPlanModal';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SENTINEL_IMAGES = {
  hero: "https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png",
  withPhone: "https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/450nzm76_Reloj%20y%20m%C3%B3vil%20seguros.png",
  lifestyle: "https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/68kjir28_Reloj%20y%20m%C3%B3vil%20seguros.png"
};
const SENTINEL_J_IMG = "https://static.prod-images.emergentagent.com/jobs/d9b76ada-9994-4215-9ba1-31b4da8dc333/images/691c09d64cba84d0a069b7937e6f2e651449be714b394f349f7e64ace5198a3a.png";
const SENTINEL_S_IMG = "https://static.prod-images.emergentagent.com/jobs/70b9cc4e-5cf4-48c1-b710-585bbf769faa/images/e4d94aa4babe28ec14a789ee54b85cfc6b5cafb807d95c003d7a26f35491fa3d.png";

const MAX_FREE = 50;

const SentinelXLanding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [freeRemaining, setFreeRemaining] = useState(() => {
    const saved = sessionStorage.getItem('sentinel_free_units');
    if (saved) { const p = parseInt(saved, 10); if (p > 0 && p <= MAX_FREE) return p; }
    return Math.floor(Math.random() * 8) + 11;
  });
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: '', postalCode: '', country: 'ES', selectedProduct: 'sentinel-x-basic'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setFreeRemaining(prev => {
        let n;
        if (prev <= 2) n = Math.floor(Math.random() * 5) + 8;
        else n = Math.random() > 0.6 ? prev - 1 : prev;
        sessionStorage.setItem('sentinel_free_units', n.toString());
        return n;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePreorder = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const products = {
        'sentinel-x-basic': { name: 'SENTINEL X Basic (Bluetooth)', amount: 9.95 },
        'sentinel-x-fundadores': { name: 'SENTINEL X Fundadores (4G)', amount: 149 },
        'sentinel-x-premium': { name: 'SENTINEL X Premium (4G Titanio)', amount: 199 },
        'sentinel-j': { name: 'SENTINEL J Junior', amount: 4.95 },
        'sentinel-s': { name: 'SENTINEL S Niños', amount: 4.95 }
      };
      const product = products[formData.selectedProduct] || products['sentinel-x-basic'];
      const response = await fetch(`${API_URL}/api/checkout/sentinel-x`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, amount: product.amount, product: product.name, paymentType: formData.selectedProduct === 'sentinel-x-basic' ? 'shipping_only' : 'full_payment' }),
      });
      const data = await response.json();
      if (data.checkout_url) window.location.href = data.checkout_url;
      else alert('Error al procesar. Inténtalo de nuevo.');
    } catch { alert('Error de conexión. Inténtalo de nuevo.'); }
    finally { setIsLoading(false); }
  };

  const isBasic = formData.selectedProduct === 'sentinel-x-basic';
  const isJunior = formData.selectedProduct === 'sentinel-j' || formData.selectedProduct === 'sentinel-s';
  const getPrice = () => {
    const p = { 'sentinel-x-basic': '9,95€', 'sentinel-x-fundadores': '149€', 'sentinel-x-premium': '199€', 'sentinel-j': '4,95€', 'sentinel-s': '4,95€' };
    return p[formData.selectedProduct] || '9,95€';
  };
  const getPriceLabel = () => {
    if (isBasic || isJunior) return 'envío';
    return 'total';
  };

  return (
    <>
      <Helmet>
        <title>SENTINEL X GRATIS – Solo Pagas Envío | Reloj SOS con GPS | ManoProtect</title>
        <meta name="description" content="Sentinel X Basic GRATIS: reloj SOS con GPS, grabación en la nube y SOS invisible vía Bluetooth. Versiones Premium con 4G independiente desde 149€. Primeros 50 Basic gratis, solo pagas envío." />
        <meta property="og:title" content="SENTINEL X GRATIS – Solo Pagas Envío | ManoProtect" />
        <meta property="og:description" content="Reloj de seguridad con SOS invisible y GPS. Versión Basic GRATIS (Bluetooth). Premium con 4G desde 149€." />
        <meta property="og:image" content={SENTINEL_IMAGES.hero} />
        <link rel="canonical" href="https://manoprotect.com/sentinel-x" />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        <LandingHeader />

        {/* PROMO BANNER */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 py-3 text-center relative overflow-hidden" data-testid="promo-banner-free">
          <div className="relative z-10 flex items-center justify-center gap-3 flex-wrap px-4">
            <Gift className="w-5 h-5 text-white animate-bounce" />
            <span className="font-black text-white text-sm md:text-base tracking-wide">
              SENTINEL X BASIC 100% GRATIS – SOLO PAGAS ENVÍO 9,95€
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

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500/20 border-2 border-green-400/60 rounded-full text-green-400 text-sm font-black mb-6 animate-pulse">
                  <Gift className="w-5 h-5" />
                  DISPOSITIVO 100% GRATIS – SOLO PAGAS ENVÍO
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  <span className="text-white">SENTINEL X</span><br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">El reloj que actúa cuando tú no puedes</span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-400 mb-4 max-w-xl mx-auto lg:mx-0">
                  SOS invisible, grabación en la nube y trayecto seguro.
                  <span className="block mt-2 text-cyan-400 font-medium">Versión Basic: funciona vía Bluetooth con tu móvil.</span>
                </p>

                {/* PRICE */}
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-400/40 rounded-2xl p-5 mb-6 max-w-xl mx-auto lg:mx-0">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-4xl font-black text-green-400">0€</span>
                    <span className="text-2xl text-gray-500 line-through">249€</span>
                    <span className="bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full">100% GRATIS</span>
                  </div>
                  <p className="text-gray-400 text-sm">Solo gastos de envío 9,95€ · Hasta 30 Marzo 2026</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="#reservar" className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25 text-lg" data-testid="hero-cta-button">
                    Pedir GRATIS <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>

                <div className="flex items-center gap-6 mt-6 justify-center lg:justify-start text-sm text-gray-500">
                  <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-400" />Garantía 12 meses</span>
                  <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-green-400" />Envío Europa</span>
                  <span className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-green-400" />Devolución fácil</span>
                </div>
              </div>

              <div className="relative order-1 lg:order-2">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl rounded-full transform scale-75" />
                <img src={SENTINEL_IMAGES.hero} alt="SENTINEL X Smartwatch" className="relative z-10 w-full max-w-lg mx-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-500" data-testid="hero-product-image" />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            MODELS SECTION — Basic FREE vs Fundadores vs Premium
            ===================================================== */}
        <section className="py-20 bg-gradient-to-b from-black to-gray-900" id="modelos" data-testid="models-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Elige tu Sentinel X</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Empieza <span className="text-green-400 font-bold">GRATIS</span> con la versión Basic (Bluetooth) o pasa directamente a la versión 4G independiente.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">

              {/* ===== BASIC — FREE (Bluetooth) ===== */}
              <div className="relative rounded-2xl p-6 border-2 border-green-400 bg-gradient-to-b from-green-500/10 to-gray-900 shadow-xl shadow-green-500/10" data-testid="model-basic">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-black px-4 py-1 rounded-full">
                  GRATIS – EMPIEZA AQUÍ
                </div>

                <div className="text-center mb-4 mt-2">
                  <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    <Bluetooth className="w-3.5 h-3.5" /> VERSIÓN BLUETOOTH
                  </span>
                  <img src={SENTINEL_IMAGES.hero} alt="Sentinel X Basic - Bluetooth" className="w-36 h-36 object-contain mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white">SENTINEL X Basic</h3>
                  <p className="text-sm text-gray-400">Funciona conectado al móvil</p>
                </div>

                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-black text-green-400">GRATIS</span>
                    <span className="text-lg text-gray-500 line-through">79€</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Solo envío: 9,95€</p>
                </div>

                <ul className="space-y-2 text-sm text-gray-300 mb-4">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 flex-shrink-0" /> Botón SOS de emergencia</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 flex-shrink-0" /> GPS vía Bluetooth + móvil</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 flex-shrink-0" /> Alertas a contactos</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 flex-shrink-0" /> Pantalla IPS 1.6"</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 flex-shrink-0" /> 5 días de batería</li>
                  <li className="flex items-center gap-2 text-gray-500"><X className="w-4 h-4 text-gray-600 flex-shrink-0" /> <span className="line-through">Sin 4G – necesita el móvil cerca</span></li>
                  <li className="flex items-center gap-2 text-gray-500"><X className="w-4 h-4 text-gray-600 flex-shrink-0" /> <span className="line-through">Sin grabación en la nube</span></li>
                  <li className="flex items-center gap-2 text-gray-500"><X className="w-4 h-4 text-gray-600 flex-shrink-0" /> <span className="line-through">Sin SOS invisible</span></li>
                </ul>

                <a href="#reservar" className="block w-full text-center py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm">
                  Pedir GRATIS – Solo 9,95€ envío
                </a>
                <p className="text-[10px] text-gray-500 text-center mt-2">Quedan {freeRemaining} de {MAX_FREE} unidades gratis</p>
              </div>

              {/* ===== FUNDADORES — 149€ (4G Square) ===== */}
              <div className="relative rounded-2xl p-6 border-2 border-cyan-400 bg-gradient-to-b from-cyan-500/10 to-gray-900 shadow-xl shadow-cyan-500/10" data-testid="model-fundadores">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black px-4 py-1 rounded-full">
                  RECOMENDADO
                </div>

                <div className="text-center mb-4 mt-2">
                  <span className="inline-flex items-center gap-1.5 bg-cyan-500/20 text-cyan-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    <Wifi className="w-3.5 h-3.5" /> 4G LTE INDEPENDIENTE
                  </span>
                  <img src={SENTINEL_IMAGES.hero} alt="Sentinel X Fundadores - 4G" className="w-36 h-36 object-contain mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white">SENTINEL X Fundadores</h3>
                  <p className="text-sm text-gray-400">Esfera Cuadrada · Funciona SIN móvil</p>
                </div>

                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-black text-white">149€</span>
                    <span className="text-lg text-gray-500 line-through">249€</span>
                  </div>
                  <p className="text-xs text-cyan-400 mt-1">Ahorra 100€ · Envío GRATIS</p>
                </div>

                <ul className="space-y-2 text-sm text-gray-300 mb-4">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 flex-shrink-0" /> Todo del Basic +</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 flex-shrink-0" /> <strong className="text-white">4G LTE – funciona SIN móvil</strong></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 flex-shrink-0" /> SOS invisible + PIN falso</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 flex-shrink-0" /> Grabación segura en la nube</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 flex-shrink-0" /> Pantalla AMOLED 1.78"</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 flex-shrink-0" /> Trayecto seguro con alertas</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 flex-shrink-0" /> Caja metálica negra mate</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 flex-shrink-0" /> GPS multi-banda</li>
                </ul>

                <a href="#reservar" className="block w-full text-center py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm">
                  Comprar por 149€ – Envío GRATIS
                </a>
              </div>

              {/* ===== PREMIUM — 199€ (4G Round Titanium) ===== */}
              <div className="relative rounded-2xl p-6 border-2 border-amber-400 bg-gradient-to-b from-amber-500/10 to-gray-900 shadow-xl shadow-amber-500/10" data-testid="model-premium">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black px-4 py-1 rounded-full">
                  ÉLITE
                </div>

                <div className="text-center mb-4 mt-2">
                  <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    <Wifi className="w-3.5 h-3.5" /> 4G LTE + TITANIO + ZAFIRO
                  </span>
                  <img src={SENTINEL_IMAGES.withPhone} alt="Sentinel X Premium - Titanio" className="w-36 h-36 object-contain mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white">SENTINEL X Premium</h3>
                  <p className="text-sm text-gray-400">Esfera Redonda · Titanio · Funciona SIN móvil</p>
                </div>

                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-black text-white">199€</span>
                    <span className="text-lg text-gray-500 line-through">349€</span>
                  </div>
                  <p className="text-xs text-amber-400 mt-1">Ahorra 150€ · Envío GRATIS</p>
                </div>

                <ul className="space-y-2 text-sm text-gray-300 mb-4">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" /> Todo del Fundadores +</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" /> <strong className="text-white">Caja de titanio pulido</strong></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" /> Cristal de zafiro antiarañazos</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" /> Pantalla AMOLED 1.9" redonda</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" /> Correa de cuero genuino</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" /> Monitor cardíaco + SpO2</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" /> Detección de caídas IA</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" /> Resistencia 5ATM</li>
                </ul>

                <a href="#reservar" className="block w-full text-center py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm">
                  Comprar por 199€ – Envío GRATIS
                </a>
              </div>
            </div>

            {/* COMPARISON TABLE Basic vs Premium */}
            <div className="max-w-4xl mx-auto mt-12">
              <h3 className="text-xl font-bold text-center mb-6 text-gray-300">¿Basic o Premium? La diferencia clave:</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-500/5 border border-green-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Bluetooth className="w-6 h-6 text-green-400" />
                    <div>
                      <h4 className="font-bold text-white">Basic (Bluetooth)</h4>
                      <p className="text-xs text-green-400">GRATIS – Solo 9,95€ envío</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                    <Smartphone className="w-8 h-8 text-gray-400" />
                    <ArrowRight className="w-4 h-4 text-green-400" />
                    <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center"><Bluetooth className="w-4 h-4 text-green-400" /></div>
                    <ArrowRight className="w-4 h-4 text-green-400" />
                    <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-xs">SOS</div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">El reloj envía SOS a través de tu móvil vía Bluetooth. Si el móvil no está cerca, no funciona.</p>
                </div>

                <div className="bg-cyan-500/5 border border-cyan-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Wifi className="w-6 h-6 text-cyan-400" />
                    <div>
                      <h4 className="font-bold text-white">Fundadores / Premium (4G)</h4>
                      <p className="text-xs text-cyan-400">Desde 149€ · Envío GRATIS</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                    <div className="w-8 h-8 bg-cyan-500/20 rounded flex items-center justify-center"><Wifi className="w-4 h-4 text-cyan-400" /></div>
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                    <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-xs">4G</div>
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                    <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-xs">SOS</div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">El reloj envía SOS directamente por 4G. <strong className="text-white">Funciona SIN móvil, con pantalla apagada y bloqueado.</strong></p>
                </div>
              </div>
            </div>

            {/* Urgency */}
            <div className="mt-8 max-w-2xl mx-auto text-center">
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-sm text-gray-300">
                  <span className="text-red-400 font-bold">Oferta limitada:</span> Quedan <strong className="text-white">{freeRemaining}</strong> Sentinel X Basic gratuitos. Hasta 30 de Marzo 2026.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-black" id="caracteristicas">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">¿Por qué <span className="text-cyan-400">SENTINEL X</span>?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">5 funciones premium que pueden salvar tu vida.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <Lock className="w-8 h-8" />, title: "SOS Invisible", desc: "Activación discreta sin alertas visibles. Nadie sabrá que has pedido ayuda.", badge: "4G" },
                { icon: <Shield className="w-8 h-8" />, title: "Modo PIN Falso", desc: "Un PIN alternativo que simula desbloqueo normal mientras activa protocolos de emergencia.", badge: "4G" },
                { icon: <Mic className="w-8 h-8" />, title: "Grabación Segura en la Nube", desc: "Grabaciones cifradas y almacenadas automáticamente en tiempo real.", badge: "4G" },
                { icon: <MapPin className="w-8 h-8" />, title: "Trayecto Seguro", desc: "Comparte rutas con tus contactos y recibe alertas si algo falla en tu camino.", badge: null },
                { icon: <Zap className="w-8 h-8" />, title: "Autonomía 5 Días", desc: "Batería optimizada para tu día a día. Sin recargas constantes.", badge: null }
              ].map((f, i) => (
                <div key={i} className="group p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl hover:border-cyan-500/50 transition-all duration-300" data-testid={`feature-card-${i}`}>
                  {f.badge && <span className="inline-block text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-bold mb-3">Solo versión {f.badge}</span>}
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{f.title}</h3>
                  <p className="text-gray-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NIÑOS: Sentinel J & S */}
        <section className="py-16 bg-gray-900 border-y border-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Para Niños y Jóvenes</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Link to="/sentinel-j" className="group flex items-center gap-5 p-5 bg-gray-800/50 border border-gray-700 rounded-2xl hover:border-pink-500/50 transition-all">
                <img src={SENTINEL_J_IMG} alt="Sentinel J" className="w-20 h-20 object-contain" />
                <div>
                  <p className="font-bold text-white group-hover:text-pink-400 transition-colors">SENTINEL J – Jóvenes 6-14</p>
                  <p className="text-sm text-gray-400">8 correas intercambiables · GPS · Botón SOS</p>
                  <p className="text-sm text-green-400 font-bold mt-1">GRATIS – Solo 4,95€ envío</p>
                </div>
              </Link>
              <Link to="/sentinel-s" className="group flex items-center gap-5 p-5 bg-gray-800/50 border border-gray-700 rounded-2xl hover:border-[#B4A7D6]/50 transition-all">
                <img src={SENTINEL_S_IMG} alt="Sentinel S" className="w-20 h-20 object-contain" />
                <div>
                  <p className="font-bold text-white group-hover:text-[#B4A7D6] transition-colors">SENTINEL S – Niños 3-12</p>
                  <p className="text-sm text-gray-400">Cerámica + rose gold · Anti-retirada · Sirena 120dB</p>
                  <p className="text-sm text-green-400 font-bold mt-1">GRATIS – Solo 4,95€ envío</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <Testimonials />
        <ProductComparison />

        {/* ORDER FORM */}
        <section className="py-20 bg-black" id="reservar" data-testid="purchase-section">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Haz tu Pedido</h2>
                <p className="text-gray-400">Sentinel X Basic GRATIS (solo envío) o elige la versión 4G premium.</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Product Selection */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">Selecciona tu Modelo</h3>
                  <div className="space-y-2 mb-6">
                    {[
                      { id: 'sentinel-x-basic', label: 'SENTINEL X Basic', sub: 'Bluetooth · Necesita móvil · IPS 1.6"', price: 'GRATIS', old: '79€', accent: 'green', tag: 'GRATIS' },
                      { id: 'sentinel-x-fundadores', label: 'SENTINEL X Fundadores', sub: '4G LTE · Funciona SIN móvil · AMOLED 1.78"', price: '149€', old: '249€', accent: 'cyan', tag: '4G' },
                      { id: 'sentinel-x-premium', label: 'SENTINEL X Premium', sub: '4G LTE · Titanio + Zafiro · AMOLED 1.9"', price: '199€', old: '349€', accent: 'amber', tag: 'ÉLITE' },
                      { id: 'sentinel-j', label: 'SENTINEL J Junior', sub: 'Jóvenes 6-14 · 8 correas colores · GPS', price: 'GRATIS', old: '99€', accent: 'pink', tag: 'NIÑOS' },
                      { id: 'sentinel-s', label: 'SENTINEL S Niños', sub: 'Niños 3-12 · Cerámica · Anti-retirada', price: 'GRATIS', old: '129€', accent: 'purple', tag: 'NIÑOS' }
                    ].map((p) => (
                      <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.selectedProduct === p.id ? `border-${p.accent}-400 bg-${p.accent}-500/10` : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`} data-testid={`select-${p.id}`}>
                        <input type="radio" name="selectedProduct" value={p.id} checked={formData.selectedProduct === p.id} onChange={handleInputChange} className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white text-sm truncate">{p.label}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${p.tag === 'GRATIS' ? 'bg-green-500/20 text-green-400' : p.tag === '4G' ? 'bg-cyan-500/20 text-cyan-400' : p.tag === 'ÉLITE' ? 'bg-amber-500/20 text-amber-400' : 'bg-pink-500/20 text-pink-400'}`}>{p.tag}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 truncate">{p.sub}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`font-black text-sm ${p.price === 'GRATIS' ? 'text-green-400' : 'text-white'}`}>{p.price}</p>
                          <p className="text-[10px] text-gray-500 line-through">{p.old}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-300">
                        <span>Dispositivo</span>
                        <span className={isBasic || isJunior ? 'text-green-400 font-bold' : 'text-white font-bold'}>
                          {isBasic || isJunior ? '0,00€' : formData.selectedProduct === 'sentinel-x-premium' ? '199,00€' : '149,00€'}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Envío</span>
                        <span>{isBasic ? '9,95€' : isJunior ? '4,95€' : <span className="text-green-400">GRATIS</span>}</span>
                      </div>
                      <div className="border-t border-gray-600 pt-2 flex justify-between font-bold text-white">
                        <span>Total</span>
                        <span className="text-lg">{getPrice()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handlePreorder} className="space-y-3" data-testid="preorder-form">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nombre completo</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none" placeholder="Tu nombre" data-testid="input-name" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none" placeholder="tu@email.com" data-testid="input-email" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Teléfono</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none" placeholder="+34 600 000 000" data-testid="input-phone" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Dirección de envío</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none" placeholder="Calle, número, piso..." data-testid="input-address" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Ciudad</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none" placeholder="Ciudad" data-testid="input-city" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">C. Postal</label>
                      <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none" placeholder="00000" data-testid="input-postal" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">País</label>
                    <select name="country" value={formData.country} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none" data-testid="input-country">
                      <option value="ES">España</option><option value="PT">Portugal</option><option value="FR">Francia</option><option value="DE">Alemania</option><option value="IT">Italia</option>
                    </select>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center justify-center gap-3" data-testid="submit-preorder">
                    {isLoading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</> : <><Gift className="w-5 h-5" /> {isBasic || isJunior ? `Pedir GRATIS – Solo ${getPrice()} ${getPriceLabel()}` : `Comprar por ${getPrice()} – Envío GRATIS`}</>}
                  </button>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Pago seguro</span>
                    <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> Stripe cifrado</span>
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 14 días devolución</span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4 max-w-3xl">
            <h3 className="text-2xl font-bold text-center mb-8">Preguntas Frecuentes</h3>
            <div className="space-y-4">
              {[
                { q: '¿Cuál es la diferencia entre Basic y Fundadores/Premium?', a: 'El Basic funciona vía Bluetooth conectado a tu móvil — si el móvil no está cerca, no funciona. Las versiones Fundadores y Premium tienen 4G LTE: funcionan de forma independiente SIN móvil. Además incluyen SOS invisible, PIN falso y grabación en la nube que el Basic no tiene.' },
                { q: '¿De verdad el Basic es gratis?', a: 'Sí. Los primeros 50 Sentinel X Basic son 100% gratis como promoción de lanzamiento. Solo pagas 9,95€ de gastos de envío. Queremos que pruebes la tecnología. Si necesitas la versión 4G, puedes hacer upgrade después.' },
                { q: '¿Puedo hacer upgrade de Basic a 4G?', a: 'Sí. Si empiezas con el Basic y decides que necesitas la versión 4G independiente, puedes adquirir el Fundadores o Premium con un descuento especial de upgrade.' },
                { q: '¿El Basic funciona sin el móvil?', a: 'No. El Basic necesita estar conectado a tu móvil vía Bluetooth para enviar alertas SOS y compartir GPS. Si quieres que funcione sin móvil (con pantalla apagada, teléfono bloqueado), necesitas la versión 4G (Fundadores o Premium).' },
                { q: '¿Cuándo recibiré mi reloj?', a: 'Entrega estimada: 90-120 días. Te informaremos del estado por email y WhatsApp.' },
                { q: '¿Qué diferencia hay entre Fundadores y Premium?', a: 'Fundadores: esfera cuadrada, pantalla AMOLED 1.78", caja negra mate, 149€. Premium: esfera redonda más grande (1.9"), caja de titanio pulido, cristal de zafiro, correa de cuero genuino, monitor cardíaco, detección de caídas IA, 199€. Ambos tienen 4G independiente.' }
              ].map((faq, i) => (
                <details key={i} className="group bg-gray-800/50 rounded-xl border border-gray-700/50" data-testid={`faq-item-${i}`}>
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

        {/* Trust */}
        <section className="py-16 bg-black border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="p-6"><Truck className="w-10 h-10 text-green-400 mx-auto mb-4" /><h4 className="font-semibold mb-2">Envío Seguro</h4><p className="text-sm text-gray-400">A toda Europa con seguimiento</p></div>
              <div className="p-6"><Shield className="w-10 h-10 text-green-400 mx-auto mb-4" /><h4 className="font-semibold mb-2">Garantía 12 Meses</h4><p className="text-sm text-gray-400">Cobertura total del fabricante</p></div>
              <div className="p-6"><CreditCard className="w-10 h-10 text-green-400 mx-auto mb-4" /><h4 className="font-semibold mb-2">Pago 100% Seguro</h4><p className="text-sm text-gray-400">Stripe + HTTPS cifrado</p></div>
              <div className="p-6"><Clock className="w-10 h-10 text-green-400 mx-auto mb-4" /><h4 className="font-semibold mb-2">Devolución 14 Días</h4><p className="text-sm text-gray-400">Sin preguntas, garantizado</p></div>
            </div>
          </div>
        </section>

        <LandingFooter />

        {/* Sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-950/95 to-black/95 backdrop-blur-lg border-t border-green-500/30 py-3 px-4" data-testid="sticky-cta">
          <div className="container mx-auto flex items-center justify-between gap-4 max-w-5xl">
            <div className="hidden sm:flex items-center gap-3">
              <Gift className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-white font-bold text-sm">SENTINEL X Basic – GRATIS</p>
                <p className="text-gray-400 text-xs">Solo 9,95€ envío · Quedan {freeRemaining} unidades</p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <a href="#reservar" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all text-sm" data-testid="sticky-cta-button">
                <Gift className="w-4 h-4" /> Pedir Basic GRATIS
              </a>
              <a href="#modelos" className="hidden sm:inline-flex items-center gap-1 px-4 py-3 border border-cyan-500/50 text-cyan-400 font-medium rounded-xl hover:bg-cyan-500/10 transition-all text-xs">
                Ver versión 4G
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SentinelXLanding;
