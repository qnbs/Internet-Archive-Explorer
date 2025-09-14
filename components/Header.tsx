import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { MenuIcon, FilterIcon } from './Icons';
import { useLanguage } from '../hooks/useLanguage';
import { SearchPopover } from './SearchPopover';
import { SearchBar } from './SearchBar';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onMenuClick: () => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onOpenCommandPalette }) => {
  const { t } = useLanguage();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            setIsPopoverOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md dark:shadow-black/30 border-b border-gray-200 dark:border-gray-700/50 z-20 flex items-center px-2 sm:px-4 gap-2 sm:gap-4 py-2">
        <div className="flex items-center gap-1 sm:gap-2 md:hidden">
            <button onClick={onMenuClick} className="h-10 w-10 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label={t('sideMenu:title')}>
                <MenuIcon />
            </button>
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-2">
            <SearchBar />
            
            <div ref={popoverRef} className="relative flex-shrink-0">
                <button
                    onClick={() => setIsPopoverOpen(o => !o)}
                    className="h-10 w-10 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700/50"
                    aria-label="Open search filters"
                >
                    <FilterIcon className="w-5 h-5"/>
                </button>
                {isPopoverOpen && <SearchPopover onClose={() => setIsPopoverOpen(false)} />}
            </div>
        </div>

        <PWAInstallButton />

        <button onClick={onOpenCommandPalette} className="flex-shrink-0 h-10 w-10 flex flex-col items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200 transition-colors" aria-label={t('header:openCommandPalette')}>
            <span className="text-lg leading-none">⌘</span>
            <kbd className="font-sans text-xs font-semibold leading-none">K</kbd>
        </button>
    </header>
  );
};