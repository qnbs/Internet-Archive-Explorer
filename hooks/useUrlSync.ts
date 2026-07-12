import { getDefaultStore, useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { activeViewAtom, isValidView } from '@/store/app';
import type { View } from '@/types';

const VIEW_PARAM = 'view';
const DEFAULT_VIEW: View = 'explore';

/**
 * Keeps the URL query string in sync with the active view using React Router.
 *
 * - On initial load the view is read from `?view=` by `getInitialActiveView()`.
 * - When the user navigates inside the app, the query parameter is updated via
 *   `setSearchParams` so the current view becomes shareable and survives reloads.
 * - Browser back/forward buttons update the active view atom because React Router
 *   does not automatically sync external atoms.
 */
export function useUrlSync(): void {
  const activeView = useAtomValue(activeViewAtom);
  const [searchParams, setSearchParams] = useSearchParams();
  const lastSynced = useRef<{ view: View; params: string }>({
    view: activeView,
    params: '',
  });

  useEffect(() => {
    const viewFromUrl = searchParams.get(VIEW_PARAM) ?? DEFAULT_VIEW;
    const currentParams = searchParams.toString();

    const paramsMatch = lastSynced.current.params === currentParams;
    const viewMatch = lastSynced.current.view === activeView;

    if (paramsMatch && viewMatch) {
      return;
    }

    if (!paramsMatch && isValidView(viewFromUrl)) {
      // URL changed (initial load, back/forward, external navigation):
      // update the atom to match the URL.
      getDefaultStore().set(activeViewAtom, viewFromUrl);
      lastSynced.current = { view: viewFromUrl, params: currentParams };
      return;
    }

    // Atom changed: update the URL to match the atom.
    const next = new URLSearchParams(searchParams);
    if (activeView === DEFAULT_VIEW) {
      next.delete(VIEW_PARAM);
    } else {
      next.set(VIEW_PARAM, activeView);
    }
    const nextParams = next.toString();
    setSearchParams(next, { replace: true });
    lastSynced.current = { view: activeView, params: nextParams };
  }, [activeView, searchParams, setSearchParams]);
}
