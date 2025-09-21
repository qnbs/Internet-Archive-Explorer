import React, { useState, useEffect, useCallback } from 'react';
import type { ArchiveItemSummary, Profile } from '../../types';
import { searchArchive } from '../../services/archiveService';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { ResultsGrid } from '../ResultsGrid';
import { useLanguage } from '../../hooks/useLanguage';

interface UploaderPostsTabProps {
    profile: Profile;
}

const PAGE_SIZE = 12;

export const UploaderPostsTab: React.FC<UploaderPostsTabProps> = ({ profile }) => {
    const { t } = useLanguage();
    const [items, setItems] = useState<ArchiveItemSummary[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async (pageNum: number) => {
        if (pageNum === 1) setIsLoading(true); else setIsLoadingMore(true);
        setError(null);

        try {
            const query = `creator:("${profile.searchIdentifier}") AND mediatype:(texts) AND collection:(archiveteam_newsposts)`;
            const data = await searchArchive(query, pageNum, ['-publicdate'], undefined, PAGE_SIZE);
            if (data?.response) {
                setTotal(data.response.numFound);
                setItems(prev => pageNum === 1 ? data.response.docs : [...prev, ...data.response.docs]);
            }
        } catch (err) {
            setError(t('common:error'));
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [profile.searchIdentifier, t]);

    useEffect(() => {
        setPage(1);
        setItems([]);
        fetchItems(1);
    }, [fetchItems]);
    
    const handleLoadMore = useCallback(() => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchItems(nextPage);
    }, [page, fetchItems]);
    
    const handleRetry = useCallback(() => {
        setPage(1);
        fetchItems(1);
    }, [fetchItems]);
    
    const hasMore = !isLoading && items.length < total;
    const lastElementRef = useInfiniteScroll({
        isLoading: isLoadingMore,
        hasMore,
        onLoadMore: handleLoadMore
    });

    return (
        <div className="animate-fade-in">
            <ResultsGrid
                results={items}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                error={error}
                hasMore={hasMore}
                totalResults={total}
                lastElementRef={lastElementRef}
                onRetry={handleRetry}
            />
        </div>
    );
};