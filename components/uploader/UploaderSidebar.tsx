import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { uploaderFavoriteSetAtom, addUploaderFavoriteAtom, removeUploaderFavoriteAtom } from '../../store/favorites';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../hooks/useLanguage';
import type { Profile, UploaderStats } from '../../types';
import { getProfileApiQuery } from '../../utils/profileUtils';
import { DonutChart } from '../DonutChart';
import { StarIcon, ExternalLinkIcon, ArrowLeftIcon } from '../Icons';

interface UploaderSidebarProps {
    profile: Profile;
    stats: UploaderStats | null;
    isLoadingStats: boolean;
    onBack?: () => void;
    onDisconnect?: () => void;
}

const StatDisplay: React.FC<{ label: string, value: number, isLoading: boolean }> = ({ label, value, isLoading }) => (
    <div className="flex justify-between items-baseline">
        <span className="text-sm text-gray-400">{label}</span>
        {isLoading ? (
            <div className="h-4 w-10 bg-gray-700 rounded animate-pulse"></div>
        ) : (
            <span className="font-semibold text-white">{value.toLocaleString()}</span>
        )}
    </div>
);


export const UploaderSidebar: React.FC<UploaderSidebarProps> = ({ profile, stats, isLoadingStats, onBack, onDisconnect }) => {
    const { t } = useLanguage();
    const { addToast } = useToast();
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
    
    const getUploaderUrl = () => {
        const isStandardProfile = !profile.curatedData?.searchField || ['uploader', 'creator'].includes(profile.curatedData.searchField);
        if (isStandardProfile) {
            const usernameForUrl = profile.searchIdentifier.split('@')[0];
            return `https://archive.org/details/@${encodeURIComponent(usernameForUrl)}`;
        }
        // For non-standard profiles (e.g., scanner), link to a search query instead.
        const query = getProfileApiQuery(profile);
        return `https://archive.org/search?query=${encodeURIComponent(query)}`;
    };
    const uploaderUrl = getUploaderUrl();
    
    const descriptionKey = profile.curatedData?.descriptionKey 
        || profile.curatedData?.customDescriptionKey 
        || (profile.type === 'creator' ? 'uploaderProfileCard:genericCreatorDescription' : 'uploaderProfileCard:genericDescription');
        
    const chartData = stats ? [
        { label: t('uploaderDetail:stats.movies'), value: stats.movies, color: '#34d399' },
        { label: t('uploaderDetail:stats.audio'), value: stats.audio, color: '#fbbf24' },
        { label: t('uploaderDetail:stats.texts'), value: stats.texts, color: '#60a5fa' },
        { label: t('uploaderDetail:stats.images'), value: stats.image, color: '#f87171' },
        { label: t('uploaderDetail:stats.software'), value: stats.software, color: '#c084fc' },
    ].filter(d => d.value > 0) : [];

    const handleBackOrDisconnect = onDisconnect || onBack;
    const backOrDisconnectLabel = onDisconnect ? t('myArchive:dashboard.disconnect') : t('uploaderDetail:back');

    return (
        <div className="bg-white dark:bg-gray-800/60 p-5 rounded-xl border border-gray-200 dark:border-gray-700/50 space-y-4 sticky top-20">
            {handleBackOrDisconnect && (
                <button onClick={handleBackOrDisconnect} className="flex items-center space-x-2 text-sm text-cyan-600 dark:text-cyan-400 hover:underline mb-2">
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>{backOrDisconnectLabel}</span>
                </button>
            )}
            <div className="flex items-start gap-4">
                <div className="flex-grow">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                </div>
                <div className="flex items-center flex-shrink-0">
                    {profile.type === 'uploader' && (
                        <button onClick={handleFavoriteClick} className="p-2 text-gray-400 hover:text-yellow-400 transition-colors rounded-full" aria-label={isFavorite ? "Unfollow" : "Follow"}>
                            <StarIcon filled={isFavorite} className="w-6 h-6" />
                        </button>
                    )}
                    <a href={uploaderUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-full" aria-label="View on Archive.org">
                        <ExternalLinkIcon className="w-6 h-6" />
                    </a>
                </div>
            </div>
            
             <p className="text-sm text-gray-600 dark:text-gray-400">{t(descriptionKey)}</p>

             <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('uploaderDetail:stats.distribution')}</h3>
                {isLoadingStats ? (
                    <div className="h-40 bg-gray-700 rounded-lg animate-pulse"></div>
                ) : (
                    <DonutChart data={chartData} />
                )}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                 <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('myArchive:dashboard.statsTitle')}</h3>
                 <StatDisplay label={t('uploaderDetail:stats.uploads')} value={stats?.total || 0} isLoading={isLoadingStats} />
                 <StatDisplay label={t('uploaderDetail:stats.collections')} value={stats?.collections || 0} isLoading={isLoadingStats} />
                 <StatDisplay label={t('uploaderDetail:stats.favorites')} value={stats?.favorites || 0} isLoading={isLoadingStats} />
                 <StatDisplay label={t('uploaderDetail:stats.reviews')} value={stats?.reviews || 0} isLoading={isLoadingStats} />
            </div>

        </div>
    );
};