/**
 * ManoProtect - Landing Page SEO: Reloj GPS para Mayores
 * Optimizada para keywords: reloj gps mayores, localizador gps ancianos
 */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Shield, MapPin, Navigation, Smartphone, Clock, CheckCircle, 
  Star, ArrowRight, PhoneCall, Users, Eye, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingFooter from '@/components/landing/LandingFooter';

const RelojGPSMayores = () => {
  
  useEffect(() => {
    if (window.ManoProtectAnalytics) {
      window.ManoProtectAnalytics.trackEvent('view_landing_seo', {
        landing_type: 'reloj-gps-mayores',
        target_audience: 'seniors-gps'
      });
    }
  }, []);

  const schemaProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Reloj GPS para Mayores ManoProtect",
    "description": "Reloj con localizador GPS para personas mayores. Seguimiento en tiempo real, historial de ubicaciones y alertas de zona segura.",
    "brand": {"@type": "Brand", "name": "ManoProtect"},
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "29.99",
      "highPrice": "199.99",
      "priceCurrency": "EUR"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Reloj GPS para Mayores | Localizador Ancianos | ManoProtect 2026</title>
        <meta name="description" content="Reloj con GPS para personas mayores. Localiza a tus familiares en tiempo real, historial de rutas, zonas seguras y alertas automáticas. Desde 29,99€. Envío gratis España." />
        <meta name="keywords" content="reloj gps mayores, localizador gps ancianos, reloj localizador personas mayores, gps para mayores, smartwatch gps senior, reloj rastreador ancianos" />
        <link rel="canonical" href="https://manoprotectt.com/reloj-gps-mayores" />
        
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
          <Link to="/sentinel-x">
            <Button className="bg-[#4CAF50] hover:bg-[#45a049]">Ver Sentinel X</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <MapPin className="w-4 h-4" />
                Localización GPS en tiempo real
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                <span className="text-blue-600">Reloj GPS</span> para Localizar a tus Mayores
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                Sabe siempre dónde están tus familiares mayores. Localización GPS precisa, 
                historial de rutas, zonas seguras y <strong>alertas automáticas si salen del área definida</strong>.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Link to="/sentinel-x">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                    Ver Reloj con GPS
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  GPS multi-banda
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Precisión 3 metros
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Sin smartphone
                </span>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/450nzm76_Reloj%20y%20m%C3%B3vil%20seguros.png"
                alt="Reloj GPS para mayores con app de localización"
                className="rounded-2xl shadow-2xl"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features GPS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Funciones GPS del Reloj ManoProtect
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Localización en Vivo</h3>
              <p className="text-gray-600 text-sm">Ve la ubicación exacta de tu familiar en cualquier momento</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Historial de Rutas</h3>
              <p className="text-gray-600 text-sm">Consulta por dónde ha pasado en los últimos 30 días</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Zonas Seguras</h3>
              <p className="text-gray-600 text-sm">Define áreas seguras (casa, parque) y recibe alertas si sale</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Alertas Automáticas</h3>
              <p className="text-gray-600 text-sm">Notificaciones si sale de zona segura o batería baja</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ¿Cómo Funciona el GPS del Reloj?
          </h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Tu familiar lleva el reloj</h3>
                <p className="text-gray-600">El reloj Sentinel X es cómodo, ligero y resistente al agua. Se puede llevar todo el día sin molestias.</p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">El GPS envía la ubicación</h3>
                <p className="text-gray-600">El reloj usa GPS multi-banda + WiFi + torres móviles para una localización precisa incluso en interiores.</p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Tú ves todo en tu móvil</h3>
                <p className="text-gray-600">Desde la app ManoProtect puedes ver la ubicación en tiempo real, el historial de rutas y configurar zonas seguras.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Localiza a tus mayores con tranquilidad
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            El reloj Sentinel X incluye GPS ilimitado sin coste adicional
          </p>
          <Link to="/sentinel-x">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8">
              Ver Reloj GPS Sentinel X
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default RelojGPSMayores;
