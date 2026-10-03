import { act, renderHook } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLibraryBackgroundSync } from '@/hooks/useLibraryBackgroundSync';
import { libraryItemsAtom } from '@/store/favorites';
import { type LibraryItem, MediaType } from '@/types';

const registerSync = vi.fn();

const sampleLibraryItem: LibraryItem = {
  identifier: 'book-1',
  title: 'Book',
  publicdate: '2020-01-01',
  mediatype: MediaType.Texts,
  notes: '',
  tags: [],
  addedAt: 1,
  collections: [],
};

function mockServiceWorker(withSync: boolean) {
  const registration = withSync ? { sync: { register: registerSync } } : {};
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: { ready: Promise.resolve(registration) },
  });
}

describe('useLibraryBackgroundSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    registerSync.mockReset();
    registerSync.mockResolvedValue(undefined);
    getDefaultStore().set(libraryItemsAtom, {});
    mockServiceWorker(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('registers ia-library-sync after debounce when library items change', async () => {
    renderHook(() => useLibraryBackgroundSync());

    act(() => {
      getDefaultStore().set(libraryItemsAtom, { 'book-1': sampleLibraryItem });
    });

    expect(registerSync).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });

    expect(registerSync).toHaveBeenCalledWith('ia-library-sync');
  });

  it('debounces rapid library updates', async () => {
    renderHook(() => useLibraryBackgroundSync());

    act(() => {
      getDefaultStore().set(libraryItemsAtom, { 'book-1': sampleLibraryItem });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    act(() => {
      getDefaultStore().set(libraryItemsAtom, {
        'book-1': sampleLibraryItem,
        'book-2': { ...sampleLibraryItem, identifier: 'book-2' },
      });
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });

    expect(registerSync).toHaveBeenCalledTimes(1);
  });

  it('skips registration when Background Sync API is unavailable', async () => {
    mockServiceWorker(false);
    renderHook(() => useLibraryBackgroundSync());

    act(() => {
      getDefaultStore().set(libraryItemsAtom, { 'book-1': sampleLibraryItem });
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });

    expect(registerSync).not.toHaveBeenCalled();
  });

  it('clears pending debounce on unmount', async () => {
    const { unmount } = renderHook(() => useLibraryBackgroundSync());

    act(() => {
      getDefaultStore().set(libraryItemsAtom, { 'book-1': sampleLibraryItem });
    });
    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });

    expect(registerSync).not.toHaveBeenCalled();
  });
});
