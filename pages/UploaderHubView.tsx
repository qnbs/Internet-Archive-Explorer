import React, { useState, useMemo } from 'react';
import { UploaderProfileCard } from '../components/UploaderProfileCard';
import { UPLOADER_DATA, UPLOADER_CATEGORIES } from './uploaderData';
import type { UploaderCategory } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { UsersIcon } from '../components/Icons';

interface UploaderHubViewProps {
    onSelectUploader: (searchUploader: string) => void;
}

export const UploaderHubView: React.FC<UploaderHubViewProps> = ({ onSelectUploader }) => {
    const { t } = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState<UploaderCategory | 'all'>('all');

    const featuredUploaders = useMemo(() => UPLOADER_DATA.filter(u => u.featured), []);

    const filteredUploaders = useMemo(() => {
        if (selectedCategory === 'all') {
            // On the default 'all' view, the main list should not repeat the featured uploaders.
            return UPLOADER_DATA.filter(u => !u.featured);
        }
        // When a specific category is selected, show all uploaders belonging to it.
        return UPLOADER_DATA.filter(u => u.category === selectedCategory);
    }, [selectedCategory]);

    // The "Featured" section is only shown on the default 'all' view.
    // When a category is selected, it's hidden to prevent duplicates, as featured items will appear within their category list.
    const showFeaturedSection = selectedCategory === 'all';

    return (
        <div className="space-y-12 animate-page-fade-in">
            <header className="p-6 sm:p-8 bg-gray-50 dark:bg-gray-800/60 rounded-xl shadow-lg text-center relative overflow-hidden">
                 <div className="absolute -top-12 -left-12 text-cyan-500/10 opacity-50">
                    <UsersIcon className="w-48 h-48 transform rotate-[-15deg]" />
                </div>
                 <div className="absolute -bottom-12 -right-12 text-cyan-500/10 opacity-50">
                    <UsersIcon className="w-48 h-48 transform rotate-[15deg]" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-cyan-400 tracking-wider">{t('uploaderHub:title')}</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        {t('uploaderHub:description')}
                    </p>
                </div>
            </header>

            {showFeaturedSection && (
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('uploaderHub:featured')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {featuredUploaders.map((uploader, index) => (
                            <UploaderProfileCard key={uploader.searchUploader} uploader={uploader} index={index} onSelect={onSelectUploader} />
                        ))}
                    </div>
                </section>
            )}
            
            <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    {selectedCategory === 'all'
                        ? t('uploaderHub:allOtherUploaders')
                        : t('uploaderHub:categoryTitle', { category: t(`uploaderHub:categories.${selectedCategory}`) })}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${selectedCategory === 'all' ? 'bg-cyan-500 text-white shadow-sm' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'}`}
                    >
                        {t('uploaderHub:all')}
                    </button>
                    {UPLOADER_CATEGORIES.map(cat => (
                         <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${selectedCategory === cat ? 'bg-cyan-500 text-white shadow-sm' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'}`}
                        >
                            {t(`uploaderHub:categories.${cat}`)}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredUploaders.map((uploader, index) => (
                        <UploaderProfileCard key={uploader.searchUploader} uploader={uploader} index={index} onSelect={onSelectUploader} />
                    ))}
                </div>
            </section>
        </div>
    );
};