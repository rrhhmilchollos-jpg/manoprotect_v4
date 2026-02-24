/**
 * ManoProtect - Landing Page SEO: Reloj SOS para Ancianos
 * Optimizada para keywords: reloj sos ancianos, reloj emergencias mayores
 */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Shield, Phone, MapPin, Heart, Clock, CheckCircle, 
  Star, ArrowRight, PhoneCall, MessageCircle, Users,
  Wifi, Battery, Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingFooter from '@/components/landing/LandingFooter';

const RelojSOSAncianos = () => {
  
  useEffect(() => {
    // Track page view
    if (window.ManoProtectAnalytics) {
      window.ManoProtectAnalytics.trackEvent('view_landing_seo', {
        landing_type: 'reloj-sos-ancianos',
        target_audience: 'seniors'
      });
    }
  }, []);

  const schemaProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Reloj SOS para Ancianos ManoProtect",
    "description": "Reloj inteligente con botón de emergencia SOS para personas mayores. GPS en tiempo real, llamadas de emergencia y detección de caídas.",
    "brand": {"@type": "Brand", "name": "ManoProtect"},
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "29.99",
      "highPrice": "199.99",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1247"
    }
  };

  const schemaFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuál es el mejor reloj SOS para personas mayores?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El ManoProtect Sentinel X es el reloj SOS más completo para mayores, con GPS, llamadas de emergencia, detección de caídas automática y batería de 5 días. Funciona de forma independiente sin necesidad de smartphone."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo funciona el botón SOS en un reloj para ancianos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Al pulsar el botón SOS, el reloj envía automáticamente la ubicación GPS a los familiares designados, realiza una llamada de emergencia y activa una grabación de audio. Todo en menos de 3 segundos."
        }
      },
      {
        "@type": "Question",
        "name": "¿Necesita tarjeta SIM el reloj SOS?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El Sentinel X incluye una eSIM integrada con cobertura en toda España y Europa. No necesitas comprar ni configurar ninguna tarjeta SIM."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Reloj SOS para Ancianos | Botón Emergencia Mayores | ManoProtect 2026</title>
        <meta name="description" content="El mejor reloj SOS para ancianos en España. Botón de emergencia, GPS en tiempo real, detección de caídas y llamadas automáticas. Protege a tus mayores. Desde 29,99€" />
        <meta name="keywords" content="reloj sos ancianos, reloj emergencias mayores, reloj gps personas mayores, botón pánico ancianos, reloj con localizador para mayores, smartwatch ancianos, reloj llamadas emergencia" />
        <link rel="canonical" href="https://manoprotect.com/reloj-sos-ancianos" />
        
        <meta property="og:title" content="Reloj SOS para Ancianos | Protección 24/7 | ManoProtect" />
        <meta property="og:description" content="Reloj con botón de emergencia SOS para personas mayores. GPS, llamadas automáticas y detección de caídas. Desde 29,99€" />
        <meta property="og:url" content="https://manoprotect.com/reloj-sos-ancianos" />
        
        <script type="application/ld+json">{JSON.stringify(schemaProduct)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaFAQ)}</script>
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
          <div className="flex items-center gap-3">
            <a href="tel:601510950" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-[#4CAF50]">
              <PhoneCall className="w-4 h-4" />
              <span className="text-sm font-medium">601 510 950</span>
            </a>
            <Link to="/sentinel-x">
              <Button className="bg-[#4CAF50] hover:bg-[#45a049]" data-testid="header-cta-sentinel">
                Ver Sentinel X
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-green-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 fill-current" />
                +1.200 familias protegidas en España
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                El Mejor <span className="text-[#4CAF50]">Reloj SOS para Ancianos</span> con Botón de Emergencia
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                Protege a tus mayores con un reloj inteligente que envía alertas SOS, 
                comparte la ubicación GPS y realiza llamadas de emergencia automáticamente. 
                <strong>Sin smartphone necesario.</strong>
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Link to="/sentinel-x">
                  <Button size="lg" className="bg-[#4CAF50] hover:bg-[#45a049] text-lg px-8" data-testid="hero-cta-main">
                    Ver Reloj Sentinel X
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/dispositivo-sos">
                  <Button size="lg" variant="outline" className="text-lg px-8 border-2" data-testid="hero-cta-button">
                    Ver Botón SOS Simple
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Envío gratis
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  30 días de prueba
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Soporte 24/7
                </span>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png"
                alt="Reloj SOS para ancianos ManoProtect Sentinel X"
                className="rounded-2xl shadow-2xl"
                loading="eager"
              />
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Valoración</p>
                    <p className="font-bold text-gray-900">4.8/5 ★★★★★</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ¿Por qué elegir un Reloj SOS para tus Mayores?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Botón SOS de 1 Toque</h3>
              <p className="text-gray-600">
                Un solo toque envía alerta a familiares con ubicación exacta y realiza llamada de emergencia automática
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">GPS en Tiempo Real</h3>
              <p className="text-gray-600">
                Localiza a tu familiar en cualquier momento desde tu móvil. Historial de rutas y zonas seguras
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Detección de Caídas</h3>
              <p className="text-gray-600">
                Detecta caídas automáticamente y envía alerta si no hay respuesta en 30 segundos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Compara Nuestros Dispositivos SOS
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Elige la mejor opción según las necesidades de tu familiar
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Sentinel X */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-[#4CAF50]">
              <div className="text-center mb-6">
                <span className="bg-[#4CAF50] text-white text-xs font-bold px-3 py-1 rounded-full">MÁS VENDIDO</span>
                <h3 className="text-2xl font-bold text-gray-900 mt-4">Sentinel X</h3>
                <p className="text-gray-500">Reloj inteligente completo</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#4CAF50]">149€</span>
                  <span className="text-gray-500 ml-2 line-through">199€</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                {[
                  'Botón SOS con un toque',
                  'GPS multi-banda alta precisión',
                  'Llamadas bidireccionales',
                  'Detección automática de caídas',
                  'eSIM incluida (sin contratos)',
                  'Batería 5 días',
                  'Resistente al agua IP68',
                  'Pantalla AMOLED táctil'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link to="/sentinel-x">
                <Button className="w-full bg-[#4CAF50] hover:bg-[#45a049]" data-testid="compare-cta-sentinel">
                  Ver Sentinel X
                </Button>
              </Link>
            </div>
            
            {/* Botón SOS */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-6">
                <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">ECONÓMICO</span>
                <h3 className="text-2xl font-bold text-gray-900 mt-4">Botón SOS</h3>
                <p className="text-gray-500">Dispositivo simple de emergencia</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">29,99€</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                {[
                  'Botón SOS de emergencia',
                  'GPS básico',
                  'Alerta a familiares',
                  'Sin llamadas (solo alertas)',
                  'Requiere smartphone cerca',
                  'Batería 30 días',
                  'Resistente salpicaduras',
                  'Tamaño llavero compacto'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link to="/dispositivo-sos">
                <Button variant="outline" className="w-full" data-testid="compare-cta-button">
                  Ver Botón SOS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Preguntas Frecuentes sobre Relojes SOS para Ancianos
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                ¿Cuál es el mejor reloj SOS para personas mayores?
              </h3>
              <p className="text-gray-600">
                El ManoProtect Sentinel X es el reloj SOS más completo para mayores, con GPS, 
                llamadas de emergencia, detección de caídas automática y batería de 5 días. 
                Funciona de forma independiente sin necesidad de smartphone.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                ¿Cómo funciona el botón SOS en un reloj para ancianos?
              </h3>
              <p className="text-gray-600">
                Al pulsar el botón SOS, el reloj envía automáticamente la ubicación GPS 
                a los familiares designados, realiza una llamada de emergencia y activa 
                una grabación de audio. Todo en menos de 3 segundos.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                ¿Necesita tarjeta SIM el reloj SOS?
              </h3>
              <p className="text-gray-600">
                El Sentinel X incluye una eSIM integrada con cobertura en toda España y Europa. 
                No necesitas comprar ni configurar ninguna tarjeta SIM. El servicio tiene un 
                coste de 9,99€/mes que incluye datos, llamadas y GPS ilimitado.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                ¿Es fácil de usar para personas mayores?
              </h3>
              <p className="text-gray-600">
                Sí, el reloj está diseñado pensando en personas mayores. La pantalla es grande 
                y clara, el botón SOS es fácil de localizar, y no requiere configuración compleja. 
                Además, ofrecemos soporte telefónico gratuito para ayudar con la instalación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-[#4CAF50] to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Protege a tus mayores hoy mismo
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Más de 1.200 familias en España ya confían en ManoProtect
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/sentinel-x">
              <Button size="lg" className="bg-white text-[#4CAF50] hover:bg-gray-100 text-lg px-8" data-testid="final-cta-sentinel">
                Ver Sentinel X - 149€
              </Button>
            </Link>
            <a href="tel:601510950">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8" data-testid="final-cta-call">
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

export default RelojSOSAncianos;
