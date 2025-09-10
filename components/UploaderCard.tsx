import React, { useState, useEffect, useRef } from 'react';
import { useUploaderFavorites } from '../contexts/UploaderFavoritesContext';
import { StarIcon, MovieIcon, AudioIcon, BookIcon, ImageIcon, JoystickIcon } from './Icons';
import type { UploaderStats, Uploader } from '../types';
import { useUploaderStats } from '../hooks/useUploaderStats';
import { useLanguage } from '../contexts/LanguageContext';

interface UploaderCardProps {
    uploader: Uploader;
    onClick: () => void;
    index: number;
}

const UsersIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1H9" /></svg>;

const StatsSkeleton: React.FC = () => (
    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 animate-pulse">
        <div className="h-4 w-12 bg-gray-700 rounded-full"></div>
        <div className="h-4 w-10 bg-gray-700 rounded-full"></div>
        <div className="h-4 w-14 bg-gray-700 rounded-full"></div>
    </div>
);

const StatsDisplay: React.FC<{ stats: UploaderStats | null }> = ({ stats }) => {
    const { t } = useLanguage();
    if (!stats) return null;

    const statItems = [
        { icon: <MovieIcon className="w-4 h-4 text-red-400" />, count: stats.movies, label: t('uploaderDetail.stats.movies') },
        { icon: <AudioIcon className="w-4 h-4 text-blue-400" />, count: stats.audio, label: t('uploaderDetail.stats.audio') },
        { icon: <BookIcon className="w-4 h-4 text-green-400" />, count: stats.texts, label: t('uploaderDetail.stats.texts') },
        { icon: <ImageIcon className="w-4 h-4 text-purple-400" />, count: stats.image, label: t('uploaderDetail.stats.images') },
        { icon: <JoystickIcon className="w-4 h-4 text-yellow-400" />, count: stats.software, label: t('uploaderDetail.stats.software') },
    ].filter(item => item.count > 0).sort((a,b) => b.count - a.count);

    if (statItems.length === 0) return (
        <div className="mt-4 text-xs text-gray-500">{t('uploaderCard.noPublicUploads')}</div>
    );

    return (
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-gray-400">
            {statItems.slice(0, 5).map(item => (
                <div key={item.label} className="flex items-center space-x-1.5" title={`${item.count.toLocaleString()} ${item.label}`}>
                    {item.icon}
                    <span className="font-medium text-gray-300">{item.count.toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
};


export const UploaderCard: React.FC<UploaderCardProps> = ({ uploader, onClick, index }) => {
    const { username, descriptionKey, category, searchUploader } = uploader;
    const { isUploaderFavorite, addUploaderFavorite, removeUploaderFavorite } = useUploaderFavorites();
    const { t } = useLanguage();
    
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    
    const { stats, isLoading } = useUploaderStats(searchUploader, isVisible);
    const favoriteStatus = isUploaderFavorite(searchUploader);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        const currentRef = cardRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.disconnect();
            }
        };
    }, []);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (favoriteStatus) {
            removeUploaderFavorite(searchUploader);
        } else {
            addUploaderFavorite(searchUploader);
        }
    };

    return (
        <article
            ref={cardRef}
            onClick={onClick}
            className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col animate-fade-in border border-transparent hover:border-cyan-500/50 relative"
            style={{ animationDelay: `${Math.min(index * 50, 500)}ms`, opacity: 0 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
            aria-label={`View uploads from ${username}`}
        >
            <button 
                onClick={handleFavoriteClick}
                className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-full text-white hover:text-yellow-400 transition-colors"
                aria-label={favoriteStatus ? t('itemCard.removeFavorite') : t('itemCard.addFavorite')}
            >
                <StarIcon className="w-5 h-5" filled={favoriteStatus} />
            </button>

            <div className="flex-grow">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0 bg-gray-700 p-3 rounded-full group-hover:bg-cyan-500/20 transition-colors">
                        <UsersIcon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                         <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors truncate" title={username}>{username}</h3>
                         <span className="text-xs font-semibold bg-gray-700 text-cyan-300 px-2 py-0.5 rounded-full">{t(`uploaderHub.categories.${category}`)}</span>
                    </div>
                </div>
                <p className="text-sm text-gray-400 line-clamp-3">{t(descriptionKey)}</p>
                 <div className="mt-4">
                    {isLoading ? <StatsSkeleton /> : <StatsDisplay stats={stats} />}
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50 text-sm font-semibold text-cyan-400 text-left w-full">
                {t('uploaderCard.viewUploads')} &rarr;
            </div>
        </article>
    );
};