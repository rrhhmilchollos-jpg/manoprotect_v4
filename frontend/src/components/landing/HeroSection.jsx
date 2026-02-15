/**
 * ManoProtect - Hero Section Component
 * Clean, professional hero with clear value proposition
 * SEO Keywords: digital security, fraud prevention, online payment protection
 */
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Check, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const HeroSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UyZThmMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left: Content */}
          <div className="space-y-8">
            {/* Badge - SEO: digital security */}
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              <span>Digital Security & Fraud Prevention</span>
            </div>
            
            {/* Headline - SEO optimized H1 */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Digital Security{' '}
                <span className="text-indigo-600">contra fraudes online</span>
              </h1>
              <h2 className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl">
                ManoProtect ofrece fraud prevention avanzado y online payment protection. Detecta estafas, phishing y amenazas en tiempo real con IA.
              </h2>
            </div>

            {/* 3 Key Benefits - SEO keywords in headings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Fraud Prevention</h3>
                  <p className="text-xs text-slate-500">Detección con IA</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Botón SOS GPS</h3>
                  <p className="text-xs text-slate-500">Emergencias con 1 clic</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Payment Protection</h3>
                  <p className="text-xs text-slate-500">Pagos online seguros</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons - Simplified */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                data-testid="hero-main-cta"
                size="lg"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-14 text-lg font-semibold shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/30 transition-all"
              >
                Probar 7 Días Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                data-testid="hero-secondary-cta"
                variant="outline"
                size="lg"
                onClick={() => navigate('/precios')}
                className="border-2 border-slate-300 text-slate-700 hover:bg-slate-100 rounded-full px-8 h-14 text-lg font-semibold transition-all"
              >
                Ver Planes
              </Button>
            </div>

            {/* Trust indicators + Trust Seals */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Sin compromiso
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Cancela cuando quieras
              </span>
              <span className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>
                Pago 100% Seguro
              </span>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative lg:pl-8">
            {/* Main image container */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10">
              <img
                src="https://images.pexels.com/photos/5691823/pexels-photo-5691823.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Familia protegida con ManoProtect"
                className="w-full h-[400px] lg:h-[500px] object-cover"
                loading="eager"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
              
              {/* Floating stats card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">IA</div>
                    <div className="text-xs text-slate-500">Detección</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">24/7</div>
                    <div className="text-xs text-slate-500">Protección</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-500">SOS</div>
                    <div className="text-xs text-slate-500">Emergencias</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-100 rounded-full blur-2xl opacity-60" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-100 rounded-full blur-2xl opacity-60" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
