import { render, screen } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OfflineHubBanner } from '@/components/pwa/OfflineHubBanner';
import { activeViewAtom } from '@/store/app';
import { lastCacheAgeAtom } from '@/store/cacheAge';

vi.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: vi.fn(() => false),
}));

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
  }),
}));

describe('OfflineHubBanner', () => {
  beforeEach(() => {
    getDefaultStore().set(activeViewAtom, 'explore');
    getDefaultStore().set(lastCacheAgeAtom, null);
  });

  it('shows hub-specific offline copy when offline', () => {
    render(<OfflineHubBanner />);
    expect(screen.getByText('pwa:offline.trendingHub')).toBeTruthy();
  });

  it('shows cache age when lastCacheAgeAtom is set', () => {
    getDefaultStore().set(lastCacheAgeAtom, Date.now() - 60_000);
    render(<OfflineHubBanner />);
    expect(screen.getByText(/common:cacheAge.cached/)).toBeTruthy();
  });
});
