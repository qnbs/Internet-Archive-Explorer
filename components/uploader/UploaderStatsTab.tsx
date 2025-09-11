

import React from 'react';
import type { Profile, UploaderStats } from '../../types';
import { useUploaderStats } from '../../hooks/useUploaderStats';
import { Spinner } from '../Spinner';
import { TotalUploadsIcon, MovieIcon, AudioIcon, BookIcon, ImageIcon, JoystickIcon, ChartPieIcon } from '../Icons';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../../hooks/useLanguage';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; isLoading: boolean; isFeatured?: boolean }> = ({ icon, label, value, isLoading, isFeatured }) => (
    <div className={`p-4 rounded-lg flex items-center space-x-4 ${isFeatured ? 'bg-cyan-900/30' : 'bg-gray-900/50'}`}>
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-cyan-400">{icon}</div>
        <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider">{label}</p>
            {isLoading ? (
                <div className="h-7 mt-1 w-20 bg-gray-700 animate-pulse rounded-md"></div>
            ) : (
                <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
            )}
        </div>
    </div>
);

const MediaTypeDonutChart: React.FC<{ stats: UploaderStats | null, isLoading: boolean }> = ({ stats, isLoading }) => {
    const { t } = useLanguage();
    const radius = 60;
    const strokeWidth = 20;
    const circumference = 2 * Math.PI * radius;

    const data = [
        { key: 'movies', color: '#22d3ee', label: t('uploaderDetail:stats.movies') },
        { key: 'audio', color: '#818cf8', label: t('uploaderDetail:stats.audio') },
        { key: 'texts', color: '#a78bfa', label: t('uploaderDetail:stats.texts') },
        { key: 'image', color: '#f472b6', label: t('uploaderDetail:stats.images') },
        { key: 'software', color: '#fb923c', label: t('uploaderDetail:stats.software') }
    ];

    if (isLoading) {
        return <div className="w-full h-56 flex items-center justify-center"><Spinner size="lg" /></div>;
    }

    if (!stats || stats.total === 0) {
        return <div className="w-full h-56 flex items-center justify-center text-gray-500">{t('uploaderDetail:stats.noData')}</div>;
    }
    
    const totalMedia = stats.movies + stats.audio + stats.texts + stats.image + stats.software;
    if (totalMedia === 0) {
        return <div className="w-full h-56 flex items-center justify-center text-gray-500">{t('uploaderDetail:stats.noData')}</div>;
    }

    let accumulatedOffset = 0;
    const segments = data.map(item => {
        const percentage = stats[item.key as keyof UploaderStats] / totalMedia;
        const strokeDashoffset = circumference * (1 - accumulatedOffset);
        const strokeDasharray = `${circumference * percentage} ${circumference * (1 - percentage)}`;
        accumulatedOffset += percentage;
        return { ...item, strokeDasharray, strokeDashoffset, percentage };
    });

    return (
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-40 h-40 flex-shrink-0">
                <svg viewBox="0 0 160 160" className="-rotate-90">
                    {segments.map(s => s.percentage > 0 && (
                        <circle
                            key={s.key}
                            cx="80" cy="80" r={radius}
                            fill="transparent"
                            stroke={s.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={s.strokeDasharray}
                            strokeDashoffset={s.strokeDashoffset}
                            className="transition-all duration-500"
                        />
                    ))}
                </svg>
                 <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold text-white">{stats.total.toLocaleString()}</span>
                    <span className="text-xs text-gray-400">{t('uploaderDetail:stats.total')}</span>
                </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2">
                {segments.map(s => s.percentage > 0 && (
                    <div key={s.key} className="flex items-center space-x-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                        <span className="text-gray-300">{s.label}</span>
                        <span className="font-semibold text-white">({(s.percentage * 100).toFixed(1)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const UploaderStatsTab: React.FC<{ profile: Profile }> = ({ profile }) => {
    const { stats, isLoading, error } = useUploaderStats(profile);
    const { t } = useLanguage();

    const statItems: { key: keyof UploaderStats; icon: React.ReactNode; label: string }[] = [
        { key: 'movies', icon: <MovieIcon className="w-6 h-6"/>, label: t('uploaderDetail:stats.movies') },
        { key: 'audio', icon: <AudioIcon className="w-6 h-6"/>, label: t('uploaderDetail:stats.audio') },
        { key: 'texts', icon: <BookIcon className="w-6 h-6"/>, label: t('uploaderDetail:stats.texts') },
        { key: 'image', icon: <ImageIcon className="w-6 h-6"/>, label: t('uploaderDetail:stats.images') },
        { key: 'software', icon: <JoystickIcon className="w-6 h-6"/>, label: t('uploaderDetail:stats.software') },
    ];

    if (error) {
        return <p className="text-center text-red-400">{error}</p>;
    }
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-800/60 p-6 rounded-xl border border-gray-700/50">
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                    <ChartPieIcon className="w-6 h-6 text-cyan-400" />
                    <span>{t('uploaderDetail:stats.distribution')}</span>
                </h3>
                <MediaTypeDonutChart stats={stats} isLoading={isLoading} />
            </div>
            <div className="space-y-4">
                <StatCard 
                    isFeatured
                    icon={<TotalUploadsIcon className="w-6 h-6" />}
                    label={t('uploaderDetail:stats.total')}
                    value={stats?.total || 0}
                    isLoading={isLoading}
                />
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
        </div>
    );
};