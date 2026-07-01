import { createStore } from 'jotai';
import { describe, expect, it } from 'vitest';
import { settingsFocusSectionAtom } from '@/store/settingsNavigation';

describe('settingsFocusSectionAtom', () => {
  it('defaults to null and accepts one-shot section focus', () => {
    const store = createStore();
    expect(store.get(settingsFocusSectionAtom)).toBeNull();
    store.set(settingsFocusSectionAtom, 'ai');
    expect(store.get(settingsFocusSectionAtom)).toBe('ai');
    store.set(settingsFocusSectionAtom, null);
    expect(store.get(settingsFocusSectionAtom)).toBeNull();
  });
});
