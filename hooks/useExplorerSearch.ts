import { useState, useEffect, useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { searchQueryAtom, facetsAtom } from '../store';
import { useDebounce } from '../hooks/useDebounce';
import { searchArchive } from '../services/archiveService';
import type { ArchiveItemSummary } from '../types';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
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
  const { t } = useLanguage();

  const performSearch = useCallback(async (query: string, searchPage: number) => {
    if (searchPage === 1) {
        setIsLoading(true);
        setResults([]);
    } else {
        setIsLoadingMore(true);
    }
    setError(null);

    try {
      const finalQuery = query || 'featured';
      const sorts = finalQuery === 'featured' ? [] : ['-publicdate'];
      const data = await searchArchive(finalQuery, searchPage, sorts);
      if (data && data.response && Array.isArray(data.response.docs)) {
        setTotalResults(data.response.numFound);
        setResults(prev => searchPage === 1 ? data.response.docs : [...prev, ...data.response.docs]);
      } else {
        setTotalResults(0);
        setResults(prev => searchPage === 1 ? [] : prev);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common:error'));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [t]);

  useEffect(() => {
    setPage(1);
    const query = buildArchiveQuery({ text: debouncedQuery, facets });
    performSearch(query, 1);
  }, [debouncedQuery, facets, performSearch]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || isLoadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(buildArchiveQuery({ text: debouncedQuery, facets }), nextPage);
  }, [isLoading, isLoadingMore, page, debouncedQuery, facets, performSearch]);
  
  const handleRetry = useCallback(() => {
      setPage(1);
      performSearch(buildArchiveQuery({ text: debouncedQuery, facets }), 1);
  }, [debouncedQuery, facets, performSearch]);
  
  const hasMore = !isLoading && results.length < totalResults;
  const lastElementRef = useInfiniteScroll({
      isLoading: isLoadingMore,
      hasMore,
      onLoadMore: handleLoadMore,
      rootMargin: '400px'
  });

  return { results, isLoading, isLoadingMore, error, totalResults, hasMore, lastElementRef, handleRetry };
};