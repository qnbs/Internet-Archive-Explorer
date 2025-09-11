
import React, { useState, useEffect, useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { searchQueryAtom, facetsAtom, showExplorerHubAtom } from '../store';
import { useDebounce } from '../hooks/useDebounce';
import { searchArchive } from '../services/archiveService';
import type { ArchiveItemSummary } from '../types';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { ResultsGrid } from '../components/ResultsGrid';
import { useLanguage } from '../hooks/useLanguage';
import { OnThisDay } from '../components/OnThisDay';
import { TrendingIcon } from '../components/Icons';
import { ContentCarousel } from '../components/ContentCarousel';

interface ExplorerViewProps {
  onSelectItem: (item: ArchiveItemSummary) => void;
}

const useExplorerSearch = () => {
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

  const buildQuery = useCallback(() => {
    const queryParts: string[] = [];
    if (debouncedQuery.trim()) {
        queryParts.push(`(${debouncedQuery.trim()})`);
    }

    if (facets.mediaType.size > 0) {
        const mediaTypes = Array.from(facets.mediaType).join(' OR ');
        queryParts.push(`mediatype:(${mediaTypes})`);
    }

    if (facets.yearStart && facets.yearEnd) {
        queryParts.push(`publicdate:[${facets.yearStart} TO ${facets.yearEnd}]`);
    } else if (facets.yearStart) {
        queryParts.push(`publicdate:[${facets.yearStart} TO 9999]`);
    } else if (facets.yearEnd) {
        queryParts.push(`publicdate:[0000 TO ${facets.yearEnd}]`);
    }

    if (facets.collection) {
        queryParts.push(`collection:(${facets.collection})`);
    }
    
    return queryParts.join(' AND ');
  }, [debouncedQuery, facets]);

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
    const query = buildQuery();
    performSearch(query, 1);
  }, [debouncedQuery, facets, performSearch, buildQuery]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || isLoadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(buildQuery(), nextPage);
  }, [isLoading, isLoadingMore, page, buildQuery, performSearch]);
  
  const handleRetry = useCallback(() => {
      setPage(1);
      performSearch(buildQuery(), 1);
  }, [buildQuery, performSearch]);
  
  const hasMore = !isLoading && results.length < totalResults;
  const lastElementRef = useInfiniteScroll({
      isLoading: isLoadingMore,
      hasMore,
      onLoadMore: handleLoadMore,
      rootMargin: '400px'
  });

  return { results, isLoading, isLoadingMore, error, totalResults, hasMore, lastElementRef, handleRetry };
};

const TrendingItems: React.FC<{ onSelectItem: (item: ArchiveItemSummary) => void }> = ({ onSelectItem }) => {
    const [items, setItems] = useState<ArchiveItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();

    const fetchTrending = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await searchArchive('', 1, ['-week']);
            setItems(data.response?.docs.slice(0, 15) || []);
        } catch (err) {
            setError(t('common:error'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchTrending();
    }, [fetchTrending]);

    return (
        <ContentCarousel
            title={t('explorer:trending')}
            titleIcon={<TrendingIcon />}
            items={items}
            isLoading={isLoading}
            error={error}
            onRetry={fetchTrending}
            onSelectItem={onSelectItem}
            cardAspectRatio="portrait"
        />
    );
};

export const ExplorerView: React.FC<ExplorerViewProps> = ({ onSelectItem }) => {
    const { results, isLoading, isLoadingMore, error, totalResults, hasMore, lastElementRef, handleRetry } = useExplorerSearch();
    const showHub = useAtomValue(showExplorerHubAtom);
    const [searchQuery] = useAtom(searchQueryAtom);
    const [facets] = useAtom(facetsAtom);
    
    const hasActiveSearch = searchQuery.trim().length > 0 || facets.mediaType.size > 0 || facets.collection || facets.yearStart || facets.yearEnd;

    if (showHub && !hasActiveSearch) {
        return (
            <div className="space-y-12 animate-page-fade-in">
                <TrendingItems onSelectItem={onSelectItem} />
                <OnThisDay onSelectItem={onSelectItem} />
            </div>
        );
    }

    return (
        <div className="animate-page-fade-in">
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
    );
};
