import { atom } from 'jotai';
import {
  clearGeminiApiKey,
  getGeminiApiKey,
  setGeminiApiKey,
} from '@/services/geminiApiKeyStorage';

const geminiApiKeyBaseAtom = atom(getGeminiApiKey() ?? '');

/** User-provided Gemini API key (BYOK). Persists in sessionStorage. */
export const geminiApiKeyAtom = atom(
  (get) => get(geminiApiKeyBaseAtom),
  (_get, set, next: string) => {
    const trimmed = next.trim();
    if (trimmed) {
      setGeminiApiKey(trimmed);
    } else {
      clearGeminiApiKey();
    }
    set(geminiApiKeyBaseAtom, trimmed);
  },
);

export const hasGeminiApiKeyAtom = atom((get) => Boolean(get(geminiApiKeyAtom).trim()));
