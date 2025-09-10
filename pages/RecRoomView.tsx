import React, { useState, useEffect, useCallback } from 'react';
import { searchArchive } from '../services/archiveService';
import type { ArchiveItemSummary } from '../types';
import { MediaType } from '../types';
import { RecRoomItemCard } from '../components/RecRoomItemCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { JoystickIcon } from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface RecRoomViewProps {
    onSelectItem: (item: ArchiveItemSummary) => void;
}

export const RecRoomView: React.FC<RecRoomViewProps> = ({ onSelectItem }) => {
  const { t } = useLanguage();
  const [results, setResults] = useState<ArchiveItemSummary[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = !isLoading && results.length < totalResults;

  const performSearch = useCallback(async (searchPage: number) => {
    setError(null);
    if (searchPage === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      // Prioritize emulatable software from the softwarelibrary collection
      const data = await searchArchive(`collection:softwarelibrary AND mediatype:(${MediaType.Software})`, searchPage);
      if (data && data.response && Array.isArray(data.response.docs)) {
        setTotalResults(data.response.numFound);
        if (searchPage === 1) {
            setResults(data.response.docs);
        } else {
            setResults(prevResults => {
                const newDocs = data.response.docs.filter(doc => !prevResults.some(res => res.identifier === doc.identifier));
                return [...prevResults, ...newDocs];
            });
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
  }, [t]);

  useEffect(() => {
    performSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount
  
  const handleLoadMore = useCallback(() => {
    setPage(prevPage => {
        const nextPage = prevPage + 1;
        performSearch(nextPage);
        return nextPage;
    });
  }, [performSearch]);

  const lastElementRef = useInfiniteScroll({
      isLoading: isLoading || isLoadingMore,
      hasMore,
      onLoadMore: handleLoadMore,
      rootMargin: '400px', // Load more when the user is 400px away from the bottom
  });

  return (
    <div className="space-y-8">
        <header className="p-6 sm:p-8 bg-gray-800/60 rounded-xl shadow-lg border border-cyan-500/20 text-center relative overflow-hidden">
            <div className="absolute -top-12 -left-12 text-cyan-500/10 opacity-50">
                <JoystickIcon className="w-48 h-48 transform rotate-[-15deg]" />
            </div>
             <div className="absolute -bottom-12 -right-12 text-cyan-500/10 opacity-50">
                <JoystickIcon className="w-48 h-48 transform rotate-[15deg]" />
            </div>
            <div className="relative z-10">
                <h1 className="text-3xl sm:text-5xl font-bold text-cyan-400 tracking-wider">{t('recRoom:title')}</h1>
                <p className="mt-4 max-w-3xl mx-auto text-base sm:text-lg text-gray-300 leading-relaxed">
                    {t('recRoom:description')}
                </p>
            </div>
        </header>

        {error && (
             <div className="text-center py-20 bg-gray-800 rounded-lg">
                <p className="text-red-400 text-lg">{error}</p>
            </div>
        )}
        
        {isLoading ? (
             <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                    <SkeletonCard key={`skeleton-initial-${index}`} />
                ))}
            </div>
        ) : (
            <>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                    {results.map((item, index) => (
                        <div ref={results.length === index + 1 ? lastElementRef : null} key={item.identifier}>
                          <RecRoomItemCard item={item} onSelect={onSelectItem} index={index} />
                        </div>
                    ))}
                </div>

                {isLoadingMore && (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 mt-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <SkeletonCard key={`skeleton-more-${index}`} />
                        ))}
                    </div>
                )}
                
                {!isLoadingMore && !hasMore && results.length > 0 && (
                     <p className="text-center text-gray-500 py-8">{t('recRoom:endOfArcade')}</p>
                )}
            </>
        )}
    </div>
  );
};
