import SEOArticleLayout from '@/components/SEOArticleLayout';
import { Link } from 'react-router-dom';

const EstafasWhatsApp = () => (
  <SEOArticleLayout
    title="Estafas por WhatsApp: Las 8 más peligrosas y cómo evitarlas"
    metaTitle="Estafas por WhatsApp 2026 - Las más comunes y cómo protegerte"
    metaDescription="Las estafas por WhatsApp más frecuentes en España: suplantación de familiares, códigos de verificación, ofertas falsas. Aprende a identificarlas y proteger a tu familia."
    canonical="/blog/estafas-whatsapp"
    publishDate="2026-03-06"
    readTime="8"
    relatedLinks={[
      { href: '/blog/como-detectar-phishing', label: 'Cómo detectar phishing' },
      { href: '/blog/estafas-por-sms-en-espana', label: 'Estafas por SMS' },
      { href: '/proteccion-fraude-online', label: 'Protección contra fraude' },
      { href: '/seguridad-digital-familiar', label: 'Seguridad digital familiar' },
    ]}
  >
    <p className="text-lg text-gray-600 mb-6">WhatsApp es la aplicación de mensajería más usada en España con más de 35 millones de usuarios. Esto la convierte en el canal perfecto para los ciberdelincuentes. Te explicamos las estafas más comunes y cómo protegerte.</p>

    <h2>Las 8 estafas por WhatsApp más comunes</h2>

    <h3>1. "Mamá/papá, he cambiado de número"</h3>
    <p>Recibes un mensaje desde un número desconocido: "Hola mamá, soy [nombre de tu hijo], he perdido el móvil y este es mi nuevo número. Necesito que me hagas una transferencia urgente." Es una de las estafas más efectivas porque apela al instinto de proteger a los hijos.</p>
    <p><strong>Cómo detectarla</strong>: Llama siempre al número antiguo de tu familiar para verificar. Nunca envíes dinero sin confirmar por voz.</p>

    <h3>2. Robo de cuenta por código de verificación</h3>
    <p>"Te he enviado un código por error, ¿me lo puedes reenviar?" Este código es en realidad el código de verificación de WhatsApp. Si lo compartes, el atacante toma el control de tu cuenta.</p>

    <h3>3. Ofertas de trabajo falsas</h3>
    <p>"Gana 300€ al día trabajando desde casa." Estos mensajes te llevan a registrarte en plataformas fraudulentas donde acabas pagando "cuotas de formación" o proporcionando datos personales.</p>

    <h3>4. Cupones y premios falsos</h3>
    <p>"Mercadona regala tarjetas de 500€ por su aniversario." Mensajes virales con enlaces que llevan a webs de phishing que roban datos personales.</p>

    <h3>5. Suplantación de empresas de reparto</h3>
    <p>"Amazon: Tu paquete está retenido. Confirma tu dirección aquí." Similar al <Link to="/blog/estafas-por-sms-en-espana" className="text-emerald-600 font-medium">smishing por SMS</Link>, pero a través de WhatsApp.</p>

    <h3>6. Inversiones en criptomonedas</h3>
    <p>"Invierte 250€ y gana 10.000€ en una semana." Estafas piramidales disfrazadas de oportunidades de inversión.</p>

    <h3>7. Soporte técnico falso</h3>
    <p>"Tu WhatsApp caducará mañana. Actualiza aquí." WhatsApp nunca envía este tipo de mensajes.</p>

    <h3>8. Encuestas con premio</h3>
    <p>"Completa esta encuesta de 30 segundos y gana un iPhone." Recopilan datos personales que venden en el mercado negro.</p>

    <h2>Cómo proteger tu WhatsApp</h2>
    <ol>
      <li><strong>Activa la verificación en dos pasos</strong>: WhatsApp → Ajustes → Cuenta → Verificación en dos pasos. Establece un PIN de 6 dígitos.</li>
      <li><strong>Nunca compartas códigos de verificación</strong> con nadie, ni siquiera con contactos conocidos.</li>
      <li><strong>Configura la privacidad</strong>: Limita quién puede ver tu foto, estado y última conexión.</li>
      <li><strong>Desconfía de mensajes de números desconocidos</strong> que piden dinero o datos.</li>
      <li><strong>Verifica siempre por voz</strong>: Si un familiar te pide dinero por WhatsApp, llámale al número que conoces.</li>
      <li><strong>Protege a toda la familia</strong>: Con <Link to="/seguridad-digital-familiar" className="text-emerald-600 font-medium">ManoProtect</Link>, recibes alertas automáticas cuando se detectan amenazas digitales.</li>
    </ol>

    <h2>¿Qué hacer si te han estafado por WhatsApp?</h2>
    <ol>
      <li>Bloquea y reporta el número en WhatsApp.</li>
      <li>Si compartiste datos bancarios, contacta con tu banco inmediatamente.</li>
      <li>Si perdiste el control de tu cuenta, contacta con soporte de WhatsApp.</li>
      <li>Denuncia ante la Policía Nacional o Guardia Civil.</li>
      <li>Avisa a tus contactos para que no caigan en la misma estafa.</li>
    </ol>
  </SEOArticleLayout>
);

export default EstafasWhatsApp;
