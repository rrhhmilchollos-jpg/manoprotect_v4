import React from 'react';
import { Shield, ArrowRight, Sparkles } from 'lucide-react';

/**
 * Sticky Mobile CTA - Botón fijo para móviles
 * Siempre visible para facilitar la conversión
 */
const StickyMobileCTA = ({ 
  text = "Protégete Ahora",
  subtext = "7 días GRATIS",
  href = "/pricing",
  show = true 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isScrollingUp, setIsScrollingUp] = React.useState(false);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show after scrolling 300px
      if (currentScrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Detect scroll direction
      setIsScrollingUp(currentScrollY < lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!show || !isVisible) return null;

  return (
    <>
      {/* Spacer to prevent content jump */}
      <div className="h-20 md:hidden" />
      
      {/* Sticky CTA */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ${
          isScrollingUp ? 'translate-y-0' : 'translate-y-0'
        }`}
      >
        {/* Gradient fade */}
        <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
        
        {/* CTA Container */}
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 safe-area-pb">
          <a
            href={href}
            className="flex items-center justify-between w-full px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">{text}</p>
                <p className="text-emerald-100 text-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {subtext}
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-white" />
          </a>
        </div>
      </div>

      <style jsx>{`
        .safe-area-pb {
          padding-bottom: max(12px, env(safe-area-inset-bottom));
        }
      `}</style>
    </>
  );
};

export default StickyMobileCTA;
