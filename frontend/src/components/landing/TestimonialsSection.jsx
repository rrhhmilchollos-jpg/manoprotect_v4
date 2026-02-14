/**
 * ManoProtect - Testimonials Section
 * Shows real user reviews from database + verified testimonials
 * Includes rating submission for logged-in users
 */
import { useState, useEffect } from 'react';
import { Star, Quote, Check, ChevronLeft, ChevronRight, MessageSquarePlus } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Static verified testimonials (always shown as featured)
const featuredTestimonials = [
  {
    id: 'featured-1',
    name: "Selomit García",
    role: "Madre de familia",
    location: "Madrid",
    text: "Llevo 6 meses utilizando ManoProtect y estoy muy tranquila. Tengo dos adolescentes y puedo saber dónde están en todo momento. La detección de SMS fraudulentos me ha salvado de 3 intentos de phishing.",
    rating: 5,
    date: "Febrero 2025",
    source: "Google Play",
    verified: true,
    isFeatured: true
  },
  {
    id: 'featured-2',
    name: "María Deseada Sánchez",
    role: "Cuidadora familiar",
    location: "Barcelona",
    text: "Imprescindible para cuidar a mi madre de 78 años. El botón SOS nos da mucha tranquilidad, sabemos dónde está en todo momento y en caso de caída podemos actuar rápido. El soporte responde en minutos.",
    rating: 5,
    date: "Febrero 2025",
    source: "Google Play",
    verified: true,
    isFeatured: true
  },
  {
    id: 'featured-3',
    name: "Carlos Martínez",
    role: "Empresario autónomo",
    location: "Valencia",
    text: "Como autónomo recibo muchos emails de phishing intentando robar datos bancarios. ManoProtect los detecta antes de que haga clic. Ya no tengo miedo de abrir correos sospechosos.",
    rating: 5,
    date: "Enero 2025",
    source: "App Store",
    verified: true,
    isFeatured: true
  }
];

const TestimonialsSection = () => {
  const [stats, setStats] = useState({
    families_protected: 0,
    threats_blocked: 0,
    average_rating: 0,
    total_reviews: 0
  });
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const reviewsPerPage = 3;

  useEffect(() => {
    fetchStats();
    fetchUserReviews();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/public/landing-stats`);
      if (res.ok) {
        const data = await res.json();
        setStats({
          families_protected: data.families_protected || 0,
          threats_blocked: data.threats_blocked || 0,
          average_rating: data.average_rating || 0,
          total_reviews: data.total_reviews || 0
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/public?limit=20&min_rating=3`);
      if (res.ok) {
        const data = await res.json();
        setUserReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  // Combine featured testimonials with user reviews
  const allReviews = [...featuredTestimonials, ...userReviews.map(r => ({
    id: r.review_id,
    name: r.user_name,
    role: r.user_plan,
    location: r.location || 'España',
    text: r.comment,
    rating: r.rating,
    date: new Date(r.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
    source: 'ManoProtect',
    verified: r.verified,
    initial: r.user_initial
  }))];

  const totalPages = Math.ceil(allReviews.length / reviewsPerPage);
  const displayedReviews = allReviews.slice(
    currentPage * reviewsPerPage,
    (currentPage + 1) * reviewsPerPage
  );

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <section className="px-6 py-20 bg-slate-50" data-testid="testimonials-section">
      <div className="max-w-6xl mx-auto">
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
          
          {/* Rating Summary */}
          {stats.total_reviews > 0 && (
            <div className="mt-6 flex items-center justify-center gap-2" data-testid="rating-summary">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(stats.average_rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-slate-900">{stats.average_rating.toFixed(1)}</span>
              <span className="text-slate-500">({stats.total_reviews} valoraciones)</span>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={prevPage}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow border border-slate-200"
              aria-label="Ver testimonios anteriores"
              data-testid="prev-testimonials-btn"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <span className="flex items-center text-sm text-slate-500">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow border border-slate-200"
              aria-label="Ver más testimonios"
              data-testid="next-testimonials-btn"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        )}

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {displayedReviews.map((testimonial) => (
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
                    <Check className="w-3 h-3" />
                    Verificado
                  </span>
                )}
              </div>

              {/* Quote */}
              <Quote className="w-6 h-6 text-indigo-200 mb-3" />
              
              <blockquote className="text-slate-700 leading-relaxed mb-6 text-sm line-clamp-4">
                "{testimonial.text}"
              </blockquote>

              {/* Author */}
              <footer className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.initial || testimonial.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}, {testimonial.location}</p>
                  </div>
                </div>
              </footer>
              
              {/* Source & Date */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                <span className="text-xs text-slate-400">{testimonial.source}</span>
                <span className="text-xs text-slate-400">{testimonial.date}</span>
              </div>
            </article>
          ))}
        </div>

        {/* CTA to leave review */}
        <div className="mt-10 text-center">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            data-testid="leave-review-cta"
          >
            <MessageSquarePlus className="w-5 h-5" />
            ¿Eres cliente? Deja tu valoración
          </a>
        </div>
        
        {/* Trust Stats - Real Data from Database */}
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          <div className="text-center" data-testid="stat-rating">
            <div className="text-3xl font-bold text-indigo-600">
              {loading ? '...' : stats.average_rating > 0 ? stats.average_rating.toFixed(1) : '—'}
            </div>
            <div className="text-sm text-slate-500">Valoración media</div>
          </div>
          <div className="text-center" data-testid="stat-families">
            <div className="text-3xl font-bold text-indigo-600">
              {loading ? '...' : stats.families_protected > 0 ? formatNumber(stats.families_protected) : '—'}
            </div>
            <div className="text-sm text-slate-500">Familias protegidas</div>
          </div>
          <div className="text-center" data-testid="stat-threats">
            <div className="text-3xl font-bold text-indigo-600">
              {loading ? '...' : stats.threats_blocked > 0 ? formatNumber(stats.threats_blocked) : '—'}
            </div>
            <div className="text-sm text-slate-500">Amenazas bloqueadas</div>
          </div>
          {stats.total_reviews > 0 && (
            <div className="text-center" data-testid="stat-reviews">
              <div className="text-3xl font-bold text-indigo-600">
                {formatNumber(stats.total_reviews)}
              </div>
              <div className="text-sm text-slate-500">Valoraciones</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
