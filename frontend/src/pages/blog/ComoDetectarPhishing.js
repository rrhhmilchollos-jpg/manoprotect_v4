import SEOArticleLayout from '@/components/SEOArticleLayout';
import { Link } from 'react-router-dom';

const ComoDetectarPhishing = () => (
  <SEOArticleLayout
    title="Cómo detectar phishing: Guía completa para protegerte en 2026"
    metaTitle="Cómo detectar phishing en 2026 - Guía completa"
    metaDescription="Aprende a identificar correos de phishing, SMS fraudulentos y enlaces maliciosos. Protege tus cuentas y datos personales con estos consejos de expertos en ciberseguridad."
    canonical="/blog/como-detectar-phishing"
    publishDate="2026-03-06"
    readTime="8"
    relatedLinks={[
      { href: '/blog/estafas-por-sms-en-espana', label: 'Estafas por SMS en España' },
      { href: '/blog/estafas-whatsapp', label: 'Estafas por WhatsApp' },
      { href: '/proteccion-phishing', label: 'Protección contra phishing' },
      { href: '/blog/que-hacer-si-roban-cuenta-banco', label: 'Qué hacer si roban tu cuenta' },
      { href: '/productos', label: 'Dispositivos Sentinel' },
    ]}
  >
    <p className="text-lg text-gray-600 mb-6">El phishing es la técnica de fraude online más utilizada en España. En 2025, los intentos de phishing aumentaron un 43% según el INCIBE. En esta guía te enseñamos a detectar y evitar cada tipo de ataque.</p>

    <h2>¿Qué es el phishing exactamente?</h2>
    <p>El phishing es un método de ciberataque en el que los delincuentes suplantan la identidad de una empresa, banco o institución legítima para engañarte y obtener tus datos personales, contraseñas o información bancaria. El nombre viene del inglés "fishing" (pescar), porque los atacantes "pescan" víctimas usando cebos digitales.</p>
    <p>Estos ataques pueden llegar por <strong>correo electrónico</strong>, <strong>SMS</strong> (smishing), <strong>llamadas telefónicas</strong> (vishing), mensajes de <strong>WhatsApp</strong>, o incluso a través de redes sociales. El objetivo siempre es el mismo: que hagas clic en un enlace falso, descargues un archivo malicioso o proporciones información confidencial.</p>

    <h2>Señales para detectar un correo de phishing</h2>
    <p>Estos son los indicadores más fiables para identificar un correo fraudulento:</p>
    <ul>
      <li><strong>Remitente sospechoso</strong>: El dominio del email no coincide con la empresa real (por ejemplo, @banco-santander-es.com en lugar de @santander.es). Verifica siempre la dirección completa del remitente.</li>
      <li><strong>Urgencia artificial</strong>: "Tu cuenta será bloqueada en 24 horas", "Acción inmediata requerida". Los atacantes crean presión para que actúes sin pensar.</li>
      <li><strong>Errores ortográficos y gramaticales</strong>: Aunque los ataques son cada vez más sofisticados, muchos siguen conteniendo errores que una empresa legítima no cometería.</li>
      <li><strong>Enlaces sospechosos</strong>: Pasa el ratón sobre el enlace (sin hacer clic) para ver la URL real. Si no corresponde con el sitio oficial, es phishing.</li>
      <li><strong>Solicitud de datos sensibles</strong>: Ningún banco ni empresa legítima te pedirá contraseñas, números de tarjeta o PINs por correo electrónico.</li>
      <li><strong>Archivos adjuntos inesperados</strong>: Facturas, recibos o documentos que no esperabas pueden contener malware.</li>
    </ul>

    <h2>Tipos de phishing más comunes en España</h2>
    <h3>1. Phishing bancario</h3>
    <p>Los atacantes se hacen pasar por tu banco (Santander, BBVA, CaixaBank, Bankinter) y te envían correos o SMS alertándote de "movimientos sospechosos" o "bloqueos de cuenta". El enlace te lleva a una web idéntica a la del banco donde introduces tus credenciales, que quedan en manos del atacante.</p>

    <h3>2. Smishing (SMS fraudulentos)</h3>
    <p>Recibes un SMS supuestamente de Correos, la Agencia Tributaria, o tu operador móvil. "Tu paquete está retenido, paga 1,99€ de aduanas" o "Tienes una devolución de Hacienda pendiente". Estos <Link to="/blog/estafas-por-sms-en-espana" className="text-emerald-600 font-medium">SMS fraudulentos son cada vez más frecuentes en España</Link>.</p>

    <h3>3. Phishing por WhatsApp</h3>
    <p>Mensajes de contactos "hackeados" pidiendo dinero urgente, o supuestas ofertas de empresas conocidas. Aprende más en nuestra guía sobre <Link to="/blog/estafas-whatsapp" className="text-emerald-600 font-medium">estafas por WhatsApp</Link>.</p>

    <h3>4. Vishing (phishing telefónico)</h3>
    <p>Llamadas de supuestos técnicos de Microsoft, tu compañía eléctrica, o incluso la policía. Te piden acceso remoto a tu ordenador o datos de tu tarjeta.</p>

    <h2>Cómo protegerte del phishing</h2>
    <ol>
      <li><strong>Verifica siempre el remitente</strong>: Comprueba la dirección completa del email o el número de teléfono.</li>
      <li><strong>No hagas clic en enlaces de correos sospechosos</strong>: Accede directamente al sitio web escribiendo la dirección en tu navegador.</li>
      <li><strong>Activa la autenticación en dos pasos (2FA)</strong>: En tu banco, email y redes sociales. Aunque roben tu contraseña, no podrán acceder.</li>
      <li><strong>Mantén tu software actualizado</strong>: Las actualizaciones corrigen vulnerabilidades que los atacantes explotan.</li>
      <li><strong>Usa herramientas de protección digital</strong>: <Link to="/seguridad-digital-familiar" className="text-emerald-600 font-medium">ManoProtect ofrece protección integral</Link> para toda la familia contra amenazas digitales.</li>
      <li><strong>Denuncia los intentos</strong>: Reenvía los emails sospechosos a tu banco y reporta a <a href="https://www.incibe.es" target="_blank" rel="noopener noreferrer">INCIBE</a> (017).</li>
    </ol>

    <h2>¿Qué hacer si has caído en un phishing?</h2>
    <p>Si crees que has proporcionado datos a un sitio fraudulento, actúa inmediatamente:</p>
    <ol>
      <li><strong>Cambia tus contraseñas</strong> de inmediato, empezando por la cuenta comprometida.</li>
      <li><strong>Contacta con tu banco</strong> si proporcionaste datos bancarios. Bloquea tarjetas si es necesario.</li>
      <li><strong>Revisa tus movimientos bancarios</strong> en busca de cargos no autorizados.</li>
      <li><strong>Denuncia</strong> ante la Policía Nacional o Guardia Civil (denuncia online disponible).</li>
      <li><strong>Reporta al INCIBE</strong> llamando al 017 (gratuito y confidencial).</li>
    </ol>
    <p>Si te preocupa que alguien de tu familia pueda ser víctima, <Link to="/proteccion-phishing" className="text-emerald-600 font-medium">activa la protección anti-phishing de ManoProtect</Link> para recibir alertas en tiempo real.</p>

    <h2>Preguntas frecuentes sobre phishing</h2>
    <h3>¿Puedo recuperar el dinero si me estafan por phishing?</h3>
    <p>En muchos casos sí. Según la legislación española, los bancos deben reembolsar operaciones no autorizadas si no hubo negligencia grave por parte del usuario. Contacta con tu banco inmediatamente y presenta una reclamación formal.</p>

    <h3>¿Es seguro abrir un correo de phishing sin hacer clic?</h3>
    <p>En general, abrir un correo sin hacer clic en enlaces ni descargar archivos es relativamente seguro. Sin embargo, algunos correos avanzados pueden contener imágenes rastreo. Si sospechas, elimina el correo directamente.</p>

    <h3>¿Cómo sé si una web es legítima?</h3>
    <p>Verifica que la URL empiece por <strong>https://</strong> (con candado), que el dominio sea exacto (sin letras extra o caracteres raros), y que tenga aviso legal y política de privacidad. En caso de duda, accede escribiendo la dirección directamente en tu navegador.</p>
  </SEOArticleLayout>
);

export default ComoDetectarPhishing;
