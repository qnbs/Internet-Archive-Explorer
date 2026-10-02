import React, { useEffect, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, CloseIcon, SearchIcon } from '@/components/Icons';
import { useLanguage } from '@/hooks/useLanguage';
import { findLiteralMatchStarts } from '@/utils/literalTextSearch';

interface DocumentSearchBarProps {
  text: string;
  onSearch: (query: string) => void;
}

export const DocumentSearchBar: React.FC<DocumentSearchBarProps> = ({ text, onSearch }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [matchStarts, setMatchStarts] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  useEffect(() => {
    onSearch(query);
    const starts = findLiteralMatchStarts(text, query);
    setMatchStarts(starts);
    setCurrentMatchIndex(0);
  }, [query, text, onSearch]);

  const goToMatch = (direction: 'next' | 'prev') => {
    if (matchStarts.length === 0) return;

    const newIndex =
      direction === 'next'
        ? (currentMatchIndex + 1) % matchStarts.length
        : (currentMatchIndex - 1 + matchStarts.length) % matchStarts.length;

    setCurrentMatchIndex(newIndex);

    const offset = matchStarts[newIndex];
    const element = document.querySelector(`mark[data-match-index="${offset}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <div className="flex-shrink-0 p-2 border-t border-gray-700 bg-gray-900/50 flex items-center justify-between text-sm gap-4">
      <div className="flex items-center gap-2 flex-grow min-w-0">
        <SearchIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('scriptorium:reader.searchDocument')}
          className="bg-transparent focus:outline-none w-full"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="p-1 rounded-full text-gray-500 hover:text-white"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      {query && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-gray-400">
            {matchStarts.length > 0
              ? t('scriptorium:reader.matchCount', {
                  current: currentMatchIndex + 1,
                  total: matchStarts.length,
                  count: matchStarts.length,
                })
              : t('scriptorium:reader.noMatches')}
          </span>
          <button
            type="button"
            onClick={() => goToMatch('prev')}
            disabled={matchStarts.length === 0}
            className="p-1 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            <ChevronUpIcon />
          </button>
          <button
            type="button"
            onClick={() => goToMatch('next')}
            disabled={matchStarts.length === 0}
            className="p-1 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            <ChevronDownIcon />
          </button>
        </div>
      )}
    </div>
  );
};
