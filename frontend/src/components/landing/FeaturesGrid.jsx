/**
 * ManoProtect - Features Bento Grid
 * Clean, visual feature showcase
 */
import { useNavigate } from 'react-router-dom';
import { Shield, Phone, MapPin, Users, AlertTriangle, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    id: 'sos',
    title: 'Botón SOS',
    description: 'Alerta instantánea a familiares con tu ubicación exacta en caso de emergencia.',
    icon: AlertTriangle,
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    link: '/servicios-sos',
    span: 'lg:col-span-2',
    featured: true
  },
  {
    id: 'antiphishing',
    title: 'Anti-Phishing',
    description: 'Detectamos emails y webs fraudulentas antes de que caigas.',
    icon: Shield,
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    link: '/verificar-estafa'
  },
  {
    id: 'voiceshield',
    title: 'AI Voice Shield',
    description: 'IA que detecta estafas telefónicas en tiempo real.',
    icon: Phone,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    link: '/voice-shield'
  },
  {
    id: 'locator',
    title: 'Localizador Familiar',
    description: 'Sabe dónde están tus seres queridos en todo momento.',
    icon: MapPin,
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    link: '/smart-locator'
  },
  {
    id: 'family',
    title: 'Modo Familiar',
    description: 'Protección especial para mayores y niños.',
    icon: Users,
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    link: '/family-mode'
  }
];

const FeaturesGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="px-6 py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3">
            Funcionalidades
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Protección completa para tu familia
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Herramientas diseñadas para mantener seguros a los que más quieres
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              data-testid={`feature-card-${feature.id}`}
              className={`group relative ${feature.bgColor} ${feature.borderColor} border-2 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer ${feature.span || ''}`}
              onClick={() => navigate(feature.link)}
            >
              {/* Icon */}
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-slate-900/5`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Arrow indicator */}
              <div className="flex items-center text-indigo-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Saber más</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Featured badge */}
              {feature.featured && (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  NUEVO
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
