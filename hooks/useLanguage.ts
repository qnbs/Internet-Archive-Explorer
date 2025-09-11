import { useAtom, useAtomValue } from 'jotai';
import { useCallback } from 'react';
import { languageAtom, loadableTranslationsAtom } from '../store';
import type { Language } from '../types';

interface LanguageHook {
  language: Language;
  setLanguage: (update: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const getNestedTranslation = (obj: Record<string, any>, path: string): string | undefined => {
  return path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);
};

export const useLanguage = (): LanguageHook => {
    const [language, setLanguage] = useAtom(languageAtom);
    const loadableTranslations = useAtomValue(loadableTranslationsAtom);

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
