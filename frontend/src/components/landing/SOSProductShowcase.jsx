/**
 * ManoProtect - SOS Product Showcase
 * Apple-style product highlight section
 */
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, MapPin, Phone as PhoneIcon, Mic, Battery } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: MapPin, text: 'GPS en tiempo real (2.5m precisión)' },
  { icon: PhoneIcon, text: 'Conexión directa al 112' },
  { icon: Mic, text: 'Audio bidireccional' },
  { icon: Battery, text: '7 días de batería' }
];

const SOSProductShowcase = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Subtle glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/20 rounded-full blur-[150px]" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Product Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative mx-auto max-w-md">
              {/* Glow behind product */}
              <div className="absolute inset-0 bg-gradient-to-b from-red-500/30 to-orange-500/20 rounded-full blur-3xl scale-110" />
              
              {/* Product image */}
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700/50">
                <img
                  src="https://static.prod-images.emergentagent.com/jobs/48047d8d-d356-432e-9b76-e0dcfdb8856b/images/f99ed06308511adbc1daae4f2950cd5204c0a6d6e9b0c0050741934a2dde5029.png"
                  alt="Dispositivo SOS ManoProtect con GPS - Online Payment Protection y Fraud Prevention para emergencias familiares"
                  className="w-full h-auto drop-shadow-2xl"
                  loading="lazy"
                />
              </div>

              {/* Price tag */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white px-5 py-2 rounded-full font-bold shadow-xl shadow-emerald-500/30 transform rotate-12">
                GRATIS
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              PROMOCIÓN LANZAMIENTO
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                Botón SOS<br />
                <span className="text-red-400">para emergencias</span>
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                Dispositivo tipo llavero con GPS, conexión directa al 112 y audio bidireccional. 
                Perfecto para personas mayores, niños o cualquier situación de emergencia.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="text-sm text-slate-300">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="flex items-center gap-6">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl text-slate-500 line-through">49€</span>
                  <span className="text-4xl font-bold text-white">GRATIS</span>
                </div>
                <p className="text-slate-400 text-sm mt-1">Solo pagas envío: 4,95€</p>
              </div>
            </div>

            {/* CTA */}
            <Button
              data-testid="sos-showcase-cta"
              size="lg"
              onClick={() => navigate('/servicios-sos')}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-full px-8 h-14 text-lg font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all"
            >
              Solicitar Ahora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-xs text-slate-500">
              * Oferta válida hasta fin de existencias. Envío en 24-48h.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SOSProductShowcase;
