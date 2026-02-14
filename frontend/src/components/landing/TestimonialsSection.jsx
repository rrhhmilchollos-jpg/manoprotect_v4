/**
 * ManoProtect - Testimonials Section
 * Clean testimonial cards with real reviews
 */
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Selomit García",
    role: "Madre de familia",
    location: "Madrid",
    text: "Llevo 6 meses utilizando ManoProtect y estoy muy tranquila. Tengo dos adolescentes y puedo saber dónde están en todo momento. La detección de SMS fraudulentos me ha salvado de 3 intentos de phishing.",
    rating: 5,
    date: "Febrero 2025",
    source: "Google Play",
    verified: true
  },
  {
    id: 2,
    name: "María Deseada Sánchez",
    role: "Cuidadora familiar",
    location: "Barcelona",
    text: "Imprescindible para cuidar a mi madre de 78 años. El botón SOS nos da mucha tranquilidad, sabemos dónde está en todo momento y en caso de caída podemos actuar rápido. El soporte responde en minutos.",
    rating: 5,
    date: "Febrero 2025",
    source: "Google Play",
    verified: true
  },
  {
    id: 3,
    name: "Carlos Martínez",
    role: "Empresario autónomo",
    location: "Valencia",
    text: "Como autónomo recibo muchos emails de phishing intentando robar datos bancarios. ManoProtect los detecta antes de que haga clic. Ya no tengo miedo de abrir correos sospechosos.",
    rating: 5,
    date: "Enero 2025",
    source: "App Store",
    verified: true
  }
];

const TestimonialsSection = () => {
  return (
    <section className="px-6 py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3">
            Testimonios
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-slate-600">
            Reseñas reales de familias que confían en ManoProtect
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              data-testid={`testimonial-${testimonial.id}`}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100"
            >
              {/* Stars + Verified Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1" role="img" aria-label={`${testimonial.rating} estrellas`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                {testimonial.verified && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                    </svg>
                    Verificado
                  </span>
                )}
              </div>

              {/* Quote */}
              <Quote className="w-6 h-6 text-indigo-200 mb-3" />
              
              <blockquote className="text-slate-700 leading-relaxed mb-6 text-sm">
                "{testimonial.text}"
              </blockquote>

              {/* Author */}
              <footer className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}, {testimonial.location}</p>
                  </div>
                </div>
              </footer>
              
              {/* Source */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                <span className="text-xs text-slate-400">{testimonial.source}</span>
                <span className="text-xs text-slate-400">{testimonial.date}</span>
              </div>
            </article>
          ))}
        </div>
        
        {/* Trust Stats */}
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">4.8</div>
            <div className="text-sm text-slate-500">Valoración media</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">10K+</div>
            <div className="text-sm text-slate-500">Familias protegidas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">50K+</div>
            <div className="text-sm text-slate-500">Amenazas bloqueadas</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
