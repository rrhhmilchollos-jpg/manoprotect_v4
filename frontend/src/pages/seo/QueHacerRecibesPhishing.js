import SEOArticleLayout from '@/components/SEOArticleLayout';
import { Link } from 'react-router-dom';

const QueHacerRecibesPhishing = () => (
  <SEOArticleLayout
    title="Qué hacer si recibes un correo de phishing: Guía rápida"
    metaTitle="Qué hacer si recibes phishing - Guía de actuación rápida"
    metaDescription="Has recibido un correo o SMS sospechoso de phishing. Aprende qué hacer, cómo reportarlo y cómo proteger tus cuentas. Guía paso a paso."
    canonical="/que-hacer-si-recibes-phishing"
    publishDate="2026-03-06"
    readTime="6"
  >
    <p className="text-lg text-gray-600 mb-6">Recibir un intento de phishing no significa que estés comprometido. Lo importante es cómo reaccionas. Esta guía te explica qué hacer en cada escenario.</p>

    <h2>Escenario 1: Recibiste el correo pero NO hiciste clic</h2>
    <ol>
      <li><strong>No abras el correo</strong> si aún no lo has hecho.</li>
      <li><strong>No descargues adjuntos</strong>.</li>
      <li><strong>Marca como spam</strong> en tu cliente de correo.</li>
      <li><strong>Reporta</strong>: Reenvía a reportphishing@apwg.org o al 017 (INCIBE).</li>
      <li>Si suplanta a tu banco, reenvíalo al departamento de seguridad del banco.</li>
    </ol>
    <p>No estás en peligro. Sigue con tu día.</p>

    <h2>Escenario 2: Hiciste clic en el enlace pero NO introdujiste datos</h2>
    <ol>
      <li><strong>Cierra la página</strong> inmediatamente.</li>
      <li><strong>Borra el historial y cookies</strong> del navegador.</li>
      <li><strong>Escanea tu dispositivo</strong> con un antivirus actualizado.</li>
      <li>Vigila tus cuentas durante los próximos días por si acaso.</li>
    </ol>
    <p>El riesgo es bajo, pero no nulo. Algunos sitios pueden descargar malware automáticamente.</p>

    <h2>Escenario 3: Introdujiste datos personales o contraseñas</h2>
    <p>Actúa inmediatamente:</p>
    <ol>
      <li><strong>Cambia la contraseña</strong> de la cuenta afectada y de todas las cuentas que usen la misma contraseña.</li>
      <li><strong>Activa 2FA</strong> en todas las cuentas importantes.</li>
      <li><strong>Si proporcionaste datos bancarios</strong>: Llama a tu banco inmediatamente para bloquear tarjetas y vigilar movimientos.</li>
      <li><strong>Denuncia</strong> ante la Policía Nacional y reporta al INCIBE (017).</li>
      <li><strong>Vigila tu identidad</strong>: Los datos robados pueden usarse para suplantación de identidad durante meses.</li>
    </ol>

    <h2>Cómo reportar phishing en España</h2>
    <ul>
      <li><strong>INCIBE</strong>: Llama al 017 o envía el correo a incidencias@incibe-cert.es</li>
      <li><strong>Policía Nacional</strong>: denuncias.policia.es</li>
      <li><strong>Tu banco</strong>: Cada banco tiene un email de seguridad para reportar suplantaciones</li>
      <li><strong>Google</strong>: safebrowsing.google.com/safebrowsing/report_phish</li>
    </ul>

    <h2>Protege a toda tu familia</h2>
    <p>El phishing no discrimina por edad. Con <Link to="/productos" className="text-emerald-600 font-medium">ManoProtect y los dispositivos Sentinel</Link>, toda tu familia recibe protección digital activa contra amenazas online, incluyendo alertas de phishing en tiempo real.</p>
  </SEOArticleLayout>
);

export default QueHacerRecibesPhishing;
