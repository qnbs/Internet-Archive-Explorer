import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { facetsAtom } from '../store/search';
import { MenuIcon, FilterIcon } from './Icons';
import { useLanguage } from '../hooks/useLanguage';
import { SearchPopover } from './SearchPopover';
import { SearchBar } from './SearchBar';
import { modalAtom } from '../store/app';

interface HeaderProps {
  onMenuClick: () => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onOpenCommandPalette }) => {
  const { t } = useLanguage();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const facets = useAtomValue(facetsAtom);

  const activeFilterCount = facets.mediaType.size + (facets.language ? 1 : 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            setIsPopoverOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buttonFocusStyles = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 dark:focus-visible:ring-offset-gray-800";

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md dark:shadow-black/30 border-b border-gray-200 dark:border-gray-700/50 z-20 flex items-center px-4 gap-2 sm:gap-4 h-16">
        {/* Mobile menu button */}
        <button onClick={onMenuClick} className={`h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden ${buttonFocusStyles}`} aria-label={t('sideMenu:title')}>
            <MenuIcon />
        </button>
        
        {/* Search bar container (takes up all available space) */}
        <div className="flex-1 min-w-0">
          <SearchBar />
        </div>

        {/* Action buttons group */}
        <div className="flex items-center gap-2 flex-shrink-0">
            <div ref={popoverRef} className="relative">
                <button
                    onClick={() => setIsPopoverOpen(o => !o)}
                    className={`h-10 w-10 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700/50 ${buttonFocusStyles}`}
                    aria-label="Open search filters"
                >
                    <FilterIcon className="w-5 h-5"/>
                </button>
                {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-600 text-white text-xs font-bold pointer-events-none">
                        {activeFilterCount}
                    </span>
                )}
                {isPopoverOpen && <SearchPopover onClose={() => setIsPopoverOpen(false)} />}
            </div>

            <button onClick={onOpenCommandPalette} className={`h-10 w-10 flex flex-col items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200 transition-colors ${buttonFocusStyles}`} aria-label={t('header:openCommandPalette')}>
                <span className="text-lg leading-none">⌘</span>
                <kbd className="font-sans text-xs font-semibold leading-none">K</kbd>
            </button>
        </div>
    </header>
  );
};