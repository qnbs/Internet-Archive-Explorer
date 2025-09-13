import { atom } from 'jotai';
import { atomWithStorage, selectAtom } from 'jotai/utils';
import type { AppSettings, Theme } from '../types';

export const STORAGE_KEYS = {
    settings: 'app-settings-v2',
    theme: 'app-theme',
};

// --- Settings ---
export const defaultSettings: AppSettings = {
    // Search & Discovery
    resultsPerPage: 24,
    showExplorerHub: true,
    defaultSort: 'downloads',
    rememberFilters: false,
    
    // Appearance
    layoutDensity: 'comfortable',
    reduceMotion: false,
    
    // Content & Hubs
    defaultUploaderDetailTab: 'uploads',
    defaultDetailTabAll: 'description',
    openLinksInNewTab: false,
    autoplayMedia: false,

    // AI Features
    enableAiFeatures: true,
    defaultAiTab: 'description',
    autoRunEntityExtraction: false,
    summaryTone: 'detailed',

    // Accessibility
    highContrastMode: false,
    underlineLinks: false,
    fontSize: 'base',
    scrollbarColor: '#22d3ee', // Corresponds to Tailwind's cyan-400
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
export const defaultSortAtom = selectAtom(settingsAtom, s => s.defaultSort);
export const rememberFiltersAtom = selectAtom(settingsAtom, s => s.rememberFilters);

export const layoutDensityAtom = selectAtom(settingsAtom, s => s.layoutDensity);
export const reduceMotionAtom = selectAtom(settingsAtom, s => s.reduceMotion);

export const defaultUploaderDetailTabAtom = selectAtom(settingsAtom, s => s.defaultUploaderDetailTab);
export const defaultDetailTabAllAtom = selectAtom(settingsAtom, s => s.defaultDetailTabAll);
export const openLinksInNewTabAtom = selectAtom(settingsAtom, s => s.openLinksInNewTab);
export const autoplayMediaAtom = selectAtom(settingsAtom, s => s.autoplayMedia);

export const enableAiFeaturesAtom = selectAtom(settingsAtom, s => s.enableAiFeatures);
export const defaultAiTabAtom = selectAtom(settingsAtom, s => s.defaultAiTab);
export const autoRunEntityExtractionAtom = selectAtom(settingsAtom, s => s.autoRunEntityExtraction);
export const summaryToneAtom = selectAtom(settingsAtom, s => s.summaryTone);

export const highContrastModeAtom = selectAtom(settingsAtom, s => s.highContrastMode);
export const underlineLinksAtom = selectAtom(settingsAtom, s => s.underlineLinks);
export const fontSizeAtom = selectAtom(settingsAtom, s => s.fontSize);
export const scrollbarColorAtom = selectAtom(settingsAtom, s => s.scrollbarColor);


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