import { atom } from 'jotai';
import { loadable } from 'jotai/utils';
import { safeAtomWithStorage } from './safeStorage';
import type { Language } from '../types';

export const STORAGE_KEYS = {
    language: 'app-language',
};

// --- Language & Translations ---
export const languageAtom = safeAtomWithStorage<Language>(STORAGE_KEYS.language, 'en');

const NAMESPACES = [
  'common', 'header', 'sideMenu', 'bottomNav', 'explorer', 'searchPopover', 
  'itemCard', 'recRoom', 'imagesHub', 'videothek', 'audiothek', 
  'scriptorium', 'favorites', 'uploaderProfileCard', 'uploaderDetail', 
  'reviewCard', 'modals', 'aiTools', 'settings', 'help', 
  'commandPalette', 'uploaders', 'storyteller', 'webArchive', 'myArchive',
  'uploaderHub', 'aiArchive', 'updateNotification', 'installBanner', 'pwaModal'
];
const translationsCache = new Map<Language, Record<string, any>>();

const languageTranslationsAtom = atom(async (get) => {
    const lang = get(languageAtom);
    if (translationsCache.has(lang)) {
        return translationsCache.get(lang)!;
    }

    const fetchNamespace = async (ns: string, language: Language): Promise<[string, any]> => {
        try {
            const res = await fetch(`/locales/${language}/${ns}.json`);
            if (!res.ok) throw new Error(`Namespace fetch failed with status ${res.status}`);
            return [ns, await res.json()];
        } catch (error) {
            console.warn(`Could not load '${ns}' for '${language}', falling back to 'en'.`);
            if (language !== 'en') {
                const fallbackRes = await fetch(`/locales/en/${ns}.json`);
                if (!fallbackRes.ok) throw new Error(`Fallback namespace '${ns}' for 'en' failed.`);
                return [ns, await fallbackRes.json()];
            }
            throw error;
        }
    };
    
    const results = await Promise.all(NAMESPACES.map(ns => fetchNamespace(ns, lang)));
    const combined = Object.fromEntries(results);

    translationsCache.set(lang, combined);
    return combined;
});

export const loadableTranslationsAtom = loadable(languageTranslationsAtom);