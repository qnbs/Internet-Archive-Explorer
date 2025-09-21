import React, { useState, useEffect, useCallback } from 'react';
import type { ArchiveItemSummary } from '../../types';
import { searchArchive } from '../../services/archiveService';
import { useLanguage } from '../../hooks/useLanguage';
import { AudioCard } from './AudioCard';
import { SkeletonCard } from '../SkeletonCard';
import { ChevronLeftIcon, ChevronRightIcon } from '../Icons';

interface AudioCarouselProps {
    title: string;
    query: string;
    onSelectItem: (item: ArchiveItemSummary) => void;
}

export const AudioCarousel: React.FC<AudioCarouselProps> = ({ title, query, onSelectItem }) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [items, setItems] = useState<ArchiveItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();
    
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkForScrollability = useCallback(() => {
        const el = scrollContainerRef.current;
        if (el) {
            setCanScrollLeft(el.scrollLeft > 5);
            setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
        }
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        checkForScrollability(); // Check on mount and when items change
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
    
    return (
        <section className="animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
            <div className="relative group">
                <button
                    onClick={() => handleScroll('left')}
                    disabled={!canScrollLeft || !!error}
                    className="absolute top-1/2 -left-4 z-20 -translate-y-1/2 p-2 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                    aria-label="Scroll left"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div ref={scrollContainerRef} className="flex space-x-4 overflow-x-auto pb-4 scroll-smooth" style={{ scrollSnapType: 'x mandatory' }}>
                    {isLoading ? (
                         Array.from({ length: 8 }).map((_, i) => (
                             <div key={i} className="w-48 flex-shrink-0"><SkeletonCard aspectRatio="square" /></div>
                         ))
                    ) : error ? (
                        <div className="text-red-400 p-4">{error}</div>
                    ) : (
                        items.map((item, index) => <AudioCard key={item.identifier} item={item} onSelectDetails={onSelectItem} index={index} />)
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