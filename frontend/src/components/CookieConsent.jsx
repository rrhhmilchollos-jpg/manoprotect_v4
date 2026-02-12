import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie, X, Settings, Check } from 'lucide-react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('manoprotect_cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true };
    localStorage.setItem('manoprotect_cookie_consent', JSON.stringify(allAccepted));
    localStorage.setItem('manoprotect_cookie_date', new Date().toISOString());
    setShowBanner(false);
  };

  const acceptSelected = () => {
    localStorage.setItem('manoprotect_cookie_consent', JSON.stringify(preferences));
    localStorage.setItem('manoprotect_cookie_date', new Date().toISOString());
    setShowBanner(false);
    setShowSettings(false);
  };

  const rejectAll = () => {
    const onlyNecessary = { necessary: true, analytics: false, marketing: false };
    localStorage.setItem('manoprotect_cookie_consent', JSON.stringify(onlyNecessary));
    localStorage.setItem('manoprotect_cookie_date', new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t-2 border-indigo-600 shadow-2xl">
      <div className="max-w-7xl mx-auto p-6">
        {!showSettings ? (
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-start gap-4 flex-1">
              <Cookie className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg text-zinc-900 mb-1">🍪 Utilizamos cookies</h3>
                <p className="text-sm text-zinc-600">
                  Usamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y personalizar contenido. 
                  Puedes aceptar todas, configurar tus preferencias o rechazar las no esenciales. 
                  <a href="/privacy-policy" className="text-indigo-600 hover:underline ml-1" aria-label="Leer nuestra política de privacidad y cookies">Leer política de privacidad</a>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={rejectAll}
                className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
              >
                Solo necesarias
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSettings(true)}
                className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
              <Button
                onClick={acceptAll}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Aceptar todas
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-zinc-900">Configuración de Cookies</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                <div>
                  <p className="font-medium text-zinc-900">Cookies necesarias</p>
                  <p className="text-sm text-zinc-500">Imprescindibles para el funcionamiento del sitio</p>
                </div>
                <input type="checkbox" checked disabled className="w-5 h-5 accent-indigo-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                <div>
                  <p className="font-medium text-zinc-900">Cookies analíticas</p>
                  <p className="text-sm text-zinc-500">Nos ayudan a mejorar el sitio web</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                  className="w-5 h-5 accent-indigo-600"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                <div>
                  <p className="font-medium text-zinc-900">Cookies de marketing</p>
                  <p className="text-sm text-zinc-500">Permiten mostrarte publicidad personalizada</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                  className="w-5 h-5 accent-indigo-600"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={rejectAll}>
                Rechazar opcionales
              </Button>
              <Button onClick={acceptSelected} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Guardar preferencias
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;
