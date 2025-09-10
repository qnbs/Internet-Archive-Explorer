import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import type { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const storedTheme = localStorage.getItem('app-theme') as Theme;
      return storedTheme || 'system';
    } catch {
      return 'system';
    }
  });

  const resolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = resolvedTheme === 'dark';
    root.classList.toggle('dark', isDark);
  }, [resolvedTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const newResolvedTheme = mediaQuery.matches ? 'dark' : 'light';
        const root = window.document.documentElement;
        root.classList.toggle('dark', newResolvedTheme === 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  const handleSetTheme = (newTheme: Theme) => {
    try {
        localStorage.setItem('app-theme', newTheme);
    } catch (e) {
        console.error("Could not save theme to localStorage", e);
    }
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
