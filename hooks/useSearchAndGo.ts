import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { activeViewAtom } from '../store/app';
import { addSearchHistoryAtom, facetsAtom, searchQueryAtom } from '../store/search';
import type { Facets } from '../types';

export const useSearchAndGo = () => {
  const setSearchQuery = useSetAtom(searchQueryAtom);
  const setFacets = useSetAtom(facetsAtom);
  const setActiveView = useSetAtom(activeViewAtom);
  const addSearchHistory = useSetAtom(addSearchHistoryAtom);

  return useCallback((query: string, newFacets?: Partial<Facets>) => {
     setSearchQuery(query);
     addSearchHistory(query);
     const defaultFacets: Facets = {
        mediaType: new Set(),
        availability: 'all',
     };
     setFacets({ ...defaultFacets, ...newFacets });
     setActiveView('explore');
  }, [setSearchQuery, addSearchHistory, setFacets, setActiveView]);
};