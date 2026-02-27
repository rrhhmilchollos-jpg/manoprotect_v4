import React, { useState } from 'react';
import { Shield, Check, Zap, MapPin, Users, X, CreditCard, Lock } from 'lucide-react';

const PLANS = [
  {
    id: 'mensual',
    label: 'Mensual',
    price: '9,99',
    priceNum: 9.99,
    interval: 'mes',
    desc: 'Cancela cuando quieras',
    accent: 'cyan',
  },
  {
    id: 'anual',
    label: 'Anual',
    price: '99,99',
    priceNum: 99.99,
    interval: 'año',
    desc: 'Ahorra 20€ al año',
    accent: 'green',
    badge: 'MEJOR PRECIO',
    monthly: '8,33',
  },
];

const FEATURES = [
  { icon: <MapPin className="w-4 h-4" />, text: 'GPS y localización familiar en tiempo real' },
  { icon: <Shield className="w-4 h-4" />, text: 'Alertas SOS a contactos de emergencia' },
  { icon: <Users className="w-4 h-4" />, text: 'Hasta 5 miembros familiares' },
  { icon: <Zap className="w-4 h-4" />, text: 'Zonas seguras y notificaciones' },
];

const SubscriptionPlanModal = ({ isOpen, onClose, onConfirm, isLoading, productName = 'Sentinel X Basic', shippingCost = '9,95' }) => {
  const [selected, setSelected] = useState('anual');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const plan = PLANS.find(p => p.id === selected);
    onConfirm(selected, plan.priceNum);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" data-testid="subscription-modal">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors" data-testid="close-subscription-modal">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Activa tu {productName}</h3>
          <p className="text-sm text-gray-400">
            Para que las funciones de seguridad, GPS y SOS funcionen, tu reloj necesita un plan de servicio familiar.
          </p>
        </div>

        <div className="space-y-3 mb-5">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all relative ${
                selected === plan.id
                  ? `border-${plan.accent}-400 bg-${plan.accent}-500/10`
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
              }`}
              data-testid={`plan-${plan.id}`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 right-3 text-[10px] px-2 py-0.5 bg-green-500 text-white font-bold rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{plan.label}</p>
                  <p className="text-xs text-gray-400">{plan.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-white">{plan.price}€</p>
                  <p className="text-[11px] text-gray-500">/{plan.interval}</p>
                  {plan.monthly && (
                    <p className="text-[10px] text-green-400">{plan.monthly}€/mes</p>
                  )}
                </div>
              </div>
              {selected === plan.id && (
                <div className={`absolute top-3 left-3 w-5 h-5 bg-${plan.accent}-500 rounded-full flex items-center justify-center`}>
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 mb-5 border border-gray-700/50">
          <p className="text-xs font-semibold text-gray-300 mb-2">Incluido en tu plan:</p>
          <div className="grid grid-cols-2 gap-2">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                <span className="text-green-400">{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-xl p-3 mb-5 border border-gray-700/30">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Dispositivo {productName}</span>
            <span className="text-green-400 font-bold">GRATIS</span>
          </div>
          <div className="flex justify-between text-sm text-gray-300 mt-1">
            <span>Envío</span>
            <span>{shippingCost}€</span>
          </div>
          <div className="flex justify-between text-sm text-gray-300 mt-1">
            <span>Plan de servicio ({selected === 'mensual' ? 'mensual' : 'anual'})</span>
            <span>{selected === 'mensual' ? '9,99€/mes' : '99,99€/año'}</span>
          </div>
          <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between font-bold text-white">
            <span>Primer cobro</span>
            <span>{selected === 'mensual' ? (parseFloat(shippingCost.replace(',', '.')) + 9.99).toFixed(2).replace('.', ',') : (parseFloat(shippingCost.replace(',', '.')) + 99.99).toFixed(2).replace('.', ',')}€</span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
          data-testid="confirm-subscription"
        >
          {isLoading ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
          ) : (
            <><CreditCard className="w-5 h-5" /> Continuar al pago seguro</>
          )}
        </button>

        <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Pago cifrado</span>
          <span>Cancela cuando quieras</span>
          <span>14 días de devolución</span>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlanModal;
