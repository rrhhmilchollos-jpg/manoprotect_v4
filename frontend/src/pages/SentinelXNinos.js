/**
 * ManoProtect - Sentinel X para Niños y Adolescentes (12-16 años)
 * SEO: botón SOS para niños, seguridad hijos, localizador niños
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, MapPin, Phone, CheckCircle, Star, ArrowRight,
  Smartphone, Lock, Battery, Eye, Bell, Users, Zap, Droplets
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const SentinelXNinos = () => {
  const schemaProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Sentinel X para Niños y Adolescentes",
    "description": "Reloj inteligente con botón SOS físico para niños y adolescentes de 12 a 16 años. Localización GPS en tiempo real, llamadas de emergencia y control parental.",
    "brand": { "@type": "Brand", "name": "ManoProtect" },
    "category": "Seguridad infantil",
    "offers": {
      "@type": "Offer",
      "price": "149",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2026-03-30",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "EUR" },
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "ES" },
        "deliveryTime": { "@type": "ShippingDeliveryTime", "businessDays": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3 } }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 30
      }
    },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "342" }
  };

  const schemaFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿Cómo funciona el botón SOS de Sentinel X para niños?", "acceptedAnswer": { "@type": "Answer", "text": "Al pulsar el botón SOS físico durante 3 segundos, el Sentinel X envía automáticamente una alerta con la ubicación GPS exacta a los padres y hasta 5 contactos de emergencia. También inicia una llamada bidireccional para que los padres puedan hablar con su hijo al instante." } },
      { "@type": "Question", "name": "¿Puedo ver la ubicación de mi hijo en tiempo real?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. La app de ManoProtect permite consultar la ubicación GPS de tu hijo en tiempo real con una precisión de 2-5 metros. También puedes ver el historial de ubicaciones y configurar zonas seguras (geofencing) como el colegio o casa." } },
      { "@type": "Question", "name": "¿Es resistente al agua y golpes?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. El Sentinel X tiene certificación IP68 + 5ATM, lo que significa que es resistente a inmersiones de hasta 50 metros. Además, su carcasa de policarbonato soporta golpes del día a día escolar y deportivo." } },
      { "@type": "Question", "name": "¿Cuántos contactos pueden recibir la alerta SOS?", "acceptedAnswer": { "@type": "Answer", "text": "El botón SOS puede alertar hasta 5 contactos simultáneamente. Los padres reciben una notificación push, un SMS y una llamada automática. Los contactos secundarios reciben notificación push y SMS con la ubicación." } }
    ]
  };

  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://manoprotect.com" },
      { "@type": "ListItem", "position": 2, "name": "Sentinel X", "item": "https://manoprotect.com/sentinel-x" },
      { "@type": "ListItem", "position": 3, "name": "Sentinel X Niños", "item": "https://manoprotect.com/sentinel-x-ninos" }
    ]
  };

  const schemaReview = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Sentinel X Niños",
    "review": [
      { "@type": "Review", "author": { "@type": "Person", "name": "Laura M." }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "reviewBody": "Mi hija de 14 años lo lleva al instituto. Sé que si pasa algo, me llamará con un toque. La localización es muy precisa." },
      { "@type": "Review", "author": { "@type": "Person", "name": "Carlos P." }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "reviewBody": "Lo compré para mi hijo de 13 años que va solo al entreno de fútbol. Las zonas seguras me dan tranquilidad total." },
      { "@type": "Review", "author": { "@type": "Person", "name": "Ana R." }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "reviewBody": "Mi hijo de 15 años lo usa diariamente. La batería dura toda la semana y el diseño le encanta." }
    ]
  };

  const testimonials = [
    { name: "Laura M.", location: "Madrid", text: "Mi hija de 14 años lo lleva al instituto. Sé que si pasa algo, me llamará con un toque. La localización es muy precisa.", rating: 5 },
    { name: "Carlos P.", location: "Barcelona", text: "Lo compré para mi hijo de 13 años que va solo al entreno de fútbol. Las zonas seguras me dan tranquilidad total.", rating: 5 },
    { name: "Ana R.", location: "Valencia", text: "Mi hijo de 15 años lo usa diariamente. La batería dura toda la semana y el diseño le encanta. Es juvenil y discreto.", rating: 5 }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Compra Sentinel X Niños | Botón SOS Físico y GPS</title>
        <meta name="description" content="Sentinel X para niños y adolescentes, con botón SOS físico, localización en tiempo real y seguridad total para tus hijos. Compra ahora. Envío gratuito." />
        <meta name="keywords" content="botón SOS para niños, botón emergencia adolescentes, seguridad hijos con botón SOS, localizador niños con botón físico, reloj gps niños, sentinel x niños" />
        <link rel="canonical" href="https://manoprotect.com/sentinel-x-ninos" />
        <meta property="og:title" content="Sentinel X para Niños y Adolescentes | Botón SOS Físico" />
        <meta property="og:description" content="Protege a tus hijos con el botón SOS físico del Sentinel X. Localización GPS, llamadas y control parental. 149€ con envío gratuito." />
        <meta property="og:url" content="https://manoprotect.com/sentinel-x-ninos" />
        <meta property="og:type" content="product" />
        <script type="application/ld+json">{JSON.stringify(schemaProduct)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaFAQ)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaBreadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaReview)}</script>
      </Helmet>

      <LandingHeader />

      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500" data-testid="breadcrumb-ninos">
        <Link to="/" className="hover:text-[#4CAF50]">Inicio</Link>
        <span className="mx-2">/</span>
        <Link to="/sentinel-x" className="hover:text-[#4CAF50]">Sentinel X</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Niños y Adolescentes</span>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-emerald-50 to-purple-50 py-16 lg:py-24" data-testid="hero-ninos">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Oferta de lanzamiento hasta 30 de Marzo
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Sentinel X para Niños y Adolescentes – <span className="text-blue-600">Botón SOS Físico</span>
              </h1>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/sentinel-x">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-xl" data-testid="cta-comprar-ninos">
                    Comprar Sentinel X Niños
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Envío gratuito a toda España</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> 30 días de prueba</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Garantía 2 años</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl rounded-full transform scale-75" />
              <img
                src="https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png"
                alt="Sentinel X para niños y adolescentes - Reloj con botón SOS"
                className="relative z-10 w-full max-w-md mx-auto drop-shadow-2xl"
                loading="eager"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur rounded-full px-6 py-2 shadow-lg z-20">
                <span className="text-2xl font-bold text-blue-600">149€</span>
                <span className="text-gray-400 line-through ml-2">249€</span>
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Envío gratis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* H2: Seguridad y Tranquilidad para tus Hijos */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Seguridad y Tranquilidad para tus Hijos</h2>
          <p className="text-lg text-gray-600 mb-8">
            El Sentinel X ofrece a los padres la tranquilidad de saber que sus hijos están seguros en todo momento. Con un botón SOS físico y geolocalización en tiempo real, tu hijo puede enviar una alerta inmediata a tus contactos autorizados con solo presionar un botón.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "+2.000", label: "Familias protegidas" },
              { value: "4.9/5", label: "Valoración media" },
              { value: "2-5m", label: "Precisión GPS" },
              { value: "5 días", label: "Duración batería" }
            ].map((s, i) => (
              <div key={i} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-2xl font-bold text-blue-600">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* H2: Funcionalidades Principales */}
      <section className="py-16 bg-gray-50" data-testid="features-ninos">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Funcionalidades Principales</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Bell className="w-7 h-7" />, title: "Botón SOS físico de fácil acceso", desc: "Un botón grande y fácil de pulsar. Al mantenerlo 3 segundos, se activa el protocolo de emergencia: envío de ubicación GPS, alerta a padres y llamada bidireccional automática. No requiere desbloquear pantalla ni abrir apps." },
              { icon: <Phone className="w-7 h-7" />, title: "Llamada automática a padres o tutores", desc: "Tu hijo puede llamarte con un solo toque y tú puedes llamar al reloj directamente. Solo los números autorizados por los padres pueden contactar al dispositivo. Bloqueo de llamadas desconocidas." },
              { icon: <Eye className="w-7 h-7" />, title: "Historial de ubicaciones y seguimiento en tiempo real", desc: "Consulta dónde está tu hijo en cualquier momento. GPS multi-banda con precisión de 2-5 metros. Historial de rutas durante 30 días y alertas de zonas seguras." },
              { icon: <Shield className="w-7 h-7" />, title: "Diseño juvenil y resistente a golpes y agua", desc: "Certificación IP68 + 5ATM: resistente a inmersiones hasta 50 metros. Carcasa de policarbonato reforzado que soporta el uso diario escolar y deportivo. Disponible en colores juveniles." },
              { icon: <Lock className="w-7 h-7" />, title: "Control parental desde la app", desc: "Gestiona contactos permitidos, horarios de uso, zonas seguras, modo silencioso en clase y bloqueo de funciones. Todo sin que tu hijo pueda modificar la configuración." },
              { icon: <MapPin className="w-7 h-7" />, title: "Zonas seguras (Geofencing)", desc: "Configura perímetros virtuales en el colegio, casa de los abuelos o actividades extraescolares. Alerta instantánea si tu hijo sale de la zona definida." }
            ].map((f, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* H2: Por Qué Elegir Sentinel X para Niños */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Por Qué Elegir Sentinel X para Niños</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="w-8 h-8" />, title: "Seguridad inmediata ante emergencias", desc: "Un toque de 3 segundos activa el protocolo completo: ubicación GPS, alerta a padres y llamada automática. Sin complicaciones, sin demoras." },
              { icon: <Users className="w-8 h-8" />, title: "Independencia controlada para adolescentes", desc: "Tu hijo gana autonomía mientras tú mantienes el control total. Sabe que puede pedir ayuda al instante. Tú sabes dónde está en todo momento." },
              { icon: <Bell className="w-8 h-8" />, title: "Alertas automáticas en caso de accidente", desc: "El detector de caídas por IA envía una alerta automática si detecta un accidente. No depende de que tu hijo pueda pulsar el botón." }
            ].map((b, i) => (
              <div key={i} className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">{b.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-gray-600 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50" data-testid="testimonials-ninos">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Lo Que Dicen los Padres</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-700 mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">{t.name.charAt(0)}</div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white" data-testid="faq-ninos">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: "¿Cómo funciona el botón SOS de Sentinel X para niños?", a: "Al pulsar el botón SOS durante 3 segundos, se envía una alerta con ubicación GPS a los padres y hasta 5 contactos de emergencia. Se inicia una llamada bidireccional automática para que puedas hablar con tu hijo al instante. No necesita desbloquear pantalla ni abrir apps." },
              { q: "¿Puedo ver la ubicación de mi hijo en tiempo real?", a: "Sí. La app de ManoProtect muestra la ubicación GPS en tiempo real con precisión de 2-5 metros. Puedes configurar zonas seguras (colegio, casa, actividades) y recibir alertas si tu hijo sale de ellas. Incluye historial de ubicaciones de los últimos 30 días." },
              { q: "¿Es resistente al agua y golpes?", a: "Sí. Certificación IP68 + 5ATM: resistente a inmersiones hasta 50 metros. Carcasa de policarbonato reforzado que soporta el uso diario escolar y deportivo. Puede llevarlo a natación, bajo la lluvia y en actividades deportivas." },
              { q: "¿Cuántos contactos pueden recibir la alerta SOS?", a: "Hasta 5 contactos simultáneos. Los padres reciben notificación push, SMS y llamada automática. Los contactos secundarios reciben push y SMS con ubicación. Puedes configurar contactos diferentes para días de colegio y fines de semana." }
            ].map((faq, i) => (
              <details key={i} className="bg-gray-50 rounded-xl border border-gray-200 group">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  {faq.q}
                  <ArrowRight className="w-4 h-4 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <p className="px-5 pb-5 text-gray-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Protege a tus hijos ahora</h2>
          <p className="text-xl text-blue-100 mb-2">Oferta de lanzamiento hasta el 30 de Marzo</p>
          <p className="text-blue-200 mb-8">Envío gratuito a toda España | 30 días de prueba | Garantía 2 años</p>
          <Link to="/sentinel-x">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-10 py-6 rounded-xl font-bold" data-testid="cta-final-ninos">
              Comprar Sentinel X Niños – 149€
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Otros productos de seguridad</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/sentinel-x-adultos" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow border border-gray-100">
              <p className="font-medium text-gray-900">Sentinel X para Adultos</p>
              <p className="text-sm text-gray-500">Seguridad personal para 17-55 años</p>
            </Link>
            <Link to="/boton-sos-senior" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow border border-gray-100">
              <p className="font-medium text-gray-900">Botón SOS Senior</p>
              <p className="text-sm text-gray-500">Para mayores de 55 años</p>
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

export default SentinelXNinos;
