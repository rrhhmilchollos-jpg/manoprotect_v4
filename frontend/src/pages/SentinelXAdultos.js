/**
 * ManoProtect - Sentinel X para Adultos (17-55 años)
 * SEO: botón SOS personal, dispositivo emergencia adultos, seguridad personal
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, MapPin, Phone, CheckCircle, Star, ArrowRight,
  Briefcase, Dumbbell, Lock, Battery, Bell, Zap, Heart, Droplets
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const SentinelXAdultos = () => {
  const schemaProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Sentinel X para Adultos - Botón SOS Personal",
    "description": "Reloj inteligente con botón SOS físico para adultos. Llamadas automáticas, geolocalización inmediata y seguridad personal para trabajo y deporte.",
    "brand": { "@type": "Brand", "name": "ManoProtect" },
    "category": "Seguridad personal",
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
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "587" }
  };

  const schemaFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿Cómo funciona el botón SOS para adultos?", "acceptedAnswer": { "@type": "Answer", "text": "Al pulsar el botón SOS físico durante 3 segundos, el Sentinel X envía tu ubicación GPS exacta a hasta 3 contactos de emergencia y realiza una llamada automática. También puedes activar el SOS de forma discreta." } },
      { "@type": "Question", "name": "¿Se puede usar en deporte y trabajo?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. Certificación IP68 + 5ATM (resistente al agua hasta 50m), carcasa de titanio y batería de 5 días. Perfecto para running, ciclismo, senderismo, trabajo en campo o cualquier actividad." } },
      { "@type": "Question", "name": "¿Quién recibe la alerta cuando se pulsa el botón SOS?", "acceptedAnswer": { "@type": "Answer", "text": "Hasta 3 contactos que tú elijas. Reciben notificación push con ubicación exacta, SMS y llamada automática. Puedes configurar contactos diferentes para trabajo y personal." } },
      { "@type": "Question", "name": "¿Tiene resistencia al agua?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. IP68 + 5ATM: natación, surf, lluvia, duchas. Resiste polvo, arena, barro y temperaturas extremas (-20°C a 60°C)." } }
    ]
  };

  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://manoprotect.com" },
      { "@type": "ListItem", "position": 2, "name": "Sentinel X", "item": "https://manoprotect.com/sentinel-x" },
      { "@type": "ListItem", "position": 3, "name": "Sentinel X Adultos", "item": "https://manoprotect.com/sentinel-x-adultos" }
    ]
  };

  const schemaReview = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Sentinel X Adultos",
    "review": [
      { "@type": "Review", "author": { "@type": "Person", "name": "David S." }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "reviewBody": "Lo uso para running solo por la montaña. Mi mujer puede ver mi ruta en tiempo real y sé que si me caigo, el reloj pedirá ayuda automáticamente." },
      { "@type": "Review", "author": { "@type": "Person", "name": "Patricia G." }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "reviewBody": "Como comercial que viaja sola, me da una seguridad increíble. El modo SOS invisible es genial." },
      { "@type": "Review", "author": { "@type": "Person", "name": "Miguel A." }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "reviewBody": "Trabajo en obra y es obligatorio tener un dispositivo de emergencia. El Sentinel X cumple con PRL y es elegante." }
    ]
  };

  const testimonials = [
    { name: "David S.", location: "Madrid", text: "Lo uso para running solo por la montaña. Mi mujer puede ver mi ruta en tiempo real y sé que si me caigo, el reloj pedirá ayuda automáticamente. Tranquilidad total.", rating: 5 },
    { name: "Patricia G.", location: "Bilbao", text: "Como comercial que viaja sola, me da una seguridad increíble. El modo SOS invisible es genial. Lo recomiendo a todas mis compañeras.", rating: 5 },
    { name: "Miguel A.", location: "Sevilla", text: "Trabajo en obra y es obligatorio tener un dispositivo de emergencia. El Sentinel X cumple con PRL y es mucho más elegante que las alternativas industriales.", rating: 5 }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Sentinel X Adultos | Botón SOS de Emergencia Personal</title>
        <meta name="description" content="Sentinel X para adultos, con botón SOS físico, llamadas automáticas y geolocalización inmediata. Seguridad personal para tu vida diaria y deporte. Envío gratuito." />
        <meta name="keywords" content="botón SOS personal, dispositivo emergencia adultos, seguridad personal con botón físico, botón SOS trabajo y deporte, sentinel x adultos" />
        <link rel="canonical" href="https://manoprotect.com/sentinel-x-adultos" />
        <meta property="og:title" content="Sentinel X para Adultos | Botón SOS Personal" />
        <meta property="og:description" content="Seguridad personal con botón SOS físico. Llamadas automáticas, GPS y diseño discreto. 149€ envío gratuito." />
        <meta property="og:url" content="https://manoprotect.com/sentinel-x-adultos" />
        <meta property="og:type" content="product" />
        <script type="application/ld+json">{JSON.stringify(schemaProduct)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaFAQ)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaBreadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaReview)}</script>
      </Helmet>

      <LandingHeader />

      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500" data-testid="breadcrumb-adultos">
        <Link to="/" className="hover:text-[#4CAF50]">Inicio</Link>
        <span className="mx-2">/</span>
        <Link to="/sentinel-x" className="hover:text-[#4CAF50]">Sentinel X</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Adultos</span>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-white py-16 lg:py-24" data-testid="hero-adultos">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-emerald-500/30">
                <Shield className="w-4 h-4" />
                Oferta de lanzamiento hasta 30 de Marzo
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Sentinel X para Adultos – <span className="text-emerald-400">Botón SOS Físico Personal</span>
              </h1>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/sentinel-x">
                  <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-lg px-8 py-6 rounded-xl" data-testid="cta-comprar-adultos">
                    Comprar Sentinel X Adultos
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-500" /> Envío gratuito</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-500" /> 30 días prueba</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-500" /> Garantía 2 años</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-3xl rounded-full transform scale-75" />
              <img
                src="https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png"
                alt="Sentinel X para adultos - Seguridad personal con botón SOS"
                className="relative z-10 w-full max-w-md mx-auto drop-shadow-2xl"
                loading="eager"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-lg rounded-full px-6 py-2 border border-white/20 z-20">
                <span className="text-2xl font-bold text-white">149€</span>
                <span className="text-gray-400 line-through ml-2">249€</span>
                <span className="ml-2 text-xs bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full">Envío gratis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* H2: Seguridad Personal para tu Vida Diaria */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Seguridad Personal para tu Vida Diaria</h2>
          <p className="text-lg text-gray-600">
            Sentinel X para adultos combina discreción y seguridad. Su botón SOS físico permite enviar alertas inmediatas a tus contactos predefinidos en caso de emergencia. Ideal para uso diario, deportes, viajes o trabajo.
          </p>
        </div>
      </section>

      {/* H2: Funcionalidades Principales */}
      <section className="py-16 bg-gray-50" data-testid="features-adultos">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Funcionalidades Principales</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Bell className="w-7 h-7" />, title: "Botón SOS físico discreto", desc: "Botón lateral integrado en el diseño. Actívalo con una pulsación larga de 3 segundos. Nadie notará que has pedido ayuda. Envía ubicación GPS y llama a tus contactos automáticamente." },
              { icon: <Phone className="w-7 h-7" />, title: "Llamadas automáticas a 3 contactos", desc: "Al activar el SOS, el Sentinel X llama automáticamente a tus 3 contactos de emergencia en orden. Si el primero no contesta, llama al segundo, y así sucesivamente." },
              { icon: <MapPin className="w-7 h-7" />, title: "Envío de ubicación inmediata", desc: "GPS multi-banda con precisión de 2-5 metros. Tu ubicación se comparte al instante con tus contactos de emergencia. Funciona en interiores y exteriores." },
              { icon: <Droplets className="w-7 h-7" />, title: "Resistente al agua y golpes", desc: "IP68 + 5ATM: resistente a inmersiones de hasta 50 metros. Apto para natación, surf, duchas y cualquier condición meteorológica extrema." },
              { icon: <Briefcase className="w-7 h-7" />, title: "Uso laboral y deportivo", desc: "Perfecto para running, ciclismo, senderismo, trabajo en campo, repartos y cualquier actividad profesional o deportiva. Cumple con normativas PRL." },
              { icon: <Heart className="w-7 h-7" />, title: "Monitor cardíaco 24/7", desc: "Sensor de ritmo cardíaco continuo con alertas de anomalías. SpO2 para saturación de oxígeno. Datos disponibles en la app." }
            ].map((f, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* H2: Beneficios del Sentinel X para Adultos */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Beneficios del Sentinel X para Adultos</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Shield className="w-8 h-8" />, title: "Protección activa y discreta", desc: "El botón SOS invisible permite pedir ayuda sin que nadie lo note. Diseño premium que parece un smartwatch de alta gama." },
              { icon: <Smartphone className="w-8 h-8" />, title: "Control total desde la app", desc: "Gestiona contactos, historial de ubicaciones, alertas y configuración desde tu móvil. Perfiles diferentes para trabajo y personal." },
              { icon: <Zap className="w-8 h-8" />, title: "Prevención ante cualquier emergencia", desc: "Detección de caídas por IA, monitor cardíaco, alertas automáticas y botón SOS. Protección 360° para cualquier situación." }
            ].map((b, i) => (
              <div key={i} className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">{b.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-gray-600 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50" data-testid="testimonials-adultos">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Opiniones de Usuarios</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-700 mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">{t.name.charAt(0)}</div>
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
      <section className="py-16 bg-white" data-testid="faq-adultos">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: "¿Cómo funciona el botón SOS para adultos?", a: "Pulsa el botón lateral durante 3 segundos. El Sentinel X envía tu ubicación GPS exacta a tus contactos de emergencia (hasta 3) y realiza llamadas automáticas secuenciales. También puedes activar el SOS de forma discreta con un gesto en la pantalla." },
              { q: "¿Se puede usar en deporte y trabajo?", a: "Sí. IP68 + 5ATM (resistente a agua hasta 50m), carcasa de titanio, batería de 5 días. Perfecto para running, ciclismo, senderismo, natación y trabajos de campo. Cumple con normativas PRL." },
              { q: "¿Quién recibe la alerta cuando se pulsa el botón SOS?", a: "Hasta 3 contactos que tú configures. Reciben notificación push con tu ubicación en mapa, SMS con coordenadas y llamada automática. Puedes tener perfiles diferentes para trabajo y personal." },
              { q: "¿Tiene resistencia al agua?", a: "Sí. IP68 + 5ATM: natación, surf, lluvia, duchas, deportes acuáticos. También resiste polvo, arena, barro y temperaturas extremas (-20°C a 60°C)." }
            ].map((faq, i) => (
              <details key={i} className="bg-gray-50 rounded-xl border border-gray-200 group">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-gray-900 hover:text-emerald-600 transition-colors">
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
      <section className="py-16 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Tu seguridad personal, en tu muñeca</h2>
          <p className="text-xl text-gray-300 mb-2">Oferta de lanzamiento hasta el 30 de Marzo</p>
          <p className="text-gray-400 mb-8">Envío gratuito a toda España | 30 días de prueba | Garantía 2 años</p>
          <Link to="/sentinel-x">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-lg px-10 py-6 rounded-xl font-bold" data-testid="cta-final-adultos">
              Comprar Sentinel X Adultos – 149€
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
              <p className="font-medium text-gray-900">Sentinel X para Niños</p>
              <p className="text-sm text-gray-500">Protección para 12-16 años</p>
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

export default SentinelXAdultos;
