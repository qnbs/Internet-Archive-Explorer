import { useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/hooks/useLanguage';
import { useLibraryBackgroundSync } from '@/hooks/useLibraryBackgroundSync';

/**
 * Registers Background Sync when the library changes and surfaces SW library-sync pings as toasts.
 */
export function PwaWorkerBridge(): null {
  useLibraryBackgroundSync();
  const { addToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const onMessage = (event: MessageEvent) => {
      const type = (event.data as { type?: string } | undefined)?.type;
      if (type === 'IA_LIBRARY_BACKGROUND_SYNC') {
        addToast(t('pwa:librarySyncNotice'), 'info');
      }
    };

    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, [addToast, t]);

  return null;
}
