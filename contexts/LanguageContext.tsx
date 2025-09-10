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
        // Default to English for all new users, removing browser language detection.
        setLanguageState('en');
      }
    } catch (e) {
      console.error("Could not access localStorage for language", e);
      setLanguageState('en');
    }
  }, []);

  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/${language}.json`);
        if (!response.ok) {
            throw new Error(`Could not load ${language}.json`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error('Failed to fetch translations:', error);
        // Attempt to load English as a fallback
        if (language !== 'en') {
            try {
                const fallbackResponse = await fetch(`/en.json`);
                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    setTranslations(fallbackData);
                }
            } catch (fallbackError) {
                console.error('Failed to fetch fallback translations:', fallbackError);
            }
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchTranslations();
  }, [language]);

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    let translationKey = key;
    // Handle pluralization based on 'count' replacement
    if (replacements && typeof replacements.count === 'number') {
        if (replacements.count === 1) {
            translationKey = `${key}_one`;
        } else {
            translationKey = `${key}_other`;
        }
    }
    
    let translation = getNestedTranslation(translations, translationKey);

    // If the pluralized key doesn't exist, fall back to the base key
    if (translation === undefined && translationKey !== key) {
        translation = getNestedTranslation(translations, key);
    }

    if (translation === undefined) {
      // Hardcoded fallback for 'common.loading' to prevent initial load warning.
      if (key === 'common.loading' && isLoading) {
          return language === 'de' ? 'Wird geladen...' : 'Loading...';
      }
      console.warn(`Translation key not found: ${key}`);
      return key; // Return key as fallback
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
