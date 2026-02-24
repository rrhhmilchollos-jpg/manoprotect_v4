/**
 * ManoProtect - Blog Article: Cómo funciona un reloj SOS
 * Artículo SEO optimizado para featured snippets
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, ArrowRight, Clock, User, Calendar, Share2, CheckCircle, Phone, MapPin, Bell, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingFooter from '@/components/landing/LandingFooter';

const ComoFuncionaRelojSOS = () => {
  const schemaArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Cómo Funciona un Reloj SOS para Mayores [Guía Completa 2026]",
    "description": "Explicación paso a paso de cómo funcionan los relojes con botón de emergencia para personas mayores. GPS, llamadas, detección de caídas y alertas.",
    "author": { "@type": "Organization", "name": "ManoProtect" },
    "publisher": { "@type": "Organization", "name": "ManoProtect", "logo": { "@type": "ImageObject", "url": "https://manoprotect.com/logo512.png" } },
    "datePublished": "2026-02-10",
    "dateModified": "2026-02-24",
    "mainEntityOfPage": "https://manoprotect.com/blog/como-funciona-reloj-sos"
  };

  const schemaHowTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Cómo configurar un reloj SOS para mayores",
    "step": [
      { "@type": "HowToStep", "name": "Cargar el reloj", "text": "Carga completamente el reloj SOS antes del primer uso. Esto suele tardar entre 1 y 2 horas." },
      { "@type": "HowToStep", "name": "Insertar la SIM o activar eSIM", "text": "Si el reloj requiere SIM física, insértala. Si tiene eSIM integrada como el Sentinel X, se activa automáticamente." },
      { "@type": "HowToStep", "name": "Configurar contactos de emergencia", "text": "Añade los números de familiares y el 112 como contactos de emergencia desde la app." },
      { "@type": "HowToStep", "name": "Colocar en la muñeca", "text": "Ajusta la correa cómodamente en la muñeca de tu familiar mayor." },
      { "@type": "HowToStep", "name": "Probar el botón SOS", "text": "Realiza una prueba del botón SOS para verificar que las alertas se envían correctamente." }
    ]
  };

  const steps = [
    { icon: <Bell className="w-8 h-8" />, title: "1. Activación del SOS", desc: "El usuario pulsa el botón de emergencia (o el reloj detecta una caída automáticamente). Se inicia el protocolo de alerta." },
    { icon: <MapPin className="w-8 h-8" />, title: "2. Localización GPS", desc: "El reloj obtiene la ubicación exacta mediante GPS, GLONASS y redes WiFi. Precisión de 2-5 metros dependiendo del modelo." },
    { icon: <Wifi className="w-8 h-8" />, title: "3. Envío de alertas", desc: "Se envían alertas simultáneas a todos los contactos de emergencia: SMS, llamada y notificación en la app con ubicación." },
    { icon: <Phone className="w-8 h-8" />, title: "4. Comunicación bidireccional", desc: "Los familiares pueden llamar al reloj directamente para hablar con la persona mayor y evaluar la situación." }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Cómo Funciona un Reloj SOS para Mayores [Guía Completa 2026]</title>
        <meta name="description" content="Aprende cómo funciona un reloj con botón SOS para ancianos. GPS, llamadas de emergencia, detección de caídas y alertas automáticas. Guía paso a paso." />
        <meta name="keywords" content="como funciona reloj sos, reloj emergencia mayores funcionamiento, boton sos ancianos, reloj gps mayores como funciona" />
        <link rel="canonical" href="https://manoprotect.com/blog/como-funciona-reloj-sos" />
        <script type="application/ld+json">{JSON.stringify(schemaArticle)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaHowTo)}</script>
      </Helmet>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-[#4CAF50] text-xl font-bold">ManoProtect</span>
          </Link>
          <Link to="/blog">
            <Button variant="outline">Ver más artículos</Button>
          </Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Actualizado: 24 Feb 2026</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />10 min lectura</span>
          <span className="flex items-center gap-1"><User className="w-4 h-4" />Equipo ManoProtect</span>
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Cómo Funciona un <span className="text-[#4CAF50]">Reloj SOS</span> para Mayores
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Guía completa sobre el funcionamiento de los relojes con botón de emergencia.
          Descubre cómo la tecnología GPS, las llamadas bidireccionales y la detección
          automática de caídas pueden salvar la vida de tus familiares mayores.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-10">
          <h2 className="font-bold text-lg text-gray-900 mb-2">Resumen rápido</h2>
          <p className="text-gray-700">
            Un reloj SOS es un dispositivo wearable con <strong>botón de emergencia, GPS y conectividad móvil</strong>.
            Cuando se activa (manual o automáticamente), envía la ubicación exacta y una alerta a los
            familiares y servicios de emergencia. Los modelos avanzados como el Sentinel X incluyen
            detección de caídas por IA y audio bidireccional.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Funcionamiento paso a paso
          </h2>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-14 h-14 bg-[#4CAF50]/10 rounded-xl flex items-center justify-center text-[#4CAF50] flex-shrink-0">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Tecnologías clave de un reloj SOS
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "GPS + GLONASS", desc: "Localización por satélite con precisión de 2-5 metros. Funciona en exteriores." },
              { title: "4G LTE / eSIM", desc: "Conexión móvil independiente del teléfono. Permite llamadas y datos sin smartphone." },
              { title: "Acelerómetro + Giroscopio", desc: "Sensores que detectan caídas y movimientos bruscos automáticamente." },
              { title: "Sensor cardíaco", desc: "Monitoriza el ritmo cardíaco 24/7. Alerta ante anomalías peligrosas." }
            ].map((tech, i) => (
              <div key={i} className="p-5 bg-white border border-gray-200 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-1">{tech.title}</h3>
                <p className="text-gray-600 text-sm">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Qué reloj SOS elegir?
          </h2>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Nuestra recomendación: ManoProtect Sentinel X
            </h3>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Detección de caídas con inteligencia artificial</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> eSIM incluida sin contratos mensuales extra</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Batería de 5 días de duración real</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Audio bidireccional para hablar con tu familiar</li>
            </ul>
            <Link to="/sentinel-x">
              <Button className="bg-[#4CAF50] hover:bg-[#45a049]">
                Ver Sentinel X - 149€ <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        <div className="border-t border-gray-200 pt-8 flex items-center justify-between">
          <p className="text-gray-500 text-sm">¿Te ha sido útil? Compártelo</p>
          <Button variant="outline" size="sm"><Share2 className="w-4 h-4 mr-2" />Compartir</Button>
        </div>
      </article>

      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Artículos relacionados</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link to="/blog/mejores-relojes-sos-2026" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
              <p className="font-medium text-gray-900">Los 5 mejores relojes SOS en 2026</p>
              <p className="text-sm text-gray-500">Ranking actualizado con análisis</p>
            </Link>
            <Link to="/blog/reloj-gps-sin-cuotas" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
              <p className="font-medium text-gray-900">Reloj GPS sin cuotas: la verdad</p>
              <p className="text-sm text-gray-500">Lo que no te cuentan las marcas</p>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default ComoFuncionaRelojSOS;
