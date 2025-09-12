import React, { useState, useMemo } from 'react';
import { UPLOADER_DATA, UPLOADER_CATEGORIES } from './uploaderData';
import type { Uploader, UploaderCategory, Profile } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { SearchIcon, UsersIcon } from '../components/Icons';
import { UploaderProfileCard } from '../components/UploaderProfileCard';
import { useDebounce } from '../hooks/useDebounce';

interface UploaderHubViewProps {
    onSelectUploader: (uploader: Uploader) => void;
}

export const UploaderHubView: React.FC<UploaderHubViewProps> = ({ onSelectUploader }) => {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);
    const [category, setCategory] = useState<UploaderCategory | 'all'>('all');

    const filteredUploaders = useMemo(() => {
        let uploaders = [...UPLOADER_DATA];
        
        if (category !== 'all') {
            uploaders = uploaders.filter(u => u.category === category);
        }
        
        if (debouncedQuery.trim()) {
            const lowerQuery = debouncedQuery.toLowerCase();
            uploaders = uploaders.filter(u => 
                u.username.toLowerCase().includes(lowerQuery) ||
                t(u.descriptionKey || '').toLowerCase().includes(lowerQuery)
            );
        }
        
        return uploaders;
    }, [debouncedQuery, category, t]);

    const featuredUploaders = useMemo(() => UPLOADER_DATA.filter(u => u.featured), []);

    return (
        <div className="space-y-8 animate-page-fade-in">
            <header className="p-6 bg-gray-800/60 rounded-xl shadow-lg text-center">
                <UsersIcon className="w-12 h-12 mx-auto text-cyan-400 mb-4" />
                <h1 className="text-3xl font-bold text-cyan-400">{t('uploaderHub:title')}</h1>
                <p className="mt-2 text-gray-300 max-w-2xl mx-auto">{t('uploaderHub:description')}</p>
            </header>

            <div className="sticky top-16 z-10 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                <div className="relative mb-4">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('uploaderHub:searchPlaceholder')}
                        className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700/50 focus-within:border-cyan-500 rounded-lg py-2 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-colors"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setCategory('all')} className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${category === 'all' ? 'bg-cyan-500 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                        {t('uploaderHub:categories.all')}
                    </button>
                    {UPLOADER_CATEGORIES.map(cat => (
                         <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${category === cat ? 'bg-cyan-500 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                            {t(`uploaderHub:categories.${cat}`)}
                        </button>
                    ))}
                </div>
            </div>

            <section>
                 {filteredUploaders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredUploaders.map((uploader, index) => {
                            // FIX: Construct a Profile object to pass to the UploaderProfileCard component.
                            const profile: Profile = {
                                name: uploader.username,
                                searchIdentifier: uploader.searchUploader,
                                type: 'uploader',
                                curatedData: uploader,
                            };
                            return (
                                <UploaderProfileCard
                                    key={uploader.searchUploader}
                                    profile={profile}
                                    index={index}
                                    onSelect={(_profile) => onSelectUploader(uploader)}
                                />
                            );
                        })}
                    </div>
                 ) : (
                    <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">{t('common:noResultsFound')}</p>
                    </div>
                 )}
            </section>
        </div>
    );
};
