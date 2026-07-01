/**
 * Browser-only Gemini API key storage (BYOK).
 * Keys live in sessionStorage (tab-scoped). Legacy localStorage keys are migrated once.
 * Never use build-time VITE_* keys in production AI flows.
 */

export const GEMINI_API_KEY_STORAGE_KEY = 'gemini_api_key';
const STORAGE_VERSION_KEY = 'gemini_api_key_storage_v1';

const getSessionStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage;
};

const getLocalStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

/** Basic format check — Gemini keys typically start with AIza */
export const isPlausibleGeminiApiKey = (key: string): boolean =>
  /^AIza[\w-]{20,}$/.test(key.trim());

export const getGeminiApiKey = (): string | null => {
  const session = getSessionStorage();
  const local = getLocalStorage();
  if (!session) return null;

  const sessionValue = session.getItem(GEMINI_API_KEY_STORAGE_KEY)?.trim();
  if (sessionValue) return sessionValue;

  const legacyValue = local?.getItem(GEMINI_API_KEY_STORAGE_KEY)?.trim();
  if (legacyValue) {
    session.setItem(GEMINI_API_KEY_STORAGE_KEY, legacyValue);
    local?.removeItem(GEMINI_API_KEY_STORAGE_KEY);
    session.setItem(STORAGE_VERSION_KEY, '1');
    return legacyValue;
  }

  return null;
};

export const setGeminiApiKey = (key: string): void => {
  const trimmed = key.trim();
  const session = getSessionStorage();
  const local = getLocalStorage();
  if (!session || !trimmed) return;

  session.setItem(GEMINI_API_KEY_STORAGE_KEY, trimmed);
  session.setItem(STORAGE_VERSION_KEY, '1');
  local?.removeItem(GEMINI_API_KEY_STORAGE_KEY);
  notifyGeminiApiKeyChange();
};

export const clearGeminiApiKey = (): void => {
  getSessionStorage()?.removeItem(GEMINI_API_KEY_STORAGE_KEY);
  getLocalStorage()?.removeItem(GEMINI_API_KEY_STORAGE_KEY);
  notifyGeminiApiKeyChange();
};

export const hasGeminiApiKey = (): boolean => Boolean(getGeminiApiKey());

const keyChangeListeners = new Set<() => void>();

/** Register listener when BYOK key changes (clears cached Gemini client). */
export const onGeminiApiKeyChange = (listener: () => void): (() => void) => {
  keyChangeListeners.add(listener);
  return () => keyChangeListeners.delete(listener);
};

const notifyGeminiApiKeyChange = (): void => {
  for (const listener of keyChangeListeners) {
    listener();
  }
};

/** Optional dev/CI demo fallback — never enabled in production builds by default */
export const getBuildTimeGeminiKeyFallback = (): string | null => {
  if (!import.meta.env.DEV) return null;
  if (import.meta.env.VITE_ALLOW_BUILD_TIME_GEMINI_KEY !== 'true') return null;
  const key = import.meta.env.VITE_API_KEY?.trim();
  return key || null;
};

export const resolveGeminiApiKey = (): string | null =>
  getGeminiApiKey() ?? getBuildTimeGeminiKeyFallback();
