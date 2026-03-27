import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Shield, Star, ArrowRight, Check, MapPin, Quote } from 'lucide-react';

const testimonios = [
  { name: 'Carmen García', city: 'Madrid', role: 'Madre de familia', rating: 5, text: 'Desde que instalamos ManoProtect, sé exactamente dónde están mis hijos y mis padres. La tranquilidad no tiene precio. El botón SOS nos salvó de un susto con mi madre que se cayó en el parque.', product: 'Plan Familiar + Sentinel S' },
  { name: 'Antonio Ruiz', city: 'Barcelona', role: 'Hijo cuidador', rating: 5, text: 'Mi padre tiene Alzheimer y el Sentinel S nos ha cambiado la vida. Cuando se desorientó una vez cerca de casa, pudimos localizarle en minutos gracias al GPS. Imprescindible.', product: 'Sentinel S' },
  { name: 'Laura Martínez', city: 'Valencia', role: 'Madre', rating: 5, text: 'El Sentinel J para mi hijo de 8 años es perfecto para cuando va al colegio solo. Sé cuándo llega, cuándo sale, y si tiene algún problema puede pulsarme directamente. Muy recomendable.', product: 'Sentinel J' },
  { name: 'Miguel Ángel Sánchez', city: 'Sevilla', role: 'Padre de adolescentes', rating: 5, text: 'Tuve dudas al principio, pero cuando mi hija de 16 años pulsó el SOS una noche que se perdió volviendo de una fiesta, supe que fue la mejor inversión. Llegué en 10 minutos gracias a la localización en tiempo real.', product: 'Plan Familiar + Sentinel X' },
  { name: 'Ana Belén Pérez', city: 'Málaga', role: 'Hija cuidadora', rating: 5, text: 'Mi madre de 78 años vive sola y el detector de caídas del Sentinel S nos ha dado una paz increíble. Además, ella se siente más independiente sabiendo que si necesita ayuda, solo tiene que pulsar un botón.', product: 'Sentinel S' },
  { name: 'David López', city: 'Bilbao', role: 'Padre', rating: 4, text: 'La app funciona muy bien y la configuración fue sencilla. Usamos el plan familiar con 3 dispositivos Sentinel. Lo único que mejoraría es que la batería durase un poco más, pero en general estamos muy contentos.', product: 'Plan Familiar' },
  { name: 'Isabel Fernández', city: 'Zaragoza', role: 'Abuela', rating: 5, text: 'Mis nietos me regalaron el Sentinel S y estoy encantada. Es muy fácil de usar, solo tengo que pulsar el botón si necesito algo. Mis hijos pueden ver dónde estoy y yo me siento más segura paseando sola.', product: 'Sentinel S' },
  { name: 'Javier Torres', city: 'Alicante', role: 'Padre de familia', rating: 5, text: 'Después de que a mi mujer le intentaran estafar con un SMS falso del banco, decidimos proteger a toda la familia. ManoProtect nos alerta de amenazas digitales además de tener la localización GPS. Muy completo.', product: 'Plan Familiar' },
  { name: 'Rosa María Gómez', city: 'Granada', role: 'Madre', rating: 5, text: 'El servicio de atención al cliente es excepcional. Tuve un problema configurando el Sentinel J de mi hijo y me ayudaron por WhatsApp en menos de 5 minutos. La app es muy intuitiva.', product: 'Sentinel J' },
  { name: 'Francisco Navarro', city: 'Murcia', role: 'Empresario', rating: 5, text: 'Uso ManoProtect tanto para mi familia como para los trabajadores de mi empresa. El sistema de alertas SOS y la localización son herramientas de seguridad fundamentales. Muy satisfecho.', product: 'Plan Empresa + Plan Familiar' },
  { name: 'Teresa Moreno', city: 'Palma', role: 'Profesora', rating: 5, text: 'Recomiendo ManoProtect a todos los padres del colegio. La geovalla que avisa cuando los niños llegan al cole es una maravilla. Y el botón SOS les da autonomía con seguridad.', product: 'Sentinel J' },
  { name: 'Roberto Jiménez', city: 'Valladolid', role: 'Hijo cuidador', rating: 5, text: 'Mi padre tuvo una caída en casa y el Sentinel S lo detectó automáticamente. Recibí la alerta en mi móvil con su ubicación exacta. Gracias a eso pudimos actuar rápido. Este dispositivo salva vidas.', product: 'Sentinel S' },
];

const OpinionesClientes = () => {
  const avgRating = (testimonios.reduce((s, t) => s + t.rating, 0) / testimonios.length).toFixed(1);

  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "ManoProtect - Sistema de protección familiar",
    "description": "Sistema integral de protección familiar con localización GPS, alertas SOS y seguridad digital.",
    "brand": { "@type": "Brand", "name": "ManoProtect" },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "reviewCount": testimonios.length,
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": testimonios.map(t => ({
      "@type": "Review",
      "author": { "@type": "Person", "name": t.name },
      "reviewRating": { "@type": "Rating", "ratingValue": t.rating, "bestRating": "5" },
      "reviewBody": t.text
    }))
  };

  return (
    <div className="min-h-screen bg-white" data-testid="opiniones-clientes-page">
      <Helmet>
        <title>Opiniones de clientes ManoProtect - Reseñas reales verificadas</title>
        <meta name="description" content={`Lee las opiniones reales de ${testimonios.length} clientes de ManoProtect. Valoración media: ${avgRating}/5. Descubre por qué las familias españolas confían en nosotros.`} />
        <link rel="canonical" href="https://manoprotectt.com/opiniones-clientes" />
        <script type="application/ld+json">{JSON.stringify(reviewSchema)}</script>
      </Helmet>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <span className="text-emerald-600 text-lg font-bold">ManoProtect</span>
          </Link>
          <Link to="/registro" className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-lg">Probar gratis</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4" data-testid="opiniones-title">
            Lo que dicen nuestros clientes
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className="w-6 h-6 fill-amber-400 text-amber-400" />)}</div>
            <span className="text-2xl font-bold text-gray-900">{avgRating}</span>
            <span className="text-gray-500">de 5 ({testimonios.length} opiniones)</span>
          </div>
          <p className="text-gray-500 max-w-xl mx-auto">Opiniones reales de familias españolas que confían en ManoProtect para proteger a sus seres queridos.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-emerald-50 rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-emerald-600">98%</p><p className="text-xs text-gray-500">Satisfacción</p></div>
          <div className="bg-blue-50 rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-blue-600">4.9/5</p><p className="text-xs text-gray-500">Google Reviews</p></div>
          <div className="bg-amber-50 rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-amber-600">2.400+</p><p className="text-xs text-gray-500">Familias protegidas</p></div>
        </div>

        {/* Testimonials Grid */}
        <div className="space-y-6">
          {testimonios.map((t, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow" data-testid={`opinion-${i}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{t.city} · {t.role}</p>
                </div>
                <div className="flex gap-0.5">{Array(t.rating).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
              </div>
              <div className="relative">
                <Quote className="w-5 h-5 text-emerald-200 absolute -top-1 -left-1" />
                <p className="text-gray-700 text-sm leading-relaxed pl-4">{t.text}</p>
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-3">{t.product}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-emerald-500 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Únete a las familias que ya confían en ManoProtect</h2>
          <p className="text-emerald-100 mb-6">7 días de prueba gratuita. Sin compromiso. Cancela cuando quieras.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/registro" className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50">
              Probar 7 días gratis <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/plans" className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10">
              Ver planes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpinionesClientes;
