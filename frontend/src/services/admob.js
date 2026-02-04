/**
 * ManoProtect - Google AdMob Integration
 * Rewarded Video and Native Ads for monetization
 */

// AdMob Configuration
const ADMOB_CONFIG = {
  APP_ID: 'ca-app-pub-7713974112203810~9265947358',
  REWARDED_VIDEO_UNIT: 'ca-app-pub-7713974112203810/4909676040',
  NATIVE_AD_UNIT: 'ca-app-pub-7713974112203810/5727933690',
  TEST_MODE: process.env.NODE_ENV !== 'production'
};

// AdMob State
let adMobInitialized = false;
let rewardedAd = null;

/**
 * Initialize AdMob SDK
 * This should be called once when the app starts
 */
export const initAdMob = async () => {
  if (adMobInitialized) return true;
  
  try {
    // For web, we use Google Publisher Tag (GPT) or AdSense
    // For native apps (via PWABuilder), AdMob SDK will be used
    
    // Check if running as installed PWA
    const isInstalledPWA = window.matchMedia('(display-mode: standalone)').matches ||
                           window.navigator.standalone === true;
    
    if (isInstalledPWA) {
      console.log('[AdMob] Running as PWA - native ads available');
    } else {
      console.log('[AdMob] Running in browser - web ads available');
    }
    
    adMobInitialized = true;
    return true;
  } catch (error) {
    console.error('[AdMob] Initialization error:', error);
    return false;
  }
};

/**
 * Load a rewarded video ad
 * Call this before you want to show the ad
 */
export const loadRewardedAd = async () => {
  if (!adMobInitialized) {
    await initAdMob();
  }
  
  try {
    console.log('[AdMob] Loading rewarded ad...');
    // For PWA/Web, rewarded ads work differently
    // This is a placeholder for the native implementation
    rewardedAd = {
      loaded: true,
      unitId: ADMOB_CONFIG.REWARDED_VIDEO_UNIT
    };
    return true;
  } catch (error) {
    console.error('[AdMob] Failed to load rewarded ad:', error);
    return false;
  }
};

/**
 * Show rewarded video ad
 * Returns a promise that resolves when user completes the ad
 */
export const showRewardedAd = async (onReward) => {
  if (!rewardedAd?.loaded) {
    const loaded = await loadRewardedAd();
    if (!loaded) {
      console.warn('[AdMob] No rewarded ad available');
      // Give reward anyway in test mode or if ad fails
      if (ADMOB_CONFIG.TEST_MODE && onReward) {
        onReward({ type: 'test_reward', amount: 1 });
      }
      return false;
    }
  }
  
  try {
    console.log('[AdMob] Showing rewarded ad...');
    
    // Simulate ad display for testing
    if (ADMOB_CONFIG.TEST_MODE) {
      // In test mode, simulate a short delay then reward
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (onReward) {
        onReward({ type: 'coins', amount: 10 });
      }
      console.log('[AdMob] Test reward granted');
      return true;
    }
    
    // Production implementation would use AdMob SDK
    // This is handled by the native wrapper (PWABuilder)
    return true;
  } catch (error) {
    console.error('[AdMob] Error showing rewarded ad:', error);
    return false;
  }
};

/**
 * Native Ad Component Configuration
 * For use with React components
 */
export const getNativeAdConfig = () => ({
  unitId: ADMOB_CONFIG.NATIVE_AD_UNIT,
  testMode: ADMOB_CONFIG.TEST_MODE,
  // Native ad layout options
  layout: {
    headline: true,
    body: true,
    callToAction: true,
    icon: true,
    image: false, // Set to true for image ads
    starRating: false
  }
});

/**
 * Check if ads are available
 */
export const areAdsAvailable = () => {
  return adMobInitialized;
};

/**
 * Get AdMob configuration (for native wrapper)
 */
export const getAdMobConfig = () => ADMOB_CONFIG;

export default {
  initAdMob,
  loadRewardedAd,
  showRewardedAd,
  getNativeAdConfig,
  areAdsAvailable,
  getAdMobConfig,
  ADMOB_CONFIG
};
