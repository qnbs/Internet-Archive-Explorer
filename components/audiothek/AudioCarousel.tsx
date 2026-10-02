import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/Icons';
import { CacheAgeIndicator } from '@/components/ui/CacheAgeIndicator';
import { useArchivalItems } from '@/hooks/useArchivalItems';
import { useLanguage } from '@/hooks/useLanguage';
import { SkeletonCard } from '../SkeletonCard';
import { AudioCard } from './AudioCard';

interface AudioCarouselProps {
  title: string;
  query: string;
  limit?: number;
}

export const AudioCarousel: React.FC<AudioCarouselProps> = ({ title, query, limit = 15 }) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const { items, isLoading, error, refetch, offlineCachedAt } = useArchivalItems(query, limit);
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
    checkForScrollability();
    el?.addEventListener('scroll', checkForScrollability, { passive: true });
    window.addEventListener('resize', checkForScrollability);
    return () => {
      el?.removeEventListener('scroll', checkForScrollability);
      window.removeEventListener('resize', checkForScrollability);
    };
  }, [checkForScrollability]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {offlineCachedAt ? <CacheAgeIndicator cacheTimeMs={offlineCachedAt} /> : null}
      </div>
      <div className="relative group">
        <button
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft || !!error}
          className="absolute top-1/2 -left-4 z-20 -translate-y-1/2 p-2 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
          aria-label="Scroll left"
          type="button"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-48 flex-shrink-0">
                <SkeletonCard aspectRatio="square" />
              </div>
            ))
          ) : error ? (
            <div className="text-red-400 p-4 space-y-2">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => {
                  void refetch();
                }}
                className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 hover:underline"
              >
                {t('common:retry')}
              </button>
            </div>
          ) : (
            items.map((item, index) => (
              <AudioCard key={item.identifier} item={item} index={index} />
            ))
          )}
        </div>
        <button
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight || !!error}
          className="absolute top-1/2 -right-4 z-20 -translate-y-1/2 p-2 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
          aria-label="Scroll right"
          type="button"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
};
