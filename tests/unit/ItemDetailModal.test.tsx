import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultStore } from 'jotai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemDetailModal } from '@/components/ItemDetailModal';
import { libraryItemsAtom } from '@/store/favorites';
import type { ArchiveItemSummary, ArchiveMetadata } from '@/types';
import { MediaType } from '@/types';

const addToast = vi.fn();

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ addToast }),
}));

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
  }),
}));

vi.mock('@/services/archiveService', () => ({
  getItemMetadata: vi.fn(),
  getItemPlainText: vi.fn(),
}));

const { getItemMetadata } = await import('@/services/archiveService');

const sampleItem: ArchiveItemSummary = {
  identifier: 'audio-sample',
  title: 'Sample Audio Item',
  publicdate: '2020-06-01',
  mediatype: MediaType.Audio,
};

const mockMetadata: ArchiveMetadata = {
  metadata: {
    identifier: 'audio-sample',
    title: 'Sample Audio Item',
    publicdate: '2020-06-01',
    mediatype: MediaType.Audio,
    description: 'A short description for tests.',
  },
  files: [
    {
      name: 'sample.mp3',
      source: 'original',
      size: '1024',
      format: 'VBR MP3',
    },
  ],
};

function renderModal(onClose = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const props = {
    item: sampleItem,
    onClose,
    onCreatorSelect: vi.fn(),
    onUploaderSelect: vi.fn(),
    onEmulate: vi.fn(),
  };
  return {
    onClose,
    ...render(
      <QueryClientProvider client={client}>
        <ItemDetailModal {...props} />
      </QueryClientProvider>,
    ),
  };
}

describe('ItemDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDefaultStore().set(libraryItemsAtom, {});
    vi.mocked(getItemMetadata).mockReset();
    vi.mocked(getItemMetadata).mockResolvedValue(mockMetadata);
  });

  it('renders dialog with item title after metadata loads', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
      expect(screen.getByRole('heading', { name: sampleItem.title })).toBeTruthy();
    });
  });

  it('shows retry when metadata fetch fails', async () => {
    vi.mocked(getItemMetadata).mockRejectedValue(new Error('network down'));
    renderModal();

    expect(await screen.findByText('network down')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'common:retry' })).toBeTruthy();
  });

  it('adds item to library and toast when favorite is clicked', async () => {
    const user = userEvent.setup();
    renderModal();

    const favoriteBtn = await screen.findByRole('button', {
      name: 'itemCard:addFavorite',
    });
    await user.click(favoriteBtn);

    expect(getDefaultStore().get(libraryItemsAtom)[sampleItem.identifier]).toBeTruthy();
    expect(addToast).toHaveBeenCalledWith('favorites:added', 'success');
  });

  it('switches to files tab and lists downloadable file', async () => {
    const user = userEvent.setup();
    renderModal();

    await waitFor(() => expect(screen.getByRole('tablist')).toBeTruthy());
    await user.click(screen.getByRole('tab', { name: /common:files/ }));

    expect(await screen.findByRole('link', { name: /sample\.mp3/ })).toBeTruthy();
  });

  it('calls onClose after Escape via focus trap (close animation delay)', async () => {
    const onClose = vi.fn();
    renderModal(onClose);

    await screen.findByRole('heading', { name: sampleItem.title });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1), { timeout: 500 });
  });
});
