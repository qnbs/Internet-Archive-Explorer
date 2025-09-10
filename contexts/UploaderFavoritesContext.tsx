import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

interface UploaderFavoritesContextType {
  favoriteUploaders: string[];
  addUploaderFavorite: (username: string) => void;
  removeUploaderFavorite: (username: string) => void;
  isUploaderFavorite: (username: string) => boolean;
}

const UploaderFavoritesContext = createContext<UploaderFavoritesContextType | undefined>(undefined);

export const UploaderFavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favoriteUploaders, setFavoriteUploaders] = useState<string[]>([]);
  const { addToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('archive-uploader-favorites');
      if (storedFavorites) {
        setFavoriteUploaders(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Failed to load uploader favorites from localStorage', error);
      setFavoriteUploaders([]);
    }
  }, []);

  const saveFavorites = (newFavorites: string[]) => {
    setFavoriteUploaders(newFavorites);
    try {
      localStorage.setItem('archive-uploader-favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Failed to save uploader favorites to localStorage', error);
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          addToast(t('common:errorStorageFull'), 'error');
      } else {
          addToast(t('favorites:errorSaveUploaders'), 'error');
      }
    }
  };

  const addUploaderFavorite = (username: string) => {
    if (!favoriteUploaders.includes(username)) {
      saveFavorites([...favoriteUploaders, username]);
      addToast(t('favorites:uploaderAdded'), 'success');
    }
  };

  const removeUploaderFavorite = (username: string) => {
    const newFavorites = favoriteUploaders.filter(fav => fav !== username);
    saveFavorites(newFavorites);
    addToast(t('favorites:uploaderRemoved'), 'info');
  };

  const isUploaderFavorite = (username: string) => {
    return favoriteUploaders.includes(username);
  };

  return (
    <UploaderFavoritesContext.Provider value={{ favoriteUploaders, addUploaderFavorite, removeUploaderFavorite, isUploaderFavorite }}>
      {children}
    </UploaderFavoritesContext.Provider>
  );
};

export const useUploaderFavorites = (): UploaderFavoritesContextType => {
  const context = useContext(UploaderFavoritesContext);
  if (context === undefined) {
    throw new Error('useUploaderFavorites must be used within a UploaderFavoritesProvider');
  }
  return context;
};