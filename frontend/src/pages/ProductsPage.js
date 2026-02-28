/**
 * ManoProtect - Página de Productos Detallada
 * Fotos + detalles + comparativa completa X vs J vs S + CTA
 */
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Check, X, ArrowRight, Star, Battery, Droplets, Radio, AlertTriangle, Mic, Lock } from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

const SENTINEL_X_IMG = "https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png";
const SENTINEL_J_IMG = "https://static.prod-images.emergentagent.com/jobs/d9b76ada-9994-4215-9ba1-31b4da8dc333/images/691c09d64cba84d0a069b7937e6f2e651449be714b394f349f7e64ace5198a3a.png";
const SENTINEL_S_IMG = "https://static.prod-images.emergentagent.com/jobs/70b9cc4e-5cf4-48c1-b710-585bbf769faa/images/e4d94aa4babe28ec14a789ee54b85cfc6b5cafb807d95c003d7a26f35491fa3d.png";

const products = [
  {
    name: 'Sentinel X',
    slug: '/sentinel-x',
    img: SENTINEL_X_IMG,
    audience: 'Adultos y adolescentes',
    badge: 'ADULTOS',
    badgeColor: 'bg-emerald-100 text-emerald-600',
    color: 'emerald',
    pricing: [
      { tier: 'Basic (50 uds)', price: 'GRATIS*', note: '*Con plan Basic 9,99€/mes' },
      { tier: 'Fundadores', price: '199€', original: '249€' },
      { tier: 'Premium', price: '279€', original: '349€' },
    ],
    features: [
      'Pantalla AMOLED 1.4"', 'GPS + GLONASS + Galileo', 'Conectividad 4G LTE + Bluetooth 5.0',
      'Botón SOS invisible', 'Grabación en la nube (Premium)', 'Batería 5 días', 'Resistente al agua IP68', 'Sensor de ritmo cardíaco',
    ],
    useCases: ['Adolescentes independientes', 'Excursiones y viajes', 'Deporte al aire libre', 'Trabajo en zonas remotas'],
  },
  {
    name: 'Sentinel J',
    slug: '/sentinel-j',
    img: SENTINEL_J_IMG,
    audience: 'Niños de 3 a 12 años',
    badge: '3-12 AÑOS',
    badgeColor: 'bg-pink-100 text-pink-600',
    color: 'pink',
    pricing: [
      { tier: 'Promo -20%', price: '79€', original: '99€' },
    ],
    features: [
      'Diseño infantil colorido', 'GPS de alta precisión', '4G LTE', 'Botón SOS grande y accesible',
      '8 correas intercambiables', 'Batería 4 días', 'Resistente al agua IP67', 'Sin cámara ni acceso a internet',
    ],
    useCases: ['Colegio y extraescolares', 'Parque y juegos', 'Excursiones escolares', 'Vacaciones familiares'],
  },
  {
    name: 'Sentinel S',
    slug: '/sentinel-s',
    img: SENTINEL_S_IMG,
    audience: 'Adultos y personas mayores',
    badge: 'MAYORES',
    badgeColor: 'bg-violet-100 text-violet-600',
    color: 'violet',
    pricing: [
      { tier: 'Promo -20%', price: '103€', original: '129€' },
    ],
    features: [
      'Cerámica + acabado rose gold', 'GPS + GLONASS', '4G LTE', 'Botón SOS silencioso',
      'Alerta anti-retirada', 'Sirena integrada 120dB', 'Batería 3 días', 'Correas intercambiables pastel',
    ],
    useCases: ['Personas con Alzheimer', 'Movilidad reducida', 'Paseos independientes', 'Residencias y centros de día'],
  },
];

const comparisonRows = [
  ['GPS en tiempo real', true, true, true],
  ['Botón SOS', true, true, true],
  ['Resistente al agua', true, true, true],
  ['Conectividad 4G', true, true, true],
  ['Bluetooth 5.0', true, false, false],
  ['SOS invisible', true, false, true],
  ['Grabación en la nube', true, false, false],
  ['Correas intercambiables', false, true, true],
  ['Alerta anti-retirada', false, false, true],
  ['Sirena 120dB', false, false, true],
  ['Sin cámara ni internet', false, true, false],
  ['Sensor cardíaco', true, false, false],
];

const ProductsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Productos Sentinel X, J y S | ManoProtect – Comparativa completa</title>
        <meta name="description" content="Compara los relojes Sentinel X, J y S. GPS, SOS, batería extendida y más. Dispositivo GRATIS con tu suscripción ManoProtect." />
        <link rel="canonical" href="https://manoprotect.com/productos" />
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
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white text-center" data-testid="products-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4" data-testid="products-title">
            Elige tu <span className="text-emerald-500">Sentinel</span>
          </h1>
          <p className="text-lg text-gray-500 mb-2">Dispositivo GRATIS con cualquier suscripción.</p>
          <p className="text-emerald-600 font-semibold">Prueba 7 días gratis – Sin compromiso</p>
        </div>
      </section>

      {/* Product Cards */}
      <section className="py-16 bg-white" data-testid="products-cards">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {products.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border-2 border-gray-200 hover:shadow-xl transition-all group overflow-hidden" data-testid={`product-card-${i}`}>
                <div className="bg-slate-50 p-8 text-center">
                  <img src={p.img} alt={p.name} className="w-48 h-48 object-contain mx-auto group-hover:scale-105 transition-transform" loading="lazy" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${p.badgeColor}`}>{p.badge}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{p.name}</h2>
                  <p className="text-sm text-gray-500 mb-4">{p.audience}</p>

                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Funciones principales</h3>
                  <ul className="space-y-2 mb-6">
                    {p.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          p.color === 'emerald' ? 'text-emerald-500' :
                          p.color === 'pink' ? 'text-pink-500' :
                          'text-violet-500'
                        }`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ideal para</h3>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {p.useCases.map((uc, ui) => (
                      <span key={ui} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{uc}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl font-extrabold text-emerald-500">{p.price}</span>
                    <span className="text-sm text-gray-400 line-through">{p.originalPrice}</span>
                  </div>

                  <Link to={p.slug} className={`block w-full text-center py-3.5 font-bold rounded-xl transition-colors ${
                    p.color === 'emerald' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' :
                    p.color === 'pink' ? 'bg-pink-500 hover:bg-pink-600 text-white' :
                    'bg-[#2D2A33] hover:bg-[#3D3A43] text-white'
                  }`} data-testid={`product-cta-${i}`}>
                    Ver {p.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Comparison Table */}
      <section className="py-16 bg-slate-50" data-testid="products-comparison">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">Comparativa completa</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm" data-testid="full-comparison-table">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left text-sm font-bold text-gray-900 border-b">Función</th>
                  <th className="p-4 text-center border-b">
                    <img src={SENTINEL_X_IMG} alt="X" className="w-8 h-8 object-contain mx-auto mb-1" />
                    <span className="text-sm font-bold text-emerald-600">Sentinel X</span>
                  </th>
                  <th className="p-4 text-center border-b">
                    <img src={SENTINEL_J_IMG} alt="J" className="w-8 h-8 object-contain mx-auto mb-1" />
                    <span className="text-sm font-bold text-pink-600">Sentinel J</span>
                  </th>
                  <th className="p-4 text-center border-b">
                    <img src={SENTINEL_S_IMG} alt="S" className="w-8 h-8 object-contain mx-auto mb-1" />
                    <span className="text-sm font-bold text-violet-600">Sentinel S</span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-medium text-gray-900 border-b border-gray-100">{row[0]}</td>
                    <td className="p-3 text-center border-b border-gray-100">{row[1] ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}</td>
                    <td className="p-3 text-center border-b border-gray-100">{row[2] ? <Check className="w-5 h-5 text-pink-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}</td>
                    <td className="p-3 text-center border-b border-gray-100">{row[3] ? <Check className="w-5 h-5 text-violet-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center" data-testid="products-final-cta">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">¿Listo para proteger a tu familia?</h2>
          <p className="text-emerald-100 mb-8 text-lg">Dispositivo GRATIS. 7 días de prueba. Sin compromiso.</p>
          <button
            onClick={() => navigate('/registro')}
            className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold px-10 py-5 rounded-xl hover:bg-emerald-50 transition-all text-lg shadow-xl hover:scale-105"
            data-testid="products-cta-btn"
          >
            Probar 7 días gratis <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default ProductsPage;
