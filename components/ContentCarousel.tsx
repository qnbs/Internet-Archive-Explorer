import React, { useRef, useState, useEffect, useId } from 'react';
import type { ArchiveItemSummary } from '../types';
import { CarouselItemCard, AspectRatio } from './CarouselItemCard';
import { SkeletonCard } from './SkeletonCard';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { useLanguage } from '../hooks/useLanguage';

interface ContentCarouselProps {
    title: string;
    items: ArchiveItemSummary[];
    isLoading: boolean;
    error: string | null;
    onRetry?: () => void;
    cardAspectRatio: AspectRatio;
    viewMoreAction?: () => void;
    viewMoreLabel?: string;
    titleIcon?: React.ReactNode;
    hideTitle?: boolean;
}

export const ContentCarousel: React.FC<ContentCarouselProps> = ({
    title,
    items,
    isLoading,
    error,
    onRetry,
    cardAspectRatio,
    viewMoreAction,
    viewMoreLabel,
    titleIcon,
    hideTitle = false
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const { t } = useLanguage();
    const containerId = useId();

    const checkForScrollability = () => {
        const el = scrollContainerRef.current;
        if (el) {
            setCanScrollLeft(el.scrollLeft > 5); // Add a small buffer
            setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5); // Add a small buffer
        }
    };

    useEffect(() => {
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
    
    const renderContent = () => {
        if (isLoading) {
             return Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-40 sm:w-48 scroll-snap-align-start">
                    <SkeletonCard aspectRatio={cardAspectRatio} />
                </div>
            ))
        }
        
        if (error) {
            return (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg w-full">
                    <p className="text-red-400 mb-4">{error}</p>
                     {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-4 py-2 bg-accent-600 text-white font-semibold rounded-lg hover:bg-accent-500 transition-colors"
                        >
                            {t('common:retry')}
                        </button>
                    )}
                </div>
            )
        }

        return items.map((item, index) => (
            <CarouselItemCard
                key={item.identifier}
                item={item}
                aspectRatio={cardAspectRatio}
                index={index}
            />
        ));
    };

    return (
        <section
            className={hideTitle ? '' : 'animate-fade-in'}
            role="region"
            aria-roledescription="carousel"
            aria-label={title}
        >
            {!hideTitle && (
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        {titleIcon && <span className="mr-3 text-accent-600 dark:text-accent-400">{titleIcon}</span>}
                        {title}
                    </h2>
                    {viewMoreAction && (
                        <button
                            onClick={viewMoreAction}
                            className="text-sm font-semibold text-accent-600 dark:text-accent-400 hover:text-accent-500 dark:hover:text-accent-300 transition-colors"
                        >
                            {viewMoreLabel || t('common:viewMore')} &rarr;
                        </button>
                    )}
                </div>
            )}
            <div className="relative group">
                <button
                    onClick={() => handleScroll('left')}
                    disabled={!canScrollLeft || !!error}
                    className="absolute top-1/2 -left-4 z-20 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed"
                    aria-label="Scroll left"
                    aria-controls={containerId}
                >
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-white" />
                </button>
                
                <div
                    id={containerId}
                    ref={scrollContainerRef}
                    className="flex space-x-4 overflow-x-auto pb-4 scroll-smooth"
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    {renderContent()}
                </div>

                <div 
                    aria-hidden="true"
                    className={`absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-gray-100 dark:from-gray-900 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${canScrollRight && !error ? 'opacity-100' : 'opacity-0'}`} 
                />

                <button
                    onClick={() => handleScroll('right')}
                    disabled={!canScrollRight || !!error}
                    className="absolute top-1/2 -right-4 z-20 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed"
                    aria-label="Scroll right"
                    aria-controls={containerId}
                >
                    <ChevronRightIcon className="w-6 h-6 text-gray-800 dark:text-white" />
                </button>
            </div>
        </section>
    );
};