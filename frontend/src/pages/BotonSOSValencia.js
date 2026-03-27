/**
 * ManoProtect - Landing Local SEO: Botón SOS en Valencia
 * Optimizada para SEO local y posicionamiento geográfico
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, MapPin, Phone, CheckCircle, Star, ArrowRight,
  Truck, Clock, Users, Heart, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const BotonSOSValencia = () => {
  const schemaLocalBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "ManoProtect Valencia",
    "description": "Venta y soporte de dispositivos de seguridad personal con botón SOS en Valencia. Entrega local en 24-48 horas.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Valencia",
      "addressLocality": "Valencia",
      "addressRegion": "Comunidad Valenciana",
      "postalCode": "46000",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 39.4699,
      "longitude": -0.3763
    },
    "url": "https://manoprotectt.com/boton-sos-valencia",
    "telephone": "+34601510950",
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": { "@type": "GeoCoordinates", "latitude": 39.4699, "longitude": -0.3763 },
      "geoRadius": "50000"
    },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "156" }
  };

  const schemaProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Botón SOS en Valencia – ManoProtect",
    "description": "Dispositivo SOS con botón de emergencia físico disponible en Valencia con entrega y soporte local.",
    "brand": { "@type": "Brand", "name": "ManoProtect" },
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "29.99",
      "highPrice": "149",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "areaServed": { "@type": "Place", "name": "Valencia, España" }
    }
  };

  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://manoprotectt.com" },
      { "@type": "ListItem", "position": 2, "name": "Botón SOS", "item": "https://manoprotectt.com/boton-sos-senior" },
      { "@type": "ListItem", "position": 3, "name": "Valencia", "item": "https://manoprotectt.com/boton-sos-valencia" }
    ]
  };

  const testimonials = [
    { name: "María del Carmen L.", location: "Benimaclet, Valencia", text: "Me lo trajo un mensajero al día siguiente de pedirlo. Mi madre de 82 años ya lo lleva puesto y nos da mucha tranquilidad a toda la familia. El soporte por WhatsApp es excelente.", rating: 5 },
    { name: "Francisco J. M.", location: "Ruzafa, Valencia", text: "Compré dos botones SOS: uno para mi padre en Paterna y otro para mi suegra en Mislata. Entrega en 24h y un técnico nos llamó para explicarnos todo. Servicio local de verdad.", rating: 5 },
    { name: "Amparo G.", location: "L'Eixample, Valencia", text: "Después de la DANA vivimos con más miedo. El botón SOS nos ha dado seguridad a todos. Mi marido lo lleva cuando sale a caminar por el río y yo tengo su ubicación en el móvil.", rating: 5 },
    { name: "Vicente R.", location: "Campanar, Valencia", text: "Probé otros dispositivos pero ManoProtect es el único con soporte real en Valencia. Cuando tuve una duda, me llamaron y me ayudaron en 10 minutos. Eso no tiene precio.", rating: 5 }
  ];

  const zones = [
    "Valencia ciudad", "L'Horta Nord", "L'Horta Sud", "Camp de Túria",
    "Camp de Morvedre (Sagunto)", "Ribera Alta (Alzira)", "Ribera Baixa (Sueca)",
    "La Safor (Gandía)", "La Costera (Xàtiva)", "La Vall d'Albaida"
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Botón SOS Valencia | Compra y Atención Local</title>
        <meta name="description" content="Compra tu botón SOS físico en Valencia con entrega rápida y soporte local. Seguridad inmediata para toda la familia." />
        <meta name="keywords" content="botón SOS Valencia, dispositivo emergencia Valencia, teleasistencia Valencia, seguridad mayores Valencia, localizador GPS Valencia, botón pánico Valencia" />
        <link rel="canonical" href="https://manoprotectt.com/boton-sos-valencia" />
        <meta property="og:title" content="Botón SOS en Valencia | Entrega y Soporte Local" />
        <meta property="og:description" content="Compra tu botón SOS con entrega en 24-48h en Valencia y atención local personalizada." />
        <meta property="og:url" content="https://manoprotectt.com/boton-sos-valencia" />
        <script type="application/ld+json">{JSON.stringify(schemaLocalBusiness)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaProduct)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaBreadcrumb)}</script>
      </Helmet>

      <LandingHeader />

      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500" data-testid="breadcrumb-valencia">
        <Link to="/" className="hover:text-[#4CAF50]">Inicio</Link>
        <span className="mx-2">/</span>
        <Link to="/boton-sos-senior" className="hover:text-[#4CAF50]">Botón SOS</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Valencia</span>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-16 lg:py-24" data-testid="hero-valencia">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              Entrega y soporte local en Valencia
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Botón SOS en Valencia – <span className="text-orange-600">Entrega y Soporte Local</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              Compra tu botón SOS físico en Valencia y protege a tus hijos, adultos o mayores con un dispositivo que ofrece asistencia inmediata y localización en tiempo real. Nuestro servicio local garantiza entrega rápida y soporte especializado para cualquier necesidad.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/servicios-sos">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-6 rounded-xl" data-testid="cta-comprar-valencia">
                  Comprar Botón SOS en Valencia
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="https://wa.me/34601510950?text=Hola,%20quiero%20info%20del%20bot%C3%B3n%20SOS%20en%20Valencia" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl border-orange-300 text-orange-700 hover:bg-orange-50">
                  <Phone className="w-5 h-5 mr-2" />
                  WhatsApp Valencia
                </Button>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Truck className="w-4 h-4 text-orange-500" /> Entrega 24-48h Valencia</span>
              <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-orange-500" /> Soporte local</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Configuración incluida</span>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Local */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Beneficios de Comprar Localmente</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Truck className="w-8 h-8" />, title: "Entrega rápida en Valencia y alrededores", desc: "Recibe tu botón SOS en 24-48 horas laborables. Envío gratuito.", color: "bg-orange-100 text-orange-600" },
              { icon: <Phone className="w-8 h-8" />, title: "Soporte técnico local y personalizado", desc: "Atención por teléfono y WhatsApp con personas reales en Valencia.", color: "bg-blue-100 text-blue-600" },
              { icon: <Users className="w-8 h-8" />, title: "Instalación y configuración guiada", desc: "Te ayudamos a configurar tu dispositivo paso a paso.", color: "bg-green-100 text-green-600" },
              { icon: <Heart className="w-8 h-8" />, title: "Compatibilidad con todos nuestros modelos", desc: "Niños, Adultos y Senior. Garantía y asistencia completa.", color: "bg-purple-100 text-purple-600" }
            ].map((adv, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${adv.color}`}>{adv.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{adv.title}</h3>
                <p className="text-gray-600 text-sm">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Dispositivos disponibles en Valencia</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-gray-900">29,99€</span>
                <p className="text-green-600 text-sm font-medium">Envío gratuito</p>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-center">Botón SOS Físico</h3>
              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Botón de emergencia portátil</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> GPS incluido</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> 7 días de batería</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Ideal para seniors</li>
              </ul>
              <Link to="/servicios-sos">
                <Button className="w-full bg-red-600 hover:bg-red-700">Comprar Botón SOS</Button>
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-[#4CAF50] hover:shadow-lg transition-shadow relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4CAF50] text-white text-xs font-bold px-3 py-1 rounded-full">MÁS VENDIDO</div>
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-[#4CAF50]">149€</span>
                <p className="text-gray-400 line-through text-sm">249€</p>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-center">Sentinel X</h3>
              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Reloj con botón SOS</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Detección de caídas IA</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Llamadas bidireccionales</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> eSIM incluida</li>
              </ul>
              <Link to="/sentinel-x">
                <Button className="w-full bg-[#4CAF50] hover:bg-[#45a049]">Comprar Sentinel X</Button>
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-gray-900">0€</span>
                <p className="text-gray-500 text-sm">7 días gratis</p>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-center">App ManoProtect</h3>
              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Botón SOS en el móvil</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Localización familiar</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Alertas de estafas</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Verificador de fraudes</li>
              </ul>
              <Link to="/registro">
                <Button variant="outline" className="w-full">Probar Gratis</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Valencia */}
      <section className="py-16 bg-white" data-testid="testimonials-valencia">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Opiniones de Clientes en Valencia</h2>
          <p className="text-gray-500 text-center mb-8">Familias valencianas que ya confían en ManoProtect</p>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-700 mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">{t.name.charAt(0)}</div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* H2: Por Qué Elegir ManoProtect en Valencia */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Por Qué Elegir ManoProtect en Valencia</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Servicio local confiable", desc: "Empresa valenciana con equipo local de soporte técnico y atención al cliente." },
              { title: "Experiencia y respaldo en seguridad familiar", desc: "Más de 500 familias valencianas protegidas. Conocemos las necesidades de nuestra tierra." },
              { title: "Atención rápida ante cualquier emergencia", desc: "Soporte por teléfono y WhatsApp con tiempos de respuesta inferiores a 10 minutos." }
            ].map((v, i) => (
              <div key={i} className="text-center p-6 bg-orange-50 rounded-xl border border-orange-100">
                <CheckCircle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-600 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Area */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Cobertura en la Provincia de Valencia</h2>
          <p className="text-gray-600 text-center mb-8">Entrega en 24-48h y soporte local en toda la provincia</p>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {zones.map((z, i) => (
              <span key={i} className="bg-white px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-colors">
                <MapPin className="w-3 h-3 inline mr-1 text-orange-500" />{z}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-amber-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Protege a tu familia en Valencia</h2>
          <p className="text-xl text-orange-100 mb-2">
            Oferta de lanzamiento hasta el 30 de Marzo
          </p>
          <p className="text-orange-200 mb-8">Envío gratuito | Soporte local | Atención personalizada</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/servicios-sos">
              <Button size="lg" className="bg-white text-orange-700 hover:bg-orange-50 text-lg px-10 py-6 rounded-xl font-bold">
                Comprar Botón SOS en Valencia
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="tel:+34601510950">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl">
                <Phone className="w-5 h-5 mr-2" />
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

export default BotonSOSValencia;
