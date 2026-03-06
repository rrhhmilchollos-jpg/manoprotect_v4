import SEOArticleLayout from '@/components/SEOArticleLayout';
import { Link } from 'react-router-dom';

const MeHanEstafadoOnline = () => (
  <SEOArticleLayout
    title="Me han estafado online: Guía completa de actuación y recuperación"
    metaTitle="Me han estafado online - Qué hacer y cómo recuperar el dinero"
    metaDescription="Has sido víctima de una estafa por internet. Pasos urgentes para denunciar, recuperar tu dinero y protegerte. Guía actualizada para España 2026."
    canonical="/me-han-estafado-online"
    publishDate="2026-03-06"
    readTime="9"
    relatedLinks={[
      { href: '/blog/que-hacer-si-roban-cuenta-banco', label: 'Robo de cuenta bancaria' },
      { href: '/me-han-hackeado-la-cuenta', label: 'Me han hackeado la cuenta' },
      { href: '/blog/como-detectar-phishing', label: 'Detectar phishing' },
      { href: '/estafas-bancarias', label: 'Estafas bancarias' },
    ]}
  >
    <p className="text-lg text-gray-600 mb-6">Si has sido víctima de una estafa online, es crucial actuar con rapidez. En España, el fraude digital tiene solución legal y en muchos casos puedes recuperar tu dinero. Esta guía te explica exactamente qué hacer.</p>

    <h2>Primeros pasos urgentes (hacer YA)</h2>
    <ol>
      <li><strong>Documenta todo</strong>: Capturas de pantalla de mensajes, emails, páginas web, transferencias. Esta evidencia es imprescindible para la denuncia.</li>
      <li><strong>Contacta con tu banco</strong>: Si realizaste una transferencia o proporcionaste datos de tarjeta, llama inmediatamente para intentar revertir la operación o bloquear la tarjeta.</li>
      <li><strong>No borres nada</strong>: Conversaciones, emails, historial de navegación... Todo puede ser prueba.</li>
      <li><strong>No contactes al estafador</strong>: No intentes negociar ni amenazar. Solo empeorarás la situación.</li>
    </ol>

    <h2>Cómo denunciar una estafa online en España</h2>
    <h3>1. Denuncia policial</h3>
    <p>Acude a una comisaría de la <strong>Policía Nacional</strong> o <strong>Guardia Civil</strong>, o presenta denuncia online en <a href="https://denuncias.policia.es" target="_blank" rel="noopener noreferrer">denuncias.policia.es</a>. Lleva toda la documentación: capturas, números de cuenta, emails del estafador.</p>

    <h3>2. Reportar al INCIBE</h3>
    <p>Llama al <strong>017</strong> (gratuito y confidencial). El INCIBE te asesorará sobre los pasos a seguir y puede ayudar a rastrear la estafa.</p>

    <h3>3. Reclamación al banco</h3>
    <p>Si el fraude involucra tu cuenta bancaria, presenta una reclamación formal. Por la Ley de Servicios de Pago, el banco debe investigar y puede reembolsarte si no hubo negligencia grave.</p>

    <h3>4. Oficina del Consumidor (OMIC)</h3>
    <p>Si la estafa fue una compra fraudulenta (producto que nunca llegó, producto falso), puedes reclamar también ante la OMIC de tu localidad.</p>

    <h2>¿Puedo recuperar el dinero?</h2>
    <p>Depende del tipo de estafa y la rapidez de tu actuación:</p>
    <ul>
      <li><strong>Pago con tarjeta</strong>: Alta probabilidad de recuperación mediante chargeback (contracargo).</li>
      <li><strong>Transferencia bancaria</strong>: Si actúas en las primeras horas, el banco puede intentar revertirla.</li>
      <li><strong>Bizum</strong>: Más difícil, ya que el pago es instantáneo e irrevocable. Pero puedes denunciar.</li>
      <li><strong>Criptomonedas</strong>: Prácticamente imposible de recuperar. Extrema precaución.</li>
    </ul>

    <h2>Tipos de estafas online más comunes en España</h2>
    <ul>
      <li><Link to="/blog/como-detectar-phishing" className="text-emerald-600 font-medium">Phishing</Link> (emails fraudulentos)</li>
      <li><Link to="/blog/estafas-por-sms-en-espana" className="text-emerald-600 font-medium">Smishing</Link> (SMS fraudulentos)</li>
      <li><Link to="/blog/estafas-whatsapp" className="text-emerald-600 font-medium">Estafas por WhatsApp</Link></li>
      <li>Tiendas online falsas</li>
      <li>Estafas de inversión (criptomonedas, forex)</li>
      <li>Estafas románticas</li>
      <li>Fraude en alquileres</li>
      <li>Falso soporte técnico</li>
    </ul>

    <h2>Prevención: No vuelvas a caer</h2>
    <p>La mejor protección es la prevención. <Link to="/proteccion-fraude-online" className="text-emerald-600 font-medium">ManoProtect</Link> te protege a ti y a tu familia con alertas automáticas contra phishing, smishing y otras amenazas digitales en tiempo real.</p>
  </SEOArticleLayout>
);

export default MeHanEstafadoOnline;
