import React from 'react';
import type { ArchiveItemSummary } from '../../types';
import { Spinner } from '../Spinner';
import { useLanguage } from '../../contexts/LanguageContext';
import { MusicNoteIcon } from '../Icons';

interface AudiothekHeroProps {
    item: ArchiveItemSummary | null;
    isLoading: boolean;
    onSearch: (query: string) => void;
}

export const AudiothekHero: React.FC<AudiothekHeroProps> = ({ item, isLoading, onSearch }) => {
    const { t } = useLanguage();
    const thumbnailUrl = item ? `https://archive.org/services/get-item-image.php?identifier=${item.identifier}` : 'https://picsum.photos/1280/720?grayscale&blur=2';

    return (
        <div className="relative aspect-video sm:aspect-[2.4/1] w-full rounded-xl overflow-hidden shadow-2xl shadow-black/30 bg-gray-800">
             {isLoading ? (
                <div className="w-full h-full flex items-center justify-center"><Spinner size="lg" /></div>
            ) : (
                <img 
                    src={thumbnailUrl} 
                    alt="Featured audio collection" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 sm:p-10 text-white">
                <div className="max-w-3xl">
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>{t('audiothek.title')}</h1>
                    <p className="text-lg sm:text-xl font-medium text-gray-300 mt-4 max-w-2xl mx-auto">
                        {t('audiothek.description')}
                    </p>
                    <button 
                        onClick={() => onSearch('collection:etree')}
                        className="mt-8 inline-flex items-center space-x-3 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 transition-colors font-bold rounded-lg shadow-lg"
                    >
                       <MusicNoteIcon className="w-6 h-6" />
                       <span>{t('audiothek.heroButton')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};