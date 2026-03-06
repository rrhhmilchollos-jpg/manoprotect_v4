import SEOArticleLayout from '@/components/SEOArticleLayout';
import { Link } from 'react-router-dom';

const ProteccionFamiliar = () => (
  <SEOArticleLayout
    title="Protección familiar digital: Todo lo que necesitas saber"
    metaTitle="Proteccion familiar digital - Sistema integral de seguridad"
    metaDescription="Sistema integral de protección familiar digital con localización GPS, alertas SOS, protección contra estafas y monitoreo 24/7 para niños, adultos y mayores."
    canonical="/proteccion-familiar"
    publishDate="2026-03-06"
    readTime="10"
    relatedLinks={[
      { href: '/productos', label: 'Dispositivos Sentinel X, J y S' },
      { href: '/plans', label: 'Planes y precios' },
      { href: '/blog/proteger-familia-online', label: 'Proteger a tu familia online' },
      { href: '/alerta-sos-familiar', label: 'Alerta SOS familiar' },
      { href: '/seguridad-digital-familias', label: 'Seguridad digital para familias' },
    ]}
  >
    <p className="text-lg text-gray-600 mb-6">La protección familiar en 2026 va más allá de cerrar la puerta con llave. Con amenazas digitales, estafas online y emergencias físicas, necesitas un sistema integral que proteja a cada miembro de tu familia las 24 horas del día.</p>

    <h2>¿Qué es la protección familiar digital?</h2>
    <p>La protección familiar digital es un conjunto de herramientas y dispositivos que mantienen a toda la familia segura tanto en el mundo físico como en el digital. Incluye:</p>
    <ul>
      <li><strong>Localización GPS en tiempo real</strong> de todos los miembros de la familia</li>
      <li><strong>Botón SOS de emergencia</strong> que alerta a todos los contactos</li>
      <li><strong>Protección contra phishing y estafas digitales</strong></li>
      <li><strong>Detector de caídas</strong> para personas mayores</li>
      <li><strong>Geovallas inteligentes</strong> que alertan si alguien entra o sale de una zona</li>
      <li><strong>Historial de ubicaciones seguro</strong> con cifrado</li>
    </ul>

    <h2>ManoProtect: Protección adaptada a cada miembro</h2>

    <h3>Para niños (6-12 años) — Sentinel J</h3>
    <p>Un reloj GPS diseñado para los más pequeños con <Link to="/blog/seguridad-hijos-boton-sos" className="text-emerald-600 font-medium">botón SOS</Link>, llamada directa a padres, geovalla escolar y función anti-pérdida. Los padres pueden ver la ubicación en tiempo real desde la app ManoProtect.</p>

    <h3>Para adultos — Sentinel X</h3>
    <p>El reloj más completo de la gama. GPS, alertas SOS, <Link to="/proteccion-phishing" className="text-emerald-600 font-medium">protección anti-phishing</Link>, llamadas de emergencia y conexión con toda la familia a través de la plataforma ManoProtect.</p>

    <h3>Para mayores (+65 años) — Sentinel S</h3>
    <p>Diseñado para la <Link to="/seguridad-mayores" className="text-emerald-600 font-medium">seguridad de personas mayores</Link>. Detector de caídas automático, botón SOS grande, GPS en tiempo real y llamada directa. Ideal para personas con Alzheimer o movilidad reducida.</p>

    <h2>¿Por qué es necesaria la protección familiar?</h2>
    <p>Las cifras hablan por sí solas:</p>
    <ul>
      <li>120.000+ incidentes de ciberseguridad reportados en España en 2025 (INCIBE)</li>
      <li>25% de los adolescentes españoles ha sufrido ciberacoso</li>
      <li>Las personas mayores de 65 años son el grupo más vulnerable a estafas telefónicas</li>
      <li>El tiempo medio de respuesta a una emergencia puede reducirse un 60% con sistemas de alerta SOS</li>
    </ul>

    <h2>Empieza a proteger a tu familia hoy</h2>
    <p><Link to="/plans" className="text-emerald-600 font-medium">ManoProtect ofrece planes adaptados</Link> a cada necesidad. Prueba 7 días gratis, sin compromiso, y descubre la tranquilidad de saber que tu familia está protegida.</p>
  </SEOArticleLayout>
);

export default ProteccionFamiliar;
