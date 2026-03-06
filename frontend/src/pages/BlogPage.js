/**
 * ManoProtect - Blog Educativo SEO
 * Títulos optimizados + Meta Tags + OG + Links internos
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Clock, User, Tag } from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

const blogPosts = [
  {
    slug: 'como-detectar-phishing',
    title: 'Cómo detectar phishing: Guía completa para protegerte en 2026',
    excerpt: 'Aprende a identificar correos de phishing, SMS fraudulentos y enlaces maliciosos. Protege tus cuentas y datos personales.',
    category: 'Ciberseguridad',
    date: '6 Mar 2026',
    readTime: '8 min',
    isExternalPage: true
  },
  {
    slug: 'estafas-por-sms-en-espana',
    title: 'Estafas por SMS en España: Las más peligrosas de 2026',
    excerpt: 'Las estafas por SMS más comunes: falsos paquetes de Correos, Hacienda, bancos. Aprende a identificar el smishing.',
    category: 'Ciberseguridad',
    date: '6 Mar 2026',
    readTime: '7 min',
    isExternalPage: true
  },
  {
    slug: 'que-hacer-si-roban-cuenta-banco',
    title: 'Qué hacer si te roban la cuenta del banco: Guía paso a paso',
    excerpt: 'Pasos urgentes si te roban la cuenta bancaria. Cómo recuperar el dinero, denuncias y prevención.',
    category: 'Finanzas seguras',
    date: '6 Mar 2026',
    readTime: '9 min',
    isExternalPage: true
  },
  {
    slug: 'proteger-familia-online',
    title: 'Cómo proteger a tu familia online: Guía completa',
    excerpt: 'Guía integral para proteger a niños, adolescentes y mayores en internet.',
    category: 'Seguridad familiar',
    date: '6 Mar 2026',
    readTime: '10 min',
    isExternalPage: true
  },
  {
    slug: 'estafas-whatsapp',
    title: 'Estafas por WhatsApp: Las 8 más peligrosas y cómo evitarlas',
    excerpt: 'Suplantación de familiares, códigos de verificación, ofertas falsas. Identifícalas y protégete.',
    category: 'Ciberseguridad',
    date: '6 Mar 2026',
    readTime: '8 min',
    isExternalPage: true
  },
  {
    slug: 'como-evitar-phishing',
    title: 'Cómo evitar el phishing: 10 consejos de expertos',
    excerpt: 'Los 10 mejores consejos de expertos para evitar phishing y proteger tus datos.',
    category: 'Ciberseguridad',
    date: '6 Mar 2026',
    readTime: '7 min',
    isExternalPage: true
  },
  {
    slug: 'proteger-hijos-tecnologia-gps',
    title: 'Cómo proteger a tus hijos con tecnología GPS',
    excerpt: 'Descubre cómo los localizadores GPS como Sentinel J y S pueden darte tranquilidad sobre la seguridad de tus hijos en el colegio, el parque y las excursiones.',
    category: 'Seguridad infantil',
    date: '15 Feb 2026',
    readTime: '5 min',
    img: 'https://static.prod-images.emergentagent.com/jobs/9da3b4c4-c09a-415b-8aa7-bb34b82ca31e/images/910a9c2ec4bd34474c8f1f73a4011a40e480c1a6c2227fd17299b6a14e326ad7.png',
    content: `
La seguridad de nuestros hijos es la prioridad número uno de cualquier padre. Con la tecnología GPS actual, podemos estar tranquilos sabiendo exactamente dónde están en todo momento.

**¿Por qué usar un localizador GPS para niños?**

1. **Tranquilidad en el colegio**: Recibe alertas automáticas cuando tu hijo llega al colegio o sale de él.
2. **Seguridad en excursiones**: Localización en tiempo real durante actividades escolares y campamentos.
3. **Botón SOS**: En caso de emergencia, tu hijo puede alertarte con un solo toque.

**¿Qué buscar en un localizador infantil?**

- **Sin cámara ni internet**: Los niños no necesitan acceso a redes sociales ni fotos.
- **Resistente al agua**: Los niños juegan, corren y se mojan.
- **Batería duradera**: Mínimo 3-4 días sin cargar.
- **Diseño atractivo**: Que al niño le guste llevarlo puesto.

El **Sentinel J** de ManoProtect cumple todos estos requisitos: GPS preciso, botón SOS, resistente al agua y con 8 colores de correas intercambiables.

**Conclusión**: La tecnología GPS no es vigilancia, es protección. Tus hijos ganan independencia y tú ganas tranquilidad.
    `
  },
  {
    slug: 'guia-localizadores-familiares-mayores',
    title: 'Guía de localizadores para familiares mayores',
    excerpt: 'Todo lo que necesitas saber sobre localizadores GPS para personas mayores, con Alzheimer o movilidad reducida. Compara opciones y descubre cuál es la mejor.',
    category: 'Cuidado de mayores',
    date: '10 Feb 2026',
    readTime: '7 min',
    img: 'https://static.prod-images.emergentagent.com/jobs/9da3b4c4-c09a-415b-8aa7-bb34b82ca31e/images/7ad5d961d432cd41064d5a0c5ad6a516bc92a9e6d960fca3881e0e8fc7f2b06a.png',
    content: `
Cuidar a un familiar mayor puede ser un desafío diario. Los localizadores GPS diseñados para personas mayores ofrecen una solución discreta y eficaz.

**¿Cuándo necesitas un localizador para mayores?**

- Cuando tu familiar sale a caminar solo y te preocupa que se desoriente.
- Si padece Alzheimer o demencia y existe riesgo de deambulación.
- Para personas con movilidad reducida que necesitan asistencia rápida.

**Características esenciales**

1. **Alerta anti-retirada**: Si el dispositivo se retira de la muñeca, recibes una notificación inmediata.
2. **Botón SOS silencioso**: Fácil de activar sin llamar la atención.
3. **Sirena integrada**: Para alertar a personas cercanas en caso de emergencia.
4. **Diseño elegante**: Que no parezca un dispositivo médico.

El **Sentinel S** está diseñado específicamente para este caso: cerámica + rose gold, alerta anti-retirada, sirena de 120dB y GPS de alta precisión.

**Consejo**: Involucra a tu familiar en la elección del dispositivo. Cuando ellos participan en la decisión, es más probable que lo usen a diario.
    `
  },
  {
    slug: 'seguridad-familiar-digital-2026',
    title: 'Seguridad familiar digital en 2026: Lo que debes saber',
    excerpt: 'Las amenazas digitales evolucionan. Aprende cómo proteger a tu familia con las últimas herramientas de seguridad y localización GPS.',
    category: 'Tecnología',
    date: '5 Feb 2026',
    readTime: '6 min',
    img: 'https://static.prod-images.emergentagent.com/jobs/9da3b4c4-c09a-415b-8aa7-bb34b82ca31e/images/87b9c67e566b3df4d280471b26a2215bd603777003e860a14633f20318652e92.png',
    content: `
En 2026, la seguridad familiar va más allá del antivirus. La combinación de dispositivos wearables con GPS y aplicaciones inteligentes crea un ecosistema de protección integral.

**Tendencias en seguridad familiar**

1. **Wearables con GPS**: Relojes inteligentes que combinan estilo con seguridad.
2. **Alertas proactivas**: IA que detecta patrones anómalos y alerta antes de que ocurra un problema.
3. **Cifrado de extremo a extremo**: Tus datos de ubicación solo los ves tú.

**ManoProtect**: Una plataforma que combina hardware (Sentinel X, J y S) con software inteligente para ofrecer la protección más completa del mercado.
    `
  },
];

const BlogPage = () => (
  <div className="min-h-screen bg-white">
    <Helmet>
      <title>Blog Educativo | ManoProtect – Seguridad Familiar y GPS</title>
      <meta name="description" content="Artículos sobre seguridad familiar, tecnología GPS, protección infantil y cuidado de mayores. Guías prácticas de ManoProtect." />
      <link rel="canonical" href="https://manoprotect.com/blog" />
      <meta property="og:title" content="Blog ManoProtect – Seguridad Familiar" />
      <meta property="og:description" content="Artículos sobre seguridad familiar, tecnología GPS y protección." />
      <meta property="og:type" content="website" />
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

    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3" data-testid="blog-title">Blog Educativo</h1>
        <p className="text-lg text-gray-500">Guías, consejos y novedades sobre seguridad familiar.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post, i) => (
          <article key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow group" data-testid={`blog-post-${i}`}>
            {post.img && <img src={post.img} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />}
            {!post.img && <div className="w-full h-48 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><Shield className="w-16 h-16 text-white/30" /></div>}
            <div className="p-6">
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span className="bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded">{post.category}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                <span>{post.date}</span>
              </div>
              <h2 className="font-bold text-gray-900 mb-2 text-lg leading-tight group-hover:text-emerald-600 transition-colors">{post.title}</h2>
              <p className="text-sm text-gray-500 mb-4 line-clamp-3">{post.excerpt}</p>
              <Link to={`/blog/${post.slug}`} className="text-emerald-600 font-semibold text-sm hover:underline flex items-center gap-1" data-testid={`blog-read-${i}`}>
                Leer artículo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-16 bg-emerald-50 border border-emerald-200 rounded-2xl p-8" data-testid="blog-cta">
        <h3 className="text-xl font-bold text-gray-900 mb-3">¿Listo para proteger a tu familia?</h3>
        <p className="text-gray-500 mb-6">Prueba ManoProtect 7 días gratis. Sin compromiso.</p>
        <Link to="/registro" className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors">
          Probar gratis 7 días <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>

    <LandingFooter />
  </div>
);

/* Blog Post Detail Page */
export const BlogPostDetail = () => {
  const slug = window.location.pathname.split('/').pop();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artículo no encontrado</h1>
          <Link to="/blog" className="text-emerald-600 hover:underline">Volver al blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{post.title} | Blog ManoProtect</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://manoprotect.com/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.img} />
        <meta property="og:type" content="article" />
      </Helmet>

      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <span className="text-emerald-600 text-lg font-bold">ManoProtect</span>
          </Link>
          <Link to="/blog" className="text-sm text-gray-500 hover:text-emerald-600">Volver al blog</Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16" data-testid="blog-post-detail">
        <img src={post.img} alt={post.title} className="w-full h-64 object-cover rounded-2xl mb-8" />
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
          <span className="bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded">{post.category}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
          <span>{post.date}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
        <div className="prose prose-emerald max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-[15px]">
          {post.content}
        </div>

        <div className="mt-12 bg-emerald-50 rounded-2xl p-8 text-center border border-emerald-200">
          <h3 className="text-xl font-bold text-gray-900 mb-3">¿Te ha parecido útil?</h3>
          <p className="text-gray-500 mb-5">Prueba ManoProtect 7 días gratis y protege a tu familia hoy.</p>
          <Link to="/registro" className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors">
            Probar gratis 7 días <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
};

export default BlogPage;
