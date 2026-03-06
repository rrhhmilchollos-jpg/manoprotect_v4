import SEOArticleLayout from '@/components/SEOArticleLayout';
import { Link } from 'react-router-dom';

const QueHacerRobanCuentaBanco = () => (
  <SEOArticleLayout
    title="Qué hacer si te roban la cuenta del banco: Guía paso a paso"
    metaTitle="Me han robado la cuenta del banco - Qué hacer paso a paso"
    metaDescription="Guía completa sobre qué hacer si te roban la cuenta bancaria en España. Pasos urgentes, cómo recuperar el dinero, denuncias y prevención de fraudes bancarios."
    canonical="/blog/que-hacer-si-roban-cuenta-banco"
    publishDate="2026-03-06"
    readTime="9"
    relatedLinks={[
      { href: '/blog/como-detectar-phishing', label: 'Cómo detectar phishing' },
      { href: '/blog/estafas-por-sms-en-espana', label: 'Estafas por SMS en España' },
      { href: '/estafas-bancarias', label: 'Protección contra estafas bancarias' },
      { href: '/me-han-estafado-online', label: 'Me han estafado online' },
    ]}
  >
    <p className="text-lg text-gray-600 mb-6">Descubrir que han accedido a tu cuenta bancaria sin autorización es una experiencia angustiante. Sin embargo, si actúas rápido, puedes minimizar el daño y aumentar las posibilidades de recuperar tu dinero. Esta guía te explica exactamente qué hacer.</p>

    <h2>Pasos urgentes: Qué hacer en las primeras horas</h2>
    <h3>1. Bloquea tu tarjeta inmediatamente</h3>
    <p>Llama a tu banco o usa la app bancaria para bloquear todas las tarjetas asociadas a la cuenta comprometida. La mayoría de bancos españoles tienen un número de atención 24h:</p>
    <ul>
      <li>BBVA: 900 102 801</li>
      <li>CaixaBank: 900 365 065</li>
      <li>Santander: 915 123 123</li>
      <li>Bankinter: 900 802 081</li>
    </ul>

    <h3>2. Cambia tus credenciales bancarias</h3>
    <p>Modifica inmediatamente la contraseña de tu banca online. Si usas la misma contraseña en otros servicios, cámbialas todas. Activa la autenticación en dos pasos (2FA) si no la tenías.</p>

    <h3>3. Revisa todos los movimientos</h3>
    <p>Identifica y anota todas las operaciones no autorizadas: fecha, hora, importe, concepto y destinatario. Esta información será esencial para la reclamación.</p>

    <h3>4. Contacta con tu banco</h3>
    <p>Presenta una reclamación formal indicando que las operaciones no fueron autorizadas. El banco tiene la obligación de investigar y, en la mayoría de casos, <strong>devolver el dinero en un plazo de 15 días</strong> (según la Ley de Servicios de Pago).</p>

    <h3>5. Presenta denuncia</h3>
    <p>Denuncia ante la Policía Nacional o Guardia Civil. Puedes hacerlo presencialmente o <a href="https://denuncias.policia.es" target="_blank" rel="noopener noreferrer">online</a>. Guarda una copia de la denuncia para la reclamación bancaria.</p>

    <h2>¿Puedo recuperar el dinero robado?</h2>
    <p>En España, la <strong>Ley de Servicios de Pago</strong> protege al consumidor. Si no autorizaste las operaciones y no hubo negligencia grave por tu parte:</p>
    <ul>
      <li>El banco debe reembolsar el importe total de las operaciones no autorizadas.</li>
      <li>El máximo que puedes perder es de 50€ si la notificación fue anterior al uso fraudulento.</li>
      <li>Si el banco se niega, puedes reclamar al Banco de España o acudir a los tribunales.</li>
    </ul>

    <h2>Cómo prevenir futuros robos bancarios</h2>
    <ol>
      <li><strong>Activa alertas de movimientos</strong> en tu app bancaria para detectar operaciones sospechosas al instante.</li>
      <li><strong>Nunca compartas claves por teléfono, SMS o email</strong>. Tu banco nunca te las pedirá.</li>
      <li><strong>Usa contraseñas únicas y fuertes</strong> para tu banca online.</li>
      <li><strong>Activa la verificación en dos pasos</strong> (2FA).</li>
      <li><strong>Revisa tus movimientos regularmente</strong>.</li>
      <li><strong>Protege a tu familia con ManoProtect</strong>: <Link to="/estafas-bancarias" className="text-emerald-600 font-medium">Nuestro sistema alerta sobre intentos de fraude bancario</Link> en tiempo real a todos los miembros de la familia.</li>
    </ol>

    <h2>Preguntas frecuentes</h2>
    <h3>¿Cuánto tarda el banco en devolver el dinero?</h3>
    <p>Por ley, el banco debe resolver la reclamación en un plazo máximo de 15 días hábiles. Si no lo hace, puedes escalar al Servicio de Reclamaciones del Banco de España.</p>

    <h3>¿Qué es una "negligencia grave" del usuario?</h3>
    <p>Se considera negligencia grave anotar el PIN junto a la tarjeta, compartir voluntariamente las claves con terceros, o ignorar repetidamente las alertas de seguridad del banco.</p>

    <h3>¿Debo cambiar de banco después de un fraude?</h3>
    <p>No necesariamente. Lo importante es reforzar la seguridad: cambiar contraseñas, activar 2FA, y usar herramientas de <Link to="/seguridad-digital-familiar" className="text-emerald-600 font-medium">protección digital familiar</Link> como ManoProtect.</p>
  </SEOArticleLayout>
);

export default QueHacerRobanCuentaBanco;
