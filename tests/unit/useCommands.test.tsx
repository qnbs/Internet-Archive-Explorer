import { renderHook } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCommands } from '@/hooks/useCommands';
import { languageAtom } from '@/store/i18n';
import { deferredPromptAtom, isAppInstalledAtom } from '@/store/pwa';
import { themeAtom } from '@/store/settings';

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
  }),
}));

function renderCommands() {
  const navigateTo = vi.fn();
  const globalSearch = vi.fn();
  const onClosePalette = vi.fn();
  const hook = renderHook(() => useCommands({ navigateTo, globalSearch, onClosePalette }));
  return { ...hook, navigateTo, globalSearch, onClosePalette };
}

describe('useCommands', () => {
  beforeEach(() => {
    const store = getDefaultStore();
    store.set(themeAtom, 'dark');
    store.set(languageAtom, 'en');
    store.set(isAppInstalledAtom, false);
    store.set(deferredPromptAtom, null);
  });

  it('wires nav-explore to navigateTo(explore)', () => {
    const { result, navigateTo } = renderCommands();
    const cmd = result.current.find((c) => c.id === 'nav-explore');
    cmd?.action();
    expect(navigateTo).toHaveBeenCalledWith('explore');
  });

  it('toggles theme via action-theme command', () => {
    const { result } = renderCommands();
    const cmd = result.current.find((c) => c.id === 'action-theme');
    cmd?.action();
    expect(getDefaultStore().get(themeAtom)).toBe('light');
  });

  it('toggles language via action-language command', () => {
    const { result } = renderCommands();
    const cmd = result.current.find((c) => c.id === 'action-language');
    cmd?.action();
    expect(getDefaultStore().get(languageAtom)).toBe('de');
  });
});
