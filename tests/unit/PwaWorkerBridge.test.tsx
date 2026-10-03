import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PwaWorkerBridge } from '@/components/pwa/PwaWorkerBridge';

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

vi.mock('@/hooks/useLibraryBackgroundSync', () => ({
  useLibraryBackgroundSync: vi.fn(),
}));

describe('PwaWorkerBridge', () => {
  beforeEach(() => {
    addToast.mockReset();
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: new EventTarget(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows library sync toast when SW posts IA_LIBRARY_BACKGROUND_SYNC', () => {
    render(<PwaWorkerBridge />);

    navigator.serviceWorker.dispatchEvent(
      new MessageEvent('message', { data: { type: 'IA_LIBRARY_BACKGROUND_SYNC' } }),
    );

    expect(addToast).toHaveBeenCalledWith('pwa:librarySyncNotice', 'info');
  });

  it('ignores unrelated SW messages', () => {
    render(<PwaWorkerBridge />);

    navigator.serviceWorker.dispatchEvent(new MessageEvent('message', { data: { type: 'OTHER' } }));

    expect(addToast).not.toHaveBeenCalled();
  });
});
