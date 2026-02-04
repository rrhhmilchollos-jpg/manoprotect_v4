/**
 * ManoProtect - Interstitial Ad Component
 * Shows a full-screen ad overlay on app launch or between screens
 * Works for both web (AdSense) and native (AdMob via PWA)
 */
import { useState, useEffect, useCallback } from 'react';
import { X, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Ad configuration
const AD_CONFIG = {
  // AdMob IDs for native app
  ADMOB_APP_ID: 'ca-app-pub-7713974112203810~9265947358',
  ADMOB_INTERSTITIAL_ID: 'ca-app-pub-7713974112203810/XXXXXXXXXX', // Replace with actual ID
  
  // Display settings
  COUNTDOWN_SECONDS: 5,
  SHOW_AFTER_VIEWS: 3, // Show ad after X page views
  MIN_INTERVAL_MS: 60000, // Minimum 60 seconds between ads
  
  // Storage keys
  STORAGE_KEY_VIEWS: 'mano_ad_views',
  STORAGE_KEY_LAST_AD: 'mano_last_ad_time',
  STORAGE_KEY_DISMISSED: 'mano_ad_session_dismissed'
};

/**
 * Check if user is on a premium plan (skip ads for premium users)
 */
const isPremiumUser = (user) => {
  if (!user) return false;
  const premiumPlans = ['family-yearly', 'family-monthly', 'family-quarterly', 
                        'premium', 'premium-yearly', 'premium-monthly', 'enterprise'];
  return premiumPlans.includes(user.plan);
};

/**
 * Check if we should show an ad based on frequency rules
 */
const shouldShowAd = (user) => {
  // Skip for premium users
  if (isPremiumUser(user)) {
    console.log('[Ads] Premium user - skipping ads');
    return false;
  }
  
  // Check if already dismissed this session
  const sessionDismissed = sessionStorage.getItem(AD_CONFIG.STORAGE_KEY_DISMISSED);
  if (sessionDismissed === 'true') {
    return false;
  }
  
  // Check minimum interval
  const lastAdTime = parseInt(localStorage.getItem(AD_CONFIG.STORAGE_KEY_LAST_AD) || '0');
  const timeSinceLastAd = Date.now() - lastAdTime;
  if (timeSinceLastAd < AD_CONFIG.MIN_INTERVAL_MS) {
    console.log('[Ads] Too soon since last ad');
    return false;
  }
  
  // Check view count
  const viewCount = parseInt(localStorage.getItem(AD_CONFIG.STORAGE_KEY_VIEWS) || '0');
  if (viewCount < AD_CONFIG.SHOW_AFTER_VIEWS) {
    // Increment view count
    localStorage.setItem(AD_CONFIG.STORAGE_KEY_VIEWS, String(viewCount + 1));
    return false;
  }
  
  return true;
};

/**
 * Record that an ad was shown
 */
const recordAdShown = () => {
  localStorage.setItem(AD_CONFIG.STORAGE_KEY_LAST_AD, String(Date.now()));
  localStorage.setItem(AD_CONFIG.STORAGE_KEY_VIEWS, '0'); // Reset view count
};

/**
 * InterstitialAd Component
 * Displays a full-screen promotional interstitial
 */
export const InterstitialAd = ({ user, onClose, onAdComplete }) => {
  const [countdown, setCountdown] = useState(AD_CONFIG.COUNTDOWN_SECONDS);
  const [canClose, setCanClose] = useState(false);
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanClose(true);
    }
  }, [countdown]);
  
  const handleClose = useCallback(() => {
    recordAdShown();
    sessionStorage.setItem(AD_CONFIG.STORAGE_KEY_DISMISSED, 'true');
    onClose?.();
    onAdComplete?.();
  }, [onClose, onAdComplete]);
  
  const handleUpgrade = useCallback(() => {
    handleClose();
    window.location.href = '/pricing';
  }, [handleClose]);
  
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-emerald-600 to-teal-700 flex flex-col items-center justify-center p-6">
      {/* Close button */}
      <div className="absolute top-4 right-4">
        {canClose ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full"
            data-testid="close-interstitial-btn"
          >
            <X className="w-6 h-6" />
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-white/80 bg-white/10 rounded-full px-3 py-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{countdown}s</span>
          </div>
        )}
      </div>
      
      {/* Main content */}
      <div className="max-w-md text-center text-white">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold mb-4">
          ¿Sabías que...?
        </h2>
        
        <p className="text-lg text-white/90 mb-6">
          Los usuarios <span className="font-bold text-yellow-300">Premium</span> de ManoProtect 
          disfrutan de una experiencia <span className="font-bold">sin anuncios</span> y con 
          todas las funciones desbloqueadas.
        </p>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
            <span className="text-2xl">🚫</span>
            <span className="text-left">Sin anuncios ni interrupciones</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
            <span className="text-2xl">📍</span>
            <span className="text-left">Zonas seguras ilimitadas</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
            <span className="text-left">Protege hasta 5 familiares</span>
          </div>
        </div>
        
        <Button 
          onClick={handleUpgrade}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-14 text-lg rounded-xl"
          data-testid="upgrade-from-ad-btn"
        >
          Actualizar a Premium
        </Button>
        
        {canClose && (
          <button 
            onClick={handleClose}
            className="mt-4 text-white/60 hover:text-white text-sm underline"
          >
            Continuar con versión gratuita
          </button>
        )}
      </div>
      
      {/* AdMob tag for native app */}
      <div 
        id="admob-interstitial-container" 
        className="hidden"
        data-ad-unit={AD_CONFIG.ADMOB_INTERSTITIAL_ID}
      />
    </div>
  );
};

/**
 * Hook to manage interstitial ad display
 */
export const useInterstitialAd = (user) => {
  const [showAd, setShowAd] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  
  useEffect(() => {
    if (!hasChecked) {
      setHasChecked(true);
      if (shouldShowAd(user)) {
        // Small delay to let the app render first
        const timer = setTimeout(() => setShowAd(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, hasChecked]);
  
  const closeAd = useCallback(() => {
    setShowAd(false);
  }, []);
  
  const triggerAd = useCallback(() => {
    if (!isPremiumUser(user)) {
      setShowAd(true);
    }
  }, [user]);
  
  return { showAd, closeAd, triggerAd };
};

/**
 * Reset ad tracking (for testing)
 */
export const resetAdTracking = () => {
  localStorage.removeItem(AD_CONFIG.STORAGE_KEY_VIEWS);
  localStorage.removeItem(AD_CONFIG.STORAGE_KEY_LAST_AD);
  sessionStorage.removeItem(AD_CONFIG.STORAGE_KEY_DISMISSED);
  console.log('[Ads] Tracking reset');
};

export default InterstitialAd;
