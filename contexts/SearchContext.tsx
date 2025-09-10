import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { View, MediaType } from '../types';
import { useSettings } from './SettingsContext';

export type Facets = {
    mediaType: Set<MediaType>;
    yearStart?: string;
    yearEnd?: string;
    collection?: string;
};

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  facets: Facets;
  setFacets: React.Dispatch<React.SetStateAction<Facets>>;
  searchAndGo: (query: string, facets?: Facets) => void;
  setActiveView: (view: View) => void;
  registerViewSetter: (setter: (view: View) => void) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

let viewSetter: (view: View) => void = () => { console.warn("View setter not initialized"); };

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [facets, setFacets] = useState<Facets>({ mediaType: new Set() });
  const { addSearchHistory } = useSettings();

  const searchAndGo = (query: string, newFacets?: Facets) => {
     setSearchQuery(query);
     if (query.trim()) {
        addSearchHistory(query.trim());
     }
     setFacets(newFacets || { mediaType: new Set() });
     viewSetter('explore');
  };

  const registerViewSetter = (setter: (view: View) => void) => {
    viewSetter = setter;
  };

  return (
    <SearchContext.Provider value={{ 
        searchQuery, 
        setSearchQuery, 
        facets,
        setFacets,
        searchAndGo, 
        setActiveView: (view: View) => viewSetter(view),
        registerViewSetter
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};