import React from 'react';
import type { ArchiveItemSummary } from '../types';
import { AudiothekHero } from '../components/audiothek/AudiothekHero';
import { CategoryGrid } from '../components/audiothek/CategoryGrid';
import { AudioCarousel } from '../components/audiothek/AudioCarousel';
import { useLanguage } from '../contexts/LanguageContext';
import { MediaType } from '../types';

interface AudiothekViewProps {
  onSelectItem: (item: ArchiveItemSummary) => void;
}

export const AudiothekView: React.FC<AudiothekViewProps> = ({ onSelectItem }) => {
    const { t } = useLanguage();

    const shelves = [
        { title: t('audiothek:shelves.newly_added'), query: `mediatype:(${MediaType.Audio})` },
        { title: t('audiothek:shelves.grateful_dead'), query: 'collection:GratefulDead' },
        { title: t('audiothek:shelves.otr'), query: 'collection:oldtimeradio' },
        { title: t('audiothek:shelves.librivox'), query: 'collection:librivoxaudio' },
        { title: t('audiothek:shelves.78rpm'), query: 'collection:georgeblood' },
    ];

    return (
        <div className="space-y-12 animate-page-fade-in">
            <AudiothekHero />
            <CategoryGrid />
            {shelves.map(shelf => (
                <AudioCarousel key={shelf.title} collection={shelf} onSelectItem={onSelectItem} />
            ))}
        </div>
    );
};