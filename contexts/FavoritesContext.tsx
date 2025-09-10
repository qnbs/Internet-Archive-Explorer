import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { ArchiveItemSummary } from '../types';

interface FavoritesContextType {
  favorites: ArchiveItemSummary[];
  addFavorite: (item: ArchiveItemSummary) => void;
  removeFavorite: (identifier: string) => void;
  isFavorite: (identifier: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<ArchiveItemSummary[]>([]);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('archive-favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage', error);
      setFavorites([]);
    }
  }, []);

  const saveFavorites = (newFavorites: ArchiveItemSummary[]) => {
    setFavorites(newFavorites);
    try {
      localStorage.setItem('archive-favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Failed to save favorites to localStorage', error);
    }
  };

  const addFavorite = (item: ArchiveItemSummary) => {
    if (!favorites.some(fav => fav.identifier === item.identifier)) {
      saveFavorites([...favorites, item]);
    }
  };

  const removeFavorite = (identifier: string) => {
    const newFavorites = favorites.filter(fav => fav.identifier !== identifier);
    saveFavorites(newFavorites);
  };

  const isFavorite = (identifier: string) => {
    return favorites.some(fav => fav.identifier === identifier);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};