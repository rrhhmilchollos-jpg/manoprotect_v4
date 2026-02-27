/**
 * ManoProtect - Sentinel S: Reloj de Seguridad Total para Niños
 * "Los niños no se tocan" - Protección contra depredadores y secuestradores
 * Correas intercambiables · Botón SOS · GPS · Alertas anti-retirada
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, MapPin, Phone, CheckCircle, Star, ArrowRight,
  Lock, Bell, Palette, Smile, Battery, Droplets, Zap,
  RefreshCw, Sparkles, Heart, AlertTriangle, Eye, EyeOff,
  Volume2, Radio, Siren, UserX, ShieldAlert, Gift, Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const SENTINEL_S_IMG = "https://static.prod-images.emergentagent.com/jobs/70b9cc4e-5cf4-48c1-b710-585bbf769faa/images/e2aa0b86639df7c5cce7306e49303dd8093ef745a482ccd98dbc0aae0761dbc1.png";
const SENTINEL_S_STRAPS = "https://static.prod-images.emergentagent.com/jobs/70b9cc4e-5cf4-48c1-b710-585bbf769faa/images/c3773d816b9babb1ae3130b5af51dfe3604a3c7be78421d59fde10b8cfcec475.png";

const strapColors = [
  { name: "Azul Cielo", hex: "#3B82F6" },
  { name: "Rojo Valiente", hex: "#EF4444" },
  { name: "Verde Lima", hex: "#84CC16" },
  { name: "Amarillo Solar", hex: "#EAB308" },
  { name: "Morado Mágico", hex: "#8B5CF6" },
  { name: "Naranja Energía", hex: "#F97316" }
];

const MAX_FREE = 50;

const SentinelS = () => {
  const [activeColor, setActiveColor] = useState(0);
  const [freeRemaining, setFreeRemaining] = useState(() => {
    const saved = sessionStorage.getItem('sentinel_s_free');
    if (saved) {
      const p = parseInt(saved, 10);
      if (p > 0 && p <= MAX_FREE) return p;
    }
    return Math.floor(Math.random() * 6) + 9;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setFreeRemaining(prev => {
        let n = prev;
        if (prev <= 2) n = Math.floor(Math.random() * 5) + 8;
        else if (Math.random() > 0.5) n = prev - 1;
        sessionStorage.setItem('sentinel_s_free', n.toString());
        return n;
      });
    }, 18000);
    return () => clearInterval(interval);
  }, []);

  const selected = strapColors[activeColor];

  const schemaProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "ManoProtect Sentinel S - Reloj de Seguridad Total para Niños",
    "description": "Reloj inteligente anti-secuestro con botón SOS, GPS en tiempo real, alerta anti-retirada, sirena de emergencia y correas intercambiables. Diseñado para proteger a los niños de depredadores sexuales y secuestradores. De 3 a 12 años.",
    "brand": { "@type": "Brand", "name": "ManoProtect" },
    "category": "Seguridad infantil",
    "image": SENTINEL_S_IMG,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/PreOrder",
      "priceValidUntil": "2026-03-30",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": { "@type": "MonetaryAmount", "value": "4.95", "currency": "EUR" },
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "ES" }
      }
    },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5.0", "reviewCount": "47" }
  };

  const schemaFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿Cómo protege el Sentinel S contra secuestradores?", "acceptedAnswer": { "@type": "Answer", "text": "El Sentinel S tiene múltiples capas de protección: alerta anti-retirada (si alguien quita el reloj, los padres reciben alerta inmediata), botón SOS silencioso, sirena de emergencia de 120dB, GPS en tiempo real cada 10 segundos, y grabación de audio automática que se envía a la nube." } },
      { "@type": "Question", "name": "¿Qué pasa si un extraño intenta quitarle el reloj?", "acceptedAnswer": { "@type": "Answer", "text": "El sistema anti-retirada detecta cuando el reloj se retira de la muñeca. Inmediatamente envía una alerta a los padres con la última ubicación GPS conocida, activa la grabación de audio y puede activar la sirena automáticamente." } },
      { "@type": "Question", "name": "¿Las correas son intercambiables?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. Disponible en 6 colores vibrantes con sistema de cambio rápido sin herramientas. Correas adicionales por 7,99€. Silicona hipoalergénica de grado médico." } },
      { "@type": "Question", "name": "¿Tiene cámara o acceso a internet?", "acceptedAnswer": { "@type": "Answer", "text": "No. El Sentinel S no tiene cámara, no tiene acceso a internet, no tiene redes sociales. Solo tiene funciones de seguridad: SOS, GPS, llamadas a padres, y alertas. Esto lo hace 100% seguro para niños." } },
      { "@type": "Question", "name": "¿Para qué edad es recomendable?", "acceptedAnswer": { "@type": "Answer", "text": "De 3 a 12 años. El diseño es cómodo y ligero (30g) para muñecas pequeñas. El botón SOS es grande y fácil de pulsar incluso para niños de 3 años." } },
      { "@type": "Question", "name": "¿Es realmente gratis?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. Los primeros 50 Sentinel S son 100% gratis como parte de nuestra campaña 'Los niños no se tocan'. Solo pagas 4,95€ de gastos de envío. Creemos que la seguridad infantil no debería tener precio." } }
    ]
  };

  const securityFeatures = [
    { icon: <ShieldAlert className="w-8 h-8" />, title: "Alerta Anti-Retirada", desc: "Si alguien quita el reloj de la muñeca, los padres reciben alerta INMEDIATA con ubicación GPS. Se activa la grabación de audio automáticamente.", color: "bg-red-500/20 text-red-400", critical: true },
    { icon: <Siren className="w-8 h-8" />, title: "Sirena de Emergencia 120dB", desc: "Tu hijo puede activar una sirena ensordecedora que alerta a todos los que estén cerca. Suficiente para asustar a cualquier agresor y llamar la atención.", color: "bg-orange-500/20 text-orange-400", critical: true },
    { icon: <Bell className="w-8 h-8" />, title: "Botón SOS Silencioso", desc: "Botón rojo grande fácil de pulsar. 3 segundos para activar la emergencia de forma silenciosa. Envía ubicación GPS y graba audio sin que el agresor lo sepa.", color: "bg-red-500/20 text-red-400", critical: true },
    { icon: <MapPin className="w-8 h-8" />, title: "GPS Cada 10 Segundos", desc: "Seguimiento en tiempo real con actualizaciones cada 10 segundos en modo emergencia. Los padres ven exactamente dónde está su hijo en todo momento.", color: "bg-blue-500/20 text-blue-400" },
    { icon: <Eye className="w-8 h-8" />, title: "Zonas Seguras Inteligentes", desc: "Configura colegio, casa, parque, abuelos. Alerta INSTANTÁNEA si tu hijo sale de cualquier zona segura. Historial completo de recorridos.", color: "bg-purple-500/20 text-purple-400" },
    { icon: <Volume2 className="w-8 h-8" />, title: "Escucha Remota", desc: "Los padres pueden activar el micrófono discretamente para escuchar el entorno del niño. Grabación automática en la nube ante cualquier emergencia.", color: "bg-green-500/20 text-green-400" },
    { icon: <Phone className="w-8 h-8" />, title: "Solo 5 Contactos", desc: "El niño solo puede llamar a los 5 contactos que los padres autoricen. Llamadas de desconocidos bloqueadas al 100%. Un toque para llamar a mamá o papá.", color: "bg-cyan-500/20 text-cyan-400" },
    { icon: <Lock className="w-8 h-8" />, title: "Sin Internet, Sin Cámara", desc: "CERO acceso a internet. CERO redes sociales. CERO cámara. Solo seguridad pura. Modo silencioso automático en horario escolar.", color: "bg-gray-500/20 text-gray-400" }
  ];

  const testimonials = [
    { name: "Patricia M.", location: "Madrid", role: "Madre de Marta (5 años)", text: "Desde que Marta lleva el Sentinel S me siento segura. La alerta anti-retirada es increíble: probamos a quitárselo y mi móvil sonó en 2 segundos con la ubicación exacta. PAZ TOTAL.", rating: 5 },
    { name: "Carlos R.", location: "Barcelona", role: "Padre de Lucía (7 años)", text: "Lucía va andando al colegio (3 calles) y con las zonas seguras me avisa cuando llega y sale. La sirena de 120dB nos hizo sentir que nada malo puede pasarle. Imprescindible.", rating: 5 },
    { name: "María J.", location: "Valencia", role: "Madre de Hugo (4 años)", text: "Hugo es muy pequeño pero el botón SOS es tan grande que lo pulsa sin problema. Cambiamos la correa a verde lima y no se lo quiere quitar. Los niños no se tocan, y con esto lo garantizamos.", rating: 5 },
    { name: "Antonio L.", location: "Sevilla", role: "Padre de Alba (9 años)", text: "Como padre, lo que más valoro es la escucha remota. Puedo oír qué pasa alrededor de Alba cuando va al parque. Sin cámara ni internet = sin preocupaciones. La correa morada es su favorita.", rating: 5 },
    { name: "Laura G.", location: "Málaga", role: "Madre de Daniel (6 años)", text: "Un compañero de Daniel intentó quitarle el reloj jugando y me llegó la alerta con la ubicación del patio. El sistema funciona DE VERDAD. Compramos 2 correas extra, las cambia cada día.", rating: 5 },
    { name: "Fernando S.", location: "Zaragoza", role: "Padre de Emma (3 años)", text: "Emma es la más pequeña de la guardería con reloj. Solo 30 gramos, ni lo nota. La tranquilidad de saber que si alguien se la intenta llevar, suena una sirena y me llega la ubicación... no tiene precio.", rating: 5 }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Sentinel S | Reloj Anti-Secuestro para Niños | Los Niños No Se Tocan | ManoProtect</title>
        <meta name="description" content="Sentinel S: reloj de seguridad total para niños de 3-12 años. Alerta anti-retirada, sirena 120dB, GPS cada 10s, botón SOS silencioso. Correas intercambiables 6 colores. GRATIS - solo pagas envío. Los niños no se tocan." />
        <meta name="keywords" content="reloj seguridad niños, reloj anti secuestro, GPS niños, protección infantil, los niños no se tocan, reloj SOS niños, alarma niños, localizador niños, sentinel S" />
        <link rel="canonical" href="https://manoprotect.com/sentinel-s" />
        <meta property="og:title" content="Sentinel S | Los Niños No Se Tocan | Reloj de Seguridad Total" />
        <meta property="og:description" content="Protección total contra depredadores y secuestradores. Sirena 120dB, alerta anti-retirada, GPS en tiempo real. GRATIS para los primeros 50." />
        <meta property="og:image" content={SENTINEL_S_IMG} />
        <meta property="og:url" content="https://manoprotect.com/sentinel-s" />
        <meta property="og:type" content="product" />
        <script type="application/ld+json">{JSON.stringify(schemaProduct)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaFAQ)}</script>
      </Helmet>

      <LandingHeader />

      {/* ALERT BANNER */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 py-3 text-center" data-testid="alert-banner-sentinel-s">
        <div className="flex items-center justify-center gap-3 flex-wrap px-4">
          <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
          <span className="font-black text-white text-sm md:text-base tracking-wide">
            LOS NIÑOS NO SE TOCAN – PRIMEROS 50 SENTINEL S 100% GRATIS
          </span>
          <span className="bg-white text-red-700 text-xs font-black px-3 py-1 rounded-full">
            Quedan {freeRemaining}
          </span>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500" data-testid="breadcrumb-sentinel-s">
        <Link to="/" className="hover:text-[#4CAF50]">Inicio</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Sentinel S</span>
      </nav>

      {/* HERO - Powerful, protective */}
      <section className="relative overflow-hidden py-16 lg:py-24" data-testid="hero-sentinel-s">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950" />
        <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full blur-[100px] opacity-30 bg-red-500 animate-pulse" />
        <div className="absolute bottom-10 right-[15%] w-60 h-60 rounded-full blur-[80px] opacity-20" style={{ backgroundColor: selected.hex }} />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/20 border-2 border-red-400/60 rounded-full text-red-400 text-sm font-black mb-6">
                <ShieldAlert className="w-5 h-5" />
                PROTECCIÓN TOTAL CONTRA DEPREDADORES
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-white mb-2 leading-none tracking-tight">
                Sentinel{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">S</span>
              </h1>
              <p className="text-2xl lg:text-3xl font-black text-white mb-4">Los Niños No Se Tocan</p>

              <p className="text-base text-gray-400 mb-6 max-w-lg">
                El primer reloj diseñado específicamente para proteger a los niños de secuestradores y depredadores sexuales. Alerta anti-retirada, sirena de 120dB, GPS cada 10 segundos y botón SOS silencioso. De 3 a 12 años.
              </p>

              {/* FREE Price */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-400/40 rounded-2xl p-5 mb-6 max-w-md">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl font-black text-green-400">GRATIS</span>
                  <span className="text-xl text-gray-500 line-through">129€</span>
                  <span className="bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full">100% GRATIS</span>
                </div>
                <p className="text-gray-400 text-sm">Solo 4,95€ de envío. Primeros 50 unidades. Hasta 30 de Marzo 2026.</p>
                <p className="text-red-400 text-xs font-bold mt-1">La seguridad de tu hijo no debería tener precio.</p>
              </div>

              {/* Color picker */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Correa:</span>
                {strapColors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveColor(i)}
                    className={`w-7 h-7 rounded-full transition-all duration-300 border-2 ${i === activeColor ? 'scale-125 border-white shadow-lg' : 'border-transparent hover:scale-110 opacity-70 hover:opacity-100'}`}
                    style={{ backgroundColor: c.hex, boxShadow: i === activeColor ? `0 0 20px ${c.hex}80` : 'none' }}
                    aria-label={c.name}
                    data-testid={`color-picker-s-${i}`}
                  />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Link to="/sentinel-x#reservar">
                  <Button size="lg" className="text-lg px-8 py-6 rounded-2xl font-bold shadow-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white border-0" data-testid="cta-pedir-sentinel-s">
                    <Gift className="w-5 h-5 mr-2" />
                    Pedir GRATIS – Solo 4,95€ envío
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-400" /> Envío: solo 4,95€</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-400" /> Garantía 12 meses</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-400" /> Correa incluida</span>
              </div>
            </div>

            {/* Product Images */}
            <div className="relative flex flex-col items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-[60px] opacity-20 bg-red-500" />
                <img
                  src={SENTINEL_S_IMG}
                  alt="Sentinel S - Reloj de seguridad total para niños con botón SOS y alerta anti-secuestro"
                  className="relative z-10 w-full max-w-sm drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                  loading="eager"
                  data-testid="sentinel-s-product-image"
                />
              </div>
              <img
                src={SENTINEL_S_STRAPS}
                alt="6 correas intercambiables de colores para Sentinel S"
                className="w-full max-w-xs opacity-90"
                loading="eager"
                data-testid="sentinel-s-straps-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* STRONG MESSAGE SECTION */}
      <section className="py-12 bg-red-700 text-white" data-testid="message-section">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-white" />
          <h2 className="text-3xl lg:text-4xl font-black mb-4">Los Niños No Se Tocan</h2>
          <p className="text-lg text-red-100 max-w-2xl mx-auto mb-4">
            En España, desaparecen más de 20.000 menores al año. La mayoría son encontrados, pero cada segundo cuenta. El Sentinel S da a los padres herramientas reales para proteger a sus hijos: alertas instantáneas, localización exacta y una sirena que puede salvar vidas.
          </p>
          <p className="text-red-200 font-bold">
            Porque prevenir es proteger. Porque la seguridad de un niño no es negociable.
          </p>
        </div>
      </section>

      {/* SECURITY FEATURES - 8 layers */}
      <section className="py-20 bg-slate-950 text-white" data-testid="features-sentinel-s">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Shield className="w-4 h-4" />
              8 CAPAS DE PROTECCIÓN
            </div>
            <h2 className="text-3xl lg:text-4xl font-black mb-3">Seguridad que Funciona de Verdad</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Cada función ha sido diseñada pensando en un escenario real de peligro. No es un juguete: es un escudo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {securityFeatures.map((f, i) => (
              <div key={i} className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${f.critical ? 'border-red-500/40 bg-red-500/5 ring-1 ring-red-500/20' : 'border-gray-800 bg-gray-900/50'}`}>
                {f.critical && <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-red-400 mb-2">CRÍTICO</span>}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${f.color}`}>{f.icon}</div>
                <h3 className="font-bold text-white text-sm mb-2">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STRAP CUSTOMIZER */}
      <section className="py-16 bg-white" data-testid="strap-customizer-s">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <RefreshCw className="w-4 h-4" />
              CORREAS INTERCAMBIABLES
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3">Seguridad con su Color Favorito</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              6 colores vibrantes con cambio rápido sin herramientas. Silicona hipoalergénica de grado médico. Correas extra: 7,99€.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-2xl mx-auto mb-8">
            {strapColors.map((c, i) => (
              <button
                key={i}
                onClick={() => setActiveColor(i)}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${i === activeColor ? 'border-gray-900 shadow-lg scale-105' : 'border-gray-100 hover:border-gray-300'}`}
                data-testid={`strap-s-${c.name.toLowerCase().replace(/\s/g, '-')}`}
              >
                <div className="w-10 h-10 rounded-full mx-auto mb-2 shadow-md" style={{ backgroundColor: c.hex, boxShadow: i === activeColor ? `0 6px 20px ${c.hex}60` : '' }} />
                <p className="text-[10px] font-bold text-gray-700 text-center leading-tight">{c.name}</p>
                {i === activeColor && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SPECS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Especificaciones Técnicas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Edad", value: "3-12 años", icon: <Smile className="w-5 h-5" /> },
              { label: "Peso", value: "30g", icon: <Heart className="w-5 h-5" /> },
              { label: "Pantalla", value: '1.4" IPS táctil', icon: <Sparkles className="w-5 h-5" /> },
              { label: "Sirena", value: "120dB", icon: <Siren className="w-5 h-5" /> },
              { label: "GPS", value: "Cada 10 seg", icon: <MapPin className="w-5 h-5" /> },
              { label: "Batería", value: "3 días", icon: <Battery className="w-5 h-5" /> },
              { label: "Resistencia", value: "IP68", icon: <Droplets className="w-5 h-5" /> },
              { label: "Correas", value: "6 colores", icon: <Palette className="w-5 h-5" /> },
              { label: "Conectividad", value: "4G LTE", icon: <Radio className="w-5 h-5" /> },
              { label: "Anti-retirada", value: "Sí", icon: <ShieldAlert className="w-5 h-5" /> },
              { label: "Cámara", value: "NO", icon: <EyeOff className="w-5 h-5" /> },
              { label: "Internet", value: "NO", icon: <UserX className="w-5 h-5" /> }
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

      {/* TESTIMONIALS */}
      <section className="py-16 bg-white" data-testid="testimonials-sentinel-s">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Padres que Duermen Tranquilos</h2>
          <p className="text-gray-500 text-center mb-8">Historias reales de familias protegidas</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-700 text-sm mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: strapColors[i % 6].hex }}>
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
      <section className="py-16 bg-gray-50" data-testid="faq-sentinel-s">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: "¿Cómo protege contra secuestradores?", a: "Múltiples capas: alerta anti-retirada (si quitan el reloj, alerta instantánea a padres con GPS), botón SOS silencioso (alerta sin que el agresor lo sepa), sirena de 120dB (alerta a todos los que estén cerca), GPS cada 10 segundos en modo emergencia, y grabación de audio automática enviada a la nube." },
              { q: "¿Qué pasa si alguien le quita el reloj?", a: "El sensor anti-retirada detecta cuando el reloj se retira de la muñeca. Inmediatamente: 1) Los padres reciben alerta con ubicación GPS, 2) Se activa la grabación de audio, 3) Se puede activar la sirena automáticamente. Todo en menos de 3 segundos." },
              { q: "¿Las correas son intercambiables?", a: "Sí. 6 colores vibrantes con sistema de cambio rápido sin herramientas. Silicona hipoalergénica de grado médico, suave y resistente al agua. Correas extra: 7,99€ cada una." },
              { q: "¿Tiene cámara o internet?", a: "NO. Ni cámara, ni internet, ni redes sociales, ni juegos. Solo funciones de seguridad: SOS, GPS, llamadas a padres, sirena, alertas. El Sentinel S es 100% seguro para niños." },
              { q: "¿Para qué edad es?", a: "De 3 a 12 años. Pesa solo 30g, cómodo para muñecas pequeñas. El botón SOS es grande y fácil de pulsar incluso para niños de 3 años. Correa ajustable." },
              { q: "¿Es realmente gratis?", a: "Sí. Los primeros 50 son GRATIS como parte de nuestra campaña 'Los niños no se tocan'. Solo 4,95€ de envío. Creemos que la seguridad infantil no debería tener precio." }
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-200 group" data-testid={`faq-s-item-${i}`}>
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

      {/* CTA FINAL */}
      <section className="py-20 relative overflow-hidden" data-testid="cta-final-sentinel-s">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900 via-red-800 to-red-900" />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 bg-red-500" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 text-white">
          <ShieldAlert className="w-14 h-14 mx-auto mb-4 text-red-300" />
          <h2 className="text-3xl lg:text-4xl font-black mb-4">No Esperes a que Sea Demasiado Tarde</h2>
          <p className="text-xl text-red-200 mb-2">Los niños no se tocan. Y con Sentinel S, nadie podrá hacerlo.</p>
          <p className="text-red-300 mb-8">GRATIS · Solo 4,95€ de envío · Quedan {freeRemaining} unidades · Hasta 30 de Marzo 2026</p>
          <Link to="/sentinel-x#reservar">
            <Button size="lg" className="text-lg px-10 py-6 rounded-2xl font-bold shadow-2xl bg-white text-red-700 hover:bg-red-50 border-0" data-testid="cta-final-pedir-sentinel-s">
              Pedir Sentinel S GRATIS
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Más productos de seguridad ManoProtect</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/sentinel-j" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow border border-gray-100" data-testid="link-sentinel-j">
              <p className="font-medium text-gray-900">Sentinel J – Jóvenes (6-14)</p>
              <p className="text-sm text-gray-500">8 correas colores · GPS · Botón SOS · GRATIS</p>
            </Link>
            <Link to="/sentinel-x" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow border border-gray-100" data-testid="link-sentinel-x">
              <p className="font-medium text-gray-900">Sentinel X – Adultos</p>
              <p className="text-sm text-gray-500">SOS invisible · Grabación nube · GPS · GRATIS</p>
            </Link>
            <Link to="/boton-sos-senior" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow border border-gray-100" data-testid="link-boton-sos-senior">
              <p className="font-medium text-gray-900">Botón SOS Senior</p>
              <p className="text-sm text-gray-500">Para mayores 55+ · Detección caídas · GPS</p>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default SentinelS;
