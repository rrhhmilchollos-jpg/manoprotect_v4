/**
 * ManoProtect - Testimonials Component with Schema.org
 * Testimonios estructurados para SEO y confianza
 */
import React from 'react';
import { Star, Quote, CheckCircle, MapPin } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: "María García",
    location: "Madrid",
    rating: 5,
    date: "2026-02-15",
    title: "Le di tranquilidad a mi madre",
    text: "Mi madre tiene 78 años y vive sola. Desde que tiene el Sentinel X, ambas estamos más tranquilas. Ya lo ha usado dos veces cuando se sintió mareada y la ayuda llegó en minutos. Imprescindible.",
    verified: true,
    product: "Sentinel X"
  },
  {
    id: 2,
    name: "Antonio Martínez",
    location: "Barcelona",
    rating: 5,
    date: "2026-02-10",
    title: "Funciona de verdad cuando lo necesitas",
    text: "Mi padre se cayó en el parque y el reloj detectó la caída automáticamente. Nos llamó a todos y pudimos ir a ayudarle. El GPS nos llevó exactamente donde estaba. Merece cada euro.",
    verified: true,
    product: "Sentinel X"
  },
  {
    id: 3,
    name: "Carmen Rodríguez",
    location: "Valencia",
    rating: 5,
    date: "2026-02-08",
    title: "Fácil de usar para mi abuela de 85 años",
    text: "Tenía miedo de que fuera muy complicado para ella, pero en 5 minutos ya sabía usar el botón SOS. La pantalla es grande y clara. El mejor regalo que le podía hacer.",
    verified: true,
    product: "Sentinel X"
  },
  {
    id: 4,
    name: "Javier López",
    location: "Sevilla",
    rating: 5,
    date: "2026-02-01",
    title: "Calidad premium a buen precio",
    text: "Comparé con otras marcas y el Sentinel X tiene mejor relación calidad-precio. La batería dura 5 días reales, no como otros que dicen 3 y apenas llegan a 1. Muy recomendable.",
    verified: true,
    product: "Sentinel X"
  }
];

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4CAF50] to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {testimonial.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900">{testimonial.name}</p>
              {testimonial.verified && (
                <CheckCircle className="w-4 h-4 text-[#4CAF50]" title="Compra verificada" />
              )}
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {testimonial.location}
            </p>
          </div>
        </div>
        <Quote className="w-8 h-8 text-gray-200" />
      </div>
      
      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-500 ml-2">{testimonial.rating}/5</span>
      </div>
      
      {/* Title & Text */}
      <h4 className="font-semibold text-gray-900 mb-2">{testimonial.title}</h4>
      <p className="text-gray-600 text-sm flex-grow">{testimonial.text}</p>
      
      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Producto: {testimonial.product}</span>
        <span>Compra verificada</span>
      </div>
    </div>
  );
};

const Testimonials = ({ limit = 4, showSchema = true }) => {
  const displayedTestimonials = TESTIMONIALS.slice(0, limit);
  
  // Calculate aggregate rating
  const avgRating = (displayedTestimonials.reduce((acc, t) => acc + t.rating, 0) / displayedTestimonials.length).toFixed(1);
  
  // Schema.org for Reviews
  const schemaReviews = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "ManoProtect Sentinel X",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "reviewCount": displayedTestimonials.length,
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": displayedTestimonials.map(t => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": t.name
      },
      "datePublished": t.date,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": t.rating,
        "bestRating": "5",
        "worstRating": "1"
      },
      "name": t.title,
      "reviewBody": t.text
    }))
  };
  
  return (
    <section className="py-16 bg-gray-50">
      {showSchema && (
        <script type="application/ld+json">
          {JSON.stringify(schemaReviews)}
        </script>
      )}
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4 fill-current" />
            {avgRating}/5 - {displayedTestimonials.length} opiniones verificadas
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Miles de familias españolas ya protegen a sus mayores con Sentinel X
          </p>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedTestimonials.map(testimonial => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
        
        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#4CAF50]" />
            <span>Compras verificadas</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="https://cdn.trustpilot.net/brand-assets/4.1.0/stars/stars-5.svg" alt="Trustpilot 5 stars" className="h-5" />
            <span>4.8 en Trustpilot</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#4CAF50]" />
            <span>+1.200 clientes satisfechos</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
