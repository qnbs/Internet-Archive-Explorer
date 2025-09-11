import React from 'react';
import { useSearchAndGo } from '../../hooks/useSearchAndGo';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../../hooks/useLanguage';
import { MediaType } from '../../types';
import { MusicNoteIcon, BookIcon, RadioIcon, PodcastIcon } from '../Icons';

export const CategoryGrid: React.FC = () => {
    const searchAndGo = useSearchAndGo();
    const { t } = useLanguage();

    const categories = [
        { name: t('audiothek:categories.music'), query: 'collection:etree', icon: <MusicNoteIcon className="w-8 h-8"/> },
        { name: t('audiothek:categories.audiobooks'), query: 'collection:librivoxaudio', icon: <BookIcon className="w-8 h-8"/> },
        { name: t('audiothek:categories.radio'), query: 'collection:oldtimeradio', icon: <RadioIcon className="w-8 h-8"/> },
        { name: t('audiothek:categories.podcasts'), query: 'collection:podcasts', icon: <PodcastIcon className="w-8 h-8"/> },
    ];

    const handleSearch = (query: string) => {
        searchAndGo(query, { mediaType: new Set([MediaType.Audio]) });
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map(cat => (
                <button 
                    key={cat.name} 
                    onClick={() => handleSearch(cat.query)}
                    className="bg-gray-800/60 p-6 rounded-xl text-center hover:bg-gray-700/80 hover:-translate-y-1 transition-all duration-300 group"
                >
                    <div className="text-cyan-400 mx-auto w-12 h-12 flex items-center justify-center bg-gray-900/50 rounded-full group-hover:bg-cyan-500/20 transition-colors">
                        {cat.icon}
                    </div>
                    <p className="mt-4 font-semibold text-white">{cat.name}</p>
                </button>
            ))}
        </div>
    );
};