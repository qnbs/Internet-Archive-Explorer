import React from 'react';
import { useUploaderFavorites } from '../contexts/UploaderFavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { Uploader } from '../types';
import { StarIcon, UsersIcon, ExternalLinkIcon } from './Icons';

interface UploaderProfileCardProps {
    uploader: Uploader;
    index: number;
    onSelect: (searchUploader: string) => void;
}

export const UploaderProfileCard: React.FC<UploaderProfileCardProps> = ({ uploader, index, onSelect }) => {
    const { t } = useLanguage();
    const { isUploaderFavorite, addUploaderFavorite, removeUploaderFavorite } = useUploaderFavorites();
    const isFavorite = isUploaderFavorite(uploader.searchUploader);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFavorite) {
            removeUploaderFavorite(uploader.searchUploader);
        } else {
            addUploaderFavorite(uploader.searchUploader);
        }
    };
    
    const uploaderUrl = `https://archive.org/details/@${uploader.searchUploader.split('@')[0]}`;
    
    const descriptionKey = uploader.descriptionKey || 'uploaderProfileCard:genericDescription';

    return (
        <div 
            onClick={() => onSelect(uploader.searchUploader)}
            className="bg-gray-800/60 p-6 rounded-xl border border-gray-700/50 flex flex-col h-full animate-fade-in cursor-pointer hover:bg-gray-700/70 transition-colors"
            style={{ animationDelay: `${Math.min(index * 50, 500)}ms`, opacity: 0 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(uploader.searchUploader)}
        >
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 bg-gray-700 p-3 rounded-full">
                    <UsersIcon className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">{uploader.username}</h2>
                    <span className="text-xs font-semibold bg-gray-700 text-cyan-300 px-2 py-0.5 rounded-full">{t(`uploaderHub:categories.${uploader.category}`)}</span>
                </div>
            </div>
            <p className="text-sm text-gray-400 mt-4 flex-grow">{t(descriptionKey)}</p>
            
            <div className="mt-6 space-y-3">
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
                    onClick={(e) => e.stopPropagation()}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 text-white"
                >
                    <span>{t('uploaderProfileCard:viewOnArchive')}</span>
                    <ExternalLinkIcon className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
};