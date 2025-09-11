import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { uploaderFavoriteSetAtom, addUploaderFavoriteAtom, removeUploaderFavoriteAtom } from '../../store';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../hooks/useLanguage';
import type { Profile } from '../../types';
import { useUploaderStats } from '../../hooks/useUploaderStats';
import { StarIcon, UsersIcon, ExternalLinkIcon } from '../Icons';
import { getProfileApiQuery } from '../../utils/profileUtils';

const Stat: React.FC<{ value?: number; label: string; isLoading: boolean }> = ({ value, label, isLoading }) => (
    <div className="text-center">
        {isLoading ? (
            <div className="h-6 w-16 mx-auto bg-gray-700 rounded-md animate-pulse"></div>
        ) : (
            <p className="text-xl font-bold text-white">{(value ?? 0).toLocaleString()}</p>
        )}
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
);

export const UploaderSidebar: React.FC<{ profile: Profile }> = ({ profile }) => {
    const { t } = useLanguage();
    const { addToast } = useToast();
    const { stats, isLoading: isLoadingStats } = useUploaderStats(profile);
    
    const favoriteUploaderSet = useAtomValue(uploaderFavoriteSetAtom);
    const addUploaderFavorite = useSetAtom(addUploaderFavoriteAtom);
    const removeUploaderFavorite = useSetAtom(removeUploaderFavoriteAtom);
    
    const isFavorite = favoriteUploaderSet.has(profile.searchIdentifier);
    
    const handleFavoriteClick = () => {
        if (isFavorite) {
            removeUploaderFavorite(profile.searchIdentifier);
            addToast(t('favorites:uploaderRemoved'), 'info');
        } else {
            addUploaderFavorite(profile.searchIdentifier);
            addToast(t('favorites:uploaderAdded'), 'success');
        }
    };
    
    const uploaderUrl = `https://archive.org/search?query=${encodeURIComponent(getProfileApiQuery(profile))}`;

    const descriptionKey = profile.curatedData?.customDescriptionKey 
        || (profile.type === 'uploader' ? 'uploaderProfileCard:genericDescription' : 'uploaderProfileCard:genericCreatorDescription');
    
    return (
        <div className="bg-gray-800/60 p-6 rounded-xl border border-gray-700/50 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-shrink-0 bg-gray-700 p-4 rounded-full">
                <UsersIcon className="w-12 h-12 text-cyan-400" />
            </div>
            <div className="flex-grow text-center md:text-left">
                <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                <p className="text-sm text-gray-400 mt-1">{t(descriptionKey)}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                    <Stat value={stats?.total} label={t('uploaderDetail:stats.total')} isLoading={isLoadingStats} />
                    <Stat value={stats?.movies} label={t('uploaderDetail:stats.movies')} isLoading={isLoadingStats} />
                    <Stat value={stats?.audio} label={t('uploaderDetail:stats.audio')} isLoading={isLoadingStats} />
                    <Stat value={stats?.texts} label={t('uploaderDetail:stats.texts')} isLoading={isLoadingStats} />
                </div>
            </div>
            {profile.type === 'uploader' && (
                <div className="flex flex-col gap-3 w-full md:w-auto flex-shrink-0">
                    <button 
                        onClick={handleFavoriteClick} 
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 text-white"
                    >
                        <StarIcon filled={isFavorite} className="w-5 h-5" />
                        <span>{isFavorite ? t('uploaderProfileCard:unfavorite') : t('uploaderProfileCard:favorite')}</span>
                    </button>
                    <a 
                        href={uploaderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 text-white"
                    >
                        <span>{t('uploaderProfileCard:viewOnArchive')}</span>
                        <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                </div>
            )}
        </div>
    );
};
