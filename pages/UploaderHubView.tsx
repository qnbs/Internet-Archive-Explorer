import React, { useState, useMemo } from 'react';
import { UPLOADER_DATA } from './uploaderData';
import type { Uploader, Profile, UploaderCategory } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigation } from '../hooks/useNavigation';
import { UsersIcon, StarIcon } from '../components/Icons';
import { UploaderProfileCard } from '../components/UploaderProfileCard';
import { useDebounce } from '../hooks/useDebounce';
import { UploaderHubSidebar } from '../components/uploader/UploaderHubSidebar';

const UploaderHubView: React.FC = () => {
    const { t } = useLanguage();
    const navigation = useNavigation();
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);
    // FIX: Corrected type for category state.
    const [category, setCategory] = useState<UploaderCategory | 'all'>('all');

    const featuredUploaders = useMemo(() => UPLOADER_DATA.filter(u => u.featured), []);

    const filteredUploaders = useMemo(() => {
        let uploaders = UPLOADER_DATA.filter(u => !u.featured);
        
        if (category !== 'all') {
            uploaders = uploaders.filter(u => u.category === category);
        }
        
        if (debouncedQuery.trim()) {
            const lowerQuery = debouncedQuery.toLowerCase();
            uploaders = uploaders.filter(u => 
                u.username.toLowerCase().includes(lowerQuery) ||
                (u.screenname && u.screenname.toLowerCase().includes(lowerQuery)) ||
                t(u.descriptionKey || '').toLowerCase().includes(lowerQuery)
            );
        }
        
        return uploaders;
    }, [debouncedQuery, category, t]);
    
    const handleSelectProfile = (profile: Profile) => {
        navigation.navigateToProfile(profile);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 animate-page-fade-in">
            <aside className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0">
                <UploaderHubSidebar 
                    query={query}
                    setQuery={setQuery}
                    category={category}
                    setCategory={setCategory}
                />
            </aside>
            <main className="flex-grow min-w-0 space-y-8">
                <header className="p-6 bg-gray-800/60 rounded-xl shadow-lg text-center">
                    <UsersIcon className="w-12 h-12 mx-auto text-cyan-400 mb-4" />
                    <h1 className="text-3xl font-bold text-cyan-400">{t('uploaderHub:title')}</h1>
                    <p className="mt-2 text-gray-300 max-w-2xl mx-auto">{t('uploaderHub:description')}</p>
                </header>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <StarIcon className="text-yellow-400"/>
                        {t('uploaderHub:featured')}
                    </h2>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {featuredUploaders.map((uploader, index) => {
                             const profile: Profile = { name: uploader.username, searchIdentifier: uploader.searchUploader, type: 'uploader', curatedData: uploader };
                             return <UploaderProfileCard key={uploader.searchUploader} profile={profile} index={index} onSelect={handleSelectProfile} />;
                        })}
                    </div>
                </section>
                
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">{t('uploaderHub:allUploaders')}</h2>
                     {filteredUploaders.length > 0 ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {filteredUploaders.map((uploader, index) => {
                                const profile: Profile = { name: uploader.username, searchIdentifier: uploader.searchUploader, type: 'uploader', curatedData: uploader };
                                return <UploaderProfileCard key={uploader.searchUploader} profile={profile} index={index} onSelect={handleSelectProfile} />;
                            })}
                        </div>
                     ) : (
                        <div className="text-center py-16 bg-gray-800/60 rounded-lg">
                            <p className="text-gray-500">{t('common:noResultsFound')}</p>
                        </div>
                     )}
                </section>
            </main>
        </div>
    );
};
export default UploaderHubView;