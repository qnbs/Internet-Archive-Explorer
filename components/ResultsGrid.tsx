import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import type { ArchiveItemSummary } from '@/types';
import { SearchIcon } from './Icons';
import { ItemCard } from './ItemCard';
import { SkeletonCard } from './SkeletonCard';
import { Spinner } from './Spinner';

interface ResultsGridProps {
  /** Accessible name for the live region (WCAG 2.2 async search results) */
  ariaLabel: string;
  results: ArchiveItemSummary[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  totalResults: number;
  lastElementRef?: (node: HTMLDivElement | null) => void;
  onRetry?: () => void;
  searchQuery?: string;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  ariaLabel,
  results,
  isLoading,
  isLoadingMore,
  error,
  totalResults,
  lastElementRef,
  onRetry,
  searchQuery,
}) => {
  const { t, language } = useLanguage();

  const busy = isLoading || isLoadingMore;

  let body: React.ReactNode;

  if (isLoading) {
    body = (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  } else if (error) {
    body = (
      <div className="text-center py-20 bg-red-50 dark:bg-gray-800/60 rounded-lg border border-red-200 dark:border-transparent flex flex-col items-center">
        <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="touch-target-min px-4 py-2 bg-accent-700 text-white font-semibold rounded-lg hover:bg-accent-600 transition-colors"
          >
            {t('common:retry')}
          </button>
        )}
      </div>
    );
  } else if (results.length === 0) {
    body = (
      <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-transparent flex flex-col items-center">
        <SearchIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" aria-hidden />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('common:noResultsFound')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('common:noResultsMessage')}</p>
      </div>
    );
  } else {
    body = (
      <div>
        <div className="pb-4 border-b border-gray-200 dark:border-gray-700 mb-6">
          {searchQuery && (
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">
              {t('common:resultsFor')}{' '}
              <span className="font-bold text-gray-900 dark:text-white">"{searchQuery}"</span>
            </p>
          )}
          <p className="text-gray-500 dark:text-gray-400" aria-live="polite">
            {t('common:itemsFound', {
              count: totalResults,
              formattedCount: totalResults.toLocaleString(language),
            })}
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
          {results.map((item, index) => (
            <div key={item.identifier} ref={index === results.length - 1 ? lastElementRef : null}>
              <ItemCard item={item} index={index} />
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
  }

  return (
    <div role="region" aria-label={ariaLabel} aria-live="polite" aria-busy={busy}>
      {body}
    </div>
  );
};
