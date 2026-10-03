import { render, screen } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CacheAgeIndicator } from '@/components/ui/CacheAgeIndicator';
import { lastCacheAgeAtom } from '@/store/cacheAge';

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
  }),
}));

describe('CacheAgeIndicator', () => {
  beforeEach(() => {
    getDefaultStore().set(lastCacheAgeAtom, null);
  });

  it('renders nothing without cacheTimeMs or SW atom', () => {
    const { container } = render(<CacheAgeIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('shows cached label when cacheTimeMs is provided', () => {
    render(<CacheAgeIndicator cacheTimeMs={Date.now() - 120_000} />);
    expect(screen.getByText(/common:cacheAge.cached/)).toBeTruthy();
  });

  it('falls back to lastCacheAgeAtom', () => {
    getDefaultStore().set(lastCacheAgeAtom, Date.now() - 30_000);
    render(<CacheAgeIndicator />);
    expect(screen.getByText(/common:cacheAge.cached/)).toBeTruthy();
  });
});
