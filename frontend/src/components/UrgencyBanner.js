import React, { useState, useEffect } from 'react';
import { X, Clock, Zap } from 'lucide-react';

const UrgencyBanner = ({ 
  message = "🎁 OFERTA LIMITADA: Primer mes GRATIS en todos los planes",
  endDate = null,
  link = "/registro",
  onClose = null 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    // Check if user has dismissed this banner
    const dismissed = sessionStorage.getItem('urgency_banner_dismissed');
    if (dismissed) {
      setIsVisible(false);
      return;
    }

    // If we have an end date, calculate countdown
    if (endDate) {
      const calculateTimeLeft = () => {
        const difference = new Date(endDate) - new Date();
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / 1000 / 60) % 60);
          const seconds = Math.floor((difference / 1000) % 60);
          setTimeLeft({ days, hours, minutes, seconds });
        } else {
          setTimeLeft(null);
        }
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [endDate]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('urgency_banner_dismissed', 'true');
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div 
      className="sticky top-0 z-40 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white py-2.5 px-4 shadow-lg"
      data-testid="urgency-banner"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm font-medium">
        <Zap className="w-4 h-4 animate-pulse flex-shrink-0" />
        
        <span className="text-center">
          {message}
        </span>
        
        {timeLeft && (
          <div className="hidden sm:flex items-center gap-1 bg-white/20 rounded-lg px-3 py-1 font-mono text-xs">
            <Clock className="w-3 h-3" />
            <span>
              {timeLeft.days > 0 && `${timeLeft.days}d `}
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        )}
        
        <a 
          href={link}
          className="hidden md:inline-flex bg-white text-orange-600 font-bold px-4 py-1 rounded-full text-xs hover:bg-orange-50 transition-colors whitespace-nowrap"
        >
          Obtener oferta
        </a>
        
        <button 
          onClick={handleClose}
          className="absolute right-4 text-white/80 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default UrgencyBanner;
