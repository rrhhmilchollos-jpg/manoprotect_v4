import React, { createContext, useContext, useState, useEffect } from 'react';
import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';

const translations = {
  es: esTranslations,
  en: enTranslations
};

// Countries that speak Spanish
const spanishCountries = [
  'ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU', 
  'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR'
];

const I18nContext = createContext();

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('manoprotect_locale');
    if (saved && translations[saved]) {
      return saved;
    }
    // Default to Spanish
    return 'es';
  });
  
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectedCountry, setDetectedCountry] = useState(null);

  useEffect(() => {
    // Only detect if no saved preference
    const saved = localStorage.getItem('manoprotect_locale');
    if (!saved) {
      detectCountryByIP();
    } else {
      setIsDetecting(false);
    }
  }, []);

  const detectCountryByIP = async () => {
    try {
      // Use free IP geolocation API
      const response = await fetch('https://ipapi.co/json/', {
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        const countryCode = data.country_code || data.country;
        setDetectedCountry(countryCode);
        
        // Set language based on country
        if (spanishCountries.includes(countryCode)) {
          setLocale('es');
        } else {
          setLocale('en');
        }
      }
    } catch (error) {
      console.log('Could not detect country, using default language');
      // Fallback: check browser language
      const browserLang = navigator.language?.split('-')[0];
      if (browserLang === 'es') {
        setLocale('es');
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const changeLocale = (newLocale) => {
    if (translations[newLocale]) {
      setLocale(newLocale);
      localStorage.setItem('manoprotect_locale', newLocale);
    }
  };

  // Translation function with nested key support
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // Replace parameters
    let result = value;
    Object.keys(params).forEach(param => {
      result = result.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });
    
    return result;
  };

  const value = {
    locale,
    setLocale: changeLocale,
    t,
    isDetecting,
    detectedCountry,
    availableLocales: Object.keys(translations),
    isSpanish: locale === 'es',
    isEnglish: locale === 'en'
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export default I18nContext;
