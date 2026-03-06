import SEOArticleLayout from '@/components/SEOArticleLayout';
import { Link } from 'react-router-dom';

const MeHanHackeadoCuenta = () => (
  <SEOArticleLayout
    title="Me han hackeado la cuenta: Qué hacer ahora mismo"
    metaTitle="Me han hackeado la cuenta - Pasos urgentes para recuperarla"
    metaDescription="Te han hackeado una cuenta de email, redes sociales o banco. Sigue estos pasos urgentes para recuperar el acceso, proteger tus datos y prevenir futuros ataques."
    canonical="/me-han-hackeado-la-cuenta"
    publishDate="2026-03-06"
    readTime="8"
    relatedLinks={[
      { href: '/blog/como-detectar-phishing', label: 'Cómo detectar phishing' },
      { href: '/blog/que-hacer-si-roban-cuenta-banco', label: 'Robo de cuenta bancaria' },
      { href: '/me-han-estafado-online', label: 'Me han estafado online' },
      { href: '/proteccion-identidad-digital', label: 'Protección de identidad digital' },
    ]}
  >
    <p className="text-lg text-gray-600 mb-6">Si sospechas que alguien ha accedido a tu cuenta sin permiso, no entres en pánico. Actúa rápido siguiendo estos pasos para recuperar el control y minimizar el daño.</p>

    <h2>Paso 1: Identifica qué cuenta fue comprometida</h2>
    <p>Determina si el hackeo afecta a tu email, redes sociales, banco u otros servicios. Las señales típicas incluyen:</p>
    <ul>
      <li>Sesiones activas que no reconoces</li>
      <li>Cambios en tu perfil que no hiciste tú</li>
      <li>Emails de "cambio de contraseña" que no solicitaste</li>
      <li>Contactos que reciben mensajes tuyos que no enviaste</li>
      <li>Compras o transacciones no autorizadas</li>
    </ul>

    <h2>Paso 2: Recupera el acceso</h2>
    <h3>Si aún puedes entrar</h3>
    <ol>
      <li>Cambia la contraseña inmediatamente por una nueva, fuerte y única.</li>
      <li>Cierra todas las sesiones activas.</li>
      <li>Activa la verificación en dos pasos (2FA).</li>
      <li>Revisa y elimina métodos de recuperación que no sean tuyos.</li>
    </ol>
    <h3>Si no puedes entrar</h3>
    <ol>
      <li>Usa la opción "He olvidado mi contraseña" o "Cuenta comprometida".</li>
      <li>Verifica tu identidad con el email o teléfono de recuperación.</li>
      <li>Contacta con soporte técnico del servicio.</li>
      <li>Si es una cuenta bancaria, llama al banco inmediatamente.</li>
    </ol>

    <h2>Paso 3: Evalúa el daño</h2>
    <ul>
      <li>¿Se enviaron mensajes en tu nombre? Avisa a tus contactos.</li>
      <li>¿Se hicieron compras? Contacta con la tienda y tu banco.</li>
      <li>¿Se cambiaron datos personales? Documéntalo todo.</li>
      <li>¿Se accedió a otras cuentas conectadas? Cambia contraseñas en cadena.</li>
    </ul>

    <h2>Paso 4: Protege tus otras cuentas</h2>
    <p>Si usabas la misma contraseña en otros servicios, cámbiala en todos. Los atacantes prueban las credenciales robadas en múltiples plataformas (credential stuffing).</p>

    <h2>Paso 5: Denuncia y reporta</h2>
    <ul>
      <li><strong>Policía Nacional</strong>: Denuncia online en denuncias.policia.es</li>
      <li><strong>INCIBE</strong>: Llama al 017 (gratuito y confidencial)</li>
      <li><strong>AEPD</strong>: Si se comprometieron datos personales de terceros</li>
    </ul>

    <h2>Cómo prevenir futuros hackeos</h2>
    <p>La mejor defensa es la prevención. Con <Link to="/seguridad-digital-familiar" className="text-emerald-600 font-medium">ManoProtect</Link>, toda tu familia recibe alertas automáticas ante intentos de acceso sospechoso, phishing y amenazas digitales.</p>
  </SEOArticleLayout>
);

export default MeHanHackeadoCuenta;
