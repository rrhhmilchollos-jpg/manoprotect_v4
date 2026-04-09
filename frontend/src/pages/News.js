import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/News.css';

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const articles = [
    {
      id: 1,
      title: 'ManoProtect: La Nueva Solución de Seguridad Familiar en Xátiva y Alrededores',
      description: 'Protección integral para tu familia y negocio con localización GPS en tiempo real.',
      date: '2026-04-09',
      category: 'lanzamiento',
      slug: 'lanzamiento-manoprotect',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f70504504?w=500&h=300&fit=crop',
      excerpt: 'ManoProtect, la nueva empresa de seguridad familiar, ha llegado oficialmente a Xátiva con una propuesta revolucionaria que combina alarmas inteligentes, localización GPS en tiempo real y monitorización 24/7.'
    },
    {
      id: 2,
      title: 'ManoProtect vs Securitas y Prosegur: Ahorra 80€/mes en Seguridad',
      description: 'Protección profesional a fracción del precio. Compara nuestros planes con la competencia.',
      date: '2026-04-08',
      category: 'precios',
      slug: 'comparativa-precios-securitas-prosegur',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop',
      excerpt: 'Un análisis comparativo revela que ManoProtect ofrece servicios de seguridad profesionales a una fracción del precio de empresas tradicionales como Securitas y Prosegur.'
    },
    {
      id: 3,
      title: 'ManoProtect Integra Inteligencia Artificial para Detección Inteligente de Amenazas',
      description: 'Tecnología de última generación para proteger tu familia y negocio.',
      date: '2026-04-07',
      category: 'tecnologia',
      slug: 'tecnologia-ia-manoprotect',
      image: 'https://images.unsplash.com/photo-1677442d019cecf8e5c1e0a4ad5a524e?w=500&h=300&fit=crop',
      excerpt: 'ManoProtect ha implementado algoritmos de Inteligencia Artificial avanzada en su plataforma de seguridad, permitiendo detectar patrones de riesgo antes de que causen daño.'
    },
    {
      id: 4,
      title: 'Familias de Xátiva Confían en ManoProtect: Historias de Seguridad y Tranquilidad',
      description: 'Lee cómo familias de Xátiva han mejorado su seguridad con ManoProtect.',
      date: '2026-04-06',
      category: 'testimonios',
      slug: 'testimonios-clientes-manoprotect',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=300&fit=crop',
      excerpt: 'Desde su lanzamiento en Xátiva, ManoProtect ha ganado la confianza de cientos de familias que ahora duermen más tranquilas sabiendo que sus seres queridos están protegidos.'
    },
    {
      id: 5,
      title: 'ManoProtect Expande su Servicio a 15 Ciudades de la Comunidad Valenciana en 2026',
      description: 'Más familias y negocios pueden acceder a seguridad profesional a precio accesible.',
      date: '2026-04-05',
      category: 'expansion',
      slug: 'expansion-regional-manoprotect',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
      excerpt: 'ManoProtect ha anunciado oficialmente su expansión regional, llegando a 15 municipios de la Comunidad Valenciana durante 2026.'
    },
    {
      id: 6,
      title: 'ManoProtect Obtiene Certificación ISO 27001: Máxima Protección de Datos',
      description: 'Máxima protección de datos y privacidad para tus datos personales.',
      date: '2026-04-04',
      category: 'seguridad',
      slug: 'certificacion-iso-27001',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&h=300&fit=crop',
      excerpt: 'ManoProtect ha obtenido oficialmente la certificación ISO 27001, el estándar internacional más riguroso en seguridad de la información.'
    }
  ];

  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'lanzamiento', label: 'Lanzamiento' },
    { value: 'precios', label: 'Precios' },
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'testimonios', label: 'Testimonios' },
    { value: 'expansion', label: 'Expansión' },
    { value: 'seguridad', label: 'Seguridad' }
  ];

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  return (
    <div className="news-container">
      {/* Header */}
      <section className="news-header">
        <div className="news-header-content">
          <h1>Noticias de ManoProtect</h1>
          <p>Mantente informado sobre seguridad, protección familiar y las últimas novedades de ManoProtect en Xátiva y alrededores.</p>
        </div>
      </section>

      {/* Filters */}
      <section className="news-filters">
        <div className="filter-container">
          <h3>Filtrar por categoría:</h3>
          <div className="filter-buttons">
            {categories.map(cat => (
              <button
                key={cat.value}
                className={`filter-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="news-grid">
        <div className="articles-container">
          {filteredArticles.map(article => (
            <article key={article.id} className="news-card">
              <div className="news-card-image">
                <img src={article.image} alt={article.title} />
                <span className="news-category-badge">{article.category}</span>
              </div>
              <div className="news-card-content">
                <div className="news-date">
                  {new Date(article.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <h2>{article.title}</h2>
                <p className="news-excerpt">{article.excerpt}</p>
                <Link to={`/noticias/${article.slug}`} className="read-more-btn">
                  Leer más →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="news-cta">
        <div className="cta-content">
          <h2>¿Necesitas más información?</h2>
          <p>Contacta con nuestro equipo de seguridad en Xátiva</p>
          <div className="cta-buttons">
            <a href="tel:601510950" className="btn btn-primary">
              📞 Llamar: 601 510 950
            </a>
            <a href="mailto:info@manoprotectt.com" className="btn btn-secondary">
              ✉️ Email: info@manoprotectt.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default News;
