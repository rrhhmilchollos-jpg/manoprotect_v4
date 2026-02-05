import React, { useState, useEffect } from 'react';
import { X, Shield, Gift, Clock, ArrowRight } from 'lucide-react';

/**
 * Exit Intent Popup - Se muestra cuando el usuario intenta salir
 * Ofrece descuento o prueba gratuita para retener
 */
const ExitIntentPopup = ({ onClose, onAccept }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if already shown in this session
    const shown = sessionStorage.getItem('exitPopupShown');
    if (shown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e) => {
      // Detect when mouse leaves viewport (heading to close/back button)
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }
    };

    // Also trigger on back button attempt
    const handlePopState = () => {
      if (!hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasShown]);

  const handleAccept = () => {
    setIsVisible(false);
    if (onAccept) onAccept();
    // Redirect to pricing with special offer
    window.location.href = '/pricing?offer=exit50';
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-emerald-500/30 animate-scaleIn">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
            <Gift className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Content */}
        <h2 className="text-3xl font-bold text-center text-white mb-3">
          ¡Espera! 🎁
        </h2>
        <p className="text-xl text-center text-emerald-400 font-semibold mb-2">
          Tu primer mes es GRATIS
        </p>
        <p className="text-center text-slate-300 mb-6">
          No te vayas sin proteger a tu familia. Activa tu prueba gratuita ahora y cancela cuando quieras.
        </p>

        {/* Benefits */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 text-slate-300 mb-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>Protección completa contra fraudes</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300 mb-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>Sin compromiso - cancela gratis</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <Gift className="w-5 h-5 text-emerald-400" />
            <span>7 días completamente gratis</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <button
          onClick={handleAccept}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 mb-3"
        >
          Activar Mi Mes Gratis
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={handleClose}
          className="w-full py-3 text-slate-400 hover:text-white transition-colors text-sm"
        >
          No gracias, prefiero quedarme desprotegido
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ExitIntentPopup;
