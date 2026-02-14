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
