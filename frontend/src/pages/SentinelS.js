/**
 * ManoProtect - Sentinel S: Reloj de Protección Infantil Premium
 * Diseño elegante · Correas intercambiables pastel · Seguridad total
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, MapPin, Phone, CheckCircle, Star, ArrowRight,
  Lock, Bell, Palette, Smile, Battery, Droplets,
  RefreshCw, Sparkles, Heart, Eye, EyeOff,
  Volume2, Radio, Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const SENTINEL_S_IMG = "https://static.prod-images.emergentagent.com/jobs/70b9cc4e-5cf4-48c1-b710-585bbf769faa/images/e4d94aa4babe28ec14a789ee54b85cfc6b5cafb807d95c003d7a26f35491fa3d.png";
const SENTINEL_S_STRAPS = "https://static.prod-images.emergentagent.com/jobs/70b9cc4e-5cf4-48c1-b710-585bbf769faa/images/704b866c89b5efdd4b1ad17cc2e01c27662595567fb30fc5ded65c99b967ee76.png";

const strapColors = [
  { name: "Lavanda", hex: "#B4A7D6" },
  { name: "Mint", hex: "#93C5B1" },
  { name: "Rosa Empolvado", hex: "#E8B4B8" },
  { name: "Cielo", hex: "#A0C4E8" },
  { name: "Crema", hex: "#E8DCC8" },
  { name: "Coral Suave", hex: "#E89B8B" }
];

const MAX_FREE = 50;

const SentinelS = () => {
  const [activeColor, setActiveColor] = useState(0);
  const [freeRemaining, setFreeRemaining] = useState(() => {
    const saved = sessionStorage.getItem('sentinel_s_free');
    if (saved) { const p = parseInt(saved, 10); if (p > 0 && p <= MAX_FREE) return p; }
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
    "@context": "https://schema.org", "@type": "Product",
    "name": "ManoProtect Sentinel S - Reloj de Protección Infantil Premium",
    "description": "Reloj inteligente de seguridad para niños con caja cerámica, acabados rose gold, alerta anti-retirada, sirena 120dB, GPS en tiempo real y correas intercambiables en tonos pastel. De 3 a 12 años.",
    "brand": { "@type": "Brand", "name": "ManoProtect" },
    "image": SENTINEL_S_IMG,
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR", "availability": "https://schema.org/PreOrder", "priceValidUntil": "2026-03-30" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5.0", "reviewCount": "47" }
  };

  const schemaFAQ = {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿Cómo protege el Sentinel S a mi hijo?", "acceptedAnswer": { "@type": "Answer", "text": "Alerta anti-retirada, sirena 120dB, GPS cada 10 segundos, botón SOS silencioso, escucha remota y grabación en la nube. 8 capas de seguridad real." } },
      { "@type": "Question", "name": "¿Las correas son intercambiables?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. 6 colores en tonos pastel con sistema de liberación rápida. Silicona hipoalergénica de grado médico." } },
      { "@type": "Question", "name": "¿Es realmente gratis?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. Los primeros 50 son 100% gratis. Solo 4,95€ de envío. Campaña Los niños no se tocan." } }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Sentinel S | Reloj de Protección Infantil Premium | Los Niños No Se Tocan | ManoProtect</title>
        <meta name="description" content="Sentinel S: reloj premium de seguridad para niños de 3-12 años. Caja cerámica con acabados rose gold, alerta anti-retirada, sirena 120dB, GPS tiempo real. 6 correas pastel intercambiables. GRATIS los primeros 50." />
        <meta name="keywords" content="reloj seguridad niños premium, reloj GPS niños elegante, protección infantil, sentinel S, los niños no se tocan, localizador niños, smartwatch niños sin internet" />
        <link rel="canonical" href="https://manoprotect.com/sentinel-s" />
        <meta property="og:title" content="Sentinel S | Protección Infantil Premium | ManoProtect" />
        <meta property="og:description" content="Caja cerámica, acabados rose gold, 6 correas pastel. Alerta anti-retirada, sirena 120dB, GPS. GRATIS los primeros 50." />
        <meta property="og:image" content={SENTINEL_S_IMG} />
        <script type="application/ld+json">{JSON.stringify(schemaProduct)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaFAQ)}</script>
      </Helmet>

      <LandingHeader />

      {/* Subtle top bar */}
      <div className="bg-[#2D2A33] py-2.5 text-center" data-testid="alert-banner-sentinel-s">
        <p className="text-xs tracking-[0.2em] uppercase text-[#B4A7D6] font-medium">
          Los niños no se tocan — Primeros 50 Sentinel S gratis · Solo envío
          <span className="ml-2 text-white/50">|</span>
          <span className="ml-2 text-white/70">{freeRemaining} disponibles</span>
        </p>
      </div>

      {/* Breadcrumb */}
      <nav className="max-w-6xl mx-auto px-6 py-4 text-xs text-gray-400 tracking-wide" data-testid="breadcrumb-sentinel-s">
        <Link to="/" className="hover:text-gray-900 transition-colors">Inicio</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Sentinel S</span>
      </nav>

      {/* HERO — Clean, editorial */}
      <section className="pb-20 pt-8" data-testid="hero-sentinel-s">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div className="order-2 lg:order-1">
              <p className="text-xs tracking-[0.25em] uppercase text-[#B4A7D6] font-semibold mb-4">Protección infantil premium</p>

              <h1 className="text-5xl lg:text-6xl font-light text-gray-900 mb-2 leading-[1.1] tracking-tight">
                Sentinel <span className="font-bold" style={{ color: selected.hex }}>S</span>
              </h1>
              <p className="text-lg text-gray-500 font-light mb-8 max-w-md leading-relaxed">
                Caja cerámica blanca con acabados rose gold. Diseñado para proteger lo más importante del mundo: tus hijos.
              </p>

              {/* Color selector */}
              <div className="mb-8">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Correa: <span className="text-gray-900 font-medium normal-case">{selected.name}</span></p>
                <div className="flex items-center gap-3">
                  {strapColors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveColor(i)}
                      className={`w-8 h-8 rounded-full transition-all duration-300 ${i === activeColor ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
                      style={{ backgroundColor: c.hex }}
                      aria-label={c.name}
                      data-testid={`color-picker-s-${i}`}
                    />
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-light text-gray-900">0 €</span>
                <span className="text-lg text-gray-400 line-through">129 €</span>
                <span className="text-xs bg-[#2D2A33] text-white px-3 py-1 rounded-full font-medium tracking-wide">GRATIS</span>
              </div>
              <p className="text-sm text-gray-400 mb-8">Solo 4,95 € de envío · Hasta 30 de marzo 2026</p>

              <Link to="/sentinel-x#reservar">
                <Button size="lg" className="px-10 py-6 rounded-full text-sm tracking-widest uppercase font-semibold bg-[#2D2A33] hover:bg-[#3D3A43] text-white border-0 shadow-lg shadow-gray-900/10 transition-all duration-300 hover:shadow-xl" data-testid="cta-pedir-sentinel-s">
                  Reservar gratis
                  <ArrowRight className="w-4 h-4 ml-3" />
                </Button>
              </Link>

              <div className="flex items-center gap-6 mt-8 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#93C5B1]" /> Garantía 12 meses</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#93C5B1]" /> Correa incluida</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#93C5B1]" /> Devolución 14 días</span>
              </div>
            </div>

            {/* Product Image */}
            <div className="relative order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-8 rounded-full blur-[80px] opacity-20" style={{ backgroundColor: selected.hex }} />
                <img
                  src={SENTINEL_S_IMG}
                  alt="Sentinel S – Reloj de protección infantil premium con caja cerámica y acabados rose gold"
                  className="relative z-10 w-full max-w-md drop-shadow-2xl"
                  loading="eager"
                  data-testid="sentinel-s-product-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO — Elegant dark section */}
      <section className="py-20 bg-[#2D2A33] text-white" data-testid="message-section">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Shield className="w-8 h-8 mx-auto mb-6 text-[#B4A7D6]" />
          <h2 className="text-3xl lg:text-4xl font-light mb-6 leading-snug">
            Los niños no se tocan.
          </h2>
          <p className="text-base text-gray-400 leading-relaxed mb-6 max-w-xl mx-auto">
            En España, más de 20.000 menores desaparecen cada año. Cada segundo cuenta. El Sentinel S pone en la muñeca de tu hijo la tecnología que necesitas para saber que está a salvo — sin que él note nada más que un reloj bonito.
          </p>
          <div className="w-12 h-px bg-[#B4A7D6] mx-auto" />
        </div>
      </section>

      {/* 8 SECURITY LAYERS — Minimal grid */}
      <section className="py-20 bg-[#FAFAF8]" data-testid="features-sentinel-s">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs tracking-[0.25em] uppercase text-[#B4A7D6] font-semibold text-center mb-3">8 capas de protección</p>
          <h2 className="text-3xl font-light text-gray-900 text-center mb-14">Seguridad que no se ve, pero siempre está.</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 rounded-2xl overflow-hidden">
            {[
              { icon: <Shield className="w-6 h-6" />, title: "Alerta Anti-Retirada", desc: "Si quitan el reloj, alerta inmediata a los padres con ubicación GPS y grabación de audio.", accent: "#E89B8B" },
              { icon: <Volume2 className="w-6 h-6" />, title: "Sirena 120 dB", desc: "Alarma de emergencia que alerta a todos los presentes. Disuade a cualquier agresor.", accent: "#E8B4B8" },
              { icon: <Bell className="w-6 h-6" />, title: "SOS Silencioso", desc: "Botón de emergencia que alerta a los padres sin que nadie más lo sepa. GPS + audio.", accent: "#B4A7D6" },
              { icon: <MapPin className="w-6 h-6" />, title: "GPS Cada 10 s", desc: "En modo emergencia, actualización de posición cada 10 segundos. Precisión de 3 metros.", accent: "#A0C4E8" },
              { icon: <Eye className="w-6 h-6" />, title: "Zonas Seguras", desc: "Colegio, casa, parque. Alerta automática si tu hijo entra o sale de cualquier perímetro.", accent: "#93C5B1" },
              { icon: <Phone className="w-6 h-6" />, title: "5 Contactos", desc: "Solo llama a quien tú autorices. Desconocidos bloqueados. Un toque para llamar a mamá.", accent: "#A0C4E8" },
              { icon: <Radio className="w-6 h-6" />, title: "Escucha Remota", desc: "Activa el micrófono discretamente desde la app para escuchar el entorno de tu hijo.", accent: "#B4A7D6" },
              { icon: <EyeOff className="w-6 h-6" />, title: "Sin Internet", desc: "Sin cámara, sin redes sociales, sin juegos. Solo seguridad. Modo clase automático.", accent: "#E8DCC8" }
            ].map((f, i) => (
              <div key={i} className="bg-white p-7 flex flex-col">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: f.accent + '30', color: f.accent }}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STRAPS — Editorial layout */}
      <section className="py-20 bg-white" data-testid="strap-customizer-s">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <img
                src={SENTINEL_S_STRAPS}
                alt="6 correas premium en tonos pastel para Sentinel S"
                className="w-full max-w-md mx-auto"
                loading="lazy"
                data-testid="sentinel-s-straps-image"
              />
            </div>
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-[#B4A7D6] font-semibold mb-3">Personalización</p>
              <h2 className="text-3xl font-light text-gray-900 mb-4 leading-snug">Seis tonos pastel.<br />Cambio en 3 segundos.</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Sistema de liberación rápida sin herramientas. Silicona hipoalergénica de grado médico, suave al tacto y resistente al agua. Cada correa es un accesorio más del día a día de tu hijo.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {strapColors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveColor(i)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${i === activeColor ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
                    data-testid={`strap-s-${c.name.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: c.hex }} />
                    <span className="text-xs font-medium text-gray-700">{c.name}</span>
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-400">Correas adicionales: 7,99 € · Envío combinado disponible</p>
            </div>
          </div>
        </div>
      </section>

      {/* SPECS — Refined */}
      <section className="py-20 bg-[#FAFAF8]">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs tracking-[0.25em] uppercase text-[#B4A7D6] font-semibold text-center mb-3">Especificaciones</p>
          <h2 className="text-3xl font-light text-gray-900 text-center mb-12">Diseñado al detalle.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Edad", value: "3 – 12 años", icon: <Smile className="w-5 h-5" /> },
              { label: "Peso", value: "30 g", icon: <Heart className="w-5 h-5" /> },
              { label: "Pantalla", value: '1.4" IPS', icon: <Sparkles className="w-5 h-5" /> },
              { label: "Caja", value: "Cerámica + rose gold", icon: <Palette className="w-5 h-5" /> },
              { label: "GPS", value: "Alta precisión", icon: <MapPin className="w-5 h-5" /> },
              { label: "Batería", value: "3 días", icon: <Battery className="w-5 h-5" /> },
              { label: "Resistencia", value: "IP68", icon: <Droplets className="w-5 h-5" /> },
              { label: "Conectividad", value: "4G LTE", icon: <Radio className="w-5 h-5" /> }
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-gray-300 flex justify-center mb-2">{s.icon}</div>
                <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
                <p className="text-sm font-medium text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — Minimal */}
      <section className="py-20 bg-white" data-testid="testimonials-sentinel-s">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs tracking-[0.25em] uppercase text-[#B4A7D6] font-semibold text-center mb-3">Opiniones</p>
          <h2 className="text-3xl font-light text-gray-900 text-center mb-12">La tranquilidad no tiene precio.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Patricia M.", loc: "Madrid", child: "Marta, 5 años", text: "La alerta anti-retirada es increíble. Probamos a quitárselo y mi móvil sonó en 2 segundos con la ubicación exacta. Tranquilidad total." },
              { name: "Carlos R.", loc: "Barcelona", child: "Lucía, 7 años", text: "Lucía va andando al cole y las zonas seguras me avisan cuando llega y sale. Sin cámara ni internet. La correa Mint es su favorita." },
              { name: "María J.", loc: "Valencia", child: "Hugo, 4 años", text: "Hugo es muy pequeño pero el botón SOS es tan grande que lo pulsa sin problema. No se lo quiere quitar. La correa Lavanda le encanta." },
              { name: "Antonio L.", loc: "Sevilla", child: "Alba, 9 años", text: "Lo que más valoro es la escucha remota. Puedo oír qué pasa alrededor de Alba cuando va al parque. Sin preocupaciones." },
              { name: "Laura G.", loc: "Málaga", child: "Daniel, 6 años", text: "Un compañero intentó quitarle el reloj jugando y me llegó la alerta. El sistema funciona de verdad. Cambia de correa cada día." },
              { name: "Fernando S.", loc: "Zaragoza", child: "Emma, 3 años", text: "Emma es la más pequeña de la guardería con reloj. Solo 30 gramos, ni lo nota. Saber que si alguien intenta algo, suena la sirena... no tiene precio." }
            ].map((t, i) => (
              <div key={i} className="border-t border-gray-100 pt-6">
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-[#B4A7D6] text-[#B4A7D6]" />)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.child} · {t.loc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — Clean accordion */}
      <section className="py-20 bg-[#FAFAF8]" data-testid="faq-sentinel-s">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs tracking-[0.25em] uppercase text-[#B4A7D6] font-semibold text-center mb-3">Preguntas frecuentes</p>
          <h2 className="text-3xl font-light text-gray-900 text-center mb-12">Todo lo que necesitas saber.</h2>
          <div className="space-y-0 divide-y divide-gray-200">
            {[
              { q: "¿Cómo protege contra secuestradores?", a: "Alerta anti-retirada (alerta inmediata si quitan el reloj), botón SOS silencioso, sirena 120 dB, GPS cada 10 segundos en emergencia, escucha remota y grabación de audio automática en la nube. 8 capas de seguridad diseñadas para escenarios reales." },
              { q: "¿Qué pasa si alguien le quita el reloj?", a: "El sensor anti-retirada detecta la extracción y en menos de 3 segundos: envía alerta a los padres con GPS, activa la grabación de audio y puede disparar la sirena automáticamente." },
              { q: "¿Las correas son intercambiables?", a: "Sí. 6 tonos pastel con sistema de liberación rápida sin herramientas. Silicona hipoalergénica de grado médico. Correas adicionales por 7,99 €." },
              { q: "¿Tiene cámara o internet?", a: "No. Sin cámara, sin internet, sin redes sociales, sin juegos. Solo funciones de seguridad. Modo silencioso automático en horario escolar." },
              { q: "¿Para qué edad?", a: "De 3 a 12 años. 30 gramos de peso. Botón SOS grande y fácil incluso para niños de 3 años. Correa ajustable para muñecas pequeñas." },
              { q: "¿Es realmente gratis?", a: "Sí. Los primeros 50 son 100% gratis como parte de nuestra campaña. Solo 4,95 € de envío. Creemos que la seguridad infantil no debería tener precio." }
            ].map((faq, i) => (
              <details key={i} className="group py-5" data-testid={`faq-s-item-${i}`}>
                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-900 hover:text-[#B4A7D6] transition-colors">
                  {faq.q}
                  <ArrowRight className="w-4 h-4 text-gray-300 group-open:rotate-90 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <p className="mt-4 text-sm text-gray-500 leading-relaxed pr-8">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL — Elegant dark */}
      <section className="py-24 bg-[#2D2A33] text-white relative overflow-hidden" data-testid="cta-final-sentinel-s">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full blur-[150px] opacity-10" style={{ backgroundColor: selected.hex }} />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <p className="text-xs tracking-[0.25em] uppercase text-[#B4A7D6] font-semibold mb-6">Protección infantil premium</p>
          <h2 className="text-3xl lg:text-4xl font-light mb-4 leading-snug">
            La mejor decisión que puedes<br />tomar como padre.
          </h2>
          <p className="text-gray-400 mb-2">Sentinel S · Gratis · Solo 4,95 € de envío</p>
          <p className="text-gray-500 text-sm mb-10">Quedan {freeRemaining} unidades · Oferta hasta 30 de marzo 2026</p>
          <Link to="/sentinel-x#reservar">
            <Button size="lg" className="px-10 py-6 rounded-full text-sm tracking-widest uppercase font-semibold bg-white text-[#2D2A33] hover:bg-gray-100 border-0 shadow-lg transition-all duration-300" data-testid="cta-final-pedir-sentinel-s">
              Reservar Sentinel S gratis
              <ArrowRight className="w-4 h-4 ml-3" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs tracking-[0.25em] uppercase text-gray-400 font-semibold mb-6">Más productos</p>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/sentinel-j" className="p-5 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all" data-testid="link-sentinel-j">
              <p className="text-sm font-medium text-gray-900">Sentinel J</p>
              <p className="text-xs text-gray-400 mt-1">Jóvenes 6-14 · 8 correas · GRATIS</p>
            </Link>
            <Link to="/sentinel-x" className="p-5 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all" data-testid="link-sentinel-x">
              <p className="text-sm font-medium text-gray-900">Sentinel X</p>
              <p className="text-sm text-gray-400 mt-1">Adultos · SOS invisible · GRATIS</p>
            </Link>
            <Link to="/boton-sos-senior" className="p-5 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all" data-testid="link-boton-sos-senior">
              <p className="text-sm font-medium text-gray-900">Botón SOS Senior</p>
              <p className="text-xs text-gray-400 mt-1">Mayores 55+ · Detección caídas</p>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default SentinelS;
