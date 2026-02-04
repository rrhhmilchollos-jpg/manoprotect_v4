/**
 * ManoProtect - Native Ad Component
 * Displays native ads in the dashboard and other pages
 */
import { useState, useEffect } from 'react';
import { getNativeAdConfig } from '@/services/admob';

const NativeAdBanner = ({ className = '', position = 'dashboard' }) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const config = getNativeAdConfig();

  useEffect(() => {
    // Simulate ad loading
    const loadAd = async () => {
      try {
        // In production, this would load from AdMob
        // For now, show a placeholder that will be replaced by native wrapper
        await new Promise(resolve => setTimeout(resolve, 500));
        setAdLoaded(true);
      } catch (error) {
        console.error('[NativeAd] Load error:', error);
        setAdError(true);
      }
    };
    
    loadAd();
  }, []);

  // Don't render anything if ad failed
  if (adError) return null;

  // Show loading skeleton while ad loads
  if (!adLoaded) {
    return (
      <div className={`animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg h-24 ${className}`}>
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          Cargando...
        </div>
      </div>
    );
  }

  // Native ad container - styled to match app design
  return (
    <div 
      className={`native-ad-container bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-blue-100 dark:border-gray-600 ${className}`}
      data-ad-unit={config.unitId}
      data-ad-position={position}
      data-testid="native-ad-banner"
    >
      {/* Ad content will be injected by AdMob SDK in native app */}
      <div className="flex items-center gap-4">
        {/* Ad icon placeholder */}
        <div className="w-12 h-12 bg-blue-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
          <span className="text-blue-500 dark:text-blue-300 text-xs font-medium">AD</span>
        </div>
        
        {/* Ad content placeholder */}
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Publicidad</p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Espacio publicitario
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Contenido patrocinado
          </p>
        </div>
        
        {/* CTA button placeholder */}
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
          Ver más
        </button>
      </div>
      
      {/* Native ad slot for AdMob SDK */}
      <div 
        id={`native-ad-slot-${position}`}
        className="native-ad-slot hidden"
        data-ad-unit-id={config.unitId}
      />
    </div>
  );
};

export default NativeAdBanner;
