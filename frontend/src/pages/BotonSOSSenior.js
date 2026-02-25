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
        <title>Botón SOS Mayores | Teleasistencia sin Cuotas | ManoProtect</title>
        <meta name="description" content="Botón SOS físico para mayores, con detector de caídas, llamada inmediata y ubicación en tiempo real. Seguridad para ancianos desde 55 años. Envío gratuito." />
        <meta name="keywords" content="botón SOS para mayores, teleasistencia sin cuotas, alerta médica con botón físico, seguridad ancianos con botón SOS, botón pánico ancianos, detector caídas mayores" />
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

      {/* H2: Protección Completa para Mayores */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Protección Completa para Mayores
          </h2>
          <p className="text-lg text-gray-600">
            El botón SOS físico para mayores está diseñado para garantizar seguridad y asistencia inmediata. Detecta caídas automáticamente y envía alertas a tus contactos o servicios de emergencia sin complicaciones.
          </p>
        </div>
      </section>

      {/* H2: Funcionalidades Principales */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Funcionalidades Principales
          </h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { icon: <Zap className="w-7 h-7" />, title: "Botón SOS físico obligatorio", desc: "Un botón grande y fácil de pulsar. Sin pantallas, sin menús, sin complicaciones. Funciona con un solo toque.", color: "bg-red-100 text-red-600" },
              { icon: <AlertTriangle className="w-7 h-7" />, title: "Detector de caídas automático", desc: "Sensores de movimiento detectan caídas automáticamente y envían alertas sin necesidad de pulsar el botón.", color: "bg-amber-100 text-amber-600" },
              { icon: <PhoneCall className="w-7 h-7" />, title: "Llamada de emergencia inmediata", desc: "Llama automáticamente a familiares y contactos de emergencia. Sonido alto para facilitar la comunicación.", color: "bg-green-100 text-green-600" },
              { icon: <Heart className="w-7 h-7" />, title: "Ubicación en tiempo real", desc: "GPS integrado para que tus familiares sepan exactamente dónde estás en todo momento.", color: "bg-blue-100 text-blue-600" },
              { icon: <Volume2 className="w-7 h-7" />, title: "Pantalla grande y sonido alto", desc: "Diseñado para personas mayores: pantalla legible, sonido fuerte y botones grandes.", color: "bg-purple-100 text-purple-600" }
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${f.color}`}>{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-2">{f.title}</h3>
                <p className="text-gray-600 text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* H2: Ventajas de Nuestro Botón SOS para Mayores */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Ventajas de Nuestro Botón SOS para Mayores</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Respuesta rápida ante cualquier emergencia", desc: "Alerta inmediata a familiares y servicios de emergencia con ubicación GPS exacta." },
              { title: "Fácil de usar y accesible", desc: "Sin pantallas complejas ni menús. Un solo botón grande que cualquier persona mayor puede usar." },
              { title: "Teleasistencia sin cuotas ni contratos largos", desc: "Sin permanencia, sin letras pequeñas. Envío gratuito y 30 días de prueba." }
            ].map((v, i) => (
              <div key={i} className="bg-red-50 rounded-xl p-6 border border-red-100 text-center">
                <CheckCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-600 text-sm">{v.desc}</p>
              </div>
            ))}
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

      {/* FAQ */}
      <section className="py-16 bg-white" data-testid="faq-senior">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: "¿Cómo funciona el botón SOS para mayores?", a: "Basta con mantener pulsado el botón durante 3 segundos. El dispositivo envía automáticamente tu ubicación GPS a los familiares configurados y realiza una llamada de emergencia. Sin pantallas, sin menús, sin complicaciones." },
              { q: "¿Detecta caídas automáticamente?", a: "Sí. Los sensores de movimiento integrados detectan caídas automáticamente. Si el usuario no cancela la alerta en 30 segundos, se envía la emergencia a todos los contactos. Funciona incluso si la persona está inconsciente." },
              { q: "¿Quién recibe la llamada de emergencia?", a: "Los familiares y contactos que tú configures (hasta 5). Reciben notificación push, SMS con ubicación y llamada automática. También puedes incluir el número de emergencias 112." },
              { q: "¿Es fácil de usar y visible?", a: "Sí. Está diseñado específicamente para personas mayores: botón grande y visible, sonido alto, sin pantallas complicadas. Se puede llevar como colgante, pulsera o en el bolsillo." }
            ].map((faq, i) => (
              <details key={i} className="bg-gray-50 rounded-xl border border-gray-200 group">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-gray-900 hover:text-red-600 transition-colors">
                  {faq.q}
                  <ArrowRight className="w-4 h-4 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <p className="px-5 pb-5 text-gray-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Dale tranquilidad a tu familia
          </h2>
          <p className="text-xl text-red-100 mb-2">
            Oferta de lanzamiento hasta el 30 de Marzo
          </p>
          <p className="text-red-200 mb-8">Envío gratuito a toda España | Sin cuotas ni permanencia</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dispositivo-sos">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8" data-testid="cta-comprar-senior">
                Comprar Botón SOS Senior - 29,99€
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

      {/* Internal Links */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Otros productos de seguridad</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/sentinel-x-ninos" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow border border-gray-100">
              <p className="font-medium text-gray-900">Sentinel X para Niños</p>
              <p className="text-sm text-gray-500">Protección para 12-16 años</p>
            </Link>
            <Link to="/sentinel-x-adultos" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow border border-gray-100">
              <p className="font-medium text-gray-900">Sentinel X para Adultos</p>
              <p className="text-sm text-gray-500">Seguridad personal 17-55 años</p>
            </Link>
            <Link to="/boton-sos-valencia" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow border border-gray-100">
              <p className="font-medium text-gray-900">Botón SOS en Valencia</p>
              <p className="text-sm text-gray-500">Entrega y soporte local</p>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default BotonSOSSenior;
