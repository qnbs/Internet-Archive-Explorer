import { atom } from 'jotai';
import { loadable } from 'jotai/utils';
import type { Language } from '@/types';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';
import { safeAtomWithStorage } from './safeStorage';

export const STORAGE_KEYS = {
  language: 'app-language',
};

// --- Language & Translations ---
export const languageAtom = safeAtomWithStorage<Language>(STORAGE_KEYS.language, 'en');

const NAMESPACES = [
  'common',
  'header',
  'sideMenu',
  'bottomNav',
  'explorer',
  'searchPopover',
  'itemCard',
  'recRoom',
  'imagesHub',
  'videothek',
  'audiothek',
  'scriptorium',
  'favorites',
  'uploaderProfileCard',
  'uploaderDetail',
  'reviewCard',
  'modals',
  'aiTools',
  'settings',
  'help',
  'commandPalette',
  'uploaders',
  'storyteller',
  'webArchive',
  'myArchive',
  'uploaderHub',
  'aiArchive',
  'updateNotification',
  'installBanner',
  'pwaModal',
  'downloads',
  'forYou',
];
type TranslationMap = Record<string, unknown>;
const translationsCache = new Map<Language, TranslationMap>();
const baseUrl = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';

const withBaseUrl = (path: string): string => `${baseUrl}${path}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const languageTranslationsAtom = atom(async (get) => {
  const lang = get(languageAtom);
  if (translationsCache.has(lang)) {
    return translationsCache.get(lang)!;
  }

  const fetchNamespace = async (
    ns: string,
    language: Language,
  ): Promise<[string, TranslationMap]> => {
    try {
      const res = await fetchWithTimeout(withBaseUrl(`locales/${language}/${ns}.json`), {}, 10000);
      if (!res.ok) throw new Error(`Namespace fetch failed with status ${res.status}`);
      const data = (await res.json()) as unknown;
      if (!isRecord(data)) throw new Error(`Namespace '${ns}' is not a JSON object.`);
      return [ns, data];
    } catch (error) {
      console.warn(`Could not load '${ns}' for '${language}', falling back to 'en'.`);
      if (language !== 'en') {
        const fallbackRes = await fetchWithTimeout(withBaseUrl(`locales/en/${ns}.json`), {}, 10000);
        if (!fallbackRes.ok) throw new Error(`Fallback namespace '${ns}' for 'en' failed.`);
        const fallbackData = (await fallbackRes.json()) as unknown;
        if (!isRecord(fallbackData))
          throw new Error(`Fallback namespace '${ns}' is not a JSON object.`);
        return [ns, fallbackData];
      }
      throw error;
    }
  };

  const results = await Promise.all(NAMESPACES.map((ns) => fetchNamespace(ns, lang)));
  const combined = Object.fromEntries(results);

  translationsCache.set(lang, combined);
  return combined;
});

export const loadableTranslationsAtom = loadable(languageTranslationsAtom);
