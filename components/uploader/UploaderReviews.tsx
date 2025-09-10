import React, { useState, useEffect, useCallback } from 'react';
import type { ArchiveItemSummary, Uploader } from '../../types';
import { getReviewsByUploader } from '../../services/archiveService';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { Spinner } from '../Spinner';
import { ReviewCard } from '../ReviewCard';
import { useLanguage } from '../../contexts/LanguageContext';

interface UploaderReviewsProps {
    uploader: Uploader;
    onSelectItem: (item: ArchiveItemSummary) => void;
}

const REVIEWS_PAGE_SIZE = 10;

export const UploaderReviews: React.FC<UploaderReviewsProps> = ({ uploader, onSelectItem }) => {
    const { t } = useLanguage();
    const [reviews, setReviews] = useState<ArchiveItemSummary[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = useCallback(async (pageNum: number) => {
        if (pageNum === 1) setIsLoading(true); else setIsLoadingMore(true);
        setError(null);

        try {
            const data = await getReviewsByUploader(uploader.username, pageNum, REVIEWS_PAGE_SIZE);
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
    }, [uploader.username, t]);

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
        return <p className="text-center text-red-400">{error}</p>;
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-10">
                <h3 className="text-xl font-semibold text-white">{t('uploaderDetail:noReviews')}</h3>
                <p className="text-gray-400 mt-2">{t('uploaderDetail:noReviewsDesc')}</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
             <p className="text-sm text-gray-400">{t('common:itemsFound', { count: total, formattedCount: total.toLocaleString() })}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review, index) => (
                    <div key={`${review.identifier}-${review.reviewdate}-${index}`} ref={index === reviews.length - 1 ? lastElementRef : null}>
                        <ReviewCard item={review} onItemSelect={onSelectItem} />
                    </div>
                ))}
            </div>
             {isLoadingMore && <div className="flex justify-center mt-4"><Spinner /></div>}
        </div>
    );
};