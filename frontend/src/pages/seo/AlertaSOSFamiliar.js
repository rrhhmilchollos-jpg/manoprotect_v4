import SEOArticleLayout from '@/components/SEOArticleLayout';
import { Link } from 'react-router-dom';

const AlertaSOSFamiliar = () => (
  <SEOArticleLayout
    title="Alerta SOS familiar: Sistema de emergencia para toda la familia"
    metaTitle="Alerta SOS familiar - Sistema de emergencia inmediata"
    metaDescription="Sistema de alerta SOS familiar con botón de emergencia, localización GPS y notificación automática a toda la familia. Protege a niños, adultos y mayores."
    canonical="/alerta-sos-familiar"
    publishDate="2026-03-06"
    readTime="8"
    relatedLinks={[
      { href: '/proteccion-familiar', label: 'Protección familiar digital' },
      { href: '/productos', label: 'Dispositivos Sentinel' },
      { href: '/seguridad-mayores', label: 'Seguridad para mayores' },
      { href: '/blog/seguridad-hijos-boton-sos', label: 'Seguridad hijos con botón SOS' },
    ]}
  >
    <p className="text-lg text-gray-600 mb-6">Un sistema de alerta SOS familiar permite que cualquier miembro de tu familia envíe una señal de emergencia inmediata. Con un solo botón, todos los contactos reciben la alerta con la ubicación GPS exacta.</p>

    <h2>¿Cómo funciona la alerta SOS de ManoProtect?</h2>
    <ol>
      <li><strong>Activación</strong>: El usuario pulsa el botón SOS en su dispositivo Sentinel (3 segundos).</li>
      <li><strong>Localización</strong>: El sistema obtiene la ubicación GPS precisa en tiempo real.</li>
      <li><strong>Notificación</strong>: Todos los contactos de emergencia configurados reciben alerta inmediata con ubicación en su app ManoProtect.</li>
      <li><strong>Comunicación</strong>: Se activa una llamada directa al contacto principal.</li>
      <li><strong>Seguimiento</strong>: La ubicación se actualiza en tiempo real hasta que se resuelve la emergencia.</li>
    </ol>

    <h2>Tipos de alertas SOS</h2>
    <h3>Botón SOS manual</h3>
    <p>Disponible en los tres modelos Sentinel (<Link to="/productos" className="text-emerald-600 font-medium">X, J y S</Link>). El usuario pulsa el botón cuando necesita ayuda.</p>

    <h3>Detección automática de caídas</h3>
    <p>El <strong>Sentinel S</strong>, diseñado para mayores, incorpora un acelerómetro que detecta caídas automáticamente y envía la alerta SOS sin necesidad de pulsar ningún botón.</p>

    <h3>Geovalla</h3>
    <p>Si un miembro de la familia sale de una zona segura configurada (casa, colegio, barrio), se envía una alerta automática.</p>

    <h2>¿Quién necesita una alerta SOS?</h2>
    <ul>
      <li><strong>Niños</strong>: Para situaciones de acoso, pérdida o emergencia en el colegio.</li>
      <li><strong>Adolescentes</strong>: Para emergencias nocturnas, situaciones incómodas o peligrosas.</li>
      <li><strong>Adultos</strong>: Para emergencias médicas, accidentes o situaciones de inseguridad.</li>
      <li><strong>Mayores</strong>: Para caídas, desorientación (Alzheimer) o emergencias médicas.</li>
    </ul>

    <h2>Ventajas de ManoProtect vs otros sistemas</h2>
    <ul>
      <li>Dispositivos físicos dedicados (no depende del móvil)</li>
      <li>E-SIM integrada con conectividad 4G independiente</li>
      <li>Funciona con el móvil apagado o bloqueado</li>
      <li>Batería de larga duración (3-5 días)</li>
      <li>Sin cuotas ocultas</li>
      <li>Cifrado de datos AES-256</li>
    </ul>

    <p><Link to="/registro" className="text-emerald-600 font-medium">Prueba ManoProtect 7 días gratis</Link> y descubre la tranquilidad de tener un sistema de alerta SOS familiar activo las 24 horas.</p>
  </SEOArticleLayout>
);

export default AlertaSOSFamiliar;
