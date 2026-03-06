import SEOArticleLayout from '@/components/SEOArticleLayout';
import { Link } from 'react-router-dom';

const ComoRecuperarCuentaRobada = () => (
  <SEOArticleLayout
    title="Cómo recuperar una cuenta robada: Email, redes sociales y banco"
    metaTitle="Cómo recuperar una cuenta robada - Guía completa España 2026"
    metaDescription="Guía paso a paso para recuperar cuentas de email, Instagram, Facebook, banco y más. Qué hacer, a quién contactar y cómo prevenir futuros robos de cuenta."
    canonical="/como-recuperar-cuenta-robada"
    publishDate="2026-03-06"
    readTime="8"
    relatedLinks={[
      { href: '/me-han-hackeado-la-cuenta', label: 'Me han hackeado la cuenta' },
      { href: '/blog/que-hacer-si-roban-cuenta-banco', label: 'Robo de cuenta bancaria' },
      { href: '/proteccion-identidad-digital', label: 'Protección de identidad digital' },
      { href: '/seguridad-digital-familiar', label: 'Seguridad digital familiar' },
    ]}
  >
    <p className="text-lg text-gray-600 mb-6">Perder el acceso a una cuenta puede ser estresante, pero la mayoría de plataformas tienen procesos de recuperación. Te guiamos paso a paso para cada tipo de cuenta.</p>

    <h2>Recuperar cuenta de Gmail / Google</h2>
    <ol>
      <li>Ve a accounts.google.com/signin/recovery</li>
      <li>Introduce tu dirección de email</li>
      <li>Sigue las opciones de verificación: teléfono, email alternativo, preguntas de seguridad</li>
      <li>Si no puedes verificar tu identidad, usa el formulario de recuperación de cuenta de Google</li>
    </ol>
    <p><strong>Consejo</strong>: Añade siempre un número de teléfono y email de recuperación actualizados.</p>

    <h2>Recuperar cuenta de Instagram</h2>
    <ol>
      <li>En la pantalla de login, toca "Obtener ayuda para iniciar sesión"</li>
      <li>Si cambiaron tu email, busca un correo de Instagram sobre el cambio y usa "Revert this change"</li>
      <li>Usa la verificación por video selfie si está disponible</li>
      <li>Contacta con soporte: help.instagram.com</li>
    </ol>

    <h2>Recuperar cuenta de Facebook</h2>
    <ol>
      <li>Ve a facebook.com/hacked</li>
      <li>Selecciona "Mi cuenta fue comprometida"</li>
      <li>Sigue el proceso de verificación de identidad</li>
      <li>Facebook puede pedirte un documento de identidad</li>
    </ol>

    <h2>Recuperar cuenta bancaria comprometida</h2>
    <ol>
      <li><strong>Llama al banco inmediatamente</strong>: Bloquea acceso y tarjetas</li>
      <li>Cambia contraseña de banca online desde un dispositivo seguro</li>
      <li>Revisa y reporta movimientos no autorizados</li>
      <li>Presenta denuncia policial</li>
      <li>Lee nuestra <Link to="/blog/que-hacer-si-roban-cuenta-banco" className="text-emerald-600 font-medium">guía completa sobre robo de cuentas bancarias</Link></li>
    </ol>

    <h2>Recuperar cuenta de WhatsApp</h2>
    <ol>
      <li>Reinstala WhatsApp e intenta verificar tu número</li>
      <li>Si el atacante activó 2FA, tendrás que esperar 7 días</li>
      <li>Envía un email a support@whatsapp.com con asunto: "Cuenta robada"</li>
      <li>Incluye tu número en formato internacional (+34...)</li>
    </ol>

    <h2>Prevención: Que no vuelva a pasar</h2>
    <ol>
      <li><strong>Activa 2FA en todas las cuentas</strong></li>
      <li><strong>Usa contraseñas únicas y fuertes</strong></li>
      <li><strong>Mantén datos de recuperación actualizados</strong></li>
      <li><strong>Revisa sesiones activas periódicamente</strong></li>
      <li><strong>Protege a tu familia</strong> con <Link to="/seguridad-digital-familiar" className="text-emerald-600 font-medium">ManoProtect</Link></li>
    </ol>
  </SEOArticleLayout>
);

export default ComoRecuperarCuentaRobada;
