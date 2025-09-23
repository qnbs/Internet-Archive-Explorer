import React from 'react';
import { HeroSection } from '../components/videothek/HeroSection';
import { ArchivalCarousel } from '../components/ArchivalCarousel';
import { useLanguage } from '../hooks/useLanguage';
import { MediaType, AIGenerationType } from '../types';
import { useArchivalItems } from '../hooks/useArchivalItems';
import { generateFilmDoubleFeatureConcept } from '../services/geminiService';
import { AIInsightPanel } from '../components/AIInsightPanel';

const getCollections = (t: (key: string) => string) => [
    { key: 'newly_added', title: t('videothek:collections.newly_added'), query: `mediatype:(${MediaType.Movies})` },
    { key: 'prelinger', title: t('videothek:collections.prelinger'), query: 'collection:prelinger' },
    { key: 'film_noir', title: t('videothek:collections.film_noir'), query: 'collection:film_noir' },
    { key: 'sci_fi', title: t('videothek:collections.sci_fi'), query: 'subject:"science fiction" AND mediatype:(movies)' },
    { key: 'animation', title: t('videothek:collections.animation'), query: 'collection:animationandcartoons' },
    { key: 'silent_films', title: t('videothek:collections.silent_films'), query: 'subject:"silent film" AND mediatype:(movies)' },
];

const VideothekView: React.FC = () => {
    const { t } = useLanguage();
    const collections = getCollections(t);
    const { items: newlyAddedItems } = useArchivalItems(collections[0].query);

    return (
        <div className="space-y-12 animate-page-fade-in">
            <HeroSection />

            <AIInsightPanel
                title={t('videothek:aiInsight.title')}
                description={t('videothek:aiInsight.description')}
                buttonLabel={t('videothek:aiInsight.button')}
                items={newlyAddedItems}
                generationFn={generateFilmDoubleFeatureConcept}
                generationType={AIGenerationType.MoviesInsight}
            />

            {collections.map(collection => (
                <ArchivalCarousel
                    key={collection.key}
                    title={collection.title}
                    query={collection.query}
                />
            ))}
        </div>
    );
};

export default VideothekView;
