import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from './ToastContext';

// Define the shape of your settings
export interface AppSettings {
    // Search & Discovery
    resultsPerPage: number;
    showExplorerHub: boolean;
    // UI & Layout
    hideScrollbars: boolean;
    // Content & Hubs
    defaultUploaderDetailTab: 'uploads' | 'reviews' | 'statistics';
    // AI Features
    defaultAiTab: 'description' | 'ai';
    autoRunEntityExtraction: boolean;
    // Playback
    autoplayMedia: boolean;
    // Accessibility
    reduceMotion: boolean;
    enableAiFeatures: boolean;
}

export const defaultSettings: AppSettings = {
    resultsPerPage: 24,
    showExplorerHub: true,
    hideScrollbars: false,
    defaultUploaderDetailTab: 'uploads',
    defaultAiTab: 'description',
    autoRunEntityExtraction: false,
    autoplayMedia: false,
    reduceMotion: false,
    enableAiFeatures: true,
};

interface SettingsContextType {
  settings: AppSettings;
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
  // Search History
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_KEY = 'app-settings-v2';
const SEARCH_HISTORY_KEY = 'app-search-history';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { addToast } = useToast();

  const handleStorageError = (error: unknown) => {
      console.error("LocalStorage operation failed:", error);
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          addToast("Could not save data. Your browser's local storage is full.", 'error');
      } else {
          addToast("An error occurred while saving data.", 'error');
      }
  }

  // Load settings from localStorage on initial render
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        // Merge stored settings with defaults to ensure all keys are present
        setSettings(prev => ({ ...prev, ...JSON.parse(storedSettings) }));
      }
      const storedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
      if(storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
    }
  }, []);

  const setSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
        const newSettings = { ...prev, [key]: value };
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
        } catch (e) {
            handleStorageError(e);
        }
        return newSettings;
    });
  };
  
  const resetSettings = () => {
      setSettings(defaultSettings);
      try {
          localStorage.removeItem(SETTINGS_KEY);
      } catch (e) {
           handleStorageError(e);
      }
  };

  const addSearchHistory = (query: string) => {
      setSearchHistory(prev => {
          const newHistory = [query, ...prev.filter(item => item.toLowerCase() !== query.toLowerCase())].slice(0, 20); // Keep last 20 unique searches
          try {
              localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
          } catch (e) {
              handleStorageError(e);
          }
          return newHistory;
      });
  };

  const clearSearchHistory = () => {
      setSearchHistory([]);
      try {
          localStorage.removeItem(SEARCH_HISTORY_KEY);
      } catch (e) {
          handleStorageError(e);
      }
  };

  return (
    <SettingsContext.Provider value={{ settings, setSetting, resetSettings, searchHistory, addSearchHistory, clearSearchHistory }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};