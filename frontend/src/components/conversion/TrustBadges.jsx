import React from 'react';
import { Shield, Clock, CreditCard, Lock, Award, CheckCircle, RefreshCw } from 'lucide-react';

/**
 * Trust Badges - Insignias de confianza y garantía
 * Aumenta la credibilidad y reduce fricción de compra
 */
const TrustBadges = ({ variant = 'full' }) => {
  const badges = [
    {
      icon: Shield,
      title: '15 Días Gratis',
      subtitle: 'Sin compromiso',
      color: 'emerald'
    },
    {
      icon: RefreshCw,
      title: 'Garantía 100%',
      subtitle: 'Devolución fácil',
      color: 'blue'
    },
    {
      icon: Lock,
      title: 'Pago Seguro',
      subtitle: 'SSL Encriptado',
      color: 'purple'
    },
    {
      icon: Award,
      title: 'Certificado',
      subtitle: 'GDPR Compliant',
      color: 'amber'
    }
  ];

  const paymentMethods = [
    { name: 'Visa', logo: '💳' },
    { name: 'Mastercard', logo: '💳' },
    { name: 'Apple Pay', logo: '🍎' },
    { name: 'Google Pay', logo: '🔵' },
  ];

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 py-4">
        {badges.slice(0, 3).map((badge, index) => (
          <div key={index} className="flex items-center gap-2 text-slate-400 text-sm">
            <badge.icon className="w-4 h-4 text-emerald-400" />
            <span>{badge.title}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'payment') {
    return (
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-slate-300">Pago 100% Seguro</span>
        </div>
        <div className="flex items-center justify-center gap-4">
          {paymentMethods.map((method, index) => (
            <div 
              key={index}
              className="w-12 h-8 bg-white rounded flex items-center justify-center text-lg"
              title={method.name}
            >
              {method.logo}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 text-center mt-3">
          Transacciones procesadas por Stripe
        </p>
      </div>
    );
  }

  // Full variant
  return (
    <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700">
      {/* Main badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {badges.map((badge, index) => {
          const colorClasses = {
            emerald: 'bg-emerald-500/20 text-emerald-400',
            blue: 'bg-blue-500/20 text-blue-400',
            purple: 'bg-purple-500/20 text-purple-400',
            amber: 'bg-amber-500/20 text-amber-400',
          };
          
          return (
            <div key={index} className="text-center">
              <div className={`w-14 h-14 ${colorClasses[badge.color]} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <badge.icon className="w-7 h-7" />
              </div>
              <p className="text-white font-semibold text-sm">{badge.title}</p>
              <p className="text-slate-400 text-xs">{badge.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700 pt-6">
        {/* Payment methods */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <CreditCard className="w-4 h-4" />
            <span>Aceptamos:</span>
          </div>
          <div className="flex items-center gap-3">
            {paymentMethods.map((method, index) => (
              <div 
                key={index}
                className="w-10 h-6 bg-white rounded flex items-center justify-center text-sm"
                title={method.name}
              >
                {method.logo}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>SSL 256-bit</span>
          </div>
        </div>
      </div>

      {/* Trust message */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 inline mr-1" />
          Más de <span className="text-emerald-400 font-bold">10,000 familias</span> ya confían en ManoProtect
        </p>
      </div>
    </div>
  );
};

export default TrustBadges;
