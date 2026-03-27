import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Clock, ChevronRight } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const SEOArticleLayout = ({ title, metaTitle, metaDescription, canonical, publishDate, readTime, children, relatedLinks = [] }) => {
  const defaultRelated = [
    { href: '/proteccion-phishing', label: 'Protección contra phishing' },
    { href: '/proteccion-fraude-online', label: 'Prevención de fraude online' },
    { href: '/seguridad-digital-familiar', label: 'Seguridad digital familiar' },
    { href: '/productos', label: 'Nuestros dispositivos Sentinel' },
    { href: '/plans', label: 'Ver planes y precios' },
  ];
  const links = relatedLinks.length > 0 ? relatedLinks : defaultRelated;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": metaTitle || title,
    "description": metaDescription,
    "author": { "@type": "Organization", "name": "ManoProtect", "url": "https://manoprotectt.com" },
    "publisher": { "@type": "Organization", "name": "ManoProtect", "logo": { "@type": "ImageObject", "url": "https://manoprotectt.com/manoprotect_logo.png" } },
    "datePublished": publishDate || "2026-03-06",
    "dateModified": "2026-03-06",
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://manoprotectt.com${canonical}` },
    "inLanguage": "es"
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{metaTitle || title} | ManoProtect</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`https://manoprotectt.com${canonical}`} />
        <meta property="og:title" content={metaTitle || title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://manoprotectt.com${canonical}`} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <span className="text-emerald-600 text-lg font-bold">ManoProtect</span>
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm text-gray-500">
            <Link to="/blog" className="hover:text-emerald-600">Blog</Link>
            <Link to="/productos" className="hover:text-emerald-600">Productos</Link>
            <Link to="/plans" className="hover:text-emerald-600">Precios</Link>
            <Link to="/sobre-nosotros" className="hover:text-emerald-600">Sobre nosotros</Link>
          </nav>
          <Link to="/registro" className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-lg">Probar gratis</Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-1 text-xs text-gray-400">
          <Link to="/" className="hover:text-emerald-600">Inicio</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/blog" className="hover:text-emerald-600">Blog</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 truncate">{title}</span>
        </nav>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 pb-16">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">{title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {publishDate && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {publishDate}</span>}
            {readTime && <span>{readTime} min de lectura</span>}
            <span>Por ManoProtect</span>
          </div>
        </header>

        <div className="prose prose-lg prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900">
          {children}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Protege a tu familia ahora</h3>
          <p className="text-gray-600 mb-4">Activa alertas SOS, monitoreo y asistencia inmediata con ManoProtect.</p>
          <Link to="/registro" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl transition-colors">
            Activar protección ahora <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Related Links */}
        <div className="mt-10">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Artículos relacionados</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {links.map((l, i) => (
              <Link key={i} to={l.href} className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-emerald-50 rounded-xl text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">
                <ArrowRight className="w-4 h-4 flex-shrink-0" /> {l.label}
              </Link>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default SEOArticleLayout;
