import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/NewsDetail.css';

const NewsDetail = () => {
  const { slug } = useParams();

  // Contenido de los artículos
  const articles = {
    'lanzamiento-manoprotect': {
      title: 'ManoProtect: La Nueva Solución de Seguridad Familiar en Xátiva y Alrededores',
      date: '2026-04-09',
      category: 'lanzamiento',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f70504504?w=800&h=400&fit=crop',
      content: `
        <h2>Una Solución Integral de Seguridad</h2>
        <p>ManoProtect ofrece tres pilares fundamentales de protección:</p>
        
        <h3>1. Seguridad para Viviendas</h3>
        <p>Sistemas de alarma profesionales con sensores inteligentes, monitorización en tiempo real y respuesta inmediata ante cualquier incidencia. Los residentes de Xátiva pueden disfrutar de protección 24/7 con tecnología de última generación.</p>
        
        <h3>2. Seguridad para Negocios</h3>
        <p>Desde pequeños comercios hasta grandes empresas, ManoProtect proporciona soluciones personalizadas de seguridad con cámaras de vigilancia, control de acceso y alertas instantáneas para proteger tu negocio en Xátiva.</p>
        
        <h3>3. Localización GPS para Personas</h3>
        <p>Uno de los servicios más innovadores de ManoProtect es la localización GPS en tiempo real para niños, adultos y personas mayores. Los padres pueden monitorear la ubicación de sus hijos, y las familias pueden estar tranquilas sabiendo dónde se encuentran sus seres queridos en todo momento.</p>

        <h2>Botón SOS de Emergencia</h2>
        <p>Cada usuario de ManoProtect tiene acceso a un botón SOS que, con un solo clic, activa alertas instantáneas a los contactos de emergencia y a nuestro centro de monitorización. Ideal para personas mayores o en situaciones de riesgo.</p>

        <h2>Presencia en Xátiva y Alrededores</h2>
        <p>ManoProtect ya está operativo en Xátiva, Xixona, Llosa de Ranes, Montesa y municipios cercanos. Nuestro equipo local está disponible para consultas, instalaciones y mantenimiento de sistemas.</p>

        <h2>Planes Flexibles y Asequibles</h2>
        <p>Desde 39,99€/mes para protección básica hasta planes empresariales personalizados, ManoProtect ofrece soluciones para todos los presupuestos. Primer mes gratis para nuevos clientes.</p>

        <h2>Compromiso con la Privacidad</h2>
        <p>Todos los datos de localización y seguridad están encriptados y protegidos bajo los estándares internacionales ISO 27001. La privacidad de nuestros clientes es nuestra prioridad.</p>
      `
    },
    'comparativa-precios-securitas-prosegur': {
      title: 'ManoProtect vs Securitas y Prosegur: Ahorra 80€/mes en Seguridad',
      date: '2026-04-08',
      category: 'precios',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
      content: `
        <h2>Comparativa de Precios</h2>
        <table border="1" cellpadding="10">
          <tr>
            <th>Empresa</th>
            <th>Plan Básico</th>
            <th>Características</th>
            <th>Permanencia</th>
          </tr>
          <tr>
            <td><strong>ManoProtect</strong></td>
            <td><strong>39,99€/mes</strong></td>
            <td>App SOS, Alertas 24/7, GPS</td>
            <td>❌ Sin permanencia</td>
          </tr>
          <tr>
            <td><strong>Securitas</strong></td>
            <td>120€/mes</td>
            <td>Alarma básica, Monitorización</td>
            <td>✅ 24 meses obligatorio</td>
          </tr>
          <tr>
            <td><strong>Prosegur</strong></td>
            <td>125€/mes</td>
            <td>Alarma estándar, Monitorización</td>
            <td>✅ 24 meses obligatorio</td>
          </tr>
        </table>

        <h2>Análisis Económico</h2>
        <p><strong>Ahorro Anual con ManoProtect:</strong></p>
        <ul>
          <li>vs Securitas: 960€/año (80€/mes × 12)</li>
          <li>vs Prosegur: 1.020€/año (85€/mes × 12)</li>
        </ul>
        <p><strong>En 2 años:</strong> Ahorras hasta 1.920€ con ManoProtect</p>

        <h2>Ventajas Adicionales de ManoProtect</h2>
        <h3>1. Sin Permanencia</h3>
        <p>Cancela cuando quieras. No hay contratos de 24 meses obligatorios como en Securitas o Prosegur.</p>
        
        <h3>2. Localización GPS en Tiempo Real</h3>
        <p>Incluida en todos los planes. Securitas y Prosegur cobran extra por este servicio.</p>
        
        <h3>3. Primer Mes Gratis</h3>
        <p>Prueba ManoProtect sin riesgo durante 30 días.</p>
        
        <h3>4. Atención Local en Xátiva</h3>
        <p>Equipo técnico disponible en tu zona para instalaciones y mantenimiento.</p>

        <h2>Planes de ManoProtect</h2>
        <h3>Plan App Connect - 39,99€/mes</h3>
        <ul>
          <li>App de emergencia con SOS</li>
          <li>Alertas 24/7</li>
          <li>Localización GPS</li>
          <li>Ideal para familias</li>
        </ul>

        <h3>Plan Reloj SOS - 69,99€/mes</h3>
        <ul>
          <li>Reloj GPS inteligente</li>
          <li>Botón de emergencia físico</li>
          <li>Monitorización CRA profesional</li>
          <li>Perfecto para niños y mayores</li>
        </ul>

        <h3>Plan Alarma Pro - 89,99€/mes</h3>
        <ul>
          <li>Alarma profesional para vivienda</li>
          <li>Sensores inteligentes</li>
          <li>Monitorización 24/7</li>
          <li>Respuesta inmediata ante incidencias</li>
        </ul>
      `
    },
    'tecnologia-ia-manoprotect': {
      title: 'ManoProtect Integra Inteligencia Artificial para Detección Inteligente de Amenazas',
      date: '2026-04-07',
      category: 'tecnologia',
      image: 'https://images.unsplash.com/photo-1677442d019cecf8e5c1e0a4ad5a524e?w=800&h=400&fit=crop',
      content: `
        <h2>¿Cómo Funciona la IA en ManoProtect?</h2>
        
        <h3>1. Detección de Patrones Anómalos</h3>
        <p>La IA analiza el comportamiento normal de tu hogar o negocio y detecta automáticamente cualquier actividad inusual. Si alguien intenta acceder sin autorización, el sistema lo identifica inmediatamente.</p>
        
        <h3>2. Análisis Predictivo de Riesgos</h3>
        <p>Mediante machine learning, ManoProtect predice posibles amenazas basándose en datos históricos y patrones de seguridad. Esto permite alertas preventivas antes de que ocurra un incidente.</p>
        
        <h3>3. Localización GPS Inteligente</h3>
        <p>La IA optimiza el seguimiento GPS para niños y personas mayores, detectando desviaciones de rutas habituales y alertando a los contactos de emergencia si algo parece fuera de lo normal.</p>

        <h2>Beneficios de la IA en Seguridad</h2>
        <ul>
          <li><strong>Respuesta Más Rápida:</strong> La IA detecta amenazas en milisegundos, mucho más rápido que un operador humano.</li>
          <li><strong>Menos Falsas Alarmas:</strong> Algoritmos inteligentes distinguen entre eventos reales y falsos positivos.</li>
          <li><strong>Protección 24/7 Inteligente:</strong> La IA nunca se cansa ni se distrae, monitorizando constantemente.</li>
          <li><strong>Aprendizaje Continuo:</strong> El sistema mejora con el tiempo, aprendiendo de cada evento.</li>
        </ul>

        <h2>Casos de Uso en Xátiva</h2>
        <h3>Para Familias</h3>
        <p>Si tu hijo sale de la ruta escolar habitual, la IA lo detecta y te alerta. Si una persona mayor se aleja demasiado de casa, el sistema notifica a los contactos de emergencia.</p>
        
        <h3>Para Negocios</h3>
        <p>La IA detecta intentos de robo, acceso no autorizado y comportamientos sospechosos en tiempo real, alertando al propietario y a la policía local.</p>
        
        <h3>Para Viviendas</h3>
        <p>El sistema aprende tus patrones de movimiento y detecta intrusiones con precisión, reduciendo falsas alarmas en un 95%.</p>

        <h2>Privacidad y Seguridad de Datos</h2>
        <p>Toda la IA funciona con encriptación de extremo a extremo. Los datos personales nunca se comparten con terceros. ManoProtect cumple con RGPD y está certificado ISO 27001.</p>

        <h2>Tecnología Cloud de Última Generación</h2>
        <p>ManoProtect utiliza servidores en la nube con redundancia automática, garantizando que tu sistema de seguridad funciona 24/7 sin interrupciones.</p>
      `
    },
    'testimonios-clientes-manoprotect': {
      title: 'Familias de Xátiva Confían en ManoProtect: Historias de Seguridad y Tranquilidad',
      date: '2026-04-06',
      category: 'testimonios',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop',
      content: `
        <h2>Historia 1: María García - Madre Preocupada por sus Hijos</h2>
        <p><em>"Tenía miedo cada vez que mis hijos salían de casa. ¿Dónde estaban? ¿Estaban seguros? Con ManoProtect puedo ver en tiempo real dónde están mis hijos en el mapa. Si se desvían de la ruta escolar, me avisa. Ahora duermo tranquila."</em></p>
        <p><strong>Servicio utilizado:</strong> Plan Reloj SOS + Localización GPS</p>
        <p><strong>Ahorro:</strong> 80€/mes vs Securitas</p>

        <h2>Historia 2: Juan Rodríguez - Empresario en Xátiva</h2>
        <p><em>"Tenía una pequeña tienda en el centro de Xátiva y sufrí un robo hace 2 años. Después de eso, estaba paranoico. Probé Securitas pero era muy caro. ManoProtect me ofreció un sistema completo con cámaras, alarma y monitorización 24/7 por menos dinero. En 6 meses ya se había pagado solo con el ahorro."</em></p>
        <p><strong>Servicio utilizado:</strong> Plan Alarma Pro + Monitorización CRA</p>
        <p><strong>Resultado:</strong> 0 robos en 6 meses, cliente muy satisfecho</p>

        <h2>Historia 3: Carmen López - Abuela de Xátiva</h2>
        <p><em>"Tengo 78 años y mis hijos estaban preocupados por mí viviendo sola. Me instalaron el reloj SOS de ManoProtect. Una vez me caí en el baño y con un clic llamé a mis hijos. Llegaron en 5 minutos. Ese reloj me salvó la vida."</em></p>
        <p><strong>Servicio utilizado:</strong> Plan Reloj SOS + Botón de Emergencia</p>
        <p><strong>Impacto:</strong> Tranquilidad para la familia, seguridad para Carmen</p>

        <h2>Historia 4: Pedro Martínez - Propietario de Vivienda</h2>
        <p><em>"Viajo mucho por trabajo y dejaba mi casa vacía. Con ManoProtect puedo monitorizar mi vivienda desde cualquier parte del mundo. Las cámaras me envían alertas si detectan movimiento. Además, el sistema aprendió mis patrones y casi nunca me da falsas alarmas."</em></p>
        <p><strong>Servicio utilizado:</strong> Plan Alarma Pro + Cámaras inteligentes</p>
        <p><strong>Ventaja:</strong> Monitorización remota desde el extranjero</p>

        <h2>Historia 5: Ana Fernández - Negocio de Ropa en Xátiva</h2>
        <p><em>"Tengo una boutique en Xátiva y ManoProtect me ha ayudado a reducir el estrés. Antes me preocupaba constantemente si había cerrado bien o si alguien intentaría robar. Ahora recibo alertas en tiempo real si algo está mal. Es como tener un vigilante de seguridad 24/7 por un precio accesible."</em></p>
        <p><strong>Servicio utilizado:</strong> Plan Alarma Pro + Alertas en tiempo real</p>
        <p><strong>Beneficio:</strong> Paz mental y reducción de estrés</p>
      `
    },
    'expansion-regional-manoprotect': {
      title: 'ManoProtect Expande su Servicio a 15 Ciudades de la Comunidad Valenciana en 2026',
      date: '2026-04-05',
      category: 'expansion',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
      content: `
        <h2>Ciudades de Cobertura en 2026</h2>
        <h3>Zona Centro (Xátiva y Alrededores)</h3>
        <ul>
          <li>✅ Xátiva (Operativo desde abril 2026)</li>
          <li>✅ Xixona</li>
          <li>✅ Llosa de Ranes</li>
          <li>✅ Montesa</li>
          <li>✅ Alcira</li>
        </ul>

        <h3>Zona Requena-Utiel</h3>
        <ul>
          <li>✅ Requena</li>
          <li>✅ Utiel</li>
          <li>✅ Camporrobles</li>
        </ul>

        <h3>Zona Ribera Alta</h3>
        <ul>
          <li>✅ Alzira</li>
          <li>✅ Sueca</li>
          <li>✅ Cullera</li>
        </ul>

        <h3>Zona Ribera Baja</h3>
        <ul>
          <li>✅ Gandia</li>
          <li>✅ Oliva</li>
          <li>✅ Pego</li>
        </ul>

        <h2>Razones de la Expansión</h2>
        <p>La expansión de ManoProtect responde a la creciente demanda de soluciones de seguridad asequibles en la región. Según datos internos, el 78% de las familias en la Comunidad Valenciana desean mejorar su seguridad pero encuentran los precios de empresas tradicionales prohibitivos.</p>

        <h2>Inversión en Infraestructura Local</h2>
        <p>Para garantizar un servicio de calidad, ManoProtect está invirtiendo en:</p>
        <ul>
          <li><strong>Centros de Monitorización Local:</strong> Equipos técnicos en cada zona para respuesta rápida.</li>
          <li><strong>Instaladores Certificados:</strong> Profesionales locales capacitados en todas las ciudades.</li>
          <li><strong>Soporte 24/7 en Valenciano:</strong> Atención al cliente en idioma local.</li>
          <li><strong>Almacenes de Repuestos:</strong> Disponibilidad rápida de componentes.</li>
        </ul>

        <h2>Planes Especiales para la Expansión</h2>
        <h3>Oferta de Lanzamiento (Abril-Mayo 2026)</h3>
        <ul>
          <li>✅ 50% de descuento en el primer mes</li>
          <li>✅ Instalación gratuita</li>
          <li>✅ Primer mes completamente gratis</li>
          <li>✅ Garantía de satisfacción de 30 días</li>
        </ul>

        <h2>Impacto Económico Regional</h2>
        <p>La expansión de ManoProtect generará más de 150 empleos directos en la región durante 2026, incluyendo técnicos de instalación, operadores de monitorización y personal de atención al cliente.</p>
      `
    },
    'certificacion-iso-27001': {
      title: 'ManoProtect Obtiene Certificación ISO 27001: Máxima Protección de Datos',
      date: '2026-04-04',
      category: 'seguridad',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop',
      content: `
        <h2>¿Qué es ISO 27001?</h2>
        <p>ISO 27001 es la norma internacional que especifica los requisitos para establecer, implementar, mantener y mejorar continuamente un Sistema de Gestión de la Seguridad de la Información (SGSI). Solo las empresas más serias y comprometidas con la privacidad logran esta certificación.</p>

        <h2>¿Qué Significa para Nuestros Clientes?</h2>
        <h3>1. Máxima Privacidad</h3>
        <p>Tus datos de localización GPS, información personal y datos de seguridad están encriptados y protegidos bajo los estándares más rigurosos del mundo.</p>
        
        <h3>2. Cumplimiento RGPD</h3>
        <p>ManoProtect cumple completamente con el Reglamento General de Protección de Datos (RGPD) de la Unión Europea. Tus datos nunca se venden a terceros.</p>
        
        <h3>3. Auditorías Independientes</h3>
        <p>La certificación ISO 27001 requiere auditorías externas anuales. Esto significa que terceros independientes verifican constantemente que cumplimos con los estándares.</p>
        
        <h3>4. Protección Contra Ciberataques</h3>
        <p>Nuestros sistemas están protegidos contra las amenazas cibernéticas más sofisticadas, incluyendo ransomware, phishing y ataques DDoS.</p>

        <h2>Medidas de Seguridad Implementadas</h2>
        <h3>Encriptación de Extremo a Extremo</h3>
        <p>Todos los datos se encriptan antes de ser transmitidos y almacenados. Ni siquiera nuestros empleados pueden acceder a información personal sin autorización.</p>
        
        <h3>Servidores Redundantes</h3>
        <p>Los datos se almacenan en múltiples ubicaciones geográficas, garantizando que nunca se pierdan incluso en caso de desastre.</p>
        
        <h3>Control de Acceso Estricto</h3>
        <p>Solo personal autorizado puede acceder a datos sensibles, y cada acceso se registra y audita.</p>
        
        <h3>Monitorización 24/7</h3>
        <p>Equipos de seguridad monitorean constantemente cualquier actividad sospechosa o intentos de acceso no autorizados.</p>

        <h2>Derechos de los Usuarios</h2>
        <p>Como cliente de ManoProtect, tienes derecho a:</p>
        <ul>
          <li>Acceder a todos tus datos personales</li>
          <li>Solicitar la corrección de datos incorrectos</li>
          <li>Solicitar la eliminación de tus datos</li>
          <li>Portabilidad de datos (exportar tus datos)</li>
          <li>Oposición al procesamiento de datos</li>
        </ul>
      `
    }
  };

  const article = articles[slug];

  useEffect(() => {
    // Scroll to top when article changes
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) {
    return (
      <div className="article-not-found">
        <h1>Artículo no encontrado</h1>
        <p>Lo sentimos, el artículo que buscas no existe.</p>
        <Link to="/noticias" className="back-link">← Volver a noticias</Link>
      </div>
    );
  }

  return (
    <div className="news-detail-container">
      {/* Header */}
      <section className="article-header">
        <img src={article.image} alt={article.title} className="article-image" />
        <div className="article-header-overlay">
          <div className="article-header-content">
            <span className="article-category">{article.category}</span>
            <h1>{article.title}</h1>
            <div className="article-meta">
              <span className="article-date">
                {new Date(article.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="article-author">ManoProtect</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="article-content">
        <div className="article-body">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
          
          {/* Contact CTA */}
          <div className="article-cta">
            <h3>¿Necesitas más información?</h3>
            <p>Contacta con nuestro equipo de seguridad en Xátiva</p>
            <div className="contact-buttons">
              <a href="tel:601510950" className="contact-btn primary">
                📞 Llamar: 601 510 950
              </a>
              <a href="mailto:info@manoprotectt.com" className="contact-btn secondary">
                ✉️ Email: info@manoprotectt.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Back Button */}
      <section className="article-footer">
        <Link to="/noticias" className="back-link">← Volver a todas las noticias</Link>
      </section>
    </div>
  );
};

export default NewsDetail;
