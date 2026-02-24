/**
 * ManoProtect - Sticky CTA Bar Component
 * Barra de CTA fija que aparece al hacer scroll
 */
import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StickyCTA = ({ 
  productName = "Sentinel X",
  price = 149,
  originalPrice = 199,
  ctaText = "Comprar Ahora",
  onCTAClick,
  scrollThreshold = 400
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > scrollThreshold && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold, isDismissed]);

  // Track visibility for analytics
  useEffect(() => {
    if (isVisible && window.ManoProtectAnalytics) {
      window.ManoProtectAnalytics.trackEvent('sticky_cta_view', {
        product: productName
      });
    }
  }, [isVisible, productName]);

  const handleClick = () => {
    if (window.ManoProtectAnalytics) {
      window.ManoProtectAnalytics.trackEvent('sticky_cta_click', {
        product: productName,
        price: price
      });
    }
    if (onCTAClick) {
      onCTAClick();
    } else {
      // Scroll to purchase section
      const purchaseSection = document.getElementById('purchase-section');
      if (purchaseSection) {
        purchaseSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] animate-slide-up"
      style={{
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse-soft {
          0%, 100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Product Info */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src="https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png"
                alt={productName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm sm:text-base">{productName}</p>
              <div className="flex items-center gap-2">
                <span className="text-[#4CAF50] font-bold text-lg">{price}€</span>
                {originalPrice && (
                  <span className="text-gray-400 line-through text-sm">{originalPrice}€</span>
                )}
                <span className="hidden sm:inline bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">
                  -{Math.round((1 - price/originalPrice) * 100)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleClick}
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold px-6 py-3 text-sm sm:text-base"
              style={{ animation: 'pulse-soft 2s infinite' }}
              data-testid="sticky-cta-button"
            >
              <ShoppingCart className="w-4 h-4 mr-2 hidden sm:inline" />
              {ctaText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <button 
              onClick={() => setIsDismissed(true)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyCTA;
