/**
 * ManoProtect - Sentinel J: Reloj SOS para Niños y Juveniles
 * Nuevo producto diseñado específicamente para niños de 6 a 14 años
 * SEO optimizado
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, MapPin, Phone, CheckCircle, Star, ArrowRight,
  Lock, Bell, Users, Zap, Droplets, Palette, Smile, Eye, Battery
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const SENTINEL_J_IMG = "https://static.prod-images.emergentagent.com/jobs/d9b76ada-9994-4215-9ba1-31b4da8dc333/images/691c09d64cba84d0a069b7937e6f2e651449be714b394f349f7e64ace5198a3a.png";

const SentinelJ = () => {
  const schemaProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "ManoProtect Sentinel J - Reloj SOS para Niños",
    "description": "Reloj inteligente con botón SOS físico diseñado para niños de 6 a 14 años. Diseño colorido, GPS en tiempo real, llamadas a padres y zonas seguras.",
    "brand": { "@type": "Brand", "name": "ManoProtect" },
    "category": "Seguridad infantil",
    "image": SENTINEL_J_IMG,
    "offers": {
      "@type": "Offer",
      "price": "99",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/PreOrder",
      "priceValidUntil": "2026-03-30",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "EUR" },
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "ES" }
      }
    },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "128" }
  };

  const schemaFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿Qué diferencia hay entre el Sentinel J y el Sentinel X?", "acceptedAnswer": { "@type": "Answer", "text": "El Sentinel J está diseñado específicamente para niños de 6 a 14 años con un diseño colorido, más ligero y resistente a golpes. El Sentinel X es para adolescentes y adultos con un diseño más premium y funciones avanzadas como monitor cardíaco." } },
      { "@type": "Question", "name": "¿Es seguro para niños pequeños?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. El Sentinel J está fabricado con materiales hipoalergénicos, sin bordes afilados. La correa de silicona es suave y el dispositivo pesa solo 35g. Certificado CE y apto para menores." } },
      { "@type": "Question", "name": "¿Puede mi hijo hacer llamadas con el Sentinel J?", "acceptedAnswer": { "@type": "Answer", "text": "Sí, pero solo a los números autorizados por los padres (hasta 5 contactos). No puede recibir llamadas de números desconocidos. Los padres controlan todo desde la app." } },
      { "@type": "Question", "name": "¿Resiste el agua y los golpes del día a día?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. Certificación IP68: resistente a salpicaduras, lluvia y lavado de manos. Carcasa de policarbonato reforzado que resiste caídas y golpes del recreo." } },
      { "@type": "Question", "name": "¿Cuánto dura la batería?", "acceptedAnswer": { "@type": "Answer", "text": "4 días con uso normal. Carga magnética segura que tarda 90 minutos de 0 a 100%. Alerta de batería baja enviada a los padres cuando queda menos del 15%." } },
      { "@type": "Question", "name": "¿Tiene cámara o acceso a internet?", "acceptedAnswer": { "@type": "Answer", "text": "No. El Sentinel J NO tiene cámara ni navegador de internet. Está diseñado exclusivamente para seguridad: botón SOS, llamadas autorizadas, GPS y zonas seguras. Sin distracciones." } }
    ]
  };

  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://manoprotect.com" },
      { "@type": "ListItem", "position": 2, "name": "Sentinel J", "item": "https://manoprotect.com/sentinel-j" }
    ]
  };

  const colors = [
    { name: "Azul Aventura", hex: "#3B82F6", border: "border-blue-400" },
    { name: "Rosa Estrella", hex: "#EC4899", border: "border-pink-400" },
    { name: "Verde Bosque", hex: "#22C55E", border: "border-green-400" },
    { name: "Naranja Sol", hex: "#F97316", border: "border-orange-400" }
  ];

  const features = [
    { icon: <Bell className="w-7 h-7" />, title: "Botón SOS Grande y Fácil", desc: "Un botón rojo grande en el lateral, fácil de encontrar y pulsar. 3 segundos para activar la emergencia. Envía ubicación GPS y llama a papá y mamá automáticamente.", color: "bg-red-100 text-red-600" },
    { icon: <MapPin className="w-7 h-7" />, title: "GPS en Tiempo Real", desc: "Los padres ven la ubicación exacta de su hijo desde la app. Precisión de 3-5 metros. Funciona en el colegio, el parque, la calle y en interiores.", color: "bg-blue-100 text-blue-600" },
    { icon: <Phone className="w-7 h-7" />, title: "Llamadas Solo a Papá y Mamá", desc: "Tu hijo puede llamar a los 5 contactos que tú autorices con un solo toque. Las llamadas de números desconocidos se bloquean automáticamente.", color: "bg-green-100 text-green-600" },
    { icon: <Shield className="w-7 h-7" />, title: "Zonas Seguras Automáticas", desc: "Configura el colegio, casa, parque y casa de los abuelos como zonas seguras. Recibes una alerta si tu hijo entra o sale de cualquier zona.", color: "bg-purple-100 text-purple-600" },
    { icon: <Lock className="w-7 h-7" />, title: "Control Parental Total", desc: "Los niños no pueden desactivar la localización ni cambiar contactos. Modo silencioso automático en horario escolar. Todo se gestiona desde la app de los padres.", color: "bg-amber-100 text-amber-600" },
    { icon: <Palette className="w-7 h-7" />, title: "Diseño Divertido y Colorido", desc: "Disponible en 4 colores vibrantes. Correa de silicona suave e hipoalergénica. Solo 35 gramos de peso. A los niños les encanta llevarlo.", color: "bg-pink-100 text-pink-600" }
  ];

  const testimonials = [
    { name: "Sandra L.", location: "Madrid", text: "Mi hija de 8 años lo adora. Le encanta el color rosa y que puede llamarme con un toque. Yo estoy tranquila sabiendo dónde está siempre.", rating: 5 },
    { name: "Roberto M.", location: "Valencia", text: "Perfecto para mi hijo de 10 años que va solo al cole. Las zonas seguras me avisan cuando llega y cuando sale. No tiene cámara ni internet, que era lo que buscaba.", rating: 5 },
    { name: "Carmen G.", location: "Barcelona", text: "Lo compramos para nuestro hijo de 7 años. Es muy ligero, resistente al agua del grifo y la batería dura 4 días. El botón SOS nos da mucha tranquilidad.", rating: 5 },
    { name: "Javier A.", location: "Sevilla", text: "Mucho mejor que darle un móvil. Sin internet, sin cámara, sin distracciones. Solo seguridad. Y el diseño le encanta a mi hijo de 11 años.", rating: 5 }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Sentinel J | Reloj SOS para Niños 6-14 años | ManoProtect</title>
        <meta name="description" content="Sentinel J: reloj con botón SOS diseñado para niños de 6 a 14 años. GPS, llamadas a padres, zonas seguras y diseño colorido. Sin cámara ni internet. 99€ con envío gratuito." />
        <meta name="keywords" content="reloj SOS niños, reloj GPS niños, sentinel J, reloj seguridad infantil, smartwatch niños sin internet, reloj botón emergencia niños, localizador niños" />
        <link rel="canonical" href="https://manoprotect.com/sentinel-j" />
        <meta property="og:title" content="Sentinel J | Reloj SOS para Niños de 6 a 14 años" />
        <meta property="og:description" content="Diseñado para niños. Botón SOS, GPS, llamadas a padres y sin internet. 99€ envío gratuito." />
        <meta property="og:image" content={SENTINEL_J_IMG} />
        <meta property="og:url" content="https://manoprotect.com/sentinel-j" />
        <meta property="og:type" content="product" />
        <script type="application/ld+json">{JSON.stringify(schemaProduct)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaFAQ)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaBreadcrumb)}</script>
      </Helmet>

      <LandingHeader />

      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500" data-testid="breadcrumb-sentinel-j">
        <Link to="/" className="hover:text-[#4CAF50]">Inicio</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Sentinel J</span>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 lg:py-24" data-testid="hero-sentinel-j">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50" />
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-green-200/30 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
                <Smile className="w-4 h-4" />
                NUEVO: Diseñado para niños de 6 a 14 años
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Sentinel <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">J</span>
              </h1>
              <p className="text-2xl text-gray-700 font-medium mb-2">El reloj SOS que tus hijos quieren llevar</p>
              <p className="text-lg text-gray-500 mb-8">
                Botón SOS físico, GPS en tiempo real y llamadas solo a papá y mamá.
                Sin cámara, sin internet, sin distracciones. Solo seguridad.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link to="/sentinel-x">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-lg px-8 py-6 rounded-2xl shadow-lg" data-testid="cta-comprar-sentinel-j">
                    Reservar Sentinel J – 99€
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Envío gratuito</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> 30 días de prueba</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Sin cámara ni internet</span>
              </div>

              <p className="text-xs text-gray-400 mt-3">Oferta de lanzamiento hasta el 30 de Marzo</p>
            </div>

            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 blur-3xl rounded-full transform scale-90" />
              <img
                src={SENTINEL_J_IMG}
                alt="Sentinel J - Reloj SOS para niños diseñado por ManoProtect"
                className="relative z-10 w-full max-w-sm drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                loading="eager"
              />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-xl z-20 border border-blue-100">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">99€</span>
                  <span className="text-gray-400 line-through text-lg">159€</span>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">-38%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colors */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-lg font-bold text-gray-900 mb-6">Elige su color favorito</h2>
          <div className="flex justify-center gap-6">
            {colors.map((c, i) => (
              <div key={i} className="text-center group cursor-pointer">
                <div className={`w-14 h-14 rounded-full border-4 ${c.border} mx-auto mb-2 group-hover:scale-110 transition-transform shadow-md`} style={{ backgroundColor: c.hex }} />
                <p className="text-xs text-gray-500 font-medium">{c.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Sentinel J - Not a Phone */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">¿Por qué Sentinel J y no un móvil?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <h3 className="text-xl font-bold text-red-800 mb-4">Con un móvil</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-red-500 font-bold mt-0.5">✕</span> Acceso a internet y redes sociales</li>
                <li className="flex items-start gap-2"><span className="text-red-500 font-bold mt-0.5">✕</span> Cámara (riesgo de contenido inapropiado)</li>
                <li className="flex items-start gap-2"><span className="text-red-500 font-bold mt-0.5">✕</span> Se pierde o se olvida en la mochila</li>
                <li className="flex items-start gap-2"><span className="text-red-500 font-bold mt-0.5">✕</span> Distracción en clase</li>
                <li className="flex items-start gap-2"><span className="text-red-500 font-bold mt-0.5">✕</span> Batería dura pocas horas</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
              <h3 className="text-xl font-bold text-green-800 mb-4">Con Sentinel J</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> Sin internet ni redes sociales</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> Sin cámara: solo seguridad</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> Siempre en la muñeca, no se pierde</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> Modo silencioso automático en clase</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> 4 días de batería</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white" data-testid="features-sentinel-j">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Funcionalidades Principales</h2>
          <p className="text-gray-500 text-center mb-10">Diseñado por padres, para padres</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Especificaciones</h2>
          <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Pantalla", value: "1.4\" IPS táctil" },
              { label: "Resistencia", value: "IP68 (salpicaduras)" },
              { label: "Batería", value: "4 días" },
              { label: "Conectividad", value: "4G LTE" },
              { label: "GPS", value: "Alta precisión" },
              { label: "Material", value: "Silicona hipoalergénica" },
              { label: "Peso", value: "35g (ultraligero)" },
              { label: "Colores", value: "Azul, Rosa, Verde, Naranja" }
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-4 text-center border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className="font-bold text-gray-900 text-sm">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sentinel J vs Sentinel X */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Sentinel J vs Sentinel X</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-xl overflow-hidden border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left text-sm font-bold text-gray-900 border-b">Característica</th>
                  <th className="p-4 text-center text-sm font-bold text-blue-600 border-b">Sentinel J (6-14)</th>
                  <th className="p-4 text-center text-sm font-bold text-gray-600 border-b">Sentinel X (12-16)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ["Precio", "99€", "149€"],
                  ["Edad recomendada", "6-14 años", "12-16 años"],
                  ["Botón SOS físico", "Sí (grande, rojo)", "Sí (lateral)"],
                  ["GPS tiempo real", "Sí", "Sí"],
                  ["Llamadas", "5 contactos", "Ilimitados autorizados"],
                  ["Zonas seguras", "Hasta 10", "Ilimitadas"],
                  ["Cámara", "No", "No"],
                  ["Internet", "No", "No"],
                  ["Monitor cardíaco", "No", "Sí"],
                  ["Detector caídas IA", "No", "Sí"],
                  ["Pantalla", "1.4\" IPS", "1.78\" AMOLED"],
                  ["Batería", "4 días", "5 días"],
                  ["Peso", "35g", "48g"],
                  ["Diseño", "Colorido juvenil", "Premium minimalista"],
                  ["Envío", "Gratuito", "Gratuito"]
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-medium text-gray-900 border-b border-gray-100">{row[0]}</td>
                    <td className="p-3 text-center text-gray-700 border-b border-gray-100">{row[1]}</td>
                    <td className="p-3 text-center text-gray-700 border-b border-gray-100">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            El Sentinel J es ideal para niños pequeños (6-14). Para adolescentes que necesitan funciones avanzadas,
            recomendamos el <Link to="/sentinel-x-ninos" className="text-blue-600 hover:underline">Sentinel X Niños</Link>.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50" data-testid="testimonials-sentinel-j">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Lo Que Dicen los Padres</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-700 text-sm mb-4">"{t.text}"</p>
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
      <section className="py-16 bg-white" data-testid="faq-sentinel-j">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: "¿Qué diferencia hay entre el Sentinel J y el Sentinel X?", a: "El Sentinel J está diseñado para niños de 6 a 14 años: más colorido, más ligero (35g) y más asequible (99€). El Sentinel X es para adolescentes de 12-16 años con funciones avanzadas como monitor cardíaco y detección de caídas IA." },
              { q: "¿Es seguro para niños pequeños?", a: "Sí. Materiales hipoalergénicos, sin bordes afilados, correa de silicona suave. Pesa solo 35g. Certificado CE y apto para menores. Sin cámara ni acceso a internet." },
              { q: "¿Puede mi hijo hacer llamadas con el Sentinel J?", a: "Sí, pero solo a los 5 contactos que los padres autoricen. Las llamadas de números desconocidos se bloquean automáticamente. Control total desde la app de los padres." },
              { q: "¿Resiste el agua y los golpes?", a: "Sí. Certificación IP68: resistente a salpicaduras, lluvia y lavado de manos. Carcasa de policarbonato reforzado que resiste caídas y golpes del recreo y el deporte." },
              { q: "¿Cuánto dura la batería?", a: "4 días con uso normal. Carga magnética segura que tarda 90 minutos. Alerta automática a los padres cuando la batería baja del 15%." },
              { q: "¿Tiene cámara o acceso a internet?", a: "No. Sin cámara, sin navegador, sin redes sociales, sin juegos. Solo seguridad: botón SOS, llamadas autorizadas, GPS y zonas seguras." }
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
      <section className="py-16 bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Dale a tu hijo la seguridad que merece</h2>
          <p className="text-xl text-blue-100 mb-2">Sentinel J: diseñado para niños, pensado por padres</p>
          <p className="text-blue-200 mb-8">Envío gratuito | 30 días de prueba | Oferta hasta 30 de Marzo</p>
          <Link to="/sentinel-x">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-10 py-6 rounded-2xl font-bold shadow-xl" data-testid="cta-final-sentinel-j">
              Reservar Sentinel J – 99€
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
            <Link to="/sentinel-x-ninos" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow border border-gray-100">
              <p className="font-medium text-gray-900">Sentinel X para Adolescentes</p>
              <p className="text-sm text-gray-500">12-16 años | 149€</p>
            </Link>
            <Link to="/sentinel-x-adultos" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow border border-gray-100">
              <p className="font-medium text-gray-900">Sentinel X para Adultos</p>
              <p className="text-sm text-gray-500">17-55 años | 149€</p>
            </Link>
            <Link to="/boton-sos-senior" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow border border-gray-100">
              <p className="font-medium text-gray-900">Botón SOS Senior</p>
              <p className="text-sm text-gray-500">55+ años | 29,99€</p>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default SentinelJ;
