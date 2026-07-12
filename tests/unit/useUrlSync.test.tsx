import { act, render, screen, waitFor } from '@testing-library/react';
import { getDefaultStore, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { MemoryRouter, useNavigate, useSearchParams } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { useUrlSync } from '@/hooks/useUrlSync';
import { activeViewAtom } from '@/store/app';

const navigateRef = { current: (_to: string): void => undefined };

function TestComponent() {
  useUrlSync();
  const activeView = useAtomValue(activeViewAtom);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  return (
    <div>
      <div data-testid="view">{activeView}</div>
      <div data-testid="params">{searchParams.toString()}</div>
    </div>
  );
}

function renderWithRouter(initialEntries?: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <TestComponent />
    </MemoryRouter>,
  );
}

describe('useUrlSync', () => {
  beforeEach(() => {
    getDefaultStore().set(activeViewAtom, 'explore');
  });

  it('keeps default view and leaves URL clean on mount', () => {
    renderWithRouter(['/?']);
    expect(screen.getByTestId('view').textContent).toBe('explore');
    expect(screen.getByTestId('params').textContent).toBe('');
  });

  it('restores activeView from ?view= on mount', async () => {
    renderWithRouter(['/?view=library']);
    await waitFor(() => {
      expect(screen.getByTestId('view').textContent).toBe('library');
      expect(screen.getByTestId('params').textContent).toBe('view=library');
    });
  });

  it('ignores invalid ?view= values and falls back to explore', () => {
    renderWithRouter(['/?view=unknown']);
    expect(screen.getByTestId('view').textContent).toBe('explore');
  });

  it('updates URL when activeView changes', async () => {
    renderWithRouter(['/?view=explore']);
    expect(screen.getByTestId('view').textContent).toBe('explore');

    act(() => {
      getDefaultStore().set(activeViewAtom, 'settings');
    });

    await waitFor(() => {
      expect(screen.getByTestId('view').textContent).toBe('settings');
      expect(screen.getByTestId('params').textContent).toBe('view=settings');
    });
  });

  it('removes ?view= when returning to the default explore view', async () => {
    renderWithRouter(['/?view=settings']);
    await waitFor(() => {
      expect(screen.getByTestId('view').textContent).toBe('settings');
    });

    act(() => {
      getDefaultStore().set(activeViewAtom, 'explore');
    });

    await waitFor(() => {
      expect(screen.getByTestId('view').textContent).toBe('explore');
      expect(screen.getByTestId('params').textContent).toBe('');
    });
  });

  it('updates activeView when the URL changes externally', async () => {
    renderWithRouter(['/?view=explore']);
    expect(screen.getByTestId('view').textContent).toBe('explore');

    act(() => {
      navigateRef.current('/?view=audio');
    });

    await waitFor(() => {
      expect(screen.getByTestId('view').textContent).toBe('audio');
      expect(screen.getByTestId('params').textContent).toBe('view=audio');
    });
  });
});
