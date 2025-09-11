import React, { useState, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { uploaderFavoritesAtom } from '../../store';
import { useLanguage } from '../../hooks/useLanguage';
import { UPLOADER_DATA } from '../../pages/uploaderData';
import { UploaderProfileCard } from '../UploaderProfileCard';
import { UsersIcon, SearchIcon } from '../Icons';
import { useNavigation } from '../../hooks/useNavigation';
import { useDebounce } from '../../hooks/useDebounce';
import type { Uploader } from '../../types';

export const UploaderFavoritesTab: React.FC = () => {
    const { t } = useLanguage();
    const navigation = useNavigation();
    const favoriteUploaderIds = useAtomValue(uploaderFavoritesAtom);

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedQuery = useDebounce(searchQuery, 300);

    const favoriteUploaders = useMemo(() => {
        return favoriteUploaderIds.map(id => {
            const curatedUploader = UPLOADER_DATA.find(u => u.searchUploader === id);
            if (curatedUploader) {
                return curatedUploader;
            }
            // If not found in our curated list, create a generic Uploader object for display.
            // This allows following any uploader, not just the curated ones.
            const genericUploader: Uploader = {
                username: id.includes('@') ? id.split('@')[0] : id,
                searchUploader: id,
                category: 'community', // Assign a default category
            };
            return genericUploader;
        }).sort((a, b) => a.username.localeCompare(b.username));
    }, [favoriteUploaderIds]);
    
    const filteredUploaders = useMemo(() => {
        if (!debouncedQuery) return favoriteUploaders;
        const lowerQuery = debouncedQuery.toLowerCase();
        return favoriteUploaders.filter(uploader => 
            uploader && uploader.username.toLowerCase().includes(lowerQuery)
        );
    }, [favoriteUploaders, debouncedQuery]);

    if (favoriteUploaders.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-800/60 rounded-lg">
                <UsersIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h2 className="text-2xl font-bold text-white">{t('favorites:noFavUploaders')}</h2>
                <p className="text-gray-400 mt-2">{t('favorites:noFavUploadersDesc')}</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('favorites:searchUploadersPlaceholder', { count: favoriteUploaders.length })}
                    className="w-full bg-gray-800/60 border-2 border-gray-700/50 focus-within:border-cyan-500 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none transition-colors"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredUploaders.map((uploader, index) => uploader && (
                    <UploaderProfileCard
                        key={uploader.searchUploader}
                        uploader={uploader}
                        index={index}
                        // FIX: Corrected a type mismatch on the 'onSelect' prop by using a function with the correct signature.
                        onSelect={navigation.navigateToUploaderFromHub}
                    />
                ))}
            </div>
        </div>
    );
};