import { act, renderHook } from '@testing-library/react';
import { createStore, Provider, type WritableAtom } from 'jotai';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type MockLoadable =
  | { state: 'loading' }
  | { state: 'hasError'; error: Error }
  | { state: 'hasData'; data: Record<string, Record<string, unknown>> };

vi.mock('@/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/store/i18n', async () => {
  const { atom } = await import('jotai');

  const languageAtom = atom<'en' | 'de'>('en');
  const loadableTranslationsAtom = atom<MockLoadable>({
    state: 'hasData',
    data: {
      common: {
        title: 'AppTitle',
        nested: { leaf: 'LeafVal' },
        greet_one: 'Hello',
        greet_other: 'Hello {{name}}',
      },
    },
  });

  return { languageAtom, loadableTranslationsAtom };
});

import { useLanguage } from '@/hooks/useLanguage';
import { languageAtom, loadableTranslationsAtom } from '@/store/i18n';

const writableTranslationsAtom = loadableTranslationsAtom as unknown as WritableAtom<
  MockLoadable,
  [MockLoadable],
  void
>;

const store = createStore();

function TestProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

describe('useLanguage', () => {
  beforeEach(() => {
    store.set(languageAtom, 'en');
    store.set(writableTranslationsAtom, {
      state: 'hasData',
      data: {
        common: {
          title: 'AppTitle',
          nested: { leaf: 'LeafVal' },
          greet_one: 'Hello',
          greet_other: 'Hello {{name}}',
        },
      },
    });
  });

  it('resolves nested translation keys', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: TestProvider });
    expect(result.current.t('common:nested.leaf')).toBe('LeafVal');
  });

  it('returns empty string for t() while translations are loading', () => {
    store.set(writableTranslationsAtom, { state: 'loading' });
    const { result } = renderHook(() => useLanguage(), { wrapper: TestProvider });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.t('common:title')).toBe('');
  });

  it('applies placeholder replacements', () => {
    store.set(writableTranslationsAtom, {
      state: 'hasData',
      data: { common: { msg: 'Hi {{name}}' } },
    });
    const { result } = renderHook(() => useLanguage(), { wrapper: TestProvider });
    expect(result.current.t('common:msg', { name: 'Ada' })).toBe('Hi Ada');
  });

  it('updates document.documentElement.lang when language changes', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: TestProvider });
    act(() => {
      result.current.setLanguage('de');
    });
    expect(document.documentElement.lang).toBe('de');
  });
});
