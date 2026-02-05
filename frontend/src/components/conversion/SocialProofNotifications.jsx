import React, { useState, useEffect } from 'react';
import { User, MapPin, Shield, CheckCircle } from 'lucide-react';

/**
 * Social Proof Notifications - Notificaciones de actividad real
 * Muestra que otros usuarios están comprando/activando
 */
const SocialProofNotifications = () => {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Datos de ejemplo (en producción vendrían de la API)
  const notifications = [
    { name: "María G.", city: "Madrid", action: "activó protección familiar", time: "hace 2 min", icon: Shield },
    { name: "Carlos R.", city: "Barcelona", action: "protegió a sus padres", time: "hace 5 min", icon: User },
    { name: "Ana P.", city: "Valencia", action: "bloqueó 3 estafas", time: "hace 8 min", icon: CheckCircle },
    { name: "Pedro M.", city: "Sevilla", action: "activó su prueba gratuita", time: "hace 12 min", icon: Shield },
    { name: "Laura S.", city: "Bilbao", action: "protegió a su familia", time: "hace 15 min", icon: User },
    { name: "Juan F.", city: "Málaga", action: "evitó una estafa de €2,400", time: "hace 18 min", icon: CheckCircle },
    { name: "Elena V.", city: "Zaragoza", action: "activó alertas SOS", time: "hace 22 min", icon: Shield },
    { name: "Roberto L.", city: "Alicante", action: "añadió 3 familiares", time: "hace 25 min", icon: User },
    { name: "Carmen D.", city: "Murcia", action: "detectó phishing bancario", time: "hace 28 min", icon: CheckCircle },
    { name: "Miguel A.", city: "Palma", action: "activó plan Premium", time: "hace 32 min", icon: Shield },
  ];

  useEffect(() => {
    // Don't show if user dismissed recently
    const dismissed = sessionStorage.getItem('socialProofDismissed');
    if (dismissed) return;

    let notificationIndex = 0;

    const showNotification = () => {
      const randomDelay = Math.random() * 5000 + 10000; // 10-15 seconds
      
      setTimeout(() => {
        setNotification(notifications[notificationIndex]);
        setIsVisible(true);
        notificationIndex = (notificationIndex + 1) % notifications.length;

        // Hide after 5 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 5000);

        // Schedule next notification
        showNotification();
      }, randomDelay);
    };

    // Initial delay before first notification
    const initialTimeout = setTimeout(() => {
      showNotification();
    }, 8000);

    return () => clearTimeout(initialTimeout);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('socialProofDismissed', 'true');
  };

  if (!isVisible || !notification) return null;

  const IconComponent = notification.icon;

  return (
    <div 
      className={`fixed bottom-4 left-4 z-50 max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all duration-500 ${
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-800">
              <span className="font-semibold">{notification.name}</span>
              {' '}{notification.action}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />
              <span>{notification.city}</span>
              <span>•</span>
              <span>{notification.time}</span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-slate-100">
        <div 
          className="h-full bg-emerald-500 animate-shrink"
          style={{ animation: 'shrink 5s linear forwards' }}
        />
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default SocialProofNotifications;
