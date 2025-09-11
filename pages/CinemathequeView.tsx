import React from 'react';
import type { ArchiveItemSummary } from '../../types';
import { HeroSection } from '../components/videothek/HeroSection';
import { CollectionCarousel } from '../components/cinematheque/CollectionCarousel';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../hooks/useLanguage';
import { MediaType } from '../types';

interface VideothekViewProps {
  onSelectItem: (item: ArchiveItemSummary) => void;
}

export const VideothekView: React.FC<VideothekViewProps> = ({ onSelectItem }) => {
    const { t } = useLanguage();

    const collections = [
        { title: t('videothek:collections.newly_added'), query: `mediatype:(${MediaType.Movies})` },
        { title: t('videothek:collections.prelinger'), query: 'collection:prelinger' },
        { title: t('videothek:collections.film_noir'), query: 'collection:film_noir' },
        { title: t('videothek:collections.sci_fi'), query: 'subject:"science fiction" AND mediatype:(movies)' },
        { title: t('videothek:collections.animation'), query: 'collection:animationandcartoons' },
        { title: t('videothek:collections.silent_films'), query: 'subject:"silent film" AND mediatype:(movies)' },
    ];
    
    return (
        <div className="space-y-12 animate-page-fade-in">
            <HeroSection onSelectItem={onSelectItem} />
            {collections.map(collection => (
                <CollectionCarousel
                    key={collection.title}
                    collection={collection}
                    onSelectItem={onSelectItem}
                />
            ))}
        </div>
    );
};