
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import type { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to get nested properties from the translation object
const getNestedTranslation = (obj: any, path: string): string | undefined => {
  return path.split('.').reduce((o, key) => (o && o[key] !== 'undefined' ? o[key] : undefined), obj);
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedLang = localStorage.getItem('app-language') as Language;
      if (storedLang && ['en', 'de'].includes(storedLang)) {
        setLanguageState(storedLang);
      } else {
        setLanguageState('en');
      }
    } catch (e) {
      console.error("Could not access localStorage for language", e);
      setLanguageState('en');
    }
  }, []);

  useEffect(() => {
    const fetchTranslations = async (lang: Language) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/${lang}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load translations for ${lang}.`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error(`Failed to fetch translations for ${lang}:`, error);
        if (lang !== 'en') {
          console.warn("Falling back to English translations.");
          fetchTranslations('en');
        } else {
          setTranslations({}); // Avoid infinite loop if English fails
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchTranslations(language);
  }, [language]);

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    const [namespace, ...pathParts] = key.split(':');
    if (!namespace || pathParts.length === 0) {
        console.warn(`Invalid translation key format: ${key}`);
        return key;
    }
    const path = pathParts.join(':');

    let translationKey = path;
    if (replacements && typeof replacements.count === 'number') {
      const pluralKey = `${path}_${replacements.count === 1 ? 'one' : 'other'}`;
      if (translations[namespace]) {
          const pluralTranslation = getNestedTranslation(translations[namespace], pluralKey);
          if(pluralTranslation !== undefined) {
              translationKey = pluralKey;
          }
      }
    }

    const namespaceTranslations = translations[namespace];
    let translation = namespaceTranslations ? getNestedTranslation(namespaceTranslations, translationKey) : undefined;
    
    if (translation === undefined) {
      if (key === 'common:loading' && isLoading) {
          return language === 'de' ? 'Wird geladen...' : 'Loading...';
      }
      console.warn(`Translation key not found: ${key}`);
      return path.split('.').pop() || key;
    }
    
    let result = String(translation);
    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            const regex = new RegExp(`{{${placeholder}}}`, 'g');
            result = result.replace(regex, String(replacements[placeholder]));
        });
    }

    return result;
  }, [translations, isLoading, language]);

  const setLanguage = (lang: Language) => {
    try {
      localStorage.setItem('app-language', lang);
    } catch (error) {
      console.error('Failed to save language to localStorage', error);
    }
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
