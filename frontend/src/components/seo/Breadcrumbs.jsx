/**
 * ManoProtect - SEO Breadcrumbs Component
 * Breadcrumbs con Schema.org para mejor indexación
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

// Mapeo de rutas a nombres legibles
const ROUTE_NAMES = {
  '/': 'Inicio',
  '/sentinel-x': 'Sentinel X',
  '/dispositivo-sos': 'Botón SOS',
  '/precios': 'Precios',
  '/registro': 'Registro',
  '/login': 'Iniciar Sesión',
  '/blog': 'Blog',
  '/como-funciona': 'Cómo Funciona',
  '/faq': 'Preguntas Frecuentes',
  '/quienes-somos': 'Quiénes Somos',
  '/contacto': 'Contacto',
  '/reloj-sos-ancianos': 'Reloj SOS Ancianos',
  '/reloj-gps-mayores': 'Reloj GPS Mayores',
  '/boton-sos-senior': 'Botón SOS Senior',
  '/reloj-sos': 'Reloj SOS',
  '/estafas-bancarias': 'Estafas Bancarias',
  '/proteccion-phishing': 'Protección Phishing',
  '/seguridad-mayores': 'Seguridad Mayores',
  '/privacy-policy': 'Política de Privacidad',
  '/terms-of-service': 'Términos de Servicio'
};

// Estructura de categorías para breadcrumbs
const ROUTE_PARENTS = {
  '/sentinel-x': { path: '/', name: 'Productos' },
  '/dispositivo-sos': { path: '/', name: 'Productos' },
  '/reloj-sos-ancianos': { path: '/', name: 'Productos' },
  '/reloj-gps-mayores': { path: '/', name: 'Productos' },
  '/boton-sos-senior': { path: '/', name: 'Productos' },
  '/estafas-bancarias': { path: '/blog', name: 'Blog' },
  '/proteccion-phishing': { path: '/blog', name: 'Blog' }
};

const Breadcrumbs = ({ customItems, className = '' }) => {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Generate breadcrumb items
  const generateItems = () => {
    const items = [{ path: '/', name: 'Inicio' }];
    
    // Check if there's a parent category
    if (ROUTE_PARENTS[pathname]) {
      items.push(ROUTE_PARENTS[pathname]);
    }
    
    // Add current page
    if (pathname !== '/') {
      items.push({
        path: pathname,
        name: ROUTE_NAMES[pathname] || pathname.split('/').pop().replace(/-/g, ' ')
      });
    }
    
    return customItems || items;
  };
  
  const items = generateItems();
  
  // Generate Schema.org BreadcrumbList
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://manoprotect.com${item.path}`
    }))
  };
  
  // Don't show on home page
  if (pathname === '/') return null;
  
  return (
    <>
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
      
      {/* Visual Breadcrumbs */}
      <nav 
        aria-label="Breadcrumb" 
        className={`bg-gray-50 border-b border-gray-100 ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2">
          <ol className="flex items-center space-x-2 text-sm">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              
              return (
                <li key={item.path} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                  )}
                  
                  {isLast ? (
                    <span className="text-gray-600 font-medium" aria-current="page">
                      {item.name}
                    </span>
                  ) : (
                    <Link 
                      to={item.path}
                      className="text-gray-500 hover:text-[#4CAF50] transition-colors flex items-center"
                    >
                      {index === 0 && <Home className="w-4 h-4 mr-1" />}
                      {item.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
};

export default Breadcrumbs;
