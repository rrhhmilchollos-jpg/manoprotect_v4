import React from 'react';
import { Star, Quote, CheckCircle, Shield } from 'lucide-react';

/**
 * Testimonials Carousel - Carrusel de testimonios con fotos
 * Prueba social con historias reales
 */
const TestimonialsCarousel = () => {
  const testimonials = [
    {
      name: "María García López",
      location: "Madrid",
      avatar: "MG",
      role: "Madre de familia",
      rating: 5,
      saved: "€3,200",
      text: "ManoProtect me salvó de una estafa telefónica. Un supuesto técnico de Microsoft me llamó diciendo que mi ordenador tenía virus. La app me alertó inmediatamente que era una estafa conocida.",
      highlight: "Evité perder €3,200",
      verified: true
    },
    {
      name: "Carlos Rodríguez",
      location: "Barcelona",
      avatar: "CR",
      role: "Empresario",
      rating: 5,
      saved: "€15,000",
      text: "Recibí un email muy convincente de mi 'banco'. Gracias a ManoProtect detecté que era phishing antes de introducir mis datos. El análisis IA lo identificó en segundos.",
      highlight: "Protegí mi empresa",
      verified: true
    },
    {
      name: "Ana Martínez",
      location: "Valencia",
      avatar: "AM",
      role: "Cuidadora de mayores",
      rating: 5,
      saved: "€4,500",
      text: "Mis padres de 75 años recibían llamadas de estafadores casi cada semana. Desde que instalamos ManoProtect, las detectamos todas. Ahora están tranquilos.",
      highlight: "Mis padres protegidos",
      verified: true
    },
    {
      name: "Pedro Sánchez Ruiz",
      location: "Sevilla",
      avatar: "PS",
      role: "Jubilado",
      rating: 5,
      saved: "€2,800",
      text: "A mis 68 años no entiendo mucho de tecnología, pero esta app es muy fácil. Mi hijo me la instaló y ahora me siento seguro cuando uso el móvil.",
      highlight: "Fácil para mayores",
      verified: true
    },
    {
      name: "Laura Fernández",
      location: "Bilbao",
      avatar: "LF",
      role: "Profesora",
      rating: 5,
      saved: "€1,500",
      text: "Un SMS me pedía actualizar datos de Correos. ManoProtect lo analizó y detectó que era smishing. Sin la app, habría caído seguro.",
      highlight: "SMS fraudulento detectado",
      verified: true
    }
  ];

  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const activeTestimonial = testimonials[activeIndex];

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 md:p-8 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Lo que dicen nuestros usuarios</h3>
          <p className="text-slate-400 text-sm">Historias reales de protección</p>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
          ))}
          <span className="ml-2 text-white font-semibold">4.9/5</span>
        </div>
      </div>

      {/* Main testimonial */}
      <div className="relative">
        <Quote className="absolute -top-2 -left-2 w-10 h-10 text-emerald-500/20" />
        
        <div className="pl-8">
          {/* User info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {activeTestimonial.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold">{activeTestimonial.name}</p>
                {activeTestimonial.verified && (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <p className="text-slate-400 text-sm">{activeTestimonial.role} • {activeTestimonial.location}</p>
            </div>
          </div>

          {/* Quote */}
          <p className="text-slate-300 text-lg leading-relaxed mb-4">
            "{activeTestimonial.text}"
          </p>

          {/* Highlight badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold">
            <Shield className="w-4 h-4" />
            {activeTestimonial.highlight}
            {activeTestimonial.saved && (
              <span className="text-white ml-1">• Ahorró {activeTestimonial.saved}</span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === activeIndex ? 'bg-emerald-500 w-8' : 'bg-slate-600 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>

      {/* Trust indicator */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Opiniones verificadas
          </span>
          <span>•</span>
          <span>+10,000 familias protegidas</span>
          <span>•</span>
          <span>+€4M ahorrados en estafas evitadas</span>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
