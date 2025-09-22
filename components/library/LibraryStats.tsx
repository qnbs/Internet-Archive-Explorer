import React from 'react';
import { useAtomValue } from 'jotai';
import { libraryCountsAtom } from '../../store/favorites';
import { useLanguage } from '../../hooks/useLanguage';
import type { LibraryFilter, MediaType } from '../../types';
import { BookIcon, MovieIcon, AudioIcon, ImageIcon, JoystickIcon, CollectionIcon } from '../Icons';

interface LibraryStatsProps {
    setFilter: (filter: LibraryFilter) => void;
}

const StatCard: React.FC<{
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    onClick: () => void;
}> = ({ label, value, icon, color, onClick }) => (
    <button 
        onClick={onClick}
        className="bg-gray-800/60 p-4 rounded-xl text-left hover:bg-gray-700/80 transition-all duration-300 group flex items-start gap-4"
    >
        <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
            <p className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">{label}</p>
        </div>
    </button>
);


export const LibraryStats: React.FC<LibraryStatsProps> = ({ setFilter }) => {
    const { t } = useLanguage();
    const counts = useAtomValue(libraryCountsAtom);

    const stats = [
        { label: t('favorites:sidebar.allItems'), value: counts.total, icon: <CollectionIcon />, color: 'bg-cyan-500', type: 'all' },
        { label: t('uploaderDetail:stats.texts'), value: counts.texts, icon: <BookIcon />, color: 'bg-blue-500', type: 'texts' },
        { label: t('uploaderDetail:stats.movies'), value: counts.movies, icon: <MovieIcon />, color: 'bg-rose-500', type: 'movies' },
        { label: t('uploaderDetail:stats.audio'), value: counts.audio, icon: <AudioIcon />, color: 'bg-emerald-500', type: 'audio' },
        { label: t('uploaderDetail:stats.images'), value: counts.image, icon: <ImageIcon />, color: 'bg-amber-500', type: 'image' },
        { label: t('uploaderDetail:stats.software'), value: counts.software, icon: <JoystickIcon />, color: 'bg-violet-500', type: 'software' },
    ].filter(stat => stat.value > 0 || stat.type === 'all');

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map(stat => (
                <StatCard 
                    key={stat.type}
                    label={stat.label}
                    value={stat.value}
                    icon={stat.icon}
                    color={stat.color}
                    onClick={() => setFilter(stat.type === 'all' ? { type: 'all' } : { type: 'mediaType', mediaType: stat.type as MediaType })}
                />
            ))}
        </div>
    );
};