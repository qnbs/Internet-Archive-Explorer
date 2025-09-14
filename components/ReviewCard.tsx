import React from 'react';
import { useSetAtom } from 'jotai';
import { modalAtom } from '../store/app';
import type { ArchiveItemSummary } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface ReviewCardProps {
    review: ArchiveItemSummary;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
    const { t, language } = useLanguage();
    const setModal = useSetAtom(modalAtom);

    // Fix: Access reviewdate property which is now available on the extended ArchiveItemSummary type.
    const reviewDate = review.reviewdate ? new Date(review.reviewdate).toLocaleDateString(language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }) : '';

    const handleItemClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setModal({ type: 'itemDetail', item: review });
    };

    return (
        <article className="bg-gray-800/60 p-4 rounded-lg border border-gray-700/50">
            {/* Fix: Access reviewtitle property. */}
            {review.reviewtitle && <h3 className="font-bold text-white text-md mb-1">{review.reviewtitle}</h3>}
            {/* Fix: Access reviewbody property. */}
            {review.reviewbody && <blockquote className="text-gray-300 text-sm border-l-4 border-cyan-500 pl-4 italic my-2"><p>{review.reviewbody}</p></blockquote>}
            <div className="text-xs text-gray-400 mt-3">
                <span>{t('reviewCard:reviewedOn', { date: reviewDate })}</span>
                <p className="mt-1">
                    {t('reviewCard:regarding')}
                    <a href="#" onClick={handleItemClick} className="text-cyan-400 hover:underline">{review.title}</a>
                </p>
            </div>
        </article>
    );
};