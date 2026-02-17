/**
 * ManoProtect - Hero Section Component
 * FOCO PRINCIPAL: Localización Familiar + Botón SOS
 * Protección contra estafas como beneficio secundario
 */
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Shield, Check, Heart, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const HeroSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50/30">
      {/* Subtle pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UyZThmMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left: Content */}
          <div className="space-y-8">
            {/* Badge - Enfocado en familia */}
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
              <Heart className="w-4 h-4" />
              <span>Protección Familiar 24/7</span>
            </div>
            
            {/* Headline - FAMILIA Y LOCALIZACIÓN */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Sabe dónde está{' '}
                <span className="text-emerald-600">tu familia</span>{' '}
                en todo momento
              </h1>
              <h2 className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl">
                Localiza a tus hijos, padres y seres queridos en tiempo real. 
                Con el <strong>botón SOS</strong> pueden pedir ayuda con un solo clic y tú recibirás su ubicación exacta al instante.
              </h2>
            </div>

            {/* 3 Key Benefits - LOCALIZACIÓN, SOS, SEGURIDAD EXTRA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
              {/* PRINCIPAL: Localización */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border-2 border-emerald-200 shadow-sm">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Localización GPS</h3>
                  <p className="text-xs text-emerald-600 font-medium">Tiempo real 24/7</p>
                </div>
              </div>
              
              {/* PRINCIPAL: Botón SOS */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Botón SOS</h3>
                  <p className="text-xs text-red-600 font-medium">Emergencias 1 clic</p>
                </div>
              </div>
              
              {/* SECUNDARIO: Protección extra */}
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Antifraude</h3>
                  <p className="text-xs text-slate-500">Protección incluida</p>
                </div>
              </div>
            </div>

            {/* Mensaje emocional */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-xl shadow-emerald-600/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Tranquilidad para toda la familia</p>
                  <p className="text-emerald-100 text-sm">
                    Tus padres mayores, tus hijos, tu pareja... Todos localizados y protegidos. 
                    Si algo pasa, lo sabrás al instante.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                data-testid="hero-main-cta"
                size="lg"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 h-14 text-lg font-semibold shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 transition-all"
              >
                Probar 7 Días Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                data-testid="hero-secondary-cta"
                variant="outline"
                size="lg"
                onClick={() => navigate('/plans')}
                className="border-2 border-slate-300 text-slate-700 hover:bg-slate-100 rounded-full px-8 h-14 text-lg font-semibold transition-all"
              >
                Ver Planes y Precios
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Sin permanencia
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Cancela cuando quieras
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                +10.000 familias protegidas
              </span>
            </div>
          </div>

          {/* Right: Visual - FAMILIA */}
          <div className="relative lg:pl-8">
            {/* Main image container */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10">
              <img
                src="https://images.pexels.com/photos/5691823/pexels-photo-5691823.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Familia protegida con localización GPS ManoProtect"
                className="w-full h-[400px] lg:h-[520px] object-cover"
                loading="eager"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              
              {/* Floating GPS Location card */}
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Ubicación de Mamá</p>
                    <p className="font-semibold text-slate-900 text-sm">Casa · Hace 2 min</p>
                  </div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                </div>
              </div>

              {/* SOS Alert simulation */}
              <div className="absolute top-24 left-6 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Botón SOS Activado</p>
                    <p className="text-xs text-red-100">Ubicación enviada a 3 contactos</p>
                  </div>
                </div>
              </div>
              
              {/* Stats card at bottom */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-emerald-600">GPS</div>
                    <div className="text-xs text-slate-500 font-medium">Localización</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-500">SOS</div>
                    <div className="text-xs text-slate-500 font-medium">Emergencias</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600">24/7</div>
                    <div className="text-xs text-slate-500 font-medium">Protección</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-200 rounded-full blur-2xl opacity-60" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-200 rounded-full blur-2xl opacity-60" />
          </div>
        </div>
      </div>
      
      {/* CSS for slow bounce animation */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
