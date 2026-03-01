/**
 * ManoProtect - Premium Footer Component
 * Professional, organized footer with clear hierarchy
 */
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, Lock, CreditCard, Award, Smartphone, Truck, Star, CheckCircle, ExternalLink } from 'lucide-react';

const LOGO_URL = '/manoprotect_logo.webp';

// Trustpilot Rating Component with animation
const TrustpilotWidget = () => (
  <a 
    href="https://es.trustpilot.com/review/manoprotect.com"
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-all duration-300"
  >
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`w-4 h-4 fill-emerald-400 text-emerald-400 transition-transform duration-300 ${i < 4 ? '' : 'fill-emerald-400/50'}`}
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
    <div className="text-left">
      <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
        Excelente en
      </p>
      <p className="text-sm font-bold text-white flex items-center gap-1">
        Trustpilot
        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </p>
    </div>
  </a>
);

// ManoProtect Verified Seal Component  
const ManoProtectSeal = () => (
  <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/30">
    <div className="relative">
      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <Shield className="w-5 h-5 text-white" />
      </div>
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 flex items-center justify-center">
        <CheckCircle className="w-2.5 h-2.5 text-white" />
      </div>
    </div>
    <div>
      <p className="text-xs text-emerald-400 font-medium">Verificado por</p>
      <p className="text-sm font-bold text-white">ManoProtect.com</p>
    </div>
  </div>
);

// App Store URLs
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.manoprotect.www.twa';
const APP_STORE_URL = 'https://apps.apple.com/es/app/manoprotect/id123456789'; // Placeholder - iOS app coming soon

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

            {/* App Download Badges */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Descarga la App
              </p>
              <div className="flex flex-wrap gap-3">
                <a 
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <img 
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/es_badge_web_generic.png" 
                    alt="Disponible en Google Play"
                    className="h-12 w-auto"
                  />
                </a>
                <a 
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <img 
                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                    alt="Descargar en App Store"
                    className="h-12 w-auto rounded"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              
              {/* Producto */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Producto</h4>
                <ul className="space-y-3">
                  <li><Link to="/productos" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Productos</Link></li>
                  <li><Link to="/sentinel-x" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Sentinel X</Link></li>
                  <li><Link to="/sentinel-j" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Sentinel J</Link></li>
                  <li><Link to="/sentinel-s" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Sentinel S</Link></li>
                  <li><Link to="/plans" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Precios</Link></li>
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
                  <li><Link to="/alarmas-hogar" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Alarmas Hogar y Empresa</Link></li>
                  <li><Link to="/alarmas/vivienda" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Alarmas Vivienda</Link></li>
                  <li><Link to="/alarmas/negocio" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Alarmas Negocio</Link></li>
                  <li><Link to="/calculador" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Calcular Presupuesto</Link></li>
                </ul>
              </div>

              {/* Soporte */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Soporte</h4>
                <ul className="space-y-3">
                  <li><Link to="/faq" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">FAQ</Link></li>
                  <li><Link to="/contacto" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Contacto</Link></li>
                  <li><Link to="/testimonios" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Testimonios</Link></li>
                  <li><Link to="/blog" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Blog</Link></li>
                  <li><Link to="/about-us" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Quiénes Somos</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Trust Badges Section */}
        <div className="py-8 border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {/* Customer Promise Badges */}
            <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-full">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-emerald-400">100% Gratis</span>
            </div>
            <div className="flex items-center gap-3 bg-blue-500/10 px-4 py-2 rounded-full">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-blue-400">Envío 24-48h</span>
            </div>
            <div className="flex items-center gap-3 bg-amber-500/10 px-4 py-2 rounded-full">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-amber-400">Garantía 2 años</span>
            </div>
          </div>
        </div>

        {/* Security Trust Badges Section */}
        <div className="py-6 border-b border-slate-800">
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

        {/* Trustpilot + ManoProtect Seal Section */}
        <div className="py-6 border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <TrustpilotWidget />
            <ManoProtectSeal />
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
          <p className="text-center text-xs text-slate-600 mt-4">Compra segura – Garantía de devolución – Stripe 3D Secure</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
