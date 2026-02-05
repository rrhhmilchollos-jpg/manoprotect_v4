import React, { useState, useEffect } from 'react';
import { AlertTriangle, Users, Clock } from 'lucide-react';

/**
 * Scarcity Indicator - Indicador de escasez/plazas limitadas
 * Crea urgencia mostrando plazas limitadas
 */
const ScarcityIndicator = ({ 
  totalSpots = 50, 
  baseRemaining = 12,
  productName = "oferta especial"
}) => {
  const [remaining, setRemaining] = useState(baseRemaining);
  const [recentBuyers, setRecentBuyers] = useState(3);

  useEffect(() => {
    // Simulate occasional "purchases"
    const interval = setInterval(() => {
      if (Math.random() > 0.8 && remaining > 3) {
        setRemaining(prev => prev - 1);
        setRecentBuyers(prev => prev + 1);
      }
    }, 30000); // Every 30 seconds, 20% chance

    return () => clearInterval(interval);
  }, [remaining]);

  const percentageLeft = (remaining / totalSpots) * 100;
  const isLow = remaining <= 10;
  const isCritical = remaining <= 5;

  return (
    <div className={`rounded-xl p-4 border ${
      isCritical 
        ? 'bg-red-500/10 border-red-500/30' 
        : isLow 
          ? 'bg-amber-500/10 border-amber-500/30' 
          : 'bg-slate-800/50 border-slate-700'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-5 h-5 ${isCritical ? 'text-red-400 animate-pulse' : isLow ? 'text-amber-400' : 'text-slate-400'}`} />
          <span className={`font-semibold ${isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-slate-300'}`}>
            {isCritical ? '¡Casi agotado!' : isLow ? 'Plazas limitadas' : 'Disponibilidad'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-slate-400">
          <Users className="w-4 h-4" />
          <span>{recentBuyers} personas mirando</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden mb-2">
        <div 
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${
            isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${100 - percentageLeft}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={`font-bold ${isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
          Solo quedan {remaining} plazas
        </span>
        <span className="text-slate-500">
          de {totalSpots} disponibles
        </span>
      </div>

      {isCritical && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
          <Clock className="w-3 h-3" />
          <span>Esta oferta puede terminar en cualquier momento</span>
        </div>
      )}
    </div>
  );
};

export default ScarcityIndicator;
