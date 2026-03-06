import SEOArticleLayout from '@/components/SEOArticleLayout';
import { Link } from 'react-router-dom';

const ProtegerFamiliaOnline = () => (
  <SEOArticleLayout
    title="Cómo proteger a tu familia online: Guía completa de seguridad digital"
    metaTitle="Cómo proteger a tu familia online - Seguridad digital familiar 2026"
    metaDescription="Guía completa para proteger a niños, adolescentes y mayores en internet. Control parental, alertas SOS, prevención de ciberacoso y estafas digitales."
    canonical="/blog/proteger-familia-online"
    publishDate="2026-03-06"
    readTime="10"
    relatedLinks={[
      { href: '/seguridad-digital-familiar', label: 'Seguridad digital familiar' },
      { href: '/productos', label: 'Dispositivos Sentinel' },
      { href: '/blog/como-detectar-phishing', label: 'Detectar phishing' },
      { href: '/blog/estafas-whatsapp', label: 'Estafas por WhatsApp' },
      { href: '/plans', label: 'Planes ManoProtect' },
    ]}
  >
    <p className="text-lg text-gray-600 mb-6">En 2026, la seguridad digital de la familia es tan importante como la seguridad física. Cada miembro — niños, adolescentes, adultos y mayores — se enfrenta a amenazas distintas. Esta guía te ayuda a proteger a todos.</p>

    <h2>Amenazas digitales por grupo de edad</h2>

    <h3>Niños (6-12 años)</h3>
    <ul>
      <li><strong>Contenido inapropiado</strong>: Acceso accidental a material para adultos.</li>
      <li><strong>Contacto con desconocidos</strong>: A través de juegos online o redes sociales.</li>
      <li><strong>Compras accidentales</strong>: En apps y juegos móviles.</li>
    </ul>
    <p>Solución: Configura <strong>controles parentales</strong>, establece horarios de uso y educa sobre los peligros. <Link to="/blog/seguridad-hijos-boton-sos" className="text-emerald-600 font-medium">El botón SOS de Sentinel J</Link> permite que tus hijos te alerten en caso de emergencia.</p>

    <h3>Adolescentes (13-17 años)</h3>
    <ul>
      <li><strong>Ciberacoso</strong>: El 25% de los adolescentes españoles ha sufrido ciberacoso.</li>
      <li><strong>Sexting y grooming</strong>: Manipulación por parte de adultos.</li>
      <li><strong>Adicción a redes sociales</strong>: Impacto en salud mental.</li>
      <li><strong>Robo de cuentas</strong>: Gaming, redes sociales, email.</li>
    </ul>
    <p>Solución: Diálogo abierto, supervisión respetuosa y herramientas de <Link to="/seguridad-digital-familiar" className="text-emerald-600 font-medium">protección digital familiar</Link> que alertan sin invadir la privacidad.</p>

    <h3>Adultos</h3>
    <ul>
      <li><strong>Phishing y smishing</strong>: <Link to="/blog/como-detectar-phishing" className="text-emerald-600 font-medium">Los fraudes por email y SMS</Link> son la amenaza principal.</li>
      <li><strong>Estafas bancarias</strong>: Suplantación de bancos y robo de credenciales.</li>
      <li><strong>Ransomware</strong>: Secuestro de archivos a cambio de rescate.</li>
      <li><strong>Robo de identidad</strong>: Uso de datos personales para cometer fraudes.</li>
    </ul>

    <h3>Mayores (+65 años)</h3>
    <ul>
      <li><strong>Estafas telefónicas</strong>: Son el grupo más vulnerable al vishing.</li>
      <li><strong>Phishing básico</strong>: Menor experiencia digital les hace más susceptibles.</li>
      <li><strong>Falsos técnicos</strong>: "Le llamo de Microsoft, su ordenador tiene un virus."</li>
    </ul>
    <p>Solución: <Link to="/seguridad-mayores" className="text-emerald-600 font-medium">Los dispositivos Sentinel S</Link> ofrecen botón SOS, localización GPS y protección digital adaptada a mayores.</p>

    <h2>5 reglas de oro para la seguridad digital familiar</h2>
    <ol>
      <li><strong>Contraseñas únicas y fuertes</strong>: Usa un gestor de contraseñas familiar. Mínimo 12 caracteres con letras, números y símbolos.</li>
      <li><strong>Verificación en dos pasos (2FA)</strong>: Actívala en todas las cuentas importantes: email, banco, redes sociales.</li>
      <li><strong>Actualizaciones automáticas</strong>: Mantén todos los dispositivos actualizados. Las actualizaciones corrigen vulnerabilidades.</li>
      <li><strong>Educación continua</strong>: Habla regularmente sobre ciberseguridad con toda la familia.</li>
      <li><strong>Sistema de protección integral</strong>: <Link to="/productos" className="text-emerald-600 font-medium">ManoProtect con Sentinel X, J y S</Link> ofrece protección adaptada a cada miembro de la familia.</li>
    </ol>

    <h2>ManoProtect: Protección completa para toda la familia</h2>
    <p>Con un solo sistema, puedes proteger a todos los miembros de tu familia:</p>
    <ul>
      <li><strong>Sentinel X</strong>: Para adultos. Alertas SOS, localización y protección digital.</li>
      <li><strong>Sentinel J</strong>: Para niños y adolescentes. Control parental inteligente y botón de emergencia.</li>
      <li><strong>Sentinel S</strong>: Para mayores. GPS, detector de caídas y llamada directa.</li>
    </ul>
    <p>Todos conectados a la <Link to="/" className="text-emerald-600 font-medium">plataforma ManoProtect</Link>, que centraliza las alertas y permite a toda la familia estar conectada y protegida.</p>
  </SEOArticleLayout>
);

export default ProtegerFamiliaOnline;
