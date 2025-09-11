import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { activeViewAtom, searchQueryAtom, profileSearchQueryAtom } from '../store';
import { MenuIcon, SearchIcon } from './Icons';
import { useLanguage } from '../hooks/useLanguage';

interface HeaderProps {
  onMenuClick: () => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onOpenCommandPalette }) => {
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const { t } = useLanguage();

  // Atoms for different search contexts
  const [globalSearch, setGlobalSearch] = useAtom(searchQueryAtom);
  const [profileSearch, setProfileSearch] = useAtom(profileSearchQueryAtom);

  // Local state for the input to avoid rapid atom updates on every keystroke
  const [inputValue, setInputValue] = useState('');

  // Sync input value with the correct atom when the view changes
  useEffect(() => {
    switch (activeView) {
      case 'uploaderDetail':
        setInputValue(profileSearch);
        break;
      default:
        setInputValue(globalSearch);
        break;
    }
  }, [activeView, globalSearch, profileSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // Update the correct atom based on the active view
    switch (activeView) {
      case 'uploaderDetail':
        setProfileSearch(newValue);
        break;
      default:
        setGlobalSearch(newValue);
        break;
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // For global search, submitting should always take you to the explorer view
      if (activeView !== 'explore') {
          setActiveView('explore');
      }
      // For other views like 'web' or 'uploaderDetail', the search is live and debounced,
      // so submit can be a no-op or a trigger if needed, but for now we prioritize the explorer flow.
  };

  const getPlaceholder = () => {
    switch (activeView) {
        case 'uploaderDetail': return t('uploaderDetail:searchInUploads');
        default: return t('explorer:searchPlaceholder');
    }
  };


  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md dark:shadow-black/30 border-b border-gray-200 dark:border-gray-700/50 z-20 flex items-center px-2 sm:px-4 gap-2 sm:gap-4">
        {/* Left Side: Menu (Mobile Only) */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 md:hidden">
            <button
                onClick={onMenuClick}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={t('sideMenu:title')}
            >
                <MenuIcon />
            </button>
        </div>

        {/* Center: Search (takes remaining space) */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0 flex items-center h-full">
            <div className="relative w-full flex items-center top-2">
                 <label htmlFor="header-search" className="sr-only">{getPlaceholder()}</label>
                <SearchIcon className="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none"/>
                <input
                    id="header-search"
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={getPlaceholder()}
                    className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-transparent focus-within:border-cyan-500 transition-colors py-2 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                />
            </div>
        </form>

        {/* Right Side: Command Palette */}
        <button
            onClick={onOpenCommandPalette}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            aria-label={t('header:openCommandPalette')}
        >
            <span className="text-lg">⌘</span>
            <kbd className="font-sans text-xs font-semibold">K</kbd>
        </button>
    </header>
  );
};