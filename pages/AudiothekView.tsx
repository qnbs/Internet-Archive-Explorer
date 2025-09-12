import React from 'react';
import type { ArchiveItemSummary } from '../../types';
import { AudiothekHero } from '../components/audiothek/AudiothekHero';
import { CategoryGrid } from '../components/audiothek/CategoryGrid';
import { useLanguage } from '../hooks/useLanguage';
import { ArchivalCarousel } from '../components/ArchivalCarousel';

interface AudiothekViewProps {
  onSelectItem: (item: ArchiveItemSummary) => void;
}

const getShelves = (t: (key: string) => string) => [
    { title: t('audiothek:shelves.librivox'), query: 'collection:librivoxaudio' },
];

const getAdditionalAudioCollections = (t: (key: string) => string) => [
    { title: t('audiothek:collections.archiveOfContemporaryMusic'), query: 'collection:archive_of_contemporary_music' },
    { title: t('audiothek:collections.hipHopMixtapes'), query: 'collection:hiphopmixtapes' },
    { title: t('audiothek:collections.radioWithASR'), query: 'collection:radioprograms' },
    { title: t('audiothek:collections.blackieBeats'), query: 'collection:blackie-beats-archive' },
    { title: t('audiothek:collections.vaporwave'), query: 'collection:vaporwave' },
    { title: t('audiothek:collections.airchecks'), query: 'collection:airchecks' },
];

const AudiothekView: React.FC<AudiothekViewProps> = ({ onSelectItem }) => {
    const { t } = useLanguage();
    const shelves = getShelves(t);
    const additionalAudioCollections = getAdditionalAudioCollections(t);

    return (
        <div className="space-y-12 animate-page-fade-in">
            <AudiothekHero />
            <CategoryGrid />
            {shelves.map(shelf => (
                <ArchivalCarousel
                    key={shelf.title}
                    title={shelf.title}
                    query={shelf.query}
                    onSelectItem={onSelectItem}
                    cardAspectRatio="square"
                />
            ))}
            <div className="border-t border-gray-700"></div>
             {additionalAudioCollections.map(collection => (
                <ArchivalCarousel
                    key={collection.title}
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