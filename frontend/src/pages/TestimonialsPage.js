/**
 * ManoProtect - Testimonios y Casos de Uso
 * Testimonios reales + Casos: niños, adolescentes, adultos mayores
 */
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Star, ArrowRight, Users, Heart, MapPin } from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

const testimonials = [
  { text: 'Gracias a ManoProtect, mi hijo estaba seguro durante su excursión escolar. Recibí su ubicación en tiempo real y pude estar tranquila todo el día. La notificación SOS me da una paz increíble.', name: 'Ana García', role: 'Madre de dos hijos', city: 'Madrid', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face', product: 'Sentinel J', rating: 5 },
  { text: 'Puedo cuidar de mi padre y saber que está protegido todo el día. La alerta anti-retirada del Sentinel S me da una tranquilidad que no tiene precio. Ya no me preocupo cuando sale a caminar.', name: 'Carlos Martín', role: 'Hijo cuidador', city: 'Barcelona', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face', product: 'Sentinel S', rating: 5 },
  { text: 'Mi hija lleva el Sentinel J al cole y las zonas seguras me avisan cuando llega. Sin cámara ni internet para ella, solo seguridad GPS. Es exactamente lo que buscaba como padre.', name: 'Laura M.', role: 'Madre', city: 'Valencia', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face', product: 'Sentinel J', rating: 5 },
  { text: 'El botón SOS funciona incluso con la pantalla bloqueada. Lo probamos el primer día y la notificación llegó al instante. Muy recomendable para cualquier familia.', name: 'Roberto Pérez', role: 'Padre', city: 'Sevilla', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face', product: 'Sentinel X', rating: 5 },
  { text: 'Mi madre tiene Alzheimer y el Sentinel S nos permite saber dónde está en todo momento. La alerta de zona segura ha sido vital dos veces ya. No podríamos vivir sin ManoProtect.', name: 'María José R.', role: 'Hija cuidadora', city: 'Málaga', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face', product: 'Sentinel S', rating: 5 },
  { text: 'Mis tres hijos llevan los Sentinel J al parque. Puedo ver dónde están todos a la vez desde la app. Les encanta elegir los colores de las correas.', name: 'Javier Sánchez', role: 'Padre de familia numerosa', city: 'Bilbao', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face', product: 'Sentinel J', rating: 5 },
];

const useCases = [
  { title: 'Niños (3-12 años)', subtitle: 'Tranquilidad inmediata en el cole y en el parque', desc: 'Con el Sentinel J, los padres reciben alertas cuando su hijo llega al colegio, sale de una zona segura o pulsa el botón SOS. Sin cámara ni internet: solo localización GPS y seguridad.', product: 'Sentinel J', color: 'pink', img: 'https://static.prod-images.emergentagent.com/jobs/9da3b4c4-c09a-415b-8aa7-bb34b82ca31e/images/910a9c2ec4bd34474c8f1f73a4011a40e480c1a6c2227fd17299b6a14e326ad7.png' },
  { title: 'Adolescentes (12-18 años)', subtitle: 'Independencia con seguridad', desc: 'El Sentinel X permite a los adolescentes tener su propio reloj inteligente con GPS y SOS invisible. Los padres pueden ver la ubicación sin ser intrusivos. Conectividad 4G para funcionar de forma autónoma.', product: 'Sentinel X', color: 'emerald', img: 'https://static.prod-images.emergentagent.com/jobs/9da3b4c4-c09a-415b-8aa7-bb34b82ca31e/images/b49eca79b0e4d85e473edb0b4a8e4e645f3d8e9df5d387da0cb1466ec672cf39.png' },
  { title: 'Adultos mayores (65+)', subtitle: 'Seguridad familiar sin complicaciones', desc: 'El Sentinel S es discreto, elegante y fácil de usar. Botón SOS silencioso, alerta anti-retirada y sirena de 120dB. Perfecto para personas con Alzheimer o movilidad reducida.', product: 'Sentinel S', color: 'violet', img: 'https://static.prod-images.emergentagent.com/jobs/9da3b4c4-c09a-415b-8aa7-bb34b82ca31e/images/7ad5d961d432cd41064d5a0c5ad6a516bc92a9e6d960fca3881e0e8fc7f2b06a.png' },
];

const TestimonialsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Testimonios y Casos de Uso | ManoProtect</title>
        <meta name="description" content="Descubre cómo ManoProtect protege a familias con los relojes Sentinel X, J y S. Testimonios reales de padres, hijos y cuidadores." />
        <link rel="canonical" href="https://manoprotect.com/testimonios" />
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <span className="text-emerald-600 text-lg font-bold">ManoProtect</span>
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-emerald-600">Volver al inicio</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white text-center" data-testid="testimonials-hero">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Heart className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3" data-testid="testimonials-title">Lo que dicen nuestras familias</h1>
          <p className="text-lg text-gray-500">Historias reales de tranquilidad y seguridad familiar.</p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 bg-white" data-testid="testimonials-grid">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow" data-testid={`testimonial-card-${i}`}>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({length: t.rating}).map((_, s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-gray-600 mb-5 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3 mb-3">
                  <img src={t.img} alt={t.name} className="w-11 h-11 rounded-full object-cover" loading="lazy" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role} – {t.city}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 font-semibold px-2 py-1 rounded-md">
                  <Shield className="w-3 h-3" /> Usa {t.product}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cases */}
      <section className="py-16 bg-slate-50" data-testid="use-cases-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Casos de uso</h2>
            <p className="text-gray-500">Un Sentinel para cada miembro de tu familia.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {useCases.map((uc, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow" data-testid={`use-case-${i}`}>
                <img src={uc.img} alt={uc.title} className="w-full h-48 object-cover" loading="lazy" />
                <div className="p-6">
                  <span className={`inline-block text-xs font-bold px-2 py-1 rounded-full mb-3 ${
                    uc.color === 'pink' ? 'bg-pink-100 text-pink-600' :
                    uc.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-violet-100 text-violet-600'
                  }`}>{uc.product}</span>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{uc.title}</h3>
                  <p className="text-sm text-emerald-600 font-medium mb-3">{uc.subtitle}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{uc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-emerald-600" data-testid="testimonials-cta">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Únete a miles de familias protegidas</h2>
          <p className="text-emerald-100 mb-8 text-lg">Tranquilidad inmediata. Seguridad familiar. 7 días de prueba gratis.</p>
          <button
            onClick={() => navigate('/registro')}
            className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold px-10 py-5 rounded-xl hover:bg-emerald-50 transition-all text-lg shadow-xl hover:scale-105"
            data-testid="testimonials-cta-btn"
          >
            Probar 7 días gratis <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default TestimonialsPage;
