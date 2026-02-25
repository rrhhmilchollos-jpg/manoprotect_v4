/**
 * ManoProtect - Landing Page SEO: Botón SOS para Seniors
 * Optimizada para keywords: botón sos senior, botón pánico ancianos
 */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Shield, Phone, AlertTriangle, Heart, CheckCircle, 
  Star, ArrowRight, PhoneCall, Zap, Battery, Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingFooter from '@/components/landing/LandingFooter';

const BotonSOSSenior = () => {
  
  useEffect(() => {
    if (window.ManoProtectAnalytics) {
      window.ManoProtectAnalytics.trackEvent('view_landing_seo', {
        landing_type: 'boton-sos-senior',
        target_audience: 'seniors-simple'
      });
    }
  }, []);

  const schemaProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Botón SOS para Seniors ManoProtect",
    "description": "Botón de emergencia portátil para personas mayores. Un solo toque para pedir ayuda. GPS, alertas a familiares y fácil de usar.",
    "brand": {"@type": "Brand", "name": "ManoProtect"},
    "offers": {
      "@type": "Offer",
      "price": "29.99",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Botón SOS para Seniors | Emergencia Ancianos | ManoProtect 2026</title>
        <meta name="description" content="Botón de emergencia SOS para personas mayores. Un toque para pedir ayuda. Envía ubicación GPS y alerta a familiares. Solo 29,99€. Fácil de usar. Envío gratis." />
        <meta name="keywords" content="botón sos senior, botón pánico ancianos, botón emergencia mayores, pulsador sos ancianos, alarma personal mayores, botón ayuda tercera edad" />
        <link rel="canonical" href="https://manoprotect.com/boton-sos-senior" />
        
        <script type="application/ld+json">{JSON.stringify(schemaProduct)}</script>
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-[#4CAF50] text-xl font-bold">ManoProtect</span>
          </Link>
          <Link to="/dispositivo-sos">
            <Button className="bg-red-600 hover:bg-red-700">Ver Botón SOS</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-red-50 to-orange-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Oferta de lanzamiento hasta 30 de Marzo
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                <span className="text-red-600">Botón SOS Físico</span> para Mayores – Seguridad Senior
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                El dispositivo más simple y efectivo para que tus mayores puedan pedir ayuda 
                en cualquier momento. <strong>Sin complicaciones, sin configuraciones.</strong>
              </p>
              
              <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Precio especial</p>
                    <p className="text-4xl font-bold text-gray-900">29,99€</p>
                  </div>
                  <Link to="/dispositivo-sos">
                    <Button size="lg" className="bg-red-600 hover:bg-red-700 text-lg">
                      Comprar Ahora
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Envío gratis
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Fácil de usar
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  30 días batería
                </span>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
                  <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-6xl font-bold">SOS</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3">
                  <p className="text-xs text-gray-500">Tamaño real</p>
                  <p className="font-bold text-gray-900">5cm diámetro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Button SOS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            ¿Por qué un Botón SOS es Perfecto para Seniors?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Diseñado específicamente para personas mayores que necesitan una solución simple y efectiva
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Un Solo Botón</h3>
              <p className="text-gray-600">
                Sin pantallas, sin menús, sin complicaciones. Un botón grande y fácil de pulsar.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Battery className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">30 Días de Batería</h3>
              <p className="text-gray-600">
                Carga una vez al mes. No hay que preocuparse de quedarse sin batería.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Volume2 className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Alerta Sonora</h3>
              <p className="text-gray-600">
                Emite un sonido fuerte para alertar a personas cercanas además de enviar la alerta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-red-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Así de Fácil Funciona
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">1</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Pulsa el Botón</h3>
              <p className="text-gray-600">Mantén pulsado 3 segundos el botón SOS</p>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">2</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Se Envía la Alerta</h3>
              <p className="text-gray-600">Tus familiares reciben notificación con tu ubicación</p>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">3</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Llega la Ayuda</h3>
              <p className="text-gray-600">Tu familia sabe exactamente dónde estás</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison note */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Necesitas más funciones?
            </h3>
            <p className="text-gray-600 mb-6">
              Si buscas un dispositivo con llamadas bidireccionales, detección de caídas 
              y pantalla táctil, considera el <strong>Reloj Sentinel X</strong>.
            </p>
            <Link to="/sentinel-x">
              <Button variant="outline" className="border-2">
                Ver Reloj Sentinel X (149€)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Dale tranquilidad a tu familia
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Por solo 29,99€, tus mayores tendrán ayuda al alcance de un botón
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dispositivo-sos">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8">
                Comprar Botón SOS - 29,99€
              </Button>
            </Link>
            <a href="tel:601510950">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
                <PhoneCall className="w-5 h-5 mr-2" />
                Llamar: 601 510 950
              </Button>
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default BotonSOSSenior;
