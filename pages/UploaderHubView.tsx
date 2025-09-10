import React, { useState, useMemo } from 'react';
import { UploaderCard } from '../components/UploaderCard';
import { UPLOADER_DATA, UPLOADER_CATEGORIES } from './uploaderData';
import type { Uploader } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { UsersIcon, SearchIcon, ChevronDownIcon, StarIcon } from '../components/Icons';

interface UploaderHubViewProps {
    onSelectUploader: (uploaderName: string) => void;
}

type SortByType = 'featured' | 'asc' | 'desc';

const CategorySidebar: React.FC<{ activeCategories: Set<string>, onCategoryToggle: (category: string) => void }> = ({ activeCategories, onCategoryToggle }) => {
    const { t } = useLanguage();
    return (
        <aside className="lg:col-span-1 lg:sticky lg:top-24 self-start">
            <div className="bg-gray-200/50 dark:bg-gray-800/60 p-4 rounded-xl shadow-lg">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">{t('uploaderHub.filterByCategory')}</h3>
                <nav className="space-y-1">
                     <button
                        onClick={() => onCategoryToggle('all')}
                        className={`w-full text-left flex items-center p-2 rounded-md transition-colors text-sm font-medium ${activeCategories.has('all') ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-700/50'}`}
                    >
                        {t('uploaderHub.categories.all')}
                    </button>
                    {UPLOADER_CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => onCategoryToggle(category)}
                            className={`w-full text-left flex items-center p-2 rounded-md transition-colors text-sm font-medium ${activeCategories.has(category) ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-700/50'}`}
                        >
                            {t(`uploaderHub.categories.${category}`)}
                        </button>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export const UploaderHubView: React.FC<UploaderHubViewProps> = ({ onSelectUploader }) => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(['all']));
    const [sortBy, setSortBy] = useState<SortByType>('featured');

    const handleCategoryToggle = (category: string) => {
        if (category === 'all') {
            setActiveCategories(new Set(['all']));
            return;
        }
        setActiveCategories(prev => {
            const newSet = new Set(prev);
            newSet.delete('all');
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            if(newSet.size === 0) newSet.add('all');
            return newSet;
        });
    };

    const filteredUploaders = useMemo(() => {
        let uploaders: Uploader[] = [...UPLOADER_DATA];

        if (searchQuery.trim()) {
            const lowercasedQuery = searchQuery.toLowerCase();
            uploaders = uploaders.filter(u => 
                u.username.toLowerCase().includes(lowercasedQuery) || 
                t(u.descriptionKey).toLowerCase().includes(lowercasedQuery)
            );
        }

        if (!activeCategories.has('all')) {
            uploaders = uploaders.filter(u => activeCategories.has(u.category));
        }

        switch (sortBy) {
            case 'asc':
                uploaders.sort((a, b) => a.username.localeCompare(b.username));
                break;
            case 'desc':
                uploaders.sort((a, b) => b.username.localeCompare(a.username));
                break;
            case 'featured':
            default:
                 uploaders.sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return a.username.localeCompare(b.username);
                });
                break;
        }
        return uploaders;
    }, [searchQuery, activeCategories, sortBy, t]);

    const featuredUploaders = useMemo(() => UPLOADER_DATA.filter(u => u.featured), []);

    return (
        <div className="animate-page-fade-in">
            <header className="p-6 sm:p-8 bg-gray-200/50 dark:bg-gray-800/60 rounded-xl shadow-lg text-center relative overflow-hidden mb-8">
                <div className="absolute -top-12 -left-12 text-cyan-500/10 opacity-50">
                    <UsersIcon className="w-48 h-48 transform rotate-[-15deg]" />
                </div>
                <div className="absolute -bottom-12 -right-12 text-cyan-500/10 opacity-50">
                    <UsersIcon className="w-48 h-48 transform rotate-[15deg]" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-cyan-400 tracking-wider">{t('uploaderHub.title')}</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                       {t('uploaderHub.description')}
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <CategorySidebar activeCategories={activeCategories} onCategoryToggle={handleCategoryToggle} />

                <main className="lg:col-span-3 space-y-8">
                     <section>
                         <div className="flex items-center mb-4">
                            <StarIcon className="w-6 h-6 mr-3 text-yellow-400" filled />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('uploaderHub.featuredUploader')}</h2>
                         </div>
                        <div className="relative group">
                             <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                                {featuredUploaders.map((uploader, index) => (
                                    <div key={uploader.searchUploader} className="flex-shrink-0 w-full sm:w-96 snap-center">
                                        <UploaderCard 
                                            uploader={uploader}
                                            onClick={() => onSelectUploader(uploader.searchUploader)}
                                            index={index}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    
                    <section>
                         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('uploaderHub.allUploaders')}</h2>
                        <div className="p-4 bg-gray-200/50 dark:bg-gray-800/60 rounded-xl shadow-lg space-y-4 sticky top-20 z-10 backdrop-blur-md">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr] gap-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('uploaderHub.searchPlaceholder')}
                                        className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortByType)}
                                        className="w-full h-full appearance-none bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-3 pr-8 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="featured">{t('uploaderHub.sort.featured')}</option>
                                        <option value="asc">{t('uploaderHub.sort.asc')}</option>
                                        <option value="desc">{t('uploaderHub.sort.desc')}</option>
                                    </select>
                                    <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="pb-4 border-b border-gray-300 dark:border-gray-700 mb-6">
                                <p className="text-gray-500 dark:text-gray-400">{t('uploaderHub.resultsFound', { count: filteredUploaders.length })}</p>
                            </div>

                            {filteredUploaders.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredUploaders.map((uploader, index) => (
                                        <UploaderCard 
                                            key={uploader.searchUploader}
                                            uploader={uploader}
                                            onClick={() => onSelectUploader(uploader.searchUploader)}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-200/50 dark:bg-gray-800/60 rounded-lg">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('uploaderHub.noUploadersFound')}</h2>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2">{t('uploaderHub.noUploadersDesc')}</p>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};