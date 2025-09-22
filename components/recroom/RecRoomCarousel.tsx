import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchAndGo } from '../../hooks/useSearchAndGo';
import type { ArchiveItemSummary, MediaType } from '../../types';
import { searchArchive } from '../../services/archiveService';
import { useLanguage } from '../../hooks/useLanguage';
import { RecRoomItemCard } from '../RecRoomItemCard';
import { SkeletonCard } from '../SkeletonCard';
import { ChevronLeftIcon, ChevronRightIcon } from '../Icons';

interface RecRoomCarouselProps {
    title: string;
    query: string;
}

export const RecRoomCarousel: React.FC<RecRoomCarouselProps> = ({ title, query }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [items, setItems] = useState<ArchiveItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();
    const searchAndGo = useSearchAndGo();
    
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkForScrollability = useCallback(() => {
        const el = scrollContainerRef.current;
        if (el) {
            setCanScrollLeft(el.scrollLeft > 5);
            setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
        }
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!isLoading) checkForScrollability();
        el?.addEventListener('scroll', checkForScrollability, { passive: true });
        window.addEventListener('resize', checkForScrollability);
        return () => {
            el?.removeEventListener('scroll', checkForScrollability);
            window.removeEventListener('resize', checkForScrollability);
        };
    }, [items, isLoading, checkForScrollability]);

    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await searchArchive(query, 1, ['-downloads'], undefined, 15);
            setItems(data.response?.docs || []);
        } catch (err) {
            setError(t('common:error'));
        } finally {
            setIsLoading(false);
        }
    }, [query, t]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);
    
    const handleViewAll = () => {
        searchAndGo(query, { mediaType: new Set(['software' as MediaType]) });
    };

    return (
        <section className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <button
                    onClick={handleViewAll}
                    className="text-sm font-semibold text-accent-400 hover:text-accent-300 transition-colors"
                >
                    {t('recRoom:viewAll')} &rarr;
                </button>
            </div>
            <div className="relative group">
                <button
                    onClick={() => handleScroll('left')}
                    disabled={!canScrollLeft || !!error}
                    className="absolute top-1/2 -left-4 z-20 -translate-y-1/2 p-2 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                    aria-label="Scroll left"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div ref={scrollContainerRef} className="flex space-x-6 overflow-x-auto pb-4 scroll-smooth" style={{ scrollSnapType: 'x mandatory' }}>
                    {isLoading ? (
                         Array.from({ length: 6 }).map((_, i) => (
                             <div key={i} className="w-64 sm:w-72 flex-shrink-0"><SkeletonCard aspectRatio="video" /></div>
                         ))
                    ) : error ? (
                        <div className="text-red-400 p-4">{error}</div>
                    ) : (
                        items.map((item, index) => <RecRoomItemCard key={item.identifier} item={item} index={index} />)
                    )}
                </div>
                 <button
                    onClick={() => handleScroll('right')}
                    disabled={!canScrollRight || !!error}
                    className="absolute top-1/2 -right-4 z-20 -translate-y-1/2 p-2 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                    aria-label="Scroll right"
                >
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>
        </section>
    );
};