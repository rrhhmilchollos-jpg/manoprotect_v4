/**
 * ManoProtect - Premium Trust Badges Component
 * Displays security certifications and trust indicators
 * Critical for conversion rate optimization
 */
import { Shield, Lock, CreditCard, Award, CheckCircle, BadgeCheck } from 'lucide-react';

const TrustBadges = ({ variant = 'default', className = '' }) => {
  const badges = [
    {
      icon: Lock,
      label: 'SSL 256-bit',
      sublabel: 'Encriptación bancaria',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      icon: CreditCard,
      label: 'PCI DSS',
      sublabel: 'Pagos seguros',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: Shield,
      label: 'RGPD',
      sublabel: 'Datos protegidos',
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    },
    {
      icon: Award,
      label: 'ISO 27001',
      sublabel: 'Certificado',
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
        {badges.map((badge, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-slate-600 text-sm"
          >
            <badge.icon className={`w-4 h-4 ${badge.color}`} />
            <span>{badge.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'checkout') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <BadgeCheck className="w-5 h-5 text-emerald-600" />
          <span>Pago 100% Seguro</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {badges.slice(0, 2).map((badge, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 p-3 rounded-lg ${badge.bg} border border-slate-200/50`}
            >
              <badge.icon className={`w-5 h-5 ${badge.color}`} />
              <div>
                <p className="font-semibold text-slate-900 text-sm">{badge.label}</p>
                <p className="text-xs text-slate-500">{badge.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>Procesado por Stripe - Nivel bancario</span>
        </div>
      </div>
    );
  }

  // Default variant - full display
  return (
    <div className={`py-8 border-y border-slate-200 bg-slate-50/50 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Seguridad de nivel empresarial
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 ${badge.bg} rounded-xl flex items-center justify-center mb-3`}>
                <badge.icon className={`w-6 h-6 ${badge.color}`} />
              </div>
              <p className="font-bold text-slate-900">{badge.label}</p>
              <p className="text-xs text-slate-500">{badge.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
