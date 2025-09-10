import React from 'react';
import type { ArchiveItemSummary } from '../types';
import { HeroSection } from '../components/cinematheque/HeroSection';
import { CollectionCarousel } from '../components/cinematheque/CollectionCarousel';
import { useLanguage } from '../contexts/LanguageContext';
import { MediaType } from '../types';

interface CinemathequeViewProps {
  onSelectItem: (item: ArchiveItemSummary) => void;
}

export const CinemathequeView: React.FC<CinemathequeViewProps> = ({ onSelectItem }) => {
    const { t } = useLanguage();

    const collections = [
        { title: t('cinematheque:collections.newly_added'), query: `mediatype:(${MediaType.Movies})` },
        { title: t('cinematheque:collections.prelinger'), query: 'collection:prelinger' },
        { title: t('cinematheque:collections.film_noir'), query: 'collection:film_noir' },
        { title: t('cinematheque:collections.sci_fi'), query: 'subject:"science fiction" AND mediatype:(movies)' },
        { title: t('cinematheque:collections.animation'), query: 'collection:animationandcartoons' },
        { title: t('cinematheque:collections.silent_films'), query: 'subject:"silent film" AND mediatype:(movies)' },
    ];
    
    return (
        <div className="space-y-12 animate-page-fade-in">
            <HeroSection onSelectItem={onSelectItem} />
            {collections.map(collection => (
                <CollectionCarousel key={collection.title} collection={collection} onSelectItem={onSelectItem} />
            ))}
        </div>
    );
};