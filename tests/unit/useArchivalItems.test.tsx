import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useArchivalItems } from '@/hooks/useArchivalItems';
import * as archiveService from '@/services/archiveService';
import * as searchCache from '@/services/searchCache';
import type { ArchiveItemSummary } from '@/types';
import { MediaType } from '@/types';

vi.mock('@/services/archiveService', () => ({
  searchArchive: vi.fn(),
}));

vi.mock('@/services/searchCache', () => ({
  buildSearchCacheKey: vi.fn(() => 'archival:test'),
  getCachedSearchEntry: vi.fn(),
  setCachedSearchResult: vi.fn(),
}));

const sampleItem: ArchiveItemSummary = {
  identifier: 'film-1',
  title: 'Film',
  publicdate: '2020-01-01',
  mediatype: MediaType.Movies,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useArchivalItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns cached docs offline without calling searchArchive', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    vi.mocked(searchCache.getCachedSearchEntry).mockResolvedValue({
      cachedAt: 42,
      data: { response: { docs: [sampleItem], numFound: 1, start: 0 } },
    });

    const { result } = renderHook(() => useArchivalItems('mediatype:(movies)', 15), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.offlineCachedAt).toBe(42);
    expect(archiveService.searchArchive).not.toHaveBeenCalled();
  });

  it('fetches from network when online and cache is empty', async () => {
    vi.mocked(searchCache.getCachedSearchEntry).mockResolvedValue(undefined);
    vi.mocked(archiveService.searchArchive).mockResolvedValue({
      response: { docs: [sampleItem], numFound: 1, start: 0 },
    });

    const { result } = renderHook(() => useArchivalItems('collection:prelinger', 15), { wrapper });

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(archiveService.searchArchive).toHaveBeenCalled();
    expect(result.current.offlineCachedAt).toBeNull();
  });
});
