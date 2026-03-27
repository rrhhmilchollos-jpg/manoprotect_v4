/**
 * ManoProtect - Testimonios y Casos de Uso
 * Testimonios reales + Casos: niños, adolescentes, adultos mayores
 */
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Star, ArrowRight, Users, Heart, MapPin } from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

const testimonials = [
  { text: 'Lo compramos para nuestro hijo de 9 años cuando empezó a ir solo al cole. La primera semana ya nos avisó que había llegado a casa de su abuela sin problemas. La app es muy fácil de usar y el reloj le encanta, no se lo quita. Lo mejor: la tranquilidad que nos da como padres.', name: 'Patricia Navarro', role: 'Madre', city: 'Getafe, Madrid', product: 'Sentinel J', rating: 5, time: 'Hace 2 semanas' },
  { text: 'Mi padre tiene principio de Alzheimer y se sale a caminar solo sin avisar. Desde que le pusimos el Sentinel S, sabemos exactamente dónde está. El otro día se desorientó volviendo del mercado y con el GPS pudimos ir a buscarle en 5 minutos. Una inversión que vale cada céntimo.', name: 'Alejandro Ruiz', role: 'Hijo cuidador', city: 'Hospitalet, Barcelona', product: 'Sentinel S', rating: 5, time: 'Hace 1 mes' },
  { text: 'Tenemos 3 hijos y cada uno lleva su Sentinel J con un color diferente. Las zonas seguras funcionan genial: nos avisa cuando llegan al cole, a las extraescolares y cuando salen. Mi marido y yo podemos ver todo desde nuestros móviles. El soporte por WhatsApp es rapidísimo.', name: 'Marta Jiménez', role: 'Madre de familia numerosa', city: 'Torrent, Valencia', product: 'Sentinel J', rating: 5, time: 'Hace 3 semanas' },
  { text: 'Soy monitor de campamentos y recomendé ManoProtect a varios padres. Es la única solución que funciona en zonas de montaña con 4G. Durante la última acampada en los Pirineos, todos los padres podían ver la ubicación de sus hijos en tiempo real. Impresionante.', name: 'David Fernández', role: 'Monitor de tiempo libre', city: 'Huesca, Aragón', product: 'Sentinel X', rating: 5, time: 'Hace 1 mes' },
  { text: 'Mi madre vive sola en el pueblo y tiene 82 años. Desde que le puse el Sentinel S está más tranquila ella y nosotros. La semana pasada se cayó haciendo la compra y pulsó el botón SOS. Nos llegó la notificación al instante con su ubicación exacta. Llegamos en minutos.', name: 'Carmen López', role: 'Hija', city: 'Córdoba, Andalucía', product: 'Sentinel S', rating: 5, time: 'Hace 2 meses' },
  { text: 'Mi hija de 14 años va en transporte público al instituto. Con el Sentinel X puedo ver que llega bien sin tener que llamarla cada día. Ella está contenta porque el reloj es bonito y no parece "de control". A mí me da paz. Relación calidad-precio espectacular con el plan anual.', name: 'Francisco García', role: 'Padre', city: 'Málaga, Andalucía', product: 'Sentinel X', rating: 5, time: 'Hace 3 semanas' },
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
        <link rel="canonical" href="https://manoprotectt.com/testimonios" />
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
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition-all duration-300" data-testid={`testimonial-card-${i}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">{Array.from({length: t.rating}).map((_, s) => <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 opacity-40" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <p className="text-[13px] text-gray-600 mb-5 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">{t.name.charAt(0)}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role} · {t.city}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded">Usa {t.product}</span>
                  <span className="text-[10px] text-gray-400">{t.time}</span>
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
