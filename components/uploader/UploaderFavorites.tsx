import React, { useState, useEffect, useCallback } from 'react';
import type { ArchiveItemSummary, Profile } from '../../types';
import { searchArchive } from '../../services/archiveService';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { ResultsGrid } from '../ResultsGrid';
import { useLanguage } from '../../hooks/useLanguage';

interface UploaderFavoritesProps {
    profile: Profile;
}

const FAVORITES_PAGE_SIZE = 12;

export const UploaderFavorites: React.FC<UploaderFavoritesProps> = ({ profile }) => {
    const { t } = useLanguage();
    const [favorites, setFavorites] = useState<ArchiveItemSummary[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFavorites = useCallback(async (pageNum: number) => {
        if (profile.type !== 'uploader') {
            setIsLoading(false);
            return;
        }

        if (pageNum === 1) setIsLoading(true); else setIsLoadingMore(true);
        setError(null);

        try {
            const username = profile.searchIdentifier.split('@')[0];
            const query = `collection:(fav-${username})`;
            const data = await searchArchive(query, pageNum, ['-publicdate'], undefined, FAVORITES_PAGE_SIZE);
            if (data?.response) {
                setTotal(data.response.numFound);
                setFavorites(prev => pageNum === 1 ? data.response.docs : [...prev, ...data.response.docs]);
            }
        } catch (err) {
            setError(t('common:error'));
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [profile.searchIdentifier, profile.type, t]);

    useEffect(() => {
        setPage(1);
        setFavorites([]);
        fetchFavorites(1);
    }, [fetchFavorites]);
    
    const handleLoadMore = useCallback(() => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchFavorites(nextPage);
    }, [page, fetchFavorites]);
    
    const handleRetry = useCallback(() => {
        setPage(1);
        fetchFavorites(1);
    }, [fetchFavorites]);
    
    const hasMore = !isLoading && favorites.length < total;
    const lastElementRef = useInfiniteScroll({
        isLoading: isLoadingMore,
        hasMore,
        onLoadMore: handleLoadMore
    });

    return (
        <div className="animate-fade-in">
            <ResultsGrid
                results={favorites}
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