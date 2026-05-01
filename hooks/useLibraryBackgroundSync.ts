import { useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import { libraryItemsAtom } from '@/store/favorites';

const DEBOUNCE_MS = 1200;

/**
 * Registers Background Sync (`ia-library-sync`) when the Library changes so the SW can
 * notify clients after connectivity is restored (offline-first library).
 */
export function useLibraryBackgroundSync(): void {
  const items = useAtomValue(libraryItemsAtom);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    void items;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      if (!('serviceWorker' in navigator)) {
        return;
      }
      void navigator.serviceWorker.ready.then((reg) => {
        if ('sync' in reg) {
          void (
            reg as ServiceWorkerRegistration & {
              sync: { register: (tag: string) => Promise<void> };
            }
          ).sync
            .register('ia-library-sync')
            .catch(() => {
              /* optional API or permission */
            });
        }
      });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [items]);
}
