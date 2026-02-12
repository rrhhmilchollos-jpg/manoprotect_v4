/**
 * ManoProtect - Footer Component
 * Clean, minimal footer with essential links
 */
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin } from 'lucide-react';

const LOGO_URL = '/manoprotect_logo.webp';

const footerLinks = {
  product: [
    { name: 'Servicios SOS', href: '/servicios-sos' },
    { name: 'Precios', href: '/plans' },
    { name: 'Cómo Funciona', href: '/how-it-works' },
    { name: 'Empresas', href: '/enterprise' }
  ],
  legal: [
    { name: 'Privacidad', href: '/privacy-policy' },
    { name: 'Términos', href: '/terms-of-service' },
    { name: 'Cookies', href: '/privacy-policy#cookies' },
    { name: 'Aviso Legal', href: '/legal-notice' }
  ],
  support: [
    { name: 'FAQ', href: '/faq' },
    { name: 'Contacto', href: '/sobre-nosotros' },
    { name: 'Inversores', href: '/investor/register' }
  ]
};

const LandingFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={LOGO_URL} alt="ManoProtect" className="h-8 w-auto" />
              <span className="font-bold text-white">ManoProtect</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Protección digital para familias contra estafas y fraudes.
            </p>
            <div className="space-y-2 text-sm">
              <a href="tel:+34601510950" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                +34 601 510 950
              </a>
              <a href="mailto:info@manoprotect.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                info@manoprotect.com
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Producto</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Soporte</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} STARTBOOKING SL (CIF: B19427723). Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-emerald-500" />
              RGPD Compliant
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              España
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
