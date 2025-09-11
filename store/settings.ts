import { atom } from 'jotai';
import { atomWithStorage, selectAtom, loadable } from 'jotai/utils';
import type { AppSettings, Theme, Language } from '../types';

export const STORAGE_KEYS = {
    settings: 'app-settings-v2',
    theme: 'app-theme',
    language: 'app-language',
};

// --- Settings ---
export const defaultSettings: AppSettings = {
    resultsPerPage: 24,
    showExplorerHub: true,
    defaultUploaderDetailTab: 'uploads',
    defaultAiTab: 'description',
    autoRunEntityExtraction: false,
    autoplayMedia: false,
    reduceMotion: false,
    enableAiFeatures: true,
};

export const settingsAtom = atomWithStorage<AppSettings>(STORAGE_KEYS.settings, defaultSettings);

// Write-only atom to update a single setting
export const setSettingAtom = atom(
    null,
    (get, set, { key, value }: { key: keyof AppSettings; value: AppSettings[keyof AppSettings] }) => {
        set(settingsAtom, (prev) => ({ ...prev, [key]: value }));
    }
);

// Write-only atom to reset all settings
export const resetSettingsAtom = atom(null, (get, set) => {
    set(settingsAtom, defaultSettings);
});

// --- Selected Atoms for Performance ---
// By using selectAtom, components will only re-render when the specific value they depend on changes.
export const resultsPerPageAtom = selectAtom(settingsAtom, s => s.resultsPerPage);
export const showExplorerHubAtom = selectAtom(settingsAtom, s => s.showExplorerHub);
export const defaultUploaderDetailTabAtom = selectAtom(settingsAtom, s => s.defaultUploaderDetailTab);
export const defaultAiTabAtom = selectAtom(settingsAtom, s => s.defaultAiTab);
export const autoRunEntityExtractionAtom = selectAtom(settingsAtom, s => s.autoRunEntityExtraction);
export const autoplayMediaAtom = selectAtom(settingsAtom, s => s.autoplayMedia);
export const reduceMotionAtom = selectAtom(settingsAtom, s => s.reduceMotion);
export const enableAiFeaturesAtom = selectAtom(settingsAtom, s => s.enableAiFeatures);

// --- Theme ---
export const themeAtom = atomWithStorage<Theme>(STORAGE_KEYS.theme, 'system');

const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const systemThemeAtom = atom<'light' | 'dark'>(systemThemeQuery.matches ? 'dark' : 'light');
systemThemeAtom.onMount = (setAtom) => {
    const listener = () => setAtom(systemThemeQuery.matches ? 'dark' : 'light');
    systemThemeQuery.addEventListener('change', listener);
    return () => systemThemeQuery.removeEventListener('change', listener);
};

export const resolvedThemeAtom = atom<'light' | 'dark'>((get) => {
  const theme = get(themeAtom);
  return theme === 'system' ? get(systemThemeAtom) : theme;
});

// --- Language & Translations ---
export const languageAtom = atomWithStorage<Language>(STORAGE_KEYS.language, 'en');

const NAMESPACES = [
  'common', 'header', 'sideMenu', 'bottomNav', 'explorer', 'searchPopover', 
  'itemCard', 'recRoom', 'webArchive', 'imagesHub', 'videothek', 'audiothek', 
  'scriptorium', 'favorites', 'uploaderHub', 'uploaderProfileCard', 'uploaderDetail', 
  'reviewCard', 'modals', 'audioModal', 'videoModal', 'aiTools', 'settings', 'help', 
  'commandPalette', 'uploaders', 'uploaderCard', 'storyteller'
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
