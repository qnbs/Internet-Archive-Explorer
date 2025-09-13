import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { searchQueryAtom, facetsAtom } from '../store/search';
import { useDebounce } from '../hooks/useDebounce';
import { searchArchive } from '../services/archiveService';
import type { ArchiveItemSummary } from '../types';
import { useInfiniteScroll } from './useInfiniteScroll';
import { useLanguage } from '../hooks/useLanguage';
import { buildArchiveQuery } from '../utils/queryBuilder';

export const useExplorerSearch = () => {
  const [searchQuery] = useAtom(searchQueryAtom);
  const [facets] = useAtom(facetsAtom);
  const debouncedQuery = useDebounce(searchQuery, 400);

  const [results, setResults] = useState<ArchiveItemSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true); // New state to explicitly control infinite scroll
  const { t } = useLanguage();

  const performSearch = useCallback(async (query: string, searchPage: number) => {
    if (searchPage === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const finalQuery = query || 'featured';
      const sorts = finalQuery === 'featured' ? [] : ['-publicdate'];
      const data = await searchArchive(finalQuery, searchPage, sorts);
      if (data && data.response && Array.isArray(data.response.docs)) {
        const newDocs = data.response.docs;
        setTotalResults(data.response.numFound);

        if (newDocs.length === 0) {
          setHasMore(false);
        } else {
          setResults(prev => {
            const currentResults = searchPage === 1 ? [] : prev;
            const existingIds = new Set(currentResults.map(item => item.identifier));
            const uniqueNewDocs = newDocs.filter(item => !existingIds.has(item.identifier));
            const combinedResults = [...currentResults, ...uniqueNewDocs];
            
            setHasMore(combinedResults.length < data.response.numFound);
            return combinedResults;
          });
        }
      } else {
        setTotalResults(0);
        setResults(prev => (searchPage === 1 ? [] : prev));
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common:error'));
      setHasMore(false); // Stop fetching on error
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [t]);

  useEffect(() => {
    setPage(1);
    setHasMore(true); // Reset for new search
    const query = buildArchiveQuery({ text: debouncedQuery, facets });
    performSearch(query, 1);
  }, [debouncedQuery, facets, performSearch]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return; // Guard against unnecessary calls
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(buildArchiveQuery({ text: debouncedQuery, facets }), nextPage);
  }, [isLoading, isLoadingMore, hasMore, page, debouncedQuery, facets, performSearch]);
  
  const handleRetry = useCallback(() => {
      setPage(1);
      setHasMore(true); // Reset for retry
      performSearch(buildArchiveQuery({ text: debouncedQuery, facets }), 1);
  }, [debouncedQuery, facets, performSearch]);
  
  const lastElementRef = useInfiniteScroll({
      isLoading: isLoadingMore,
      hasMore,
      onLoadMore: handleLoadMore,
      rootMargin: '400px'
  });

  return { results, isLoading, isLoadingMore, error, totalResults, hasMore, lastElementRef, handleRetry };
};