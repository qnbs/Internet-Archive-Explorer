import React from 'react';
import type { Profile } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useAtomValue, useSetAtom } from 'jotai';
import { uploaderFavoriteSetAtom, addUploaderFavoriteAtom, removeUploaderFavoriteAtom } from '../store';
import { useToast } from '../contexts/ToastContext';
import { StarIcon, UsersIcon } from './Icons';

interface UploaderProfileCardProps {
    profile: Profile;
    onSelect: (profile: Profile) => void;
    index: number;
}

export const UploaderProfileCard: React.FC<UploaderProfileCardProps> = ({ profile, onSelect, index }) => {
    const { t } = useLanguage();
    const { addToast } = useToast();
    const favoriteUploaderSet = useAtomValue(uploaderFavoriteSetAtom);
    const addUploaderFavorite = useSetAtom(addUploaderFavoriteAtom);
    const removeUploaderFavorite = useSetAtom(removeUploaderFavoriteAtom);

    const isFavorite = favoriteUploaderSet.has(profile.searchIdentifier);
    
    const descriptionKey = profile.curatedData?.descriptionKey 
        || profile.curatedData?.customDescriptionKey 
        || (profile.type === 'creator' ? 'uploaderProfileCard:genericCreatorDescription' : 'uploaderProfileCard:genericDescription');
    
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
            className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md hover:shadow-lg dark:hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group animate-fade-in relative border border-gray-200 dark:border-transparent"
            style={{ animationDelay: `${Math.min(index % 24 * 30, 500)}ms`, opacity: 0 }}
            onClick={() => onSelect(profile)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(profile)}
            aria-label={`View profile for ${profile.name}`}
        >
            <button
                onClick={handleFavoriteClick}
                className="absolute top-3 right-3 z-10 p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                aria-label={isFavorite ? t('uploaderProfileCard:unfavorite') : t('uploaderProfileCard:favorite')}
            >
                <StarIcon className="w-5 h-5" filled={isFavorite} />
            </button>
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                    <UsersIcon className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors pr-8">
                        {profile.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2" title={t(descriptionKey)}>
                        {t(descriptionKey)}
                    </p>
                    <span className="mt-3 inline-block text-xs capitalize bg-gray-100 dark:bg-gray-700/80 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded-full font-semibold">
                        {t(`uploaderHub:categories.${category}`)}
                    </span>
                </div>
            </div>
        </article>
    );
};