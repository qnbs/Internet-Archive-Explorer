import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { searchQueryAtom, facetsAtom, activeViewAtom, addSearchHistoryAtom } from '../store';
import type { Facets } from '../types';

export const useSearchAndGo = () => {
  const setSearchQuery = useSetAtom(searchQueryAtom);
  const setFacets = useSetAtom(facetsAtom);
  const setActiveView = useSetAtom(activeViewAtom);
  const addSearchHistory = useSetAtom(addSearchHistoryAtom);

  return useCallback((query: string, newFacets?: Partial<Facets>) => {
     setSearchQuery(query);
     addSearchHistory(query);
     // FIX: Create a complete Facets object by combining defaults with the provided partial facets.
     // This ensures required properties are always set.
     const defaultFacets: Facets = {
        mediaType: new Set(),
        availability: 'free',
     };
     setFacets({ ...defaultFacets, ...newFacets });
     setActiveView('explore');
  }, [setSearchQuery, addSearchHistory, setFacets, setActiveView]);
};