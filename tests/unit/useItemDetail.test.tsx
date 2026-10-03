import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useItemDetail } from '@/hooks/useItemDetail';
import { defaultSettings, settingsAtom } from '@/store/settings';
import type { ArchiveItemSummary, ArchiveMetadata } from '@/types';
import { MediaType } from '@/types';

vi.mock('@/services/archiveService', () => ({
  getItemMetadata: vi.fn(),
  getItemPlainText: vi.fn(),
}));

const { getItemMetadata, getItemPlainText } = await import('@/services/archiveService');

const textItem: ArchiveItemSummary = {
  identifier: 'text-1',
  title: 'Text work',
  publicdate: '2019-01-01',
  mediatype: MediaType.Texts,
};

const mockMetadata: ArchiveMetadata = {
  metadata: {
    identifier: 'text-1',
    title: 'Text work',
    publicdate: '2019-01-01',
    mediatype: MediaType.Texts,
  },
  files: [],
};

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe('useItemDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDefaultStore().set(settingsAtom, {
      ...defaultSettings,
      enableAiFeatures: true,
      defaultDetailTabAll: 'description',
    });
    vi.mocked(getItemMetadata).mockResolvedValue(mockMetadata);
    vi.mocked(getItemPlainText).mockResolvedValue('chapter one');
  });

  it('uses settings default tab for text items when AI is enabled', () => {
    const { result } = renderHook(() => useItemDetail(textItem), {
      wrapper: createWrapper(),
    });
    expect(result.current.activeTab).toBe('description');
  });

  it('falls back to description when default tab is files for text items', () => {
    getDefaultStore().set(settingsAtom, {
      ...defaultSettings,
      defaultDetailTabAll: 'files',
    });
    const { result } = renderHook(() => useItemDetail(textItem), {
      wrapper: createWrapper(),
    });
    expect(result.current.activeTab).toBe('description');
  });

  it('loads metadata and exposes plain text only on AI tab', async () => {
    getDefaultStore().set(settingsAtom, {
      ...defaultSettings,
      defaultDetailTabAll: 'description',
    });
    const { result } = renderHook(() => useItemDetail(textItem), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.metadata).not.toBeNull());
    expect(getItemPlainText).not.toHaveBeenCalled();

    act(() => {
      result.current.setActiveTab('ai');
    });

    await waitFor(() => expect(result.current.plainText).toBe('chapter one'));
    expect(getItemPlainText).toHaveBeenCalledWith(
      'text-1',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('surfaces metadata fetch errors as strings', async () => {
    vi.mocked(getItemMetadata).mockRejectedValue(new Error('metadata failed'));
    const { result } = renderHook(() => useItemDetail(textItem), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.error).toBe('metadata failed'));
  });
});
