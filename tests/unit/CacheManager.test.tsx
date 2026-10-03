import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CacheManager } from '@/components/settings/CacheManager';

const getCacheStats = vi.fn();
const clearAllCaches = vi.fn();
const addToast = vi.fn();

vi.mock('@/services/cacheService', () => ({
  getCacheStats: (...args: unknown[]) => getCacheStats(...args),
  clearAllCaches: (...args: unknown[]) => clearAllCaches(...args),
}));

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ addToast }),
}));

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string, params?: { count?: number }) =>
      params?.count != null ? `${key}:${params.count}` : key,
    language: 'en',
  }),
}));

describe('CacheManager', () => {
  beforeEach(() => {
    getCacheStats.mockReset();
    clearAllCaches.mockReset();
    addToast.mockReset();
    getCacheStats.mockResolvedValue({
      metadataCount: 0,
      searchCount: 0,
      hubTrendingCount: 0,
    });
    clearAllCaches.mockResolvedValue(undefined);
  });

  it('loads cache stats on mount', async () => {
    getCacheStats.mockResolvedValue({
      metadataCount: 3,
      searchCount: 1,
      hubTrendingCount: 2,
    });
    render(<CacheManager />);
    await waitFor(() => {
      expect(screen.getByText('settings:data.cacheMetadataCount:3')).toBeTruthy();
    });
    expect(getCacheStats).toHaveBeenCalled();
  });

  it('clears caches and shows success toast', async () => {
    getCacheStats
      .mockResolvedValueOnce({ metadataCount: 1, searchCount: 0, hubTrendingCount: 0 })
      .mockResolvedValueOnce({ metadataCount: 0, searchCount: 0, hubTrendingCount: 0 });

    render(<CacheManager />);
    await waitFor(() => expect(getCacheStats).toHaveBeenCalled());

    const button = screen.getByRole('button', { name: /settings:data.clearCacheButton/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(clearAllCaches).toHaveBeenCalled();
      expect(addToast).toHaveBeenCalledWith('settings:data.cacheCleared', 'success');
    });
  });
});
