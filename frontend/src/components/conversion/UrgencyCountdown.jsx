import React, { useState, useEffect } from 'react';
import { Clock, Flame, Zap } from 'lucide-react';

/**
 * Urgency Countdown Timer - Crea urgencia con tiempo limitado
 * Muestra descuento que expira
 */
const UrgencyCountdown = ({ 
  endTime = null, // If null, uses 24h from first visit
  discount = 50,
  onExpire 
}) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Get or set end time
    let targetTime;
    const stored = localStorage.getItem('offerEndTime');
    
    if (stored) {
      targetTime = new Date(stored);
    } else if (endTime) {
      targetTime = new Date(endTime);
      localStorage.setItem('offerEndTime', targetTime.toISOString());
    } else {
      // Default: 24 hours from now
      targetTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      localStorage.setItem('offerEndTime', targetTime.toISOString());
    }

    const updateTimer = () => {
      const now = new Date();
      const diff = targetTime - now;

      if (diff <= 0) {
        setIsExpired(true);
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  if (isExpired) return null;

  const formatNumber = (num) => num.toString().padStart(2, '0');

  return (
    <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
        <div className="flex items-center gap-2 animate-pulse">
          <Flame className="w-5 h-5" />
          <span className="font-bold text-sm sm:text-base">¡OFERTA FLASH!</span>
        </div>
        
        <span className="text-sm sm:text-base">
          <span className="font-bold">{discount}% DESCUENTO</span> en tu primer mes
        </span>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Termina en:</span>
          <div className="flex gap-1 font-mono font-bold">
            <span className="bg-black/30 px-2 py-1 rounded">{formatNumber(timeLeft.hours)}</span>
            <span>:</span>
            <span className="bg-black/30 px-2 py-1 rounded">{formatNumber(timeLeft.minutes)}</span>
            <span>:</span>
            <span className="bg-black/30 px-2 py-1 rounded">{formatNumber(timeLeft.seconds)}</span>
          </div>
        </div>
        
        <a
          href="/pricing?offer=flash"
          className="flex items-center gap-1 bg-white text-red-600 px-4 py-1.5 rounded-full font-bold text-sm hover:bg-yellow-300 transition-colors"
        >
          <Zap className="w-4 h-4" />
          Activar Oferta
        </a>
      </div>
    </div>
  );
};

export default UrgencyCountdown;
