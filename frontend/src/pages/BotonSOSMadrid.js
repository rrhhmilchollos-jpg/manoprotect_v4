/**
 * ManoProtect - Landing Local SEO: Botón SOS en Madrid
 * Optimizada para SEO local y posicionamiento geográfico
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, MapPin, Phone, CheckCircle, Star, ArrowRight, Truck, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const BotonSOSMadrid = () => {
  const schemaLocalBusiness = {
    "@context": "https://schema.org", "@type": "LocalBusiness",
    "name": "ManoProtect Madrid",
    "description": "Venta y soporte de dispositivos de seguridad personal con botón SOS en Madrid.",
    "address": { "@type": "PostalAddress", "addressLocality": "Madrid", "addressRegion": "Comunidad de Madrid", "postalCode": "28000", "addressCountry": "ES" },
    "geo": { "@type": "GeoCoordinates", "latitude": 40.4168, "longitude": -3.7038 },
    "url": "https://manoprotect.com/boton-sos-madrid",
    "telephone": "+34601510950",
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "234" }
  };

  const testimonials = [
    { name: "María José R.", location: "Chamberí, Madrid", text: "Compré un Sentinel X para mi madre en Argüelles. Llegó al día siguiente y el soporte nos ayudó a configurarlo por teléfono. Servicio excelente.", rating: 5 },
    { name: "Antonio L.", location: "Vallecas, Madrid", text: "Mi padre de 78 años lleva el botón SOS desde hace 3 meses. Nos da mucha tranquilidad saber que puede pedir ayuda con un toque.", rating: 5 },
    { name: "Elena G.", location: "Alcobendas, Madrid", text: "Lo pedí un lunes y el miércoles ya lo tenía en casa. La configuración fue muy fácil con la ayuda del equipo de ManoProtect.", rating: 5 },
    { name: "Fernando P.", location: "Getafe, Madrid", text: "Tenemos tres dispositivos: uno para mi madre, otro para mi suegro y un Sentinel J para mi hijo. Toda la familia protegida.", rating: 5 }
  ];

  const zones = ["Madrid Centro", "Arganzuela", "Retiro", "Salamanca", "Chamartín", "Tetuán", "Chamberí", "Fuencarral-El Pardo", "Moncloa-Aravaca", "Latina", "Carabanchel", "Usera", "Puente de Vallecas", "Moratalaz", "Ciudad Lineal", "Hortaleza", "Villaverde", "Vicálvaro", "Barajas", "Alcobendas", "Getafe", "Leganés", "Móstoles", "Alcalá de Henares"];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Botón SOS Madrid | Compra y Atención Local</title>
        <meta name="description" content="Compra tu botón SOS físico en Madrid con entrega rápida y soporte local. Protege a toda tu familia: niños, adultos y mayores. Envío gratuito." />
        <meta name="keywords" content="botón SOS Madrid, dispositivo emergencia Madrid, teleasistencia Madrid, seguridad mayores Madrid, localizador GPS Madrid" />
        <link rel="canonical" href="https://manoprotect.com/boton-sos-madrid" />
        <script type="application/ld+json">{JSON.stringify(schemaLocalBusiness)}</script>
      </Helmet>

      <LandingHeader />
      <nav className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500" data-testid="breadcrumb-madrid">
        <Link to="/" className="hover:text-[#4CAF50]">Inicio</Link><span className="mx-2">/</span><span className="text-gray-900 font-medium">Madrid</span>
      </nav>

      <section className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-16 lg:py-24" data-testid="hero-madrid">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-6"><MapPin className="w-4 h-4" />Entrega y soporte en Madrid</div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Botón SOS en Madrid – <span className="text-red-600">Entrega y Soporte Local</span></h1>
          <p className="text-xl text-gray-600 mb-8">Compra tu botón SOS físico en Madrid y protege a tus hijos, adultos o mayores con entrega rápida, soporte local y configuración guiada. Envío gratuito a toda la Comunidad de Madrid.</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Link to="/servicios-sos"><Button size="lg" className="bg-red-600 hover:bg-red-700 text-lg px-8 py-6 rounded-xl" data-testid="cta-comprar-madrid">Comprar Botón SOS en Madrid<ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
            <a href="https://wa.me/34601510950?text=Hola,%20quiero%20info%20del%20bot%C3%B3n%20SOS%20en%20Madrid" target="_blank" rel="noopener noreferrer"><Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl"><Phone className="w-5 h-5 mr-2" />WhatsApp Madrid</Button></a>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Truck className="w-4 h-4 text-red-500" />Envío gratuito Madrid</span>
            <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-red-500" />Soporte local</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" />Oferta hasta 30 de Marzo</span>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Beneficios de Comprar en Madrid</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Truck className="w-8 h-8" />, title: "Envío gratuito y rápido", desc: "Entrega en 24-48h en toda la Comunidad de Madrid.", color: "bg-red-100 text-red-600" },
              { icon: <Phone className="w-8 h-8" />, title: "Soporte técnico local", desc: "Atención personalizada por teléfono y WhatsApp.", color: "bg-blue-100 text-blue-600" },
              { icon: <Users className="w-8 h-8" />, title: "+800 familias en Madrid", desc: "Más de 800 familias madrileñas protegidas.", color: "bg-green-100 text-green-600" },
              { icon: <Heart className="w-8 h-8" />, title: "Todos los modelos", desc: "Sentinel J, Sentinel X y Botón SOS Senior.", color: "bg-purple-100 text-purple-600" }
            ].map((a, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${a.color}`}>{a.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{a.title}</h3>
                <p className="text-gray-600 text-sm">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50" data-testid="testimonials-madrid">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Opiniones de Clientes en Madrid</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-1 mb-3">{[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-gray-700 mb-4">"{t.text}"</p>
                <p className="font-medium text-gray-900 text-sm">{t.name} <span className="text-gray-500 font-normal flex items-center gap-1 inline-flex"><MapPin className="w-3 h-3" />{t.location}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Cobertura en Madrid</h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {zones.map((z, i) => (<span key={i} className="bg-gray-50 px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700"><MapPin className="w-3 h-3 inline mr-1 text-red-500" />{z}</span>))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-2">Protege a tu familia en Madrid</h2>
          <p className="text-red-100 mb-8">Envío gratuito | Soporte local | Oferta hasta 30 de Marzo</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/servicios-sos"><Button size="lg" className="bg-white text-red-700 hover:bg-red-50 text-lg px-10 py-6 rounded-xl font-bold">Comprar Botón SOS en Madrid<ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
            <a href="tel:+34601510950"><Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl"><Phone className="w-5 h-5 mr-2" />601 510 950</Button></a>
          </div>
        </div>
      </section>
      <LandingFooter />
    </div>
  );
};

export default BotonSOSMadrid;
