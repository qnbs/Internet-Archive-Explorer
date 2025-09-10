import React from 'react';
import type { Uploader, UploaderStats } from '../../types';
import { useUploaderStats } from '../../hooks/useUploaderStats';
import { Spinner } from '../Spinner';
import { TotalUploadsIcon, MovieIcon, AudioIcon, BookIcon, ImageIcon, JoystickIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';

interface UploaderStatsTabProps {
    uploader: Uploader;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; isLoading: boolean }> = ({ icon, label, value, isLoading }) => (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 text-center">
        <div className="text-cyan-400 w-10 h-10 mx-auto mb-3 flex items-center justify-center">{icon}</div>
        <p className="text-sm text-gray-400 uppercase tracking-wider">{label}</p>
        {isLoading ? (
            <div className="h-8 mt-1 flex justify-center items-center"><Spinner /></div>
        ) : (
            <p className="text-3xl font-bold text-white mt-1">{value.toLocaleString()}</p>
        )}
    </div>
);

export const UploaderStatsTab: React.FC<UploaderStatsTabProps> = ({ uploader }) => {
    const { stats, isLoading, error } = useUploaderStats(uploader);
    const { t } = useLanguage();

    const statItems: { key: keyof UploaderStats; icon: React.ReactNode; label: string }[] = [
        { key: 'total', icon: <TotalUploadsIcon className="w-8 h-8"/>, label: t('uploaderDetail:stats.total') },
        { key: 'movies', icon: <MovieIcon className="w-8 h-8"/>, label: t('uploaderDetail:stats.movies') },
        { key: 'audio', icon: <AudioIcon className="w-8 h-8"/>, label: t('uploaderDetail:stats.audio') },
        { key: 'texts', icon: <BookIcon className="w-8 h-8"/>, label: t('uploaderDetail:stats.texts') },
        { key: 'image', icon: <ImageIcon className="w-8 h-8"/>, label: t('uploaderDetail:stats.images') },
        { key: 'software', icon: <JoystickIcon className="w-8 h-8"/>, label: t('uploaderDetail:stats.software') },
    ];

    if (error) {
        return <p className="text-center text-red-400">{error}</p>;
    }
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statItems.map(item => (
                <StatCard 
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    value={stats ? stats[item.key] : 0}
                    isLoading={isLoading}
                />
            ))}
        </div>
    );
};