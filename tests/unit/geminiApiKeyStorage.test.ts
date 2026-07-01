import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const VALID_KEY = 'AIzaSyTestKey_12345678901234567890';

describe('geminiApiKeyStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  it('returns null when no key is stored', async () => {
    const { getGeminiApiKey, hasGeminiApiKey } = await import('@/services/geminiApiKeyStorage');
    expect(getGeminiApiKey()).toBeNull();
    expect(hasGeminiApiKey()).toBe(false);
  });

  it('persists key in sessionStorage', async () => {
    const { setGeminiApiKey, getGeminiApiKey } = await import('@/services/geminiApiKeyStorage');
    setGeminiApiKey(VALID_KEY);
    expect(sessionStorage.getItem('gemini_api_key')).toBe(VALID_KEY);
    expect(getGeminiApiKey()).toBe(VALID_KEY);
  });

  it('migrates legacy localStorage key to sessionStorage', async () => {
    localStorage.setItem('gemini_api_key', VALID_KEY);
    const { getGeminiApiKey } = await import('@/services/geminiApiKeyStorage');
    expect(getGeminiApiKey()).toBe(VALID_KEY);
    expect(sessionStorage.getItem('gemini_api_key')).toBe(VALID_KEY);
    expect(localStorage.getItem('gemini_api_key')).toBeNull();
  });

  it('clears key from both storages', async () => {
    const { setGeminiApiKey, clearGeminiApiKey, getGeminiApiKey } = await import(
      '@/services/geminiApiKeyStorage'
    );
    setGeminiApiKey(VALID_KEY);
    clearGeminiApiKey();
    expect(getGeminiApiKey()).toBeNull();
    expect(sessionStorage.getItem('gemini_api_key')).toBeNull();
    expect(localStorage.getItem('gemini_api_key')).toBeNull();
  });

  it('validates plausible Gemini key format', async () => {
    const { isPlausibleGeminiApiKey } = await import('@/services/geminiApiKeyStorage');
    expect(isPlausibleGeminiApiKey(VALID_KEY)).toBe(true);
    expect(isPlausibleGeminiApiKey('not-a-key')).toBe(false);
    expect(isPlausibleGeminiApiKey('AIza short')).toBe(false);
  });

  it('notifies listeners on key change', async () => {
    const { setGeminiApiKey, onGeminiApiKeyChange } = await import(
      '@/services/geminiApiKeyStorage'
    );
    const listener = vi.fn();
    const unsubscribe = onGeminiApiKeyChange(listener);
    setGeminiApiKey(VALID_KEY);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    setGeminiApiKey(`${VALID_KEY}x`);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('resolveGeminiApiKey prefers sessionStorage over dev fallback', async () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_ALLOW_BUILD_TIME_GEMINI_KEY', 'true');
    vi.stubEnv('VITE_API_KEY', 'AIzaSyFallbackKey_123456789012345678');
    const { setGeminiApiKey, resolveGeminiApiKey } = await import('@/services/geminiApiKeyStorage');
    setGeminiApiKey(VALID_KEY);
    expect(resolveGeminiApiKey()).toBe(VALID_KEY);
  });

  it('getBuildTimeGeminiKeyFallback is disabled outside dev', async () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_ALLOW_BUILD_TIME_GEMINI_KEY', 'true');
    vi.stubEnv('VITE_API_KEY', VALID_KEY);
    const { getBuildTimeGeminiKeyFallback, resolveGeminiApiKey } = await import(
      '@/services/geminiApiKeyStorage'
    );
    expect(getBuildTimeGeminiKeyFallback()).toBeNull();
    expect(resolveGeminiApiKey()).toBeNull();
  });

  it('getBuildTimeGeminiKeyFallback returns env key only when dev flag enabled', async () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_ALLOW_BUILD_TIME_GEMINI_KEY', 'true');
    vi.stubEnv('VITE_API_KEY', 'AIzaSyFallbackKey_123456789012345678');
    const { getBuildTimeGeminiKeyFallback } = await import('@/services/geminiApiKeyStorage');
    expect(getBuildTimeGeminiKeyFallback()).toBe('AIzaSyFallbackKey_123456789012345678');
  });

  it('getBuildTimeGeminiKeyFallback is disabled without explicit dev flag', async () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_API_KEY', VALID_KEY);
    const { getBuildTimeGeminiKeyFallback, resolveGeminiApiKey } = await import(
      '@/services/geminiApiKeyStorage'
    );
    expect(getBuildTimeGeminiKeyFallback()).toBeNull();
    expect(resolveGeminiApiKey()).toBeNull();
  });

  it('resolveGeminiApiKey uses dev fallback when no session key', async () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_ALLOW_BUILD_TIME_GEMINI_KEY', 'true');
    vi.stubEnv('VITE_API_KEY', 'AIzaSyFallbackKey_123456789012345678');
    const { resolveGeminiApiKey } = await import('@/services/geminiApiKeyStorage');
    expect(resolveGeminiApiKey()).toBe('AIzaSyFallbackKey_123456789012345678');
  });
});
