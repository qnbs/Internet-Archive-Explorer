import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultStore } from 'jotai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InstallModal } from '@/components/modals/InstallModal';
import { type BeforeInstallPromptEvent, deferredPromptAtom } from '@/store/pwa';

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
  }),
}));

function mockDeferredPrompt(): BeforeInstallPromptEvent {
  return {
    platforms: ['web'],
    userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
    prompt: vi.fn().mockResolvedValue(undefined),
  } as unknown as BeforeInstallPromptEvent;
}

describe('InstallModal', () => {
  beforeEach(() => {
    getDefaultStore().set(deferredPromptAtom, null);
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0',
    });
  });

  it('renders accessible dialog with install title', async () => {
    render(<InstallModal onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'pwaModal:title' })).toBeTruthy();
    });
  });

  it('shows desktop install steps when no deferred prompt', async () => {
    render(<InstallModal onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('pwaModal:desktop.title')).toBeTruthy();
    });
  });

  it('runs install flow when deferred prompt is available', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const deferred = mockDeferredPrompt();
    getDefaultStore().set(deferredPromptAtom, deferred);

    render(<InstallModal onClose={onClose} />);

    const installBtn = await screen.findByRole('button', { name: /pwaModal:installButton/ });
    await user.click(installBtn);

    expect(deferred.prompt).toHaveBeenCalled();
    expect(getDefaultStore().get(deferredPromptAtom)).toBeNull();
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose on Escape via focus trap', async () => {
    const onClose = vi.fn();
    render(<InstallModal onClose={onClose} />);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).toHaveBeenCalled();
  });
});
