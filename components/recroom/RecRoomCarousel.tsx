import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/Icons';
import { CacheAgeIndicator } from '@/components/ui/CacheAgeIndicator';
import { useArchivalItems } from '@/hooks/useArchivalItems';
import { useLanguage } from '@/hooks/useLanguage';
import { useSearchAndGo } from '@/hooks/useSearchAndGo';
import type { MediaType } from '@/types';
import { RecRoomItemCard } from '../RecRoomItemCard';
import { SkeletonCard } from '../SkeletonCard';

interface RecRoomCarouselProps {
  title: string;
  query: string;
  limit?: number;
}

export const RecRoomCarousel: React.FC<RecRoomCarouselProps> = ({ title, query, limit = 15 }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { items, isLoading, error, refetch, offlineCachedAt } = useArchivalItems(query, limit);
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
  }, [isLoading, checkForScrollability]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleViewAll = () => {
    searchAndGo(query, { mediaType: new Set(['software' as MediaType]) });
  };

  return (
    <section className="animate-fade-in">
      <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <div className="flex items-center gap-3 shrink-0">
          {offlineCachedAt ? <CacheAgeIndicator cacheTimeMs={offlineCachedAt} /> : null}
          <button
            type="button"
            onClick={handleViewAll}
            className="touch-target-min inline-flex items-center justify-center text-sm font-semibold text-cyan-800 dark:text-accent-400 hover:text-cyan-900 dark:hover:text-accent-300 transition-colors"
          >
            {t('recRoom:viewAll')} &rarr;
          </button>
        </div>
      </div>
      <div className="relative group">
        <button
          type="button"
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft || !!error}
          className="absolute top-1/2 -left-4 z-20 -translate-y-1/2 p-2 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-64 sm:w-72 flex-shrink-0">
                <SkeletonCard aspectRatio="video" />
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
              <RecRoomItemCard key={item.identifier} item={item} index={index} />
            ))
          )}
        </div>
        <button
          type="button"
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
