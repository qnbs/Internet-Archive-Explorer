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
import { useExplorerSearch } from '../hooks/useExplorerSearch';

interface ExplorerViewProps {
  onSelectItem: (item: ArchiveItemSummary) => void;
}

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
    const [searchQuery] = useAtom(searchQueryAtom);
    const { results, isLoading, isLoadingMore, error, totalResults, hasMore, lastElementRef, handleRetry } = useExplorerSearch();
    const showHub = useAtomValue(showExplorerHubAtom);
    const [facets] = useAtom(facetsAtom);
    
    const hasActiveSearch = searchQuery.trim().length > 0 || facets.mediaType.size > 0 || facets.collection || facets.yearStart || facets.yearEnd;

    if (showHub && !hasActiveSearch) {
        return (
            <div className="space-y-12">
                <TrendingItems onSelectItem={onSelectItem} />
                <OnThisDay onSelectItem={onSelectItem} />
            </div>
        );
    }

    return (
        <div>
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
                searchQuery={searchQuery}
            />
        </div>
    );
};