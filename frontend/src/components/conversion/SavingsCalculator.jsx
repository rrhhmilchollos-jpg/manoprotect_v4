import React, { useState } from 'react';
import { Calculator, Shield, ArrowRight } from 'lucide-react';

/**
 * Savings Calculator - Herramienta interactiva
 * Ayuda al usuario a entender el valor de la protección
 */
const SavingsCalculator = () => {
  const [answered, setAnswered] = useState(false);
  const [concern, setConcern] = useState('');

  const concerns = [
    { id: 'elderly', label: 'Proteger a mis padres/abuelos', icon: '👴' },
    { id: 'family', label: 'Saber dónde está mi familia', icon: '👨‍👩‍👧‍👦' },
    { id: 'scams', label: 'Evitar estafas telefónicas/SMS', icon: '📱' },
    { id: 'all', label: 'Todo lo anterior', icon: '🛡️' },
  ];

  const handleSelect = (id) => {
    setConcern(id);
    setAnswered(true);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
          <Calculator className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">¿Qué te preocupa más?</h3>
          <p className="text-slate-400 text-sm">Selecciona una opción</p>
        </div>
      </div>

      {!answered ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {concerns.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/50 rounded-xl transition-all text-left"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-white text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h4 className="text-xl font-bold text-white mb-2">
            ManoProtect puede ayudarte
          </h4>
          <p className="text-slate-400 mb-6">
            {concern === 'elderly' && 'Localiza a tus mayores y recibe alertas si necesitan ayuda.'}
            {concern === 'family' && 'Conecta a toda tu familia y comparte ubicación en tiempo real.'}
            {concern === 'scams' && 'Analiza mensajes sospechosos y te alerta antes de que caigas.'}
            {concern === 'all' && 'Protección completa para ti y toda tu familia.'}
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors"
          >
            Ver Planes
            <ArrowRight className="w-5 h-5" />
          </a>
          <button
            onClick={() => setAnswered(false)}
            className="block mx-auto mt-4 text-slate-500 hover:text-slate-300 text-sm"
          >
            Volver a elegir
          </button>
        </div>
      )}
    </div>
  );
};

export default SavingsCalculator;
