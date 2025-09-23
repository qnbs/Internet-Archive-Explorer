import React from 'react';
import { AIGenerationType } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { AIInsightPanel } from '../components/AIInsightPanel';
import { generateRetroGamingNote } from '../services/geminiService';
import { useArchivalItems } from '../hooks/useArchivalItems';
import { RecRoomHero } from '../components/recroom/RecRoomHero';
import { RecRoomCarousel } from '../components/recroom/RecRoomCarousel';
import GameFinder from '../components/recroom/GameFinder';

const getCollections = (t: (key: string) => string) => [
    { key: 'msdos_games', title: t('recRoom:collections.msdos'), query: 'collection:softwarelibrary_msdos_games' },
    { key: 'classic_pc', title: t('recRoom:collections.classic_pc'), query: 'collection:classicpcgames' },
    { key: 'apple_ii', title: t('recRoom:collections.apple_ii'), query: 'collection:softwarelibrary_apple_ii_library_games' },
    { key: 'console_living_room', title: t('recRoom:collections.console_living_room'), query: 'collection:console_living_room' },
];

const RecRoomView: React.FC = () => {
    const { t } = useLanguage();
    const collections = getCollections(t);
    const { items: insightItems } = useArchivalItems(collections[0].query, 10);

    return (
        <div className="space-y-12 animate-page-fade-in">
            <RecRoomHero />
            
            <GameFinder />
            
            <AIInsightPanel
                title={t('recRoom:aiInsight.title')}
                description={t('recRoom:aiInsight.description')}
                buttonLabel={t('recRoom:aiInsight.button')}
                items={insightItems}
                generationFn={generateRetroGamingNote}
                generationType={AIGenerationType.RecRoomInsight}
            />

            {collections.map(collection => (
                <RecRoomCarousel
                    key={collection.key}
                    title={collection.title}
                    query={collection.query}
                />
            ))}
        </div>
    );
};

export default RecRoomView;
