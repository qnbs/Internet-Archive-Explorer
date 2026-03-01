
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect } from 'react';
import { languageAtom, loadableTranslationsAtom } from '@/store/i18n';
import type { Language } from '@/types';

interface LanguageHook {
  language: Language;
  setLanguage: (update: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const getNestedTranslation = (obj: Record<string, unknown>, path: string): string | undefined => {
  let current: unknown = obj;

  for (const key of path.split('.')) {
    if (typeof current !== 'object' || current === null || !(key in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : undefined;
};

export const useLanguage = (): LanguageHook => {
    const [language, setLanguage] = useAtom(languageAtom);
    const loadableTranslations = useAtomValue(loadableTranslationsAtom);

    // Effect to update the HTML lang attribute for accessibility and browser behavior
    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
        if (loadableTranslations.state === 'loading') return '';
        if (loadableTranslations.state === 'hasError') {
             console.error('Translation loading failed:', loadableTranslations.error);
             return key;
        }
        
        const translations = loadableTranslations.data;
        const [namespace, ...pathParts] = key.split(':');
        const path = pathParts.join('.');

        if (!namespace || !path) {
          console.warn(`Invalid translation key format: ${key}`);
          return key;
        }
        
        const namespaceTranslations = translations[namespace];
        if (!namespaceTranslations) {
            console.warn(`Translation namespace not found: ${namespace}`);
            return path.split('.').pop() || key;
        }

        let template: string | undefined;

        if (replacements && typeof replacements.count === 'number') {
          const count = replacements.count;
          const pluralKey = `${path}_${count === 1 ? 'one' : 'other'}`;
          template = getNestedTranslation(namespaceTranslations, pluralKey);
        }

        if (template === undefined) {
          template = getNestedTranslation(namespaceTranslations, path);
        }

        if (template === undefined) {
          console.warn(`Translation key not found: ${key}`);
          return path.split('.').pop() || key;
        }
        
        let result = String(template);
        if (replacements) {
            Object.entries(replacements).forEach(([placeholder, value]) => {
                const regex = new RegExp(`{{${placeholder}}}`, 'g');
                result = result.replace(regex, String(value));
            });
        }
        return result;
    }, [loadableTranslations]);

    return {
        language,
        setLanguage,
        t,
        isLoading: loadableTranslations.state === 'loading',
    };
};
