import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { searchQueryAtom, facetsAtom, activeViewAtom, addSearchHistoryAtom } from '../store';
import type { Facets } from '../types';

export const useSearchAndGo = () => {
  const setSearchQuery = useSetAtom(searchQueryAtom);
  const setFacets = useSetAtom(facetsAtom);
  const setActiveView = useSetAtom(activeViewAtom);
  const addSearchHistory = useSetAtom(addSearchHistoryAtom);

  return useCallback((query: string, newFacets?: Facets) => {
     setSearchQuery(query);
     addSearchHistory(query);
     setFacets(newFacets || { mediaType: new Set() });
     setActiveView('explore');
  }, [setSearchQuery, addSearchHistory, setFacets, setActiveView]);
};
