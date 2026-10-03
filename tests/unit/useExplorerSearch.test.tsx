import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useExplorerSearch } from '@/hooks/useExplorerSearch';
import * as archiveService from '@/services/archiveService';
import * as searchCache from '@/services/searchCache';
import { searchQueryAtom } from '@/store/search';
import type { ArchiveItemSummary } from '@/types';
import { MediaType } from '@/types';

vi.mock('@/services/archiveService', () => ({
  searchArchive: vi.fn(),
}));

vi.mock('@/services/searchCache', () => ({
  buildSearchCacheKey: vi.fn(() => 'explorer:test'),
  getCachedSearchEntry: vi.fn(),
  setCachedSearchResult: vi.fn(),
}));

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: <T,>(value: T) => value,
}));

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
  }),
}));

vi.mock('@/hooks/useInfiniteScroll', () => ({
  useInfiniteScroll: () => ({ current: null }),
}));

const sampleItem: ArchiveItemSummary = {
  identifier: 'doc-1',
  title: 'Document',
  publicdate: '2020-01-01',
  mediatype: MediaType.Texts,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useExplorerSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDefaultStore().set(searchQueryAtom, 'library');
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('serves IndexedDB cache offline without calling searchArchive', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    vi.mocked(searchCache.getCachedSearchEntry).mockResolvedValue({
      cachedAt: 99,
      data: { response: { docs: [sampleItem], numFound: 1, start: 0 } },
    });

    const { result } = renderHook(() => useExplorerSearch(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.results).toHaveLength(1);
    expect(archiveService.searchArchive).not.toHaveBeenCalled();
  });

  it('throws offline message when cache miss and offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    vi.mocked(searchCache.getCachedSearchEntry).mockResolvedValue(undefined);

    const { result } = renderHook(() => useExplorerSearch(), { wrapper });

    await waitFor(() => expect(result.current.error).toBe('common:offline.message'));
  });

  it('fetches from network when online without cache', async () => {
    vi.mocked(searchCache.getCachedSearchEntry).mockResolvedValue(undefined);
    vi.mocked(archiveService.searchArchive).mockResolvedValue({
      response: { docs: [sampleItem], numFound: 1, start: 0 },
    });

    const { result } = renderHook(() => useExplorerSearch(), { wrapper });

    await waitFor(() => expect(result.current.results).toHaveLength(1));
    expect(archiveService.searchArchive).toHaveBeenCalled();
  });
});
