import { useEffect } from 'react';

/**
 * SEO Component - Updates document head with meta tags
 * @param {string} title - Page title
 * @param {string} description - Meta description (max 160 chars)
 * @param {string} keywords - Keywords comma separated
 * @param {string} canonical - Canonical URL
 * @param {string} ogImage - Open Graph image URL
 * @param {string} type - Page type (website, article, product)
 */
const SEO = ({ 
  title = 'ManoProtect - Protección Digital para tu Familia',
  description = 'ManoProtect te protege contra estafas online, fraudes telefónicos y amenazas digitales. Protege a toda tu familia con nuestra tecnología avanzada.',
  keywords = 'protección digital, anti estafas, seguridad online, protección familiar, fraudes online, ciberseguridad, España',
  canonical = '',
  ogImage = 'https://manoprotectt.com/og-image.png',
  type = 'website'
}) => {
  useEffect(() => {
    // Update title
    document.title = title;
    
    // Update or create meta tags
    const updateMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic SEO
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('author', 'ManoProtect S.L.');
    updateMeta('robots', 'index, follow');
    
    // Open Graph
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', type, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:site_name', 'ManoProtect', true);
    updateMeta('og:locale', 'es_ES', true);
    
    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);
    
    // Update canonical link
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    // Structured Data (JSON-LD)
    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ManoProtect",
      "alternateName": "Protección Digital ManoProtect",
      "url": "https://manoprotectt.com",
      "logo": "https://manoprotectt.com/logo.png",
      "description": description,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Calle de la Innovación, 15",
        "addressLocality": "Valencia",
        "postalCode": "46001",
        "addressCountry": "ES"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+34-601-510-950",
        "contactType": "customer service",
        "availableLanguage": ["Spanish"]
      },
      "sameAs": [
        "https://twitter.com/manoprotect",
        "https://www.linkedin.com/company/manoprotect"
      ]
    };
    
    script.textContent = JSON.stringify(structuredData);

  }, [title, description, keywords, canonical, ogImage, type]);

  return null;
};

export default SEO;
