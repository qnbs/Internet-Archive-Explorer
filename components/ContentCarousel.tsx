import React, { useRef, useState, useEffect } from 'react';
import type { ArchiveItemSummary } from '../types';
import { CarouselItemCard, AspectRatio } from './CarouselItemCard';
import { SkeletonCard } from './SkeletonCard';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface ContentCarouselProps {
    title: string;
    items: ArchiveItemSummary[];
    isLoading: boolean;
    onSelectItem: (item: ArchiveItemSummary) => void;
    cardAspectRatio: AspectRatio;
    viewMoreAction?: () => void;
    viewMoreLabel?: string;
    titleIcon?: React.ReactNode;
}

export const ContentCarousel: React.FC<ContentCarouselProps> = ({
    title,
    items,
    isLoading,
    onSelectItem,
    cardAspectRatio,
    viewMoreAction,
    viewMoreLabel,
    titleIcon
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkForScrollability = () => {
        const el = scrollContainerRef.current;
        if (el) {
            setCanScrollLeft(el.scrollLeft > 5); // Add a small buffer
            setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5); // Add a small buffer
        }
    };

    useEffect(() => {
        // A small timeout allows the browser to render and calculate widths properly
        const timer = setTimeout(checkForScrollability, 100);
        const el = scrollContainerRef.current;
        el?.addEventListener('scroll', checkForScrollability, { passive: true });
        window.addEventListener('resize', checkForScrollability);
        return () => {
            clearTimeout(timer);
            el?.removeEventListener('scroll', checkForScrollability);
            window.removeEventListener('resize', checkForScrollability);
        };
    }, [items, isLoading]);

    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <section className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    {titleIcon && <span className="mr-3 text-cyan-600 dark:text-cyan-400">{titleIcon}</span>}
                    {title}
                </h2>
                {viewMoreAction && (
                    <button
                        onClick={viewMoreAction}
                        className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors"
                    >
                        {viewMoreLabel || 'View More'} &rarr;
                    </button>
                )}
            </div>
            <div className="relative group">
                <button
                    onClick={() => handleScroll('left')}
                    disabled={!canScrollLeft}
                    className="absolute top-1/2 -left-4 z-20 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed"
                    aria-label="Scroll left"
                >
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-white" />
                </button>
                
                <div 
                    ref={scrollContainerRef}
                    className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="flex-shrink-0 w-40 sm:w-48 scroll-snap-align-start">
                                <SkeletonCard aspectRatio={cardAspectRatio} />
                            </div>
                        ))
                    ) : (
                        items.map((item, index) => (
                            <CarouselItemCard
                                key={item.identifier}
                                item={item}
                                onSelect={onSelectItem}
                                aspectRatio={cardAspectRatio}
                                index={index}
                            />
                        ))
                    )}
                </div>

                <div 
                    aria-hidden="true"
                    className={`absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-gray-100 dark:from-gray-900 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} 
                />

                <button
                    onClick={() => handleScroll('right')}
                    disabled={!canScrollRight}
                    className="absolute top-1/2 -right-4 z-20 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed"
                    aria-label="Scroll right"
                >
                    <ChevronRightIcon className="w-6 h-6 text-gray-800 dark:text-white" />
                </button>
            </div>
        </section>
    );
};