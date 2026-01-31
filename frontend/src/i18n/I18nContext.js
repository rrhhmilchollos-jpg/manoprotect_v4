import React, { createContext, useContext, useState, useEffect } from 'react';
import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';
import deTranslations from './locales/de.json';
import itTranslations from './locales/it.json';
import ptTranslations from './locales/pt.json';
import zhTranslations from './locales/zh.json';
import ruTranslations from './locales/ru.json';
import arTranslations from './locales/ar.json';

const translations = {
  es: esTranslations,
  en: enTranslations,
  fr: frTranslations,
  de: deTranslations,
  it: itTranslations,
  pt: ptTranslations,
  zh: zhTranslations,
  ru: ruTranslations,
  ar: arTranslations
};

// Language metadata for selector
export const languageNames = {
  es: { name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  en: { name: 'English', flag: '🇬🇧', dir: 'ltr' },
  fr: { name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  de: { name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  it: { name: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  pt: { name: 'Português', flag: '🇵🇹', dir: 'ltr' },
  zh: { name: '中文', flag: '🇨🇳', dir: 'ltr' },
  ru: { name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  ar: { name: 'العربية', flag: '🇸🇦', dir: 'rtl' }
};

// Country to language mapping
const countryToLanguage = {
  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', PE: 'es', VE: 'es', CL: 'es', 
  EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es', 
  SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es', PR: 'es',
  // French
  FR: 'fr', BE: 'fr', CH: 'fr', CA: 'fr', LU: 'fr', MC: 'fr', SN: 'fr', 
  CI: 'fr', ML: 'fr', BF: 'fr', NE: 'fr', TG: 'fr', BJ: 'fr',
  // German
  DE: 'de', AT: 'de', LI: 'de',
  // Italian
  IT: 'it', SM: 'it', VA: 'it',
  // Portuguese
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt',
  // Chinese
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh', SG: 'zh',
  // Russian
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru',
  // Arabic
  SA: 'ar', AE: 'ar', EG: 'ar', MA: 'ar', DZ: 'ar', TN: 'ar', LY: 'ar', 
  JO: 'ar', LB: 'ar', SY: 'ar', IQ: 'ar', KW: 'ar', QA: 'ar', BH: 'ar', 
  OM: 'ar', YE: 'ar',
  // English (default for others)
  US: 'en', GB: 'en', AU: 'en', NZ: 'en', IE: 'en', ZA: 'en', IN: 'en'
};

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
    const saved = localStorage.getItem('manoprotect_locale');
    if (saved && translations[saved]) {
      return saved;
    }
    return 'es';
  });
  
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectedCountry, setDetectedCountry] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('manoprotect_locale');
    if (!saved) {
      detectCountryByIP();
    } else {
      setIsDetecting(false);
    }
  }, []);

  // Apply RTL direction for Arabic
  useEffect(() => {
    const dir = languageNames[locale]?.dir || 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale]);

  const detectCountryByIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/', {
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        const countryCode = data.country_code || data.country;
        setDetectedCountry(countryCode);
        
        // Set language based on country
        const detectedLang = countryToLanguage[countryCode] || 'en';
        setLocale(detectedLang);
      }
    } catch (error) {
      console.log('Could not detect country, using default language');
      // Fallback: check browser language
      const browserLang = navigator.language?.split('-')[0];
      if (translations[browserLang]) {
        setLocale(browserLang);
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
        return key;
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
    languageNames,
    isRTL: languageNames[locale]?.dir === 'rtl'
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export default I18nContext;
