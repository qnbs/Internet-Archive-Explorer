import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { activeViewAtom, searchQueryAtom, profileSearchQueryAtom, facetsAtom } from '../store';
import { MenuIcon, SearchIcon, CloseIcon, FilterIcon } from './Icons';
import { useLanguage } from '../hooks/useLanguage';
import { SearchPopover } from './SearchPopover';
import type { Facets, MediaType } from '../types';

interface HeaderProps {
  onMenuClick: () => void;
  onOpenCommandPalette: () => void;
}

const Pill: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
    <div className="flex items-center gap-1.5 bg-cyan-500/80 text-white text-xs font-semibold px-2 py-1 rounded-full animate-fade-in">
        <span className="capitalize">{label}</span>
        <button onClick={onRemove} className="rounded-full hover:bg-black/20" aria-label={`Remove ${label} filter`}>
            <CloseIcon className="w-3.5 h-3.5" />
        </button>
    </div>
);


export const Header: React.FC<HeaderProps> = ({ onMenuClick, onOpenCommandPalette }) => {
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const { t } = useLanguage();

  const [globalSearch, setGlobalSearch] = useAtom(searchQueryAtom);
  const [profileSearch, setProfileSearch] = useAtom(profileSearchQueryAtom);
  const [facets, setFacets] = useAtom(facetsAtom);
  
  const [inputValue, setInputValue] = useState('');
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

  useEffect(() => {
    switch (activeView) {
      case 'uploaderDetail': setInputValue(profileSearch); break;
      default: setInputValue(globalSearch); break;
    }
  }, [activeView, globalSearch, profileSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    switch (activeView) {
      case 'uploaderDetail': setProfileSearch(newValue); break;
      default: setGlobalSearch(newValue); break;
    }
  };
  
  const handleClearSearch = () => {
    setInputValue('');
    switch (activeView) {
      case 'uploaderDetail': setProfileSearch(''); break;
      default: setGlobalSearch(''); break;
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (activeView !== 'explore' && activeView !== 'uploaderDetail') {
          setActiveView('explore');
      }
  };

  const getPlaceholder = () => {
    switch (activeView) {
        case 'uploaderDetail': return t('uploaderDetail:searchInUploads');
        default: return t('explorer:searchPlaceholder');
    }
  };
  
  const handleRemoveMediaType = (type: MediaType) => {
    setFacets(f => ({ ...f, mediaType: new Set(Array.from(f.mediaType).filter(t => t !== type)) }));
  };
  
  const hasActiveFilters = facets.mediaType.size > 0 || facets.availability !== 'free';


  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md dark:shadow-black/30 border-b border-gray-200 dark:border-gray-700/50 z-20 flex items-center px-2 sm:px-4 gap-2 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 md:hidden">
            <button onClick={onMenuClick} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label={t('sideMenu:title')}>
                <MenuIcon />
            </button>
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <div className="relative w-full flex items-center bg-gray-100/50 dark:bg-gray-700/50 rounded-lg border border-transparent focus-within:border-cyan-500 py-1.5 pl-3 pr-3 transition-colors">
                    <label htmlFor="header-search" className="sr-only">{getPlaceholder()}</label>
                    <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none flex-shrink-0" />

                    <div className="flex items-center gap-1.5 ml-2 overflow-x-hidden">
                        {Array.from(facets.mediaType).map(type => <Pill key={type} label={type} onRemove={() => handleRemoveMediaType(type)} />)}
                    </div>

                    <input
                        id="header-search"
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={hasActiveFilters ? '' : getPlaceholder()}
                        className="flex-grow w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none ml-2"
                    />

                    {inputValue && (
                        <button type="button" onClick={handleClearSearch} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </form>
            
            <div ref={popoverRef} className="relative flex-shrink-0">
                <button
                    onClick={() => setIsPopoverOpen(o => !o)}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700/50"
                    aria-label="Open search filters"
                >
                    <FilterIcon className="w-5 h-5"/>
                </button>
                {isPopoverOpen && <SearchPopover onClose={() => setIsPopoverOpen(false)} />}
            </div>
        </div>

        <button onClick={onOpenCommandPalette} className="flex-shrink-0 flex items-center gap-1 px-2.5 py-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200 transition-colors" aria-label={t('header:openCommandPalette')}>
            <span className="text-lg">⌘</span>
            <kbd className="font-sans text-xs font-semibold">K</kbd>
        </button>
    </header>
  );
};