/**
 * ManoProtect - Comparativa Relojes SOS Page
 * Página SEO para comparativa de relojes SOS en España 2026
 */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, Trophy, Star, CheckCircle, ArrowRight, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductComparison from '@/components/cro/ProductComparison';
import Testimonials from '@/components/cro/Testimonials';
import LandingFooter from '@/components/landing/LandingFooter';

const ComparativaRelojesSOS = () => {
  useEffect(() => {
    if (window.ManoProtectAnalytics) {
      window.ManoProtectAnalytics.trackEvent('view_landing_seo', {
        landing_type: 'comparativa-relojes-sos',
        target_audience: 'comparison-shoppers'
      });
    }
  }, []);

  const schemaPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Comparativa Mejores Relojes SOS para Mayores 2026 | España",
    "description": "Análisis y comparativa de los mejores relojes con botón SOS para personas mayores en España. Sentinel X vs SaveFamily vs Weenect.",
    "url": "https://manoprotect.com/comparativa-relojes-sos",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".speakable-content"]
    }
  };

  const schemaFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuál es el mejor reloj SOS para mayores en 2026?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El ManoProtect Sentinel X es considerado el mejor reloj SOS para mayores en 2026 gracias a su detección automática de caídas, GPS multi-banda, llamadas bidireccionales y eSIM incluida sin contratos. Cuesta 149€ con una cuota mensual de 9,99€ todo incluido."
        }
      },
      {
        "@type": "Question",
        "name": "¿Qué diferencia hay entre Sentinel X y otros relojes SOS?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sentinel X se diferencia por incluir detección de caídas con IA (única en su rango de precio), eSIM integrada sin necesidad de contratos adicionales, batería de 5 días reales y soporte técnico 24/7 en español. Otros competidores como SaveFamily o Weenect carecen de estas características."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta un reloj SOS para ancianos al mes?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El coste mensual varía: Sentinel X cobra 9,99€/mes todo incluido (datos, GPS, llamadas). SaveFamily cobra 12,99€/mes más el coste de una SIM aparte. Weenect cobra 7,90€/mes pero solo incluye funciones básicas sin llamadas."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Comparativa Mejores Relojes SOS para Mayores 2026 | España</title>
        <meta name="description" content="Análisis completo de los mejores relojes con botón SOS para ancianos. Comparamos Sentinel X vs SaveFamily vs Weenect: precios, funciones, GPS, batería y opiniones." />
        <meta name="keywords" content="comparativa relojes sos, mejor reloj sos mayores, sentinel x vs savefamily, reloj emergencias ancianos comparacion, reloj gps mayores cual comprar" />
        <link rel="canonical" href="https://manoprotect.com/comparativa-relojes-sos" />
        
        <meta property="og:title" content="Comparativa Mejores Relojes SOS para Mayores 2026" />
        <meta property="og:description" content="Análisis de los mejores relojes SOS: Sentinel X vs SaveFamily vs Weenect. Precios, funciones y opiniones." />
        <meta property="og:url" content="https://manoprotect.com/comparativa-relojes-sos" />
        
        <script type="application/ld+json">{JSON.stringify(schemaPage)}</script>
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
              <Button className="bg-[#4CAF50] hover:bg-[#45a049]">
                Ver Sentinel X
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Trophy className="w-4 h-4" />
            Actualizado Febrero 2026
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Comparativa: <span className="text-blue-600">Mejores Relojes SOS</span> para Mayores en España
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 speakable-content">
            Analizamos los principales relojes con botón de emergencia SOS del mercado español. 
            Comparamos precios, funciones, batería, GPS y cuotas mensuales para que elijas el mejor 
            para tus familiares mayores.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Análisis independiente
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Productos probados
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Precios actualizados
            </span>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-[#4CAF50] rounded-2xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#4CAF50] uppercase tracking-wide">Ganador 2026</span>
                <h2 className="text-2xl font-bold text-gray-900 mt-1 mb-3">ManoProtect Sentinel X</h2>
                <p className="text-gray-600 mb-4">
                  El único reloj SOS con <strong>detección automática de caídas por IA</strong>, 
                  <strong>eSIM integrada sin contratos</strong> y <strong>soporte 24/7 en español</strong>. 
                  Mejor relación calidad-precio del mercado.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">4.8/5</span>
                  </div>
                  <span className="text-2xl font-bold text-[#4CAF50]">149€</span>
                  <span className="text-gray-400 line-through">199€</span>
                  <Link to="/sentinel-x">
                    <Button className="bg-[#4CAF50] hover:bg-[#45a049]">
                      Ver Oferta
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <ProductComparison showCTA={true} />

      {/* Detailed Analysis */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Análisis Detallado por Producto
          </h2>
          
          {/* Sentinel X */}
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8 border-2 border-[#4CAF50]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#4CAF50] rounded-xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="bg-[#4CAF50] text-white text-xs font-bold px-2 py-1 rounded">MEJOR OPCIÓN</span>
                <h3 className="text-2xl font-bold text-gray-900">ManoProtect Sentinel X</h3>
                <p className="text-gray-500">149€ + 9,99€/mes</p>
              </div>
            </div>
            
            <div className="prose prose-gray max-w-none">
              <p>
                El <strong>Sentinel X</strong> es el reloj SOS más completo del mercado español. 
                Destaca especialmente por su <strong>detección automática de caídas con inteligencia artificial</strong>, 
                una función crucial para personas mayores que viven solas.
              </p>
              <h4>Puntos fuertes:</h4>
              <ul>
                <li>Detección de caídas automática (único en su rango de precio)</li>
                <li>eSIM integrada: no necesitas comprar SIM adicional</li>
                <li>Batería de 5 días probada en uso real</li>
                <li>GPS multi-banda de alta precisión (3 metros)</li>
                <li>Llamadas bidireccionales ilimitadas</li>
                <li>Soporte técnico 24/7 en español</li>
              </ul>
              <h4>Puntos a mejorar:</h4>
              <ul>
                <li>Precio inicial más alto que competidores básicos</li>
                <li>Requiere conexión 4G (no funciona sin cobertura)</li>
              </ul>
            </div>
            
            <div className="mt-6">
              <Link to="/sentinel-x">
                <Button className="bg-[#4CAF50] hover:bg-[#45a049]">
                  Ver Sentinel X Completo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* SaveFamily */}
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-500">SF</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">SaveFamily Senior</h3>
                <p className="text-gray-500">129€ + 12,99€/mes + SIM</p>
              </div>
            </div>
            
            <div className="prose prose-gray max-w-none">
              <p>
                <strong>SaveFamily</strong> es una opción conocida en España con buen servicio al cliente. 
                Sin embargo, carece de detección de caídas y requiere comprar una SIM aparte.
              </p>
              <h4>Puntos fuertes:</h4>
              <ul>
                <li>Marca conocida en España</li>
                <li>Interfaz sencilla</li>
                <li>GPS funcional</li>
              </ul>
              <h4>Puntos débiles:</h4>
              <ul>
                <li>Sin detección de caídas</li>
                <li>SIM no incluida (coste extra ~10€/mes)</li>
                <li>Batería de solo 2 días</li>
                <li>Sin monitor cardíaco</li>
              </ul>
            </div>
          </div>
          
          {/* Weenect */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-500">W</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Weenect Silver</h3>
                <p className="text-gray-500">79€ + 7,90€/mes</p>
              </div>
            </div>
            
            <div className="prose prose-gray max-w-none">
              <p>
                <strong>Weenect</strong> es la opción más económica, pero es más un localizador GPS 
                que un reloj SOS completo. No tiene pantalla ni permite llamadas.
              </p>
              <h4>Puntos fuertes:</h4>
              <ul>
                <li>Precio más bajo del mercado</li>
                <li>Batería larga (7 días)</li>
                <li>Tamaño compacto</li>
              </ul>
              <h4>Puntos débiles:</h4>
              <ul>
                <li>Sin pantalla (no es un reloj real)</li>
                <li>Sin llamadas de voz</li>
                <li>Sin detección de caídas</li>
                <li>Solo funciones básicas de GPS</li>
                <li>Soporte limitado (email 48h)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Preguntas Frecuentes sobre Relojes SOS
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                ¿Cuál es el mejor reloj SOS para mayores en 2026?
              </h3>
              <p className="text-gray-600">
                El ManoProtect Sentinel X es considerado el mejor reloj SOS para mayores en 2026 
                gracias a su detección automática de caídas, GPS multi-banda, llamadas bidireccionales 
                y eSIM incluida sin contratos. Cuesta 149€ con una cuota mensual de 9,99€ todo incluido.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                ¿Qué diferencia hay entre Sentinel X y otros relojes SOS?
              </h3>
              <p className="text-gray-600">
                Sentinel X se diferencia por incluir detección de caídas con IA (única en su rango de precio), 
                eSIM integrada sin necesidad de contratos adicionales, batería de 5 días reales y 
                soporte técnico 24/7 en español. Otros competidores como SaveFamily o Weenect 
                carecen de estas características.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                ¿Cuánto cuesta un reloj SOS para ancianos al mes?
              </h3>
              <p className="text-gray-600">
                El coste mensual varía: Sentinel X cobra 9,99€/mes todo incluido (datos, GPS, llamadas). 
                SaveFamily cobra 12,99€/mes más el coste de una SIM aparte (~10€). 
                Weenect cobra 7,90€/mes pero solo incluye funciones básicas sin llamadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials limit={4} />

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-[#4CAF50] to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            ¿Listo para proteger a tu familia?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            El Sentinel X es el reloj SOS más completo del mercado español
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/sentinel-x">
              <Button size="lg" className="bg-white text-[#4CAF50] hover:bg-gray-100 text-lg px-8">
                Comprar Sentinel X - 149€
              </Button>
            </Link>
            <a href="tel:601510950">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
                <PhoneCall className="w-5 h-5 mr-2" />
                601 510 950
              </Button>
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default ComparativaRelojesSOS;
