import React, { useState, useEffect, useCallback } from 'react';
import type { ArchiveItemSummary, Profile } from '../../types';
import { getReviewsByUploader } from '../../services/archiveService';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useLanguage } from '../../hooks/useLanguage';
import { ReviewCard } from '../ReviewCard';
import { Spinner } from '../Spinner';

interface UploaderReviewsTabProps {
    profile: Profile;
}

const REVIEWS_PAGE_SIZE = 10;

export const UploaderReviewsTab: React.FC<UploaderReviewsTabProps> = ({ profile }) => {
    const { t } = useLanguage();
    const [reviews, setReviews] = useState<ArchiveItemSummary[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = useCallback(async (pageNum: number) => {
        if (profile.type !== 'uploader') {
            setIsLoading(false);
            return;
        }

        if (pageNum === 1) setIsLoading(true); else setIsLoadingMore(true);
        setError(null);

        try {
            const data = await getReviewsByUploader(profile.searchIdentifier, pageNum, REVIEWS_PAGE_SIZE);
            if (data?.response) {
                setTotal(data.response.numFound);
                setReviews(prev => pageNum === 1 ? data.response.docs : [...prev, ...data.response.docs]);
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
        setReviews([]);
        fetchReviews(1);
    }, [fetchReviews]);
    
    const handleLoadMore = useCallback(() => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchReviews(nextPage);
    }, [page, fetchReviews]);
    
    const hasMore = !isLoading && reviews.length < total;
    const lastElementRef = useInfiniteScroll({
        isLoading: isLoadingMore,
        hasMore,
        onLoadMore: handleLoadMore
    });

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }
    
    if (error) {
        return <div className="text-center py-10 text-red-400">{error}</div>;
    }

    if (reviews.length === 0) {
        return <div className="text-center py-10 text-gray-500">{t('common:noResultsFound')}</div>;
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="space-y-4">
                {reviews.map((review, index) => (
                    <div key={`${review.identifier}-${review.reviewdate}-${index}`} ref={index === reviews.length - 1 ? lastElementRef : null}>
                        <ReviewCard review={review} />
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
};