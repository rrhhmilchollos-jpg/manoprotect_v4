import React from 'react';
import { Check, X, Shield, AlertTriangle } from 'lucide-react';

/**
 * Comparison Table - Tabla comparativa Sin/Con ManoProtect
 * Muestra claramente el valor de la protección
 */
const ComparisonTable = () => {
  const comparisons = [
    {
      category: "Protección Email",
      without: "Vulnerable a phishing",
      with: "Detección automática IA",
      icon: "📧"
    },
    {
      category: "Llamadas Sospechosas",
      without: "Sin advertencias",
      with: "Alerta en tiempo real",
      icon: "📞"
    },
    {
      category: "SMS Fraudulentos",
      without: "Fácil de engañar",
      with: "Análisis instantáneo",
      icon: "💬"
    },
    {
      category: "Protección Familiar",
      without: "Cada uno por su cuenta",
      with: "Toda la familia conectada",
      icon: "👨‍👩‍👧‍👦"
    },
    {
      category: "Alertas SOS",
      without: "Sin sistema de emergencia",
      with: "Botón de pánico 24/7",
      icon: "🆘"
    },
    {
      category: "Dinero en Riesgo",
      without: "Pérdida media: €4,500",
      with: "95% amenazas bloqueadas",
      icon: "💰"
    },
    {
      category: "Soporte",
      without: "Estás solo",
      with: "Asistencia especializada",
      icon: "🎧"
    },
    {
      category: "Tranquilidad",
      without: "Preocupación constante",
      with: "Protección garantizada",
      icon: "😌"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl overflow-hidden border border-slate-700">
      {/* Header */}
      <div className="grid grid-cols-3 bg-slate-800">
        <div className="p-4 text-center">
          <span className="text-slate-400 text-sm">Aspecto</span>
        </div>
        <div className="p-4 text-center border-l border-slate-700">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold">Sin Protección</span>
          </div>
        </div>
        <div className="p-4 text-center border-l border-slate-700 bg-emerald-500/10">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Con ManoProtect</span>
          </div>
        </div>
      </div>

      {/* Rows */}
      {comparisons.map((item, index) => (
        <div 
          key={index}
          className={`grid grid-cols-3 ${index % 2 === 0 ? 'bg-slate-900/30' : ''}`}
        >
          {/* Category */}
          <div className="p-4 flex items-center gap-3 border-t border-slate-700">
            <span className="text-xl">{item.icon}</span>
            <span className="text-white text-sm font-medium">{item.category}</span>
          </div>
          
          {/* Without */}
          <div className="p-4 flex items-center gap-2 border-t border-l border-slate-700">
            <X className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-slate-400 text-sm">{item.without}</span>
          </div>
          
          {/* With */}
          <div className="p-4 flex items-center gap-2 border-t border-l border-slate-700 bg-emerald-500/5">
            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-emerald-300 text-sm">{item.with}</span>
          </div>
        </div>
      ))}

      {/* Footer CTA */}
      <div className="grid grid-cols-3 border-t border-slate-700">
        <div className="p-4"></div>
        <div className="p-4 border-l border-slate-700 text-center">
          <p className="text-red-400 text-sm font-semibold">Alto riesgo</p>
        </div>
        <div className="p-4 border-l border-slate-700 bg-emerald-500/10 text-center">
          <a 
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Shield className="w-4 h-4" />
            Protegerme Ahora
          </a>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;
