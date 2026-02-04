/**
 * ManoProtect - Rewarded Ad Component
 * Shows rewarded video ads with callback for rewards
 */
import { useState } from 'react';
import { Gift, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showRewardedAd, loadRewardedAd } from '@/services/admob';
import { toast } from 'sonner';

const RewardedAdButton = ({ 
  onReward, 
  rewardText = 'Ver anuncio',
  rewardDescription = 'Mira un anuncio y recibe una recompensa',
  className = '',
  variant = 'default'
}) => {
  const [loading, setLoading] = useState(false);
  const [adReady, setAdReady] = useState(false);

  // Pre-load ad when component mounts
  useState(() => {
    loadRewardedAd().then(ready => setAdReady(ready));
  }, []);

  const handleShowAd = async () => {
    setLoading(true);
    
    try {
      const success = await showRewardedAd((reward) => {
        console.log('[RewardedAd] Reward received:', reward);
        toast.success('¡Recompensa recibida!', {
          description: `Has ganado ${reward.amount} ${reward.type}`
        });
        if (onReward) {
          onReward(reward);
        }
      });
      
      if (!success) {
        toast.info('Anuncio no disponible', {
          description: 'Inténtalo de nuevo más tarde'
        });
      }
    } catch (error) {
      console.error('[RewardedAd] Error:', error);
      toast.error('Error al mostrar anuncio');
    } finally {
      setLoading(false);
      // Reload ad for next time
      loadRewardedAd().then(ready => setAdReady(ready));
    }
  };

  return (
    <Button
      onClick={handleShowAd}
      disabled={loading}
      variant={variant}
      className={`flex items-center gap-2 ${className}`}
      data-testid="rewarded-ad-button"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando...
        </>
      ) : (
        <>
          <Gift className="w-4 h-4" />
          {rewardText}
        </>
      )}
    </Button>
  );
};

/**
 * Rewarded Ad Card - More prominent display
 */
export const RewardedAdCard = ({ onReward, className = '' }) => {
  const [loading, setLoading] = useState(false);

  const handleShowAd = async () => {
    setLoading(true);
    try {
      await showRewardedAd((reward) => {
        toast.success('¡Recompensa obtenida!');
        if (onReward) onReward(reward);
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-700 ${className}`}
      data-testid="rewarded-ad-card"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
          <Gift className="w-7 h-7 text-amber-600 dark:text-amber-300" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            ¡Gana recompensas!
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Mira un video corto y obtén beneficios
          </p>
        </div>
        <Button
          onClick={handleShowAd}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Ver
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RewardedAdButton;
