/**
 * ManoProtect - Landing Local SEO: Botón SOS en Sevilla
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, MapPin, Phone, CheckCircle, Star, ArrowRight, Truck, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const BotonSOSSevilla = () => {
  const schemaLocalBusiness = {
    "@context": "https://schema.org", "@type": "LocalBusiness",
    "name": "ManoProtect Sevilla",
    "description": "Venta y soporte de dispositivos de seguridad personal con botón SOS en Sevilla.",
    "address": { "@type": "PostalAddress", "addressLocality": "Sevilla", "addressRegion": "Andalucía", "postalCode": "41000", "addressCountry": "ES" },
    "geo": { "@type": "GeoCoordinates", "latitude": 37.3891, "longitude": -5.9845 },
    "url": "https://manoprotectt.com/boton-sos-sevilla",
    "telephone": "+34601510950",
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "145" }
  };

  const testimonials = [
    { name: "Rocío M.", location: "Triana, Sevilla", text: "Mi abuela de 85 años vive sola en Triana. Con el botón SOS todos estamos más tranquilos. Llegó en 2 días y el soporte nos ayudó a configurarlo.", rating: 5 },
    { name: "Manuel D.", location: "Nervión, Sevilla", text: "Compré el Sentinel X para mis entrenamientos de ciclismo por la campiña. Si me caigo, mi mujer recibe la alerta con mi ubicación exacta.", rating: 5 },
    { name: "Pilar A.", location: "Dos Hermanas", text: "Lo mejor es que no tiene complicaciones. Mi padre solo tiene que pulsar un botón y nos llama a todos. Muy fácil y muy efectivo.", rating: 5 },
    { name: "José Carlos R.", location: "Alcalá de Guadaíra", text: "Estamos encantados. Tres dispositivos para toda la familia y soporte en español por WhatsApp. Servicio de primera.", rating: 5 }
  ];

  const zones = ["Sevilla ciudad", "Triana", "Nervión", "Macarena", "Dos Hermanas", "Alcalá de Guadaíra", "Utrera", "Écija", "Carmona", "La Rinconada", "Coria del Río", "Mairena del Aljarafe", "Tomares", "Bormujos", "San Juan de Aznalfarache", "Camas", "Gelves"];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Botón SOS Sevilla | Compra y Atención Local</title>
        <meta name="description" content="Compra tu botón SOS físico en Sevilla con entrega rápida y soporte local. Protege a toda tu familia. Envío gratuito." />
        <meta name="keywords" content="botón SOS Sevilla, dispositivo emergencia Sevilla, teleasistencia Sevilla, seguridad mayores Sevilla, localizador GPS Sevilla" />
        <link rel="canonical" href="https://manoprotectt.com/boton-sos-sevilla" />
        <script type="application/ld+json">{JSON.stringify(schemaLocalBusiness)}</script>
      </Helmet>

      <LandingHeader />
      <nav className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500" data-testid="breadcrumb-sevilla">
        <Link to="/" className="hover:text-[#4CAF50]">Inicio</Link><span className="mx-2">/</span><span className="text-gray-900 font-medium">Sevilla</span>
      </nav>

      <section className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-16 lg:py-24" data-testid="hero-sevilla">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6"><MapPin className="w-4 h-4" />Entrega y soporte en Sevilla</div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Botón SOS en Sevilla – <span className="text-amber-600">Entrega y Soporte Local</span></h1>
          <p className="text-xl text-gray-600 mb-8">Compra tu botón SOS físico en Sevilla con entrega rápida, soporte local y configuración guiada. Protege a toda tu familia: niños, adultos y mayores. Envío gratuito.</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Link to="/servicios-sos"><Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-lg px-8 py-6 rounded-xl" data-testid="cta-comprar-sevilla">Comprar Botón SOS en Sevilla<ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
            <a href="https://wa.me/34601510950?text=Hola,%20quiero%20info%20del%20bot%C3%B3n%20SOS%20en%20Sevilla" target="_blank" rel="noopener noreferrer"><Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl"><Phone className="w-5 h-5 mr-2" />WhatsApp Sevilla</Button></a>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Truck className="w-4 h-4 text-amber-500" />Envío gratuito Sevilla</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" />Oferta hasta 30 de Marzo</span>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Beneficios de Comprar en Sevilla</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Truck className="w-8 h-8" />, title: "Envío gratuito y rápido", desc: "Entrega en 24-48h en toda la provincia.", color: "bg-amber-100 text-amber-600" },
              { icon: <Phone className="w-8 h-8" />, title: "Soporte técnico local", desc: "Atención personalizada por teléfono y WhatsApp.", color: "bg-blue-100 text-blue-600" },
              { icon: <Users className="w-8 h-8" />, title: "+400 familias en Sevilla", desc: "Familias sevillanas que confían en ManoProtect.", color: "bg-green-100 text-green-600" },
              { icon: <Heart className="w-8 h-8" />, title: "Todos los modelos", desc: "Sentinel J, Sentinel X y Botón SOS Senior.", color: "bg-purple-100 text-purple-600" }
            ].map((a, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${a.color}`}>{a.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{a.title}</h3><p className="text-gray-600 text-sm">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50" data-testid="testimonials-sevilla">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Opiniones de Clientes en Sevilla</h2>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Cobertura en Sevilla</h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {zones.map((z, i) => (<span key={i} className="bg-gray-50 px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700"><MapPin className="w-3 h-3 inline mr-1 text-amber-500" />{z}</span>))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-2">Protege a tu familia en Sevilla</h2>
          <p className="text-amber-100 mb-8">Envío gratuito | Soporte local | Oferta hasta 30 de Marzo</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/servicios-sos"><Button size="lg" className="bg-white text-amber-700 hover:bg-amber-50 text-lg px-10 py-6 rounded-xl font-bold">Comprar Botón SOS en Sevilla<ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
            <a href="tel:+34601510950"><Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl"><Phone className="w-5 h-5 mr-2" />601 510 950</Button></a>
          </div>
        </div>
      </section>
      <LandingFooter />
    </div>
  );
};

export default BotonSOSSevilla;
