import React from 'react';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../../hooks/useLanguage';
import { CollectionIcon } from '../Icons';

export const CollectionsFavoritesTab: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="text-center py-20 bg-gray-800/60 rounded-lg">
            <CollectionIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-white">{t('favorites:comingSoon')}</h2>
            <p className="text-gray-400 mt-2">{t('favorites:comingSoonDesc')}</p>
        </div>
    );
};