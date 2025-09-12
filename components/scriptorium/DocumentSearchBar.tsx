import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { SearchIcon, ChevronUpIcon, ChevronDownIcon, CloseIcon } from '../Icons';

interface DocumentSearchBarProps {
    text: string;
    onSearch: (query: string) => void;
}

export const DocumentSearchBar: React.FC<DocumentSearchBarProps> = ({ text, onSearch }) => {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');
    const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

    useEffect(() => {
        onSearch(query);
        if (query) {
            const regex = new RegExp(query, 'gi');
            const foundMatches = [...text.matchAll(regex)];
            setMatches(foundMatches);
            setCurrentMatchIndex(0);
        } else {
            setMatches([]);
        }
    }, [query, text, onSearch]);
    
    const goToMatch = (direction: 'next' | 'prev') => {
        if(matches.length === 0) return;
        
        const newIndex = direction === 'next'
            ? (currentMatchIndex + 1) % matches.length
            : (currentMatchIndex - 1 + matches.length) % matches.length;
        
        setCurrentMatchIndex(newIndex);
        
        const match = matches[newIndex];
        const element = document.querySelector(`mark[data-match-index="${match.index}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    
    const clearSearch = () => {
        setQuery('');
    };

    return (
        <div className="flex-shrink-0 p-2 border-t border-gray-700 bg-gray-900/50 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
                <SearchIcon className="w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={t('scriptorium:reader.searchDocument')}
                    className="bg-transparent focus:outline-none w-48"
                />
                 {query && (
                    <button onClick={clearSearch} className="p-1 rounded-full text-gray-500 hover:text-white"><CloseIcon className="w-4 h-4" /></button>
                 )}
            </div>
            {query && (
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                        {matches.length > 0
                          ? t('scriptorium:reader.matchCount', { current: currentMatchIndex + 1, total: matches.length, count: matches.length })
                          : t('scriptorium:reader.noMatches')
                        }
                    </span>
                    <button onClick={() => goToMatch('prev')} disabled={matches.length === 0} className="p-1 rounded hover:bg-gray-700 disabled:opacity-50"><ChevronUpIcon/></button>
                    <button onClick={() => goToMatch('next')} disabled={matches.length === 0} className="p-1 rounded hover:bg-gray-700 disabled:opacity-50"><ChevronDownIcon /></button>
                </div>
            )}
        </div>
    );
};