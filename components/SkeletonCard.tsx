import React from 'react';

type AspectRatio = 'video' | 'square' | 'portrait';

interface SkeletonCardProps {
    aspectRatio?: AspectRatio;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ aspectRatio = 'portrait' }) => {
  const aspectClasses = {
    portrait: 'aspect-[3/4]',
    video: 'aspect-video',
    square: 'aspect-square',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden animate-pulse shadow-md border border-gray-200 dark:border-transparent">
      <div className={`bg-gray-200 dark:bg-gray-700 ${aspectClasses[aspectRatio]}`}></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="flex justify-between items-center pt-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
        </div>
      </div>
    </div>
  );
};