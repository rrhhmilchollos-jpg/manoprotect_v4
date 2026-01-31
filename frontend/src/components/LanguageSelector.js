import React from 'react';
import { useI18n, languageNames } from '../i18n/I18nContext';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

export default function LanguageSelector({ className = '' }) {
  const { locale, setLocale, availableLocales } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center gap-2 ${className}`}
          data-testid="language-selector"
        >
          <Globe className="w-4 h-4" />
          <span>{languageNames[locale]?.flag}</span>
          <span className="hidden sm:inline">{languageNames[locale]?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        {availableLocales.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLocale(lang)}
            className={`flex items-center gap-2 cursor-pointer ${locale === lang ? 'bg-emerald-50 text-emerald-700' : ''}`}
          >
            <span className="text-lg">{languageNames[lang]?.flag}</span>
            <span>{languageNames[lang]?.name}</span>
            {locale === lang && (
              <span className="ml-auto text-emerald-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
