/**
 * ManoProtect - Sentinel J: Reloj SOS para Jóvenes
 * Correas intercambiables de colores - Feature estrella
 * SEO optimizado con Schema.org Product + FAQ + Breadcrumb
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, MapPin, Phone, CheckCircle, Star, ArrowRight,
  Lock, Bell, Palette, Smile, Battery, Droplets, Zap,
  RefreshCw, Sparkles, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const SENTINEL_J_IMG = "https://static.prod-images.emergentagent.com/jobs/d9b76ada-9994-4215-9ba1-31b4da8dc333/images/691c09d64cba84d0a069b7937e6f2e651449be714b394f349f7e64ace5198a3a.png";

const strapColors = [
  { name: "Azul Aventura", hex: "#3B82F6", ring: "ring-blue-400", bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-600" },
  { name: "Rosa Estrella", hex: "#EC4899", ring: "ring-pink-400", bg: "bg-pink-500", light: "bg-pink-50", text: "text-pink-600" },
  { name: "Verde Bosque", hex: "#22C55E", ring: "ring-green-400", bg: "bg-green-500", light: "bg-green-50", text: "text-green-600" },
  { name: "Naranja Sol", hex: "#F97316", ring: "ring-orange-400", bg: "bg-orange-500", light: "bg-orange-50", text: "text-orange-600" },
  { name: "Morado Galaxia", hex: "#8B5CF6", ring: "ring-violet-400", bg: "bg-violet-500", light: "bg-violet-50", text: "text-violet-600" },
  { name: "Rojo Turbo", hex: "#EF4444", ring: "ring-red-400", bg: "bg-red-500", light: "bg-red-50", text: "text-red-600" },
  { name: "Amarillo Rayo", hex: "#EAB308", ring: "ring-yellow-400", bg: "bg-yellow-500", light: "bg-yellow-50", text: "text-yellow-600" },
  { name: "Negro Ninja", hex: "#1F2937", ring: "ring-gray-600", bg: "bg-gray-800", light: "bg-gray-100", text: "text-gray-800" }
];

const SentinelJ = () => {
  const [activeColor, setActiveColor] = useState(0);

  const schemaProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "ManoProtect Sentinel J - Reloj SOS para Jóvenes",
    "description": "Reloj inteligente con botón SOS físico y correas intercambiables de colores, diseñado para jóvenes de 6 a 14 años. GPS en tiempo real, llamadas a padres y zonas seguras. Sin cámara ni internet.",
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
      { "@type": "Question", "name": "¿Las correas del Sentinel J son intercambiables?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. El Sentinel J incluye un sistema de liberación rápida que permite cambiar la correa en segundos, sin herramientas. Disponible en 8 colores. Puedes comprar correas adicionales por 9,99€ cada una." } },
      { "@type": "Question", "name": "¿Qué diferencia hay entre el Sentinel J y el Sentinel X?", "acceptedAnswer": { "@type": "Answer", "text": "El Sentinel J está diseñado para jóvenes de 6 a 14 años: más ligero (35g), correas intercambiables de colores, diseño divertido y precio más accesible (99€). El Sentinel X es para adolescentes y adultos con funciones avanzadas como monitor cardíaco y detección de caídas IA." } },
      { "@type": "Question", "name": "¿Es seguro para niños pequeños?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. Fabricado con silicona hipoalergénica de grado médico, sin bordes afilados. La correa es suave y el dispositivo pesa solo 35g. Certificado CE y apto para menores." } },
      { "@type": "Question", "name": "¿Puede mi hijo hacer llamadas?", "acceptedAnswer": { "@type": "Answer", "text": "Sí, pero solo a los 5 contactos autorizados por los padres. Las llamadas de números desconocidos se bloquean automáticamente." } },
      { "@type": "Question", "name": "¿Resiste el agua y los golpes?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. IP68: resistente a salpicaduras, lluvia y lavado de manos. Carcasa de policarbonato reforzado que resiste caídas y golpes." } },
      { "@type": "Question", "name": "¿Cuánto dura la batería?", "acceptedAnswer": { "@type": "Answer", "text": "4 días con uso normal. Carga magnética segura en 90 minutos. Alerta automática a los padres cuando baja del 15%." } }
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

  const features = [
    { icon: <RefreshCw className="w-7 h-7" />, title: "Correas Intercambiables", desc: "8 colores vibrantes con sistema de cambio rápido. Tu hijo elige un color nuevo cada día. Sin herramientas, en 3 segundos.", color: "bg-gradient-to-br from-pink-100 to-violet-100 text-pink-600", highlight: true },
    { icon: <Bell className="w-7 h-7" />, title: "Botón SOS Grande", desc: "Botón rojo grande y fácil de pulsar. 3 segundos para activar la emergencia. Envía ubicación GPS y llama a papá y mamá.", color: "bg-red-100 text-red-600" },
    { icon: <MapPin className="w-7 h-7" />, title: "GPS Tiempo Real", desc: "Los padres ven la ubicación exacta desde la app. Precisión de 3-5 metros. Funciona en colegio, parque, calle e interiores.", color: "bg-blue-100 text-blue-600" },
    { icon: <Phone className="w-7 h-7" />, title: "Llamadas a Papá y Mamá", desc: "Solo a los 5 contactos que autorices. Números desconocidos bloqueados automáticamente. Un toque para llamar.", color: "bg-green-100 text-green-600" },
    { icon: <Shield className="w-7 h-7" />, title: "Zonas Seguras", desc: "Configura colegio, casa, parque y abuelos. Alerta instantánea si tu hijo entra o sale de cualquier zona.", color: "bg-purple-100 text-purple-600" },
    { icon: <Lock className="w-7 h-7" />, title: "Control Parental Total", desc: "Sin cámara, sin internet, sin redes sociales. Modo silencioso en horario escolar. Todo desde la app de los padres.", color: "bg-amber-100 text-amber-600" }
  ];

  const testimonials = [
    { name: "Sandra L.", location: "Madrid", role: "Madre de Lucía (8 años)", text: "Lucía tiene 3 correas y las cambia según la ropa. Le encanta el rosa y el morado. Yo estoy tranquila sabiendo dónde está siempre. El botón SOS nos da paz.", rating: 5 },
    { name: "Roberto M.", location: "Valencia", role: "Padre de Pablo (10 años)", text: "Pablo va solo al cole y las zonas seguras me avisan cuando llega y sale. Lo mejor: sin cámara ni internet. La correa verde bosque es su favorita.", rating: 5 },
    { name: "Carmen G.", location: "Barcelona", role: "Madre de Marc (7 años)", text: "Marc dice que es 'su reloj de superhéroe'. Pesa tan poco que no se lo quiere quitar. La batería dura 4 días y resiste los golpes del patio.", rating: 5 },
    { name: "Javier A.", location: "Sevilla", role: "Padre de Sofía (11 años)", text: "Mucho mejor que darle un móvil. Sofía cambió del azul al amarillo rayo y está encantada. Sin distracciones, solo seguridad. 10/10.", rating: 5 },
    { name: "Laura P.", location: "Madrid", role: "Madre de Diego (9 años)", text: "Compramos 2 correas extra (rojo turbo y negro ninja). Diego las colecciona como si fueran cromos. Y nosotros dormimos tranquilos.", rating: 5 },
    { name: "Ana R.", location: "Málaga", role: "Madre de Martina (6 años)", text: "Martina es la más pequeña del cole con reloj y está orgullosísima. La correa rosa es su tesoro. El botón SOS funciona perfecto, lo probamos el primer día.", rating: 5 }
  ];

  const selected = strapColors[activeColor];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Sentinel J | Reloj SOS para Jóvenes con Correas Intercambiables | ManoProtect</title>
        <meta name="description" content="Sentinel J: reloj con botón SOS y correas intercambiables de 8 colores para jóvenes de 6 a 14 años. GPS, llamadas a padres, zonas seguras. Sin cámara ni internet. 99€ con envío gratuito." />
        <meta name="keywords" content="reloj SOS jóvenes, reloj GPS niños, sentinel J, reloj seguridad infantil, smartwatch niños sin internet, correas intercambiables reloj niños, localizador niños" />
        <link rel="canonical" href="https://manoprotect.com/sentinel-j" />
        <meta property="og:title" content="Sentinel J | Reloj SOS con Correas de Colores para Jóvenes" />
        <meta property="og:description" content="8 colores de correas intercambiables. Botón SOS, GPS y sin internet. 99€ envío gratuito." />
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

      {/* HERO - Dark immersive */}
      <section className="relative overflow-hidden py-16 lg:py-24" data-testid="hero-sentinel-j">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full blur-[100px] opacity-40 animate-pulse" style={{ backgroundColor: selected.hex }} />
        <div className="absolute bottom-10 right-[15%] w-60 h-60 rounded-full blur-[80px] opacity-30 animate-pulse" style={{ backgroundColor: strapColors[(activeColor + 3) % 8].hex, animationDelay: '1s' }} />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 border" style={{ backgroundColor: selected.hex + '20', borderColor: selected.hex + '50', color: selected.hex }}>
                <Sparkles className="w-4 h-4" />
                8 COLORES DE CORREAS INTERCAMBIABLES
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
                Sentinel{' '}
                <span className="relative inline-block">
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${selected.hex}, ${strapColors[(activeColor + 2) % 8].hex})` }}>J</span>
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-300 font-medium mb-2">El reloj SOS que tus hijos quieren llevar</p>
              <p className="text-base text-gray-500 mb-8 max-w-lg">
                Botón SOS físico + GPS tiempo real + Llamadas a papá y mamá. Correas intercambiables en 8 colores. Sin cámara. Sin internet. Solo seguridad.
              </p>

              {/* Color picker */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Color:</span>
                {strapColors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveColor(i)}
                    className={`w-7 h-7 rounded-full transition-all duration-300 border-2 ${i === activeColor ? 'scale-125 border-white shadow-lg' : 'border-transparent hover:scale-110 opacity-70 hover:opacity-100'}`}
                    style={{ backgroundColor: c.hex, boxShadow: i === activeColor ? `0 0 20px ${c.hex}80` : 'none' }}
                    aria-label={c.name}
                    data-testid={`color-picker-${i}`}
                  />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link to="/servicios-sos">
                  <Button size="lg" className="text-lg px-8 py-6 rounded-2xl font-bold shadow-2xl transition-all duration-300 text-white border-0" style={{ background: `linear-gradient(135deg, ${selected.hex}, ${strapColors[(activeColor + 2) % 8].hex})` }} data-testid="cta-comprar-sentinel-j">
                    Reservar Sentinel J – 99€
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-400" /> Envío GRATUITO</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-400" /> 30 días de prueba</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-400" /> Correa incluida</span>
              </div>
              <p className="text-xs text-gray-600 mt-3">Oferta de lanzamiento hasta el 30 de Marzo</p>
            </div>

            {/* Product Image */}
            <div className="relative flex justify-center">
              <div className="absolute inset-0 rounded-full blur-[60px] opacity-20 transition-colors duration-700" style={{ backgroundColor: selected.hex }} />
              <img
                src={SENTINEL_J_IMG}
                alt="Sentinel J - Reloj SOS para jóvenes con correas intercambiables de colores"
                className="relative z-10 w-full max-w-md drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                loading="eager"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-2xl z-20 border border-white/20">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-white">99€</span>
                  <span className="text-gray-400 line-through text-lg">159€</span>
                  <span className="text-xs px-2 py-1 rounded-full font-bold text-white" style={{ backgroundColor: selected.hex }}>-38%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STRAP CUSTOMIZER - Feature Estrella */}
      <section className="py-20 bg-white relative overflow-hidden" data-testid="strap-customizer">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <RefreshCw className="w-4 h-4" />
              CORREAS INTERCAMBIABLES
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3">Un color diferente cada día</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Sistema de liberación rápida: cambia la correa en 3 segundos, sin herramientas. 8 colores disponibles para que tu hijo exprese su estilo.
            </p>
          </div>

          {/* Color Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
            {strapColors.map((c, i) => (
              <button
                key={i}
                onClick={() => setActiveColor(i)}
                className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 ${i === activeColor ? 'border-gray-900 shadow-xl scale-105' : 'border-gray-100 hover:border-gray-300 hover:shadow-md'}`}
                data-testid={`strap-color-${c.name.toLowerCase().replace(/\s/g, '-')}`}
              >
                <div className="w-12 h-12 rounded-full mx-auto mb-3 shadow-lg transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: c.hex, boxShadow: i === activeColor ? `0 8px 30px ${c.hex}60` : '' }} />
                <p className="text-sm font-bold text-gray-900">{c.name}</p>
                {i === activeColor && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Strap details */}
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: selected.hex + '10' }}>
              <Zap className="w-8 h-8 mx-auto mb-3" style={{ color: selected.hex }} />
              <h3 className="font-bold text-gray-900 mb-1">Cambio en 3 segundos</h3>
              <p className="text-sm text-gray-600">Sistema de liberación rápida. Sin herramientas, sin complicaciones.</p>
            </div>
            <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: selected.hex + '10' }}>
              <Droplets className="w-8 h-8 mx-auto mb-3" style={{ color: selected.hex }} />
              <h3 className="font-bold text-gray-900 mb-1">Silicona hipoalergénica</h3>
              <p className="text-sm text-gray-600">Grado médico, suave y resistente al agua. Perfecta para pieles sensibles.</p>
            </div>
            <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: selected.hex + '10' }}>
              <Heart className="w-8 h-8 mx-auto mb-3" style={{ color: selected.hex }} />
              <h3 className="font-bold text-gray-900 mb-1">Correas extra: 9,99€</h3>
              <p className="text-sm text-gray-600">Colecciona todos los colores. Regalo perfecto para cumples y Navidad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY NOT A PHONE */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">¿Por qué Sentinel J y no un móvil?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <h3 className="text-xl font-bold text-red-800 mb-4">Con un móvil</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-red-500 font-bold mt-0.5">&#x2715;</span> Acceso a internet y redes sociales</li>
                <li className="flex items-start gap-2"><span className="text-red-500 font-bold mt-0.5">&#x2715;</span> Cámara y contenido inapropiado</li>
                <li className="flex items-start gap-2"><span className="text-red-500 font-bold mt-0.5">&#x2715;</span> Se pierde en la mochila</li>
                <li className="flex items-start gap-2"><span className="text-red-500 font-bold mt-0.5">&#x2715;</span> Distracción en clase</li>
                <li className="flex items-start gap-2"><span className="text-red-500 font-bold mt-0.5">&#x2715;</span> Batería dura pocas horas</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
              <h3 className="text-xl font-bold text-green-800 mb-4">Con Sentinel J</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> Sin internet ni redes sociales</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> Sin cámara: solo seguridad</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> Siempre en la muñeca</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> Modo silencioso en clase</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> 4 días de batería</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 bg-white" data-testid="features-sentinel-j">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Funcionalidades Principales</h2>
          <p className="text-gray-500 text-center mb-10">Diseñado por padres, para padres</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${f.highlight ? 'border-2 border-violet-200 bg-gradient-to-br from-pink-50 to-violet-50 ring-1 ring-violet-100' : 'border-gray-100 bg-gray-50'}`}>
                {f.highlight && <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-violet-600 mb-2">Feature estrella</span>}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Especificaciones Técnicas</h2>
          <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Pantalla", value: '1.4" IPS táctil', icon: <Sparkles className="w-5 h-5" /> },
              { label: "Resistencia", value: "IP68", icon: <Droplets className="w-5 h-5" /> },
              { label: "Batería", value: "4 días", icon: <Battery className="w-5 h-5" /> },
              { label: "Conectividad", value: "4G LTE", icon: <Zap className="w-5 h-5" /> },
              { label: "GPS", value: "Alta precisión", icon: <MapPin className="w-5 h-5" /> },
              { label: "Material correa", value: "Silicona médica", icon: <Heart className="w-5 h-5" /> },
              { label: "Peso", value: "35g", icon: <Smile className="w-5 h-5" /> },
              { label: "Correas", value: "8 colores intercambiables", icon: <Palette className="w-5 h-5" /> }
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-4 text-center border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-gray-400 flex justify-center mb-2">{s.icon}</div>
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className="font-bold text-gray-900 text-sm">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-16 bg-white" data-testid="comparison-sentinel-j">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Sentinel J vs Sentinel X</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-xl overflow-hidden border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left text-sm font-bold text-gray-900 border-b">Característica</th>
                  <th className="p-4 text-center text-sm font-bold border-b" style={{ color: selected.hex }}>Sentinel J (6-14)</th>
                  <th className="p-4 text-center text-sm font-bold text-gray-500 border-b">Sentinel X (12+)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ["Precio", "99€", "149€"],
                  ["Correas intercambiables", "8 colores", "No"],
                  ["Edad recomendada", "6-14 años", "12+ años"],
                  ["Botón SOS físico", "Sí (grande, rojo)", "Sí (lateral)"],
                  ["GPS tiempo real", "Sí", "Sí"],
                  ["Llamadas", "5 contactos", "Ilimitados"],
                  ["Zonas seguras", "Hasta 10", "Ilimitadas"],
                  ["Cámara / Internet", "No / No", "No / No"],
                  ["Monitor cardíaco", "No", "Sí"],
                  ["Detector caídas IA", "No", "Sí"],
                  ["Batería", "4 días", "5 días"],
                  ["Peso", "35g", "48g"],
                  ["Envío", "GRATUITO", "GRATUITO"]
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-medium text-gray-900 border-b border-gray-100">{row[0]}</td>
                    <td className="p-3 text-center text-gray-700 border-b border-gray-100 font-medium">{row[1]}</td>
                    <td className="p-3 text-center text-gray-500 border-b border-gray-100">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Para adolescentes que necesitan funciones avanzadas, recomendamos el <Link to="/sentinel-x-ninos" className="text-blue-600 hover:underline font-medium">Sentinel X</Link>.
          </p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 bg-gray-50" data-testid="testimonials-sentinel-j">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Lo Que Dicen los Padres</h2>
          <p className="text-gray-500 text-center mb-8">Las correas de colores son el regalo estrella</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-700 text-sm mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: strapColors[i % 8].hex }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role} – {t.location}</p>
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
              { q: "¿Las correas son intercambiables de verdad?", a: "Sí. El Sentinel J usa un sistema de liberación rápida (quick-release) que permite cambiar la correa en 3 segundos sin herramientas. Solo desliza, retira y coloca la nueva. Disponible en 8 colores. Correas adicionales por 9,99€." },
              { q: "¿Qué diferencia hay entre Sentinel J y Sentinel X?", a: "Sentinel J: diseñado para jóvenes de 6-14, más ligero (35g), correas intercambiables en 8 colores, 99€. Sentinel X: para 12+ años, monitor cardíaco, detección caídas IA, pantalla AMOLED, 149€. Ambos tienen botón SOS, GPS y sin internet." },
              { q: "¿Es seguro para niños pequeños?", a: "Sí. Materiales hipoalergénicos de grado médico, sin bordes afilados. Correa de silicona suave. Solo 35g de peso. Certificado CE. Sin cámara ni acceso a internet." },
              { q: "¿Puede mi hijo hacer llamadas?", a: "Sí, solo a los 5 contactos que autorices desde la app. Números desconocidos se bloquean automáticamente. Un toque para llamar a papá o mamá." },
              { q: "¿Resiste agua y golpes?", a: "Sí. IP68: salpicaduras, lluvia y lavado de manos. Carcasa de policarbonato reforzado resistente a caídas y golpes del recreo." },
              { q: "¿Cuánto dura la batería?", a: "4 días con uso normal. Carga magnética segura en 90 minutos. Los padres reciben alerta cuando baja del 15%." }
            ].map((faq, i) => (
              <details key={i} className="bg-gray-50 rounded-xl border border-gray-200 group" data-testid={`faq-item-${i}`}>
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

      {/* CTA FINAL - Dark immersive */}
      <section className="py-20 text-white relative overflow-hidden" data-testid="cta-final-section">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-30" style={{ backgroundColor: selected.hex }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: strapColors[(activeColor + 4) % 8].hex }} />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center gap-2 mb-6">
            {strapColors.map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-full shadow-lg" style={{ backgroundColor: c.hex }} />
            ))}
          </div>
          <h2 className="text-3xl lg:text-4xl font-black mb-4">Dale seguridad con su color favorito</h2>
          <p className="text-xl text-gray-300 mb-2">Sentinel J: diseñado para jóvenes, pensado por padres</p>
          <p className="text-gray-500 mb-8">Envío GRATUITO | 30 días de prueba | Oferta hasta 30 de Marzo</p>
          <Link to="/servicios-sos">
            <Button size="lg" className="text-lg px-10 py-6 rounded-2xl font-bold shadow-2xl text-white border-0" style={{ background: `linear-gradient(135deg, ${selected.hex}, ${strapColors[(activeColor + 2) % 8].hex})` }} data-testid="cta-final-sentinel-j">
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
            <Link to="/sentinel-x-ninos" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow border border-gray-100" data-testid="link-sentinel-x-ninos">
              <p className="font-medium text-gray-900">Sentinel X para Adolescentes</p>
              <p className="text-sm text-gray-500">12-16 años | 149€</p>
            </Link>
            <Link to="/sentinel-x-adultos" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow border border-gray-100" data-testid="link-sentinel-x-adultos">
              <p className="font-medium text-gray-900">Sentinel X para Adultos</p>
              <p className="text-sm text-gray-500">17-55 años | 149€</p>
            </Link>
            <Link to="/boton-sos-senior" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow border border-gray-100" data-testid="link-boton-sos-senior">
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
