/**
 * ManoProtect - Testimonials Section
 * Clean testimonial cards with real reviews
 */
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Selomit",
    text: "Llevo tiempo utilizándola, estoy tranquila. Tengo dos adolescentes y las tengo controladas, sé dónde están.",
    rating: 5,
    date: "Febrero 2025",
    source: "Google Play"
  },
  {
    id: 2,
    name: "María Deseada S.",
    text: "Muy útil con mi madre de 78 años para saber dónde está en todo momento y tener controlado en caso de caída.",
    rating: 5,
    date: "Febrero 2025",
    source: "Google Play"
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
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              data-testid={`testimonial-${testimonial.id}`}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4" role="img" aria-label={`${testimonial.rating} estrellas`}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <Quote className="w-8 h-8 text-indigo-200 mb-3" />
              
              <blockquote className="text-slate-700 leading-relaxed mb-6">
                "{testimonial.text}"
              </blockquote>

              {/* Author */}
              <footer className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.source}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{testimonial.date}</span>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
