import React, { useState, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { activeViewAtom } from '../store/app';
import { searchQueryAtom, profileSearchQueryAtom, addSearchHistoryAtom } from '../store/search';
import { SearchIcon, CloseIcon } from './Icons';
import { useLanguage } from '../hooks/useLanguage';

export const SearchBar: React.FC = () => {
    const [activeView, setActiveView] = useAtom(activeViewAtom);
    const { t } = useLanguage();

    const [globalSearch, setGlobalSearch] = useAtom(searchQueryAtom);
    const [profileSearch, setProfileSearch] = useAtom(profileSearchQueryAtom);
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

    return (
        <form 
            onSubmit={handleSearchSubmit} 
            className="w-full relative flex items-center bg-gray-100/50 dark:bg-gray-700/50 rounded-lg border border-transparent focus-within:border-accent-500 h-10 px-3 transition-colors"
        >
            <label htmlFor="header-search" className="sr-only">{getPlaceholder()}</label>
            <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none flex-shrink-0" />

            <input
                id="header-search"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={getPlaceholder()}
                className="flex-grow bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none ml-2"
            />

            {inputValue && (
                <button type="button" onClick={handleClearSearch} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    <CloseIcon className="w-4 h-4" />
                </button>
            )}
        </form>
    );
};