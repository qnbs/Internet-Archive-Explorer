import React from 'react';
import type { ArchiveItemSummary } from '../types';
import { AudiothekHero } from '../components/audiothek/AudiothekHero';
import { CategoryGrid } from '../components/audiothek/CategoryGrid';
import { useLanguage } from '../hooks/useLanguage';
import { ArchivalCarousel } from '../components/ArchivalCarousel';
import { AIInsightPanel } from '../components/AIInsightPanel';
import { useArchivalItems } from '../hooks/useArchivalItems';
import { generateRadioShowConcept } from '../services/geminiService';
import { AIGenerationType } from '../types';

interface AudiothekViewProps {
  onSelectItem: (item: ArchiveItemSummary) => void;
}

const getShelves = (t: (key: string) => string) => [
    { key: 'librivox', title: t('audiothek:shelves.librivox'), query: 'collection:librivoxaudio' },
];

const getAdditionalAudioCollections = (t: (key: string) => string) => [
    { key: 'archiveOfContemporaryMusic', title: t('audiothek:collections.archiveOfContemporaryMusic'), query: 'collection:archive_of_contemporary_music' },
    { key: 'hipHopMixtapes', title: t('audiothek:collections.hipHopMixtapes'), query: 'collection:hiphopmixtapes' },
    { key: 'radioWithASR', title: t('audiothek:collections.radioWithASR'), query: 'collection:radioprograms' },
    { key: 'blackieBeats', title: t('audiothek:collections.blackieBeats'), query: 'collection:blackie-beats-archive' },
    { key: 'vaporwave', title: t('audiothek:collections.vaporwave'), query: 'collection:vaporwave' },
    { key: 'airchecks', title: t('audiothek:collections.airchecks'), query: 'collection:airchecks' },
];

const AudiothekView: React.FC<AudiothekViewProps> = ({ onSelectItem }) => {
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
                <ArchivalCarousel
                    key={shelf.key}
                    title={shelf.title}
                    query={shelf.query}
                    onSelectItem={onSelectItem}
                    cardAspectRatio="square"
                />
            ))}
            <div className="border-t border-gray-700"></div>
             {additionalAudioCollections.map(collection => (
                <ArchivalCarousel
                    key={collection.key}
                    title={collection.title}
                    query={collection.query}
                    onSelectItem={onSelectItem}
                    cardAspectRatio="square"
                />
            ))}
        </div>
    );
};

export default AudiothekView;