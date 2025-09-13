import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { safeAtomWithStorage } from './safeStorage';
import type { AppSettings, Theme, AccentColor } from '../types';

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
    rememberSort: false,
    
    // Appearance
    layoutDensity: 'comfortable',
    disableAnimations: false,
    accentColor: 'cyan',

    // Content & Hubs
    defaultView: 'explore',
    defaultUploaderDetailTab: 'uploads',
    defaultDetailTabAll: 'description',
    openLinksInNewTab: false,
    autoplayMedia: false,

    // AI Features
    enableAiFeatures: true,
    autoArchiveAI: true,
    defaultAiTab: 'description',
    autoRunEntityExtraction: false,
    summaryTone: 'detailed',

    // Accessibility
    highContrastMode: false,
    underlineLinks: false,
    fontSize: 'base',
    scrollbarColor: '#22d3ee', // Corresponds to Tailwind's cyan-400
};

export const settingsAtom = safeAtomWithStorage<AppSettings>(STORAGE_KEYS.settings, defaultSettings);

// Write-only atom to update a single setting
export const setSettingAtom = atom(
    null,
    (get, set, { key, value }: { key: keyof AppSettings; value: AppSettings[keyof AppSettings] }) => {
        const currentSettings = get(settingsAtom);
        set(settingsAtom, { ...currentSettings, [key]: value });
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
export const rememberSortAtom = selectAtom(settingsAtom, s => s.rememberSort);

export const layoutDensityAtom = selectAtom(settingsAtom, s => s.layoutDensity);
export const disableAnimationsAtom = selectAtom(settingsAtom, s => s.disableAnimations);
export const accentColorAtom = selectAtom(settingsAtom, s => s.accentColor);

export const defaultViewAtom = selectAtom(settingsAtom, s => s.defaultView);
export const defaultUploaderDetailTabAtom = selectAtom(settingsAtom, s => s.defaultUploaderDetailTab);
export const defaultDetailTabAllAtom = selectAtom(settingsAtom, s => s.defaultDetailTabAll);
export const openLinksInNewTabAtom = selectAtom(settingsAtom, s => s.openLinksInNewTab);
export const autoplayMediaAtom = selectAtom(settingsAtom, s => s.autoplayMedia);

export const enableAiFeaturesAtom = selectAtom(settingsAtom, s => s.enableAiFeatures);
export const autoArchiveAIAtom = selectAtom(settingsAtom, s => s.autoArchiveAI);
export const defaultAiTabAtom = selectAtom(settingsAtom, s => s.defaultAiTab);
export const autoRunEntityExtractionAtom = selectAtom(settingsAtom, s => s.autoRunEntityExtraction);
export const summaryToneAtom = selectAtom(settingsAtom, s => s.summaryTone);

export const highContrastModeAtom = selectAtom(settingsAtom, s => s.highContrastMode);
export const underlineLinksAtom = selectAtom(settingsAtom, s => s.underlineLinks);
export const fontSizeAtom = selectAtom(settingsAtom, s => s.fontSize);
export const scrollbarColorAtom = selectAtom(settingsAtom, s => s.scrollbarColor);


// --- Theme ---
export const themeAtom = safeAtomWithStorage<Theme>(STORAGE_KEYS.theme, 'system');

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