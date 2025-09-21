import React, { useState, useEffect, useCallback } from 'react';
import type { ArchiveItemSummary, Profile } from '../../types';
import { searchArchive } from '../../services/archiveService';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { ResultsGrid } from '../ResultsGrid';
import { useLanguage } from '../../hooks/useLanguage';

interface UploaderCollectionsProps {
    profile: Profile;
}

const COLLECTIONS_PAGE_SIZE = 12;

export const UploaderCollections: React.FC<UploaderCollectionsProps> = ({ profile }) => {
    const { t } = useLanguage();
    const [collections, setCollections] = useState<ArchiveItemSummary[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCollections = useCallback(async (pageNum: number) => {
        if (pageNum === 1) setIsLoading(true); else setIsLoadingMore(true);
        setError(null);

        try {
            const query = `uploader:("${profile.searchIdentifier}") AND mediatype:collection`;
            const data = await searchArchive(query, pageNum, ['-publicdate'], undefined, COLLECTIONS_PAGE_SIZE);
            if (data?.response) {
                setTotal(data.response.numFound);
                setCollections(prev => pageNum === 1 ? data.response.docs : [...prev, ...data.response.docs]);
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
        setCollections([]);
        fetchCollections(1);
    }, [fetchCollections]);
    
    const handleLoadMore = useCallback(() => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCollections(nextPage);
    }, [page, fetchCollections]);
    
    const handleRetry = useCallback(() => {
        setPage(1);
        fetchCollections(1);
    }, [fetchCollections]);
    
    const hasMore = !isLoading && collections.length < total;
    const lastElementRef = useInfiniteScroll({
        isLoading: isLoadingMore,
        hasMore,
        onLoadMore: handleLoadMore
    });

    return (
        <div className="animate-fade-in">
            <ResultsGrid
                results={collections}
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