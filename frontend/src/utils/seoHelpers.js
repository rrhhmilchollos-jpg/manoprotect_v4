/**
 * ManoProtect - SEO Helpers
 * Funciones avanzadas para SEO dinámico y Schema markup
 * Compatible con Google AI, Bing AI, y asistentes de voz
 */

// Generar Schema Organization
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://manoprotectt.com/#organization",
  "name": "ManoProtect",
  "alternateName": ["Mano Protect", "ManoProtect España", "ManoProtect Seguridad Digital"],
  "url": "https://manoprotectt.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://manoprotectt.com/logo512.png",
    "width": 512,
    "height": 512
  },
  "image": "https://manoprotectt.com/og-image.png",
  "description": "Líder en seguridad digital en España. Protección contra phishing, fraud prevention y online payment protection para familias.",
  "email": "info@manoprotectt.com",
  "telephone": "+34-601-510-950",
  "foundingDate": "2024",
  "slogan": "Protege lo que más importa",
  "knowsAbout": [
    "Digital Security",
    "Fraud Prevention",
    "Phishing Protection",
    "Online Payment Protection",
    "Family Safety",
    "GPS Tracking",
    "SOS Emergency"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Novelé",
    "addressLocality": "Valencia",
    "addressRegion": "Comunidad Valenciana",
    "postalCode": "46814",
    "addressCountry": "ES"
  },
  "sameAs": [
    "https://www.youtube.com/@manoprotect",
    "https://twitter.com/manoprotect",
    "https://www.linkedin.com/company/manoprotect",
    "https://www.facebook.com/manoprotect",
    "https://www.instagram.com/manoprotect"
  ]
});

// Generar Schema Product con precios actualizados
export const generateProductSchema = (product) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": product.image,
  "brand": {
    "@type": "Brand",
    "name": "ManoProtect"
  },
  "offers": {
    "@type": "Offer",
    "url": product.url,
    "priceCurrency": "EUR",
    "price": product.price,
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "327",
    "bestRating": "5"
  }
});

// Generar Schema para Planes de Precios (actualizado)
export const generatePricingSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://manoprotectt.com/#subscription",
  "name": "ManoProtect Suscripción",
  "description": "Planes de seguridad digital con protección contra phishing, fraud prevention y localización GPS",
  "brand": {"@type": "Brand", "name": "ManoProtect"},
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "0",
    "highPrice": "399.99",
    "priceCurrency": "EUR",
    "offerCount": "3",
    "offers": [
      {
        "@type": "Offer",
        "name": "Plan Básico",
        "price": "0",
        "priceCurrency": "EUR",
        "description": "7 días gratis - Sin tarjeta requerida",
        "eligibleDuration": {"@type": "QuantitativeValue", "value": "7", "unitCode": "DAY"}
      },
      {
        "@type": "Offer",
        "name": "Plan Individual",
        "price": "249.99",
        "priceCurrency": "EUR",
        "description": "Protección 24/7 avanzada - 20,83€/mes facturado anualmente",
        "eligibleDuration": {"@type": "QuantitativeValue", "value": "1", "unitCode": "ANN"}
      },
      {
        "@type": "Offer",
        "name": "Plan Familiar",
        "price": "399.99",
        "priceCurrency": "EUR",
        "description": "Hasta 5 miembros - 33,33€/mes facturado anualmente",
        "eligibleDuration": {"@type": "QuantitativeValue", "value": "1", "unitCode": "ANN"}
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "327",
    "bestRating": "5",
    "worstRating": "1"
  }
});

// Generar FAQ Schema dinámico
export const generateFAQSchema = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Generar HowTo Schema para tutoriales
export const generateHowToSchema = (title, description, steps) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": title,
  "description": description,
  "totalTime": "PT5M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "EUR",
    "value": "0"
  },
  "step": steps.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.name,
    "text": step.text,
    "url": step.url,
    "image": step.image
  }))
});

// Generar VideoObject Schema
export const generateVideoSchema = (video) => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": video.name,
  "description": video.description,
  "thumbnailUrl": video.thumbnail,
  "uploadDate": video.uploadDate,
  "duration": video.duration,
  "contentUrl": video.url,
  "embedUrl": video.embedUrl,
  "publisher": {
    "@type": "Organization",
    "name": "ManoProtect",
    "logo": {
      "@type": "ImageObject",
      "url": "https://manoprotectt.com/logo512.png"
    }
  }
});

// Generar Review Schema
export const generateReviewSchema = (reviews) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "ManoProtect",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": reviews.length.toString(),
    "bestRating": "5"
  },
  "review": reviews.map(review => ({
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5"
    },
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "datePublished": review.date,
    "reviewBody": review.text
  }))
});

// Generar Breadcrumb Schema
export const generateBreadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// Generar Article Schema para blog
export const generateArticleSchema = (article) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "image": article.image,
  "datePublished": article.datePublished,
  "dateModified": article.dateModified || article.datePublished,
  "author": {
    "@type": "Organization",
    "name": "ManoProtect"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ManoProtect",
    "logo": {
      "@type": "ImageObject",
      "url": "https://manoprotectt.com/logo512.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": article.url
  }
});

// Generar Event Schema para promociones
export const generateEventSchema = (event) => ({
  "@context": "https://schema.org",
  "@type": "SaleEvent",
  "name": event.name,
  "description": event.description,
  "startDate": event.startDate,
  "endDate": event.endDate,
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
  "location": {
    "@type": "VirtualLocation",
    "url": "https://manoprotectt.com"
  },
  "organizer": {
    "@type": "Organization",
    "name": "ManoProtect",
    "url": "https://manoprotectt.com"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://manoprotectt.com/pricing",
    "price": "0",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "validFrom": event.startDate
  }
});

// Speakable Schema para asistentes de voz (Google Assistant, Alexa, Siri)
export const generateSpeakableSchema = (page) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": page.title,
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": page.speakableSelectors || ["h1", ".hero-description", ".main-features"]
  },
  "url": page.url
});

// Meta tags generator
export const generateMetaTags = (page) => ({
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  canonical: page.canonical,
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  og: {
    type: "website",
    title: page.title,
    description: page.description,
    image: page.image || "https://manoprotectt.com/og-image.png",
    url: page.url,
    siteName: "ManoProtect"
  },
  twitter: {
    card: "summary_large_image",
    title: page.title,
    description: page.description,
    image: page.image || "https://manoprotectt.com/og-image.png"
  }
});

// IndexNow API - Para indexación instantánea en Bing y otros
export const submitToIndexNow = async (urls) => {
  const key = "manoprotect-indexnow-key"; // Necesitas generar este key
  const keyLocation = "https://manoprotectt.com/manoprotect-indexnow-key.txt";
  
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: "manoprotectt.com",
        key: key,
        keyLocation: keyLocation,
        urlList: urls
      })
    });
    console.log("URLs submitted to IndexNow:", urls);
  } catch (error) {
    console.error("IndexNow submission failed:", error);
  }
};

// Web Vitals reporter
export const reportWebVitals = (metric) => {
  // Send to analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true
    });
  }
};

export default {
  generateOrganizationSchema,
  generateProductSchema,
  generatePricingSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateVideoSchema,
  generateReviewSchema,
  generateBreadcrumbSchema,
  generateArticleSchema,
  generateEventSchema,
  generateSpeakableSchema,
  generateMetaTags,
  submitToIndexNow,
  reportWebVitals
};
