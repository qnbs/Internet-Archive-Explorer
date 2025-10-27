import React from 'react';
import { AudiothekHero } from '../components/audiothek/AudiothekHero';
import { CategoryGrid } from '../components/audiothek/CategoryGrid';
import { useLanguage } from '../hooks/useLanguage';
import { AudioCarousel } from '../components/audiothek/AudioCarousel';
import { AIInsightPanel } from '../components/AIInsightPanel';
import { useArchivalItems } from '../hooks/useArchivalItems';
import { generateRadioShowConcept } from '../services/geminiService';
import { AIGenerationType } from '../types';

const getShelves = (t: (key: string) => string) => [
    { key: 'librivox', title: t('audiothek:shelves.librivox'), query: 'collection:librivoxaudio' },
    { key: 'otr', title: t('audiothek:shelves.otr'), query: 'collection:oldtimeradio' },
    { key: 'grateful_dead', title: t('audiothek:shelves.grateful_dead'), query: 'collection:GratefulDead' },
    { key: '78rpm', title: t('audiothek:shelves.78rpm'), query: 'collection:georgeblood' },
];

const getAdditionalAudioCollections = (t: (key: string) => string) => [
    { key: 'archiveOfContemporaryMusic', title: t('audiothek:collections.archiveOfContemporaryMusic'), query: 'collection:archive_of_contemporary_music' },
    { key: 'hipHopMixtapes', title: t('audiothek:collections.hipHopMixtapes'), query: 'collection:hiphopmixtapes' },
    { key: 'radioWithASR', title: t('audiothek:collections.radioWithASR'), query: 'collection:radioprograms' },
    { key: 'blackieBeats', title: t('audiothek:collections.blackieBeats'), query: 'collection:blackie-beats-archive' },
    { key: 'vaporwave', title: t('audiothek:collections.vaporwave'), query: 'collection:vaporwave' },
    { key: 'airchecks', title: t('audiothek:collections.airchecks'), query: 'collection:airchecks' },
];

const AudiothekView: React.FC = () => {
    const { t } = useLanguage();
    const shelves = getShelves(t);
    const additionalAudioCollections = getAdditionalAudioCollections(t);
    const { items: librivoxItems } = useArchivalItems(shelves[0].query);

    return (
        <div className="space-y-12 animate-page-fade-in">
            <AudiothekHero />
            <CategoryGrid />
            
            <AIInsightPanel
                title={t('audiothek:aiInsight.title')}
                description={t('audiothek:aiInsight.description')}
                buttonLabel={t('audiothek:aiInsight.button')}
                items={librivoxItems}
                generationFn={generateRadioShowConcept}
                generationType={AIGenerationType.AudioInsight}
            />

            {shelves.map(shelf => (
                <AudioCarousel
                    key={shelf.key}
                    title={shelf.title}
                    query={shelf.query}
                />
            ))}
            <div className="border-t border-gray-700"></div>
             {additionalAudioCollections.map(collection => (
                <AudioCarousel
                    key={collection.key}
                    title={collection.title}
                    query={collection.query}
                />
            ))}
        </div>
    );
};

export default AudiothekView;
