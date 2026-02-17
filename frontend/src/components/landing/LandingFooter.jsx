/**
 * ManoProtect - Premium Footer Component
 * Professional, organized footer with clear hierarchy
 */
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, Lock, CreditCard, Award } from 'lucide-react';

const LOGO_URL = '/manoprotect_logo.webp';

const LandingFooter = () => {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        
        {/* Top Section - Brand + Contact */}
        <div className="grid lg:grid-cols-12 gap-12 pb-12 border-b border-slate-800">
          
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <img 
                src={LOGO_URL} 
                alt="ManoProtect" 
                className="h-10 w-auto"
              />
              <span className="font-bold text-white text-xl">ManoProtect</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-6 max-w-sm">
              Plataforma líder en España de protección digital contra fraudes, estafas y amenazas online para familias y empresas.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a 
                href="tel:+34601510950" 
                className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Teléfono</p>
                  <p className="font-medium">+34 601 510 950</p>
                </div>
              </a>
              <a 
                href="mailto:info@manoprotect.com" 
                className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Email</p>
                  <p className="font-medium">info@manoprotect.com</p>
                </div>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              
              {/* Producto */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Producto</h4>
                <ul className="space-y-3">
                  <li><Link to="/servicios-sos" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Servicios SOS</Link></li>
                  <li><Link to="/plans" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Precios</Link></li>
                  <li><Link to="/how-it-works" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Cómo Funciona</Link></li>
                  <li><Link to="/enterprise" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Empresas</Link></li>
                </ul>
              </div>

              {/* Seguridad */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Seguridad</h4>
                <ul className="space-y-3">
                  <li><Link to="/proteccion-phishing" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Protección Phishing</Link></li>
                  <li><Link to="/proteccion-fraude-online" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Fraud Prevention</Link></li>
                  <li><Link to="/estafas-bancarias" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Estafas Bancarias</Link></li>
                  <li><Link to="/proteccion-identidad-digital" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Identidad Digital</Link></li>
                </ul>
              </div>

              {/* Familia */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Familia</h4>
                <ul className="space-y-3">
                  <li><Link to="/seguridad-digital-familiar" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Seguridad Familiar</Link></li>
                  <li><Link to="/seguridad-mayores" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Seguridad Mayores</Link></li>
                  <li><Link to="/smart-locator" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Localizador GPS</Link></li>
                  <li><Link to="/servicios-sos" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Botón SOS</Link></li>
                </ul>
              </div>

              {/* Soporte */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Soporte</h4>
                <ul className="space-y-3">
                  <li><Link to="/faq" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">FAQ</Link></li>
                  <li><Link to="/blog" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Blog</Link></li>
                  <li><Link to="/about-us" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Quiénes Somos</Link></li>
                  <li><Link to="/investor/register" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Inversores</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges Section */}
        <div className="py-8 border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-sm font-medium">SSL 256-bit</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium">PCI DSS</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-violet-500" />
              </div>
              <span className="text-sm font-medium">RGPD Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-sm font-medium">3D Secure</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Copyright */}
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span>© 2025 Manoprotect.com. Todos los derechos reservados.</span>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link to="/privacy-policy" className="text-slate-500 hover:text-white transition-colors">Privacidad</Link>
              <Link to="/terms-of-service" className="text-slate-500 hover:text-white transition-colors">Términos</Link>
              <Link to="/refund-policy" className="text-slate-500 hover:text-white transition-colors">Reembolsos</Link>
              <Link to="/legal-notice" className="text-slate-500 hover:text-white transition-colors">Aviso Legal</Link>
              <Link to="/privacy-policy#cookies" className="text-slate-500 hover:text-white transition-colors">Cookies</Link>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <MapPin className="w-4 h-4" />
              <span>España</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
