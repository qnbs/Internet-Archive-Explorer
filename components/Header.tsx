import React from 'react';
import { useSearch } from '../contexts/SearchContext';
import { MenuIcon, SearchIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  onMenuClick: () => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onOpenCommandPalette }) => {
  const { setActiveView, searchQuery, setSearchQuery } = useSearch();
  const { t } = useLanguage();

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Trigger search by ensuring the view is 'explore'
      setActiveView('explore');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md dark:shadow-black/30 border-b border-gray-200 dark:border-gray-700/50 z-20 flex items-center px-2 sm:px-4 gap-2 sm:gap-4">
        {/* Left Side: Logo & Menu */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
                onClick={() => setActiveView('explore')}
                className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white flex-shrink-0"
                aria-label="Home"
            >
                <img src="/logo192.png" alt="Archive Explorer Logo" className="h-8 w-8" />
                <span className="hidden sm:inline">Archive Explorer</span>
            </button>
            <button
                onClick={onMenuClick}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors md:hidden"
                aria-label={t('sideMenu:title')}
            >
                <MenuIcon />
            </button>
        </div>

        {/* Center: Search (takes remaining space) */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0 flex items-center h-full">
            <div className="relative w-full flex items-center top-2">
                 <label htmlFor="header-search" className="sr-only">{t('explorer:searchPlaceholder')}</label>
                <SearchIcon className="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none"/>
                <input
                    id="header-search"
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('explorer:searchPlaceholder')}
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