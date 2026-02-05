import React, { useState, useEffect } from 'react';
import { Gift, Play, Crown, MapPin, Shield, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

/**
 * ManoProtect - Rewarded Ads Component
 * Componente para anuncios bonificados que otorgan recompensas
 */

// Tipos de recompensas disponibles
const REWARDS = {
  PREMIUM_DAY: {
    id: 'premium_day',
    name: '1 Día Premium',
    description: 'Desbloquea todas las funciones por 24 horas',
    icon: Crown,
    color: 'bg-amber-500',
    bgGradient: 'from-amber-500 to-orange-500'
  },
  EXTRA_ZONE: {
    id: 'extra_zone',
    name: 'Zona Extra',
    description: 'Añade 1 zona segura adicional',
    icon: MapPin,
    color: 'bg-emerald-500',
    bgGradient: 'from-emerald-500 to-teal-500'
  },
  THREAT_SCAN: {
    id: 'threat_scan',
    name: 'Análisis Gratis',
    description: 'Analiza 1 mensaje sospechoso',
    icon: Shield,
    color: 'bg-blue-500',
    bgGradient: 'from-blue-500 to-indigo-500'
  }
};

// Componente de tarjeta de recompensa
const RewardCard = ({ reward, onWatch, disabled, adsRemaining }) => {
  const IconComponent = reward.icon;
  
  return (
    <Card className={`border-2 hover:border-emerald-300 transition-all cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${reward.bgGradient} flex items-center justify-center`}>
            <IconComponent className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900">{reward.name}</h4>
            <p className="text-sm text-gray-500">{reward.description}</p>
          </div>
          <Button
            onClick={() => onWatch(reward)}
            disabled={disabled}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            size="sm"
          >
            <Play className="w-4 h-4" />
            Ver
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Modal de anuncio
const AdModal = ({ reward, countdown, onComplete, onClose }) => {
  const IconComponent = reward.icon;
  
  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4">
      <div className={`bg-gradient-to-br ${reward.bgGradient} rounded-3xl p-8 max-w-md text-center text-white relative`}>
        {/* Close button (disabled during countdown) */}
        {countdown <= 0 && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <IconComponent className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">{reward.name}</h2>
        <p className="text-white/80 mb-6">{reward.description}</p>
        
        {countdown > 0 ? (
          <>
            <div className="text-6xl font-bold mb-4">{countdown}</div>
            <p className="text-white/60 text-sm">Espera para reclamar tu recompensa...</p>
          </>
        ) : (
          <Button
            onClick={onComplete}
            className="bg-white text-emerald-600 hover:bg-white/90 font-bold h-14 px-8 text-lg rounded-xl"
          >
            <Gift className="w-5 h-5 mr-2" />
            ¡Reclamar {reward.name}!
          </Button>
        )}
        
        <p className="mt-6 text-xs text-white/50">
          Anuncio de ejemplo • En la app verás un video real
        </p>
      </div>
    </div>
  );
};

// Componente principal
const RewardedAdsPanel = ({ onRewardClaimed }) => {
  const [adsRemaining, setAdsRemaining] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [currentReward, setCurrentReward] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  
  // Cargar estado guardado
  useEffect(() => {
    const stored = localStorage.getItem('mano_rewarded_ads');
    if (stored) {
      const data = JSON.parse(stored);
      const today = new Date().toDateString();
      if (data.date === today) {
        setAdsRemaining(5 - data.count);
      }
    }
  }, []);
  
  // Countdown timer
  useEffect(() => {
    if (showModal && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showModal, countdown]);
  
  const handleWatchAd = (reward) => {
    if (adsRemaining <= 0) {
      toast.error('Has alcanzado el límite diario de anuncios');
      return;
    }
    
    setCurrentReward(reward);
    setCountdown(5);
    setShowModal(true);
    
    // Track evento
    if (window.ManoAds) {
      window.ManoAds._log('RewardedAdStarted', { reward_id: reward.id });
    }
  };
  
  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Actualizar contador local
      const today = new Date().toDateString();
      const stored = localStorage.getItem('mano_rewarded_ads');
      let count = 1;
      
      if (stored) {
        const data = JSON.parse(stored);
        if (data.date === today) {
          count = data.count + 1;
        }
      }
      
      localStorage.setItem('mano_rewarded_ads', JSON.stringify({
        date: today,
        count: count
      }));
      
      setAdsRemaining(5 - count);
      
      // Mostrar éxito
      toast.success(`🎁 ¡Has ganado ${currentReward.name}!`);
      
      // Callback
      if (onRewardClaimed) {
        onRewardClaimed(currentReward);
      }
      
      // Track conversión
      if (window.ManoAds) {
        window.ManoAds.trackLead({ reward_type: currentReward.id });
      }
      
    } catch (error) {
      toast.error('Error al reclamar recompensa');
    } finally {
      setIsLoading(false);
      setShowModal(false);
      setCurrentReward(null);
    }
  };
  
  const handleClose = () => {
    if (countdown > 0) return; // No cerrar durante countdown
    setShowModal(false);
    setCurrentReward(null);
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-600" />
            Recompensas Gratuitas
          </h3>
          <p className="text-sm text-gray-500">
            Mira anuncios cortos y gana beneficios
          </p>
        </div>
        <Badge variant="outline" className="text-emerald-600 border-emerald-200">
          {adsRemaining}/5 disponibles hoy
        </Badge>
      </div>
      
      {/* Lista de recompensas */}
      <div className="space-y-3">
        {Object.values(REWARDS).map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            onWatch={handleWatchAd}
            disabled={adsRemaining <= 0}
            adsRemaining={adsRemaining}
          />
        ))}
      </div>
      
      {/* Info */}
      {adsRemaining <= 0 && (
        <p className="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          ¡Vuelve mañana para más recompensas gratuitas!
        </p>
      )}
      
      {/* Modal de anuncio */}
      {showModal && currentReward && (
        <AdModal
          reward={currentReward}
          countdown={countdown}
          onComplete={handleComplete}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default RewardedAdsPanel;
export { REWARDS, RewardCard };
