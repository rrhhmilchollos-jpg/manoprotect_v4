import React, { useState } from 'react';
import { Calculator, AlertTriangle, TrendingUp, Euro, Shield } from 'lucide-react';

/**
 * Savings Calculator - Calculadora interactiva de ahorro
 * Muestra cuánto dinero podría perder el usuario sin protección
 */
const SavingsCalculator = () => {
  const [monthlyTransactions, setMonthlyTransactions] = useState(50);
  const [avgAmount, setAvgAmount] = useState(200);
  const [showResult, setShowResult] = useState(false);

  // Estadísticas reales de España
  const stats = {
    avgScamLoss: 4500, // Pérdida media por estafa en España
    scamProbability: 0.08, // 8% probabilidad de ser víctima
    annualScams: 280000, // Estafas anuales en España
  };

  const calculateRisk = () => {
    const annualTransactions = monthlyTransactions * 12;
    const totalExposure = annualTransactions * avgAmount;
    const riskAmount = totalExposure * stats.scamProbability;
    const maxPotentialLoss = Math.min(riskAmount, stats.avgScamLoss);
    
    return {
      exposure: totalExposure,
      riskAmount: maxPotentialLoss,
      protectionValue: maxPotentialLoss * 0.95, // 95% de amenazas bloqueadas
    };
  };

  const result = calculateRisk();

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
          <Calculator className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Calculadora de Riesgo</h3>
          <p className="text-slate-400 text-sm">¿Cuánto podrías perder sin protección?</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Transacciones mensuales */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Transacciones online al mes: <span className="text-emerald-400 font-bold">{monthlyTransactions}</span>
          </label>
          <input
            type="range"
            min="10"
            max="200"
            value={monthlyTransactions}
            onChange={(e) => setMonthlyTransactions(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>10</span>
            <span>200+</span>
          </div>
        </div>

        {/* Importe medio */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Importe medio por transacción: <span className="text-emerald-400 font-bold">€{avgAmount}</span>
          </label>
          <input
            type="range"
            min="20"
            max="1000"
            step="10"
            value={avgAmount}
            onChange={(e) => setAvgAmount(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>€20</span>
            <span>€1000+</span>
          </div>
        </div>

        {/* Botón calcular */}
        <button
          onClick={() => setShowResult(true)}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-5 h-5" />
          Calcular Mi Riesgo
        </button>

        {/* Resultados */}
        {showResult && (
          <div className="mt-6 space-y-4 animate-fadeIn">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Sin Protección</span>
              </div>
              <p className="text-3xl font-bold text-white">
                €{result.riskAmount.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-slate-400">Pérdida potencial estimada al año</p>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Con ManoProtect</span>
              </div>
              <p className="text-3xl font-bold text-white">
                €{result.protectionValue.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-slate-400">Dinero que proteges cada año</p>
            </div>

            <div className="text-center pt-4">
              <p className="text-slate-300 mb-3">
                Por solo <span className="text-emerald-400 font-bold">€29.99/mes</span> protege tu dinero
              </p>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors"
              >
                <Euro className="w-5 h-5" />
                Proteger Mi Dinero Ahora
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Estadística de credibilidad */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">
          📊 Basado en datos del Ministerio del Interior: {stats.annualScams.toLocaleString()} estafas en España en 2024
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default SavingsCalculator;
