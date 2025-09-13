import React, { useState, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { activeViewAtom } from '../store/app';
import { searchQueryAtom, profileSearchQueryAtom, facetsAtom, addSearchHistoryAtom } from '../store/search';
import { SearchIcon, CloseIcon } from './Icons';
import type { Facets, MediaType } from '../types';
import { useLanguage } from '../hooks/useLanguage';

const Pill: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
    <div className="flex items-center gap-1.5 bg-cyan-500/80 text-white text-xs font-semibold px-2 py-1 rounded-full animate-fade-in">
        <span className="capitalize">{label}</span>
        <button onClick={onRemove} className="rounded-full hover:bg-black/20" aria-label={`Remove ${label} filter`}>
            <CloseIcon className="w-3.5 h-3.5" />
        </button>
    </div>
);

export const SearchBar: React.FC = () => {
    const [activeView, setActiveView] = useAtom(activeViewAtom);
    const { t } = useLanguage();

    const [globalSearch, setGlobalSearch] = useAtom(searchQueryAtom);
    const [profileSearch, setProfileSearch] = useAtom(profileSearchQueryAtom);
    const [facets, setFacets] = useAtom(facetsAtom);
    const addSearchHistory = useSetAtom(addSearchHistoryAtom);

    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        switch (activeView) {
            case 'uploaderDetail':
            case 'myArchive':
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
        switch (activeView) {
            case 'uploaderDetail':
            case 'myArchive':
                setProfileSearch(newValue);
                break;
            default:
                setGlobalSearch(newValue);
                break;
        }
    };

    const handleClearSearch = () => {
        setInputValue('');
        switch (activeView) {
            case 'uploaderDetail':
            case 'myArchive':
                setProfileSearch('');
                break;
            default:
                setGlobalSearch('');
                break;
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addSearchHistory(inputValue);
        if (activeView !== 'explore' && activeView !== 'uploaderDetail' && activeView !== 'myArchive') {
            setActiveView('explore');
        }
    };

    const getPlaceholder = () => {
        switch (activeView) {
            case 'uploaderDetail': return t('uploaderDetail:searchInUploads');
            case 'myArchive': return t('myArchive:searchMyUploads');
            default: return t('explorer:searchPlaceholder');
        }
    };

    const handleRemoveMediaType = (type: MediaType) => {
        setFacets(f => ({ ...f, mediaType: new Set(Array.from(f.mediaType).filter(t => t !== type)) }));
    };

    const handleRemoveLanguage = () => {
        setFacets(f => ({ ...f, language: undefined }));
    };

    const hasActiveFilters = facets.mediaType.size > 0 || facets.availability !== 'all' || !!facets.language;

    return (
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <div className="relative w-full flex items-center bg-gray-100/50 dark:bg-gray-700/50 rounded-lg border border-transparent focus-within:border-cyan-500 h-10 px-3 transition-colors">
                <label htmlFor="header-search" className="sr-only">{getPlaceholder()}</label>
                <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none flex-shrink-0" />

                <div className="flex items-center gap-1.5 ml-2 overflow-x-hidden">
                    {Array.from(facets.mediaType).map((type: MediaType) => <Pill key={type} label={type} onRemove={() => handleRemoveMediaType(type)} />)}
                    {facets.language && <Pill key={facets.language} label={facets.language} onRemove={handleRemoveLanguage} />}
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
    );
};
