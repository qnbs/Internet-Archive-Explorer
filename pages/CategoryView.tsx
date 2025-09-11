import React, { useState, useEffect, useCallback } from 'react';
import { ResultsGrid } from '../components/ResultsGrid';
import { searchArchive } from '../services/archiveService';
import type { ArchiveItemSummary, MediaType } from '../types';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useLanguage } from '../hooks/useLanguage';
import { sanitizeHtml } from '../utils/sanitizer';

interface CategoryViewProps {
    onSelectItem: (item: ArchiveItemSummary) => void;
    mediaType: MediaType | string;
    title: string;
    description: string;
    collectionUrl?: string;
    contributors?: { name: string; role: string }[];
}

const ExternalLinkIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);


export const CategoryView: React.FC<CategoryViewProps> = ({ onSelectItem, mediaType, title, description, collectionUrl, contributors }) => {
  const [results, setResults] = useState<ArchiveItemSummary[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const performSearch = useCallback(async (searchPage: number) => {
    if (searchPage === 1) {
      setIsLoading(true);
      setResults([]);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const data = await searchArchive(`mediatype:(${mediaType})`, searchPage);
      if (data && data.response && Array.isArray(data.response.docs)) {
        setTotalResults(data.response.numFound);
        if (searchPage === 1) {
          setResults(data.response.docs);
        } else {
          setResults(prevResults => [...prevResults, ...data.response.docs]);
        }
      } else {
        setTotalResults(0);
        setResults(prev => searchPage === 1 ? [] : prev);
      }
    } catch (err) {
      setError(t('common:error'));
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [mediaType, t]);
  
  const handleLoadMore = useCallback(() => {
    setPage(prevPage => {
        const nextPage = prevPage + 1;
        performSearch(nextPage);
        return nextPage;
    });
  }, [performSearch]);
  
  const handleRetry = useCallback(() => {
      setPage(1);
      performSearch(1);
  }, [performSearch]);

  const hasMore = !isLoading && results.length < totalResults;
  const lastElementRef = useInfiniteScroll({
      isLoading: isLoadingMore,
      hasMore,
      onLoadMore: handleLoadMore,
      rootMargin: '400px',
  });

  useEffect(() => {
    performSearch(1);
  }, [performSearch]);

  return (
    <div className="space-y-8">
        <div className="p-6 bg-gray-800/60 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">{title}</h2>
            <div className="text-gray-300 leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }} />
             {collectionUrl && (
              <div className="mt-6">
                <a
                  href={collectionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg"
                >
                  {t('common:viewFullCollection')}
                  <ExternalLinkIcon />
                </a>
              </div>
            )}
        </div>

        {contributors && contributors.length > 0 && (
            <div className="p-6 bg-gray-800/60 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4">{t('common:topContributors')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {contributors.map((c, i) => (
                        <div key={i} className="bg-gray-900/50 p-3 rounded-lg text-center border border-gray-700">
                        <p className="font-semibold text-gray-200 text-sm truncate" title={c.name}>{c.name}</p>
                        <p className="text-xs text-cyan-400">{c.role}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div>
            <h3 className="text-2xl font-bold mb-4">{t('common:featuredItems')}</h3>
            <ResultsGrid
                results={results}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                error={error}
                onSelectItem={onSelectItem}
                hasMore={hasMore}
                totalResults={totalResults}
                lastElementRef={lastElementRef}
                onRetry={handleRetry}
            />
        </div>
    </div>
  );
};