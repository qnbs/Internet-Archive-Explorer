import React from 'react';
import { useHelpViewContext } from '../../contexts/HelpViewContext';
import { SearchIcon } from '../Icons';

export const HelpSearchBar: React.FC = () => {
    const { t, searchQuery, setSearchQuery } = useHelpViewContext();
    return (
        <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('help:searchPlaceholder')}
                className="w-full bg-white dark:bg-gray-800/60 border-2 border-gray-200 dark:border-gray-700/50 focus-within:border-accent-500 rounded-lg py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-colors"
            />
        </div>
    );
};