import React from 'react';
import { ItemCard } from './ItemCard';
import { SkeletonCard } from './SkeletonCard';
import { Spinner } from './Spinner';
import type { ArchiveItemSummary } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { SearchIcon } from './Icons';

interface ResultsGridProps {
  results: ArchiveItemSummary[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  onSelectItem: (item: ArchiveItemSummary) => void;
  hasMore: boolean;
  totalResults: number;
  lastElementRef?: (node: HTMLDivElement | null) => void;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  results,
  isLoading,
  isLoadingMore,
  error,
  onSelectItem,
  hasMore,
  totalResults,
  lastElementRef,
}) => {
  const { t, language } = useLanguage();

  if (isLoading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-red-100 dark:bg-gray-800/60 rounded-lg">
        <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-200/50 dark:bg-gray-800/60 rounded-lg flex flex-col items-center">
        <SearchIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('common.noResultsFound')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('common.noResultsMessage')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-4 border-b border-gray-300 dark:border-gray-700 mb-6">
        <p className="text-gray-500 dark:text-gray-400" aria-live="polite">{t('common.itemsFound', { count: totalResults, formattedCount: totalResults.toLocaleString(language) })}</p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
        {results.map((item, index) => (
          <div key={item.identifier} ref={index === results.length - 1 ? lastElementRef : null}>
            <ItemCard item={item} onSelect={onSelectItem} index={index} />
          </div>
        ))}
      </div>
      {isLoadingMore && (
        <div className="flex justify-center mt-10" aria-live="polite">
          <Spinner />
        </div>
      )}
    </div>
  );
};