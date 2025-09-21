import React from 'react';
import { useSearchAndGo } from '../../hooks/useSearchAndGo';
import { useLanguage } from '../../hooks/useLanguage';
import { MusicNoteIcon } from '../Icons';
import { MediaType } from '../../types';

export const AudiothekHero: React.FC = () => {
    const searchAndGo = useSearchAndGo();
    const { t } = useLanguage();
    
    const handleExplore = () => {
        searchAndGo('collection:etree', { mediaType: new Set([MediaType.Audio]) });
    };

    return (
        <div className="relative rounded-xl overflow-hidden bg-gray-800 p-8 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 opacity-50"></div>
            <MusicNoteIcon className="absolute -left-8 -top-8 w-48 h-48 text-cyan-400/10" />
            <MusicNoteIcon className="absolute -right-12 -bottom-16 w-64 h-64 text-blue-400/10 transform rotate-12" />
            <div className="relative z-10">
                <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">{t('audiothek:title')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">{t('audiothek:description')}</p>
                <button 
                    onClick={handleExplore}
                    className="mt-6 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-full shadow-lg transition-transform hover:scale-105"
                >
                    {t('audiothek:heroButton')}
                </button>
            </div>
        </div>
    );
};
