import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultStore } from 'jotai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandPalette } from '@/components/CommandPalette';
import { activeViewAtom } from '@/store/app';

vi.mock('@/hooks/useCommands', () => ({
  useCommands: () => [],
}));

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
  }),
}));

describe('CommandPalette', () => {
  beforeEach(() => {
    getDefaultStore().set(activeViewAtom, 'explore');
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(<CommandPalette onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('navigates to library and closes when My Library is selected', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<CommandPalette onClose={onClose} />);

    await user.click(screen.getByText('commandPalette:myLibrary'));

    expect(getDefaultStore().get(activeViewAtom)).toBe('library');
    expect(onClose).toHaveBeenCalled();
  });

  it('exposes dialog semantics for accessibility', () => {
    render(<CommandPalette onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'commandPalette:title' })).toBeTruthy();
  });
});
