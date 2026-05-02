import { useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/hooks/useLanguage';
import {
  addUploaderFavoriteAtom,
  removeUploaderFavoriteAtom,
  uploaderFavoriteSetAtom,
} from '@/store/favorites';
import type { Profile } from '@/types';
import { StarIcon, UsersIcon } from './Icons';

interface UploaderProfileCardProps {
  profile: Profile;
  onSelect: (profile: Profile) => void;
  index: number;
}

export const UploaderProfileCard: React.FC<UploaderProfileCardProps> = React.memo(
  ({ profile, onSelect, index }) => {
    const { t } = useLanguage();
    const { addToast } = useToast();
    const favoriteUploaderSet = useAtomValue(uploaderFavoriteSetAtom);
    const addUploaderFavorite = useSetAtom(addUploaderFavoriteAtom);
    const removeUploaderFavorite = useSetAtom(removeUploaderFavoriteAtom);

    const isFavorite = favoriteUploaderSet.has(profile.searchIdentifier);

    const descriptionKey =
      profile.curatedData?.descriptionKey ||
      (profile.type === 'creator'
        ? 'uploaderProfileCard:genericCreatorDescription'
        : 'uploaderProfileCard:genericDescription');

    const category = profile.curatedData?.category || 'community';

    const handleFavoriteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isFavorite) {
        removeUploaderFavorite(profile.searchIdentifier);
        addToast(t('favorites:uploaderRemoved'), 'info');
      } else {
        addUploaderFavorite(profile.searchIdentifier);
        addToast(t('favorites:uploaderAdded'), 'success');
      }
    };

    return (
      <article
        className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md hover:shadow-lg dark:hover:shadow-accent-500/20 transition-all duration-300 transform hover:-translate-y-1 group animate-fade-in relative border border-gray-200 dark:border-transparent"
        style={{ animationDelay: `${Math.min((index % 24) * 30, 500)}ms`, opacity: 0 }}
      >
        <div className="flex gap-2 items-stretch">
          <button
            type="button"
            className="flex min-h-[44px] min-w-0 flex-1 cursor-pointer rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800 ia-focus-visible-enhanced"
            onClick={() => onSelect(profile)}
            aria-label={t('uploaderProfileCard:viewProfile', { name: profile.name })}
          >
            <div className="flex w-full items-start space-x-4">
              <div className="flex-shrink-0 rounded-full bg-gray-100 p-3 dark:bg-gray-700">
                <UsersIcon className="h-8 w-8 text-accent-600 dark:text-accent-400" aria-hidden />
              </div>
              <div className="min-w-0 flex-grow">
                <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-accent-600 dark:text-white dark:group-hover:text-accent-400">
                  {profile.name}
                </h3>
                <p
                  className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400"
                  title={t(descriptionKey)}
                >
                  {t(descriptionKey)}
                </p>
                <span className="mt-3 inline-block rounded-full bg-gray-200 px-2 py-1 text-xs font-semibold capitalize text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                  {t(`uploaderHub:categories.${category}`)}
                </span>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="touch-target-min inline-flex shrink-0 items-center justify-center self-start rounded-full p-2 text-gray-600 transition-colors hover:text-yellow-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:text-gray-400 ia-focus-visible-enhanced"
            aria-label={
              isFavorite ? t('uploaderProfileCard:unfavorite') : t('uploaderProfileCard:favorite')
            }
          >
            <StarIcon className="h-5 w-5" filled={isFavorite} aria-hidden />
          </button>
        </div>
      </article>
    );
  },
);
