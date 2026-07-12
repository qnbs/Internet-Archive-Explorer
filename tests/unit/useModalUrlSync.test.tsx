import { act, render, screen, waitFor } from '@testing-library/react';
import { getDefaultStore, useAtomValue } from 'jotai';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useModalUrlSync } from '@/hooks/useModalUrlSync';
import { type ModalState, modalAtom } from '@/store/app';
import { type ArchiveMetadata, MediaType } from '@/types';

vi.mock('@/services/archiveService', () => ({
  getItemMetadata: vi.fn(),
}));

const { getItemMetadata } = await import('@/services/archiveService');

function TestComponent() {
  useModalUrlSync();
  const modal = useAtomValue(modalAtom);
  const [searchParams] = useSearchParams();

  return (
    <div>
      <div data-testid="modal">{JSON.stringify(modal)}</div>
      <div data-testid="params">{searchParams.toString()}</div>
    </div>
  );
}

function renderWithRouter(initialEntries?: string[]) {
  const testId = initialEntries?.[0] ?? 'default';
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <TestComponent key={testId} />
    </MemoryRouter>,
  );
}

const mockMetadata: ArchiveMetadata = {
  metadata: {
    identifier: 'foo-id',
    title: 'Foo Item',
    publicdate: '2020-01-01',
    mediatype: MediaType.Texts,
  },
  files: [],
};

describe('useModalUrlSync', () => {
  beforeEach(() => {
    getDefaultStore().set(modalAtom, { type: 'none' });
    vi.mocked(getItemMetadata).mockReset();
  });

  it('restores a simple modal from ?modal=commandPalette', () => {
    renderWithRouter(['/?modal=commandPalette']);
    expect(screen.getByTestId('modal').textContent).toBe(
      JSON.stringify({ type: 'commandPalette' } as ModalState),
    );
  });

  it('restores an item modal by fetching metadata', async () => {
    vi.mocked(getItemMetadata).mockResolvedValue(mockMetadata);

    renderWithRouter(['/?modal=itemDetail&id=foo-id']);

    await waitFor(() => {
      const modalText = screen.getByTestId('modal').textContent ?? '';
      expect(modalText).toContain('itemDetail');
      expect(modalText).toContain('foo-id');
    });
  });

  it('clears invalid item modal params when metadata fetch fails', async () => {
    vi.mocked(getItemMetadata).mockRejectedValue(new Error('not found'));

    renderWithRouter(['/?modal=itemDetail&id=missing']);

    await waitFor(() => {
      expect(screen.getByTestId('params').textContent).toBe('');
    });
  });

  it('updates URL when an item modal opens', async () => {
    vi.mocked(getItemMetadata).mockResolvedValue({
      metadata: {
        identifier: 'bar-id',
        title: 'Bar Item',
        publicdate: '2021-01-01',
        mediatype: MediaType.Audio,
      },
      files: [],
    });

    renderWithRouter(['/']);
    expect(screen.getByTestId('params').textContent).toBe('');

    act(() => {
      getDefaultStore().set(modalAtom, {
        type: 'itemDetail',
        item: {
          identifier: 'bar-id',
          title: 'Bar Item',
          publicdate: '2021-01-01',
          mediatype: MediaType.Audio,
        },
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('params').textContent).toBe('modal=itemDetail&id=bar-id');
    });
  });

  it('removes modal params when the modal is closed', () => {
    renderWithRouter(['/?modal=commandPalette']);
    expect(screen.getByTestId('params').textContent).toBe('modal=commandPalette');

    act(() => {
      getDefaultStore().set(modalAtom, { type: 'none' });
    });

    expect(screen.getByTestId('params').textContent).toBe('');
  });

  it('ignores unsupported modal types in the URL', () => {
    renderWithRouter(['/?modal=confirmation']);
    expect(screen.getByTestId('modal').textContent).toBe(
      JSON.stringify({ type: 'none' } as ModalState),
    );
    expect(screen.getByTestId('params').textContent).toBe('');
  });
});
