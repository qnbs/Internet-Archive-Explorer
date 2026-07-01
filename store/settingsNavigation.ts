import { atom } from 'jotai';

export type SettingsFocusSection = 'ui' | 'accessibility' | 'search' | 'content' | 'ai' | 'data';

/** One-shot focus target when navigating to Settings (e.g. from GeminiKeyPrompt). */
export const settingsFocusSectionAtom = atom<SettingsFocusSection | null>(null);
