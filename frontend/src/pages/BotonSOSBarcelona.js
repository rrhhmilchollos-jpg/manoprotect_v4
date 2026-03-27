/**
 * ManoProtect - Landing Local SEO: Botón SOS en Barcelona
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, MapPin, Phone, CheckCircle, Star, ArrowRight, Truck, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const BotonSOSBarcelona = () => {
  const schemaLocalBusiness = {
    "@context": "https://schema.org", "@type": "LocalBusiness",
    "name": "ManoProtect Barcelona",
    "description": "Venta y soporte de dispositivos de seguridad personal con botón SOS en Barcelona.",
    "address": { "@type": "PostalAddress", "addressLocality": "Barcelona", "addressRegion": "Cataluña", "postalCode": "08000", "addressCountry": "ES" },
    "geo": { "@type": "GeoCoordinates", "latitude": 41.3874, "longitude": 2.1686 },
    "url": "https://manoprotectt.com/boton-sos-barcelona",
    "telephone": "+34601510950",
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "189" }
  };

  const testimonials = [
    { name: "Montserrat V.", location: "Eixample, Barcelona", text: "Mi madre vive sola en Gràcia. Con el botón SOS sabemos que puede pedir ayuda al instante. La entrega fue rapidísima y el soporte excelente.", rating: 5 },
    { name: "Jordi S.", location: "Sant Martí, Barcelona", text: "Compré un Sentinel J para mi hija y un Sentinel X para mí. Los dos funcionan perfecto. El GPS es muy preciso incluso en el metro.", rating: 5 },
    { name: "Anna M.", location: "Hospitalet de Llobregat", text: "Para mi padre con principio de Alzheimer, el botón SOS con zonas seguras es fundamental. Si sale de casa, nos avisa inmediatamente.", rating: 5 },
    { name: "Pere G.", location: "Badalona", text: "Empresa seria con soporte real. Tuve una duda con la configuración y me llamaron en menos de 5 minutos. Así da gusto.", rating: 5 }
  ];

  const zones = ["Barcelona ciudad", "L'Hospitalet", "Badalona", "Terrassa", "Sabadell", "Santa Coloma", "Cornellà", "Sant Boi", "Castelldefels", "Cerdanyola", "Mollet del Vallès", "Gavà", "Viladecans", "Granollers", "El Prat de Llobregat", "Rubí", "Manresa", "Sant Cugat", "Mataró", "Vilanova i la Geltrú"];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Botón SOS Barcelona | Compra y Atención Local</title>
        <meta name="description" content="Compra tu botón SOS físico en Barcelona con entrega rápida y soporte local. Protege a toda tu familia. Envío gratuito." />
        <meta name="keywords" content="botón SOS Barcelona, dispositivo emergencia Barcelona, teleasistencia Barcelona, seguridad mayores Barcelona, localizador GPS Barcelona" />
        <link rel="canonical" href="https://manoprotectt.com/boton-sos-barcelona" />
        <script type="application/ld+json">{JSON.stringify(schemaLocalBusiness)}</script>
      </Helmet>

      <LandingHeader />
      <nav className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500" data-testid="breadcrumb-barcelona">
        <Link to="/" className="hover:text-[#4CAF50]">Inicio</Link><span className="mx-2">/</span><span className="text-gray-900 font-medium">Barcelona</span>
      </nav>

      <section className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 py-16 lg:py-24" data-testid="hero-barcelona">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6"><MapPin className="w-4 h-4" />Entrega y soporte en Barcelona</div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Botón SOS en Barcelona – <span className="text-blue-600">Entrega y Soporte Local</span></h1>
          <p className="text-xl text-gray-600 mb-8">Compra tu botón SOS físico en Barcelona y protege a tus hijos, adultos o mayores. Entrega rápida en toda la provincia, soporte local y configuración guiada. Envío gratuito.</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Link to="/servicios-sos"><Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-xl" data-testid="cta-comprar-barcelona">Comprar Botón SOS en Barcelona<ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
            <a href="https://wa.me/34601510950?text=Hola,%20quiero%20info%20del%20bot%C3%B3n%20SOS%20en%20Barcelona" target="_blank" rel="noopener noreferrer"><Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl"><Phone className="w-5 h-5 mr-2" />WhatsApp Barcelona</Button></a>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Truck className="w-4 h-4 text-blue-500" />Envío gratuito Barcelona</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" />Oferta hasta 30 de Marzo</span>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Beneficios de Comprar en Barcelona</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Truck className="w-8 h-8" />, title: "Envío gratuito y rápido", desc: "Entrega en 24-48h en toda la provincia.", color: "bg-blue-100 text-blue-600" },
              { icon: <Phone className="w-8 h-8" />, title: "Soporte técnico local", desc: "Atención en castellano y catalán.", color: "bg-sky-100 text-sky-600" },
              { icon: <Users className="w-8 h-8" />, title: "+600 familias en Barcelona", desc: "Familias catalanas que confían en ManoProtect.", color: "bg-green-100 text-green-600" },
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

      <section className="py-16 bg-gray-50" data-testid="testimonials-barcelona">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Opiniones de Clientes en Barcelona</h2>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Cobertura en Barcelona</h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {zones.map((z, i) => (<span key={i} className="bg-gray-50 px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700"><MapPin className="w-3 h-3 inline mr-1 text-blue-500" />{z}</span>))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-2">Protege a tu familia en Barcelona</h2>
          <p className="text-blue-100 mb-8">Envío gratuito | Soporte local | Oferta hasta 30 de Marzo</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/servicios-sos"><Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-10 py-6 rounded-xl font-bold">Comprar Botón SOS en Barcelona<ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
            <a href="tel:+34601510950"><Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl"><Phone className="w-5 h-5 mr-2" />601 510 950</Button></a>
          </div>
        </div>
      </section>
      <LandingFooter />
    </div>
  );
};

export default BotonSOSBarcelona;
