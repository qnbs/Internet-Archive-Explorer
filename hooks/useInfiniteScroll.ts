
import React, { useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
}

export const useInfiniteScroll = ({
  onLoadMore,
  isLoading,
  hasMore,
  root = null,
  rootMargin = '0px',
  threshold = 0,
}: UseInfiniteScrollOptions) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            onLoadMore();
          }
        },
        { root, rootMargin, threshold }
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore, root, rootMargin, threshold]
  );

  return lastElementRef;
};
