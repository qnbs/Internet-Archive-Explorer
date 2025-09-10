import React, { useState, useEffect } from 'react';
import type { ArchiveItemSummary } from '../types';
import { MediaType as MediaTypeValue } from '../types';
import { searchArchive } from '../services/archiveService';
import { AudiothekHero } from '../components/audiothek/AudiothekHero';
import { CategoryGrid } from '../components/audiothek/CategoryGrid';
import { useSearch } from '../contexts/SearchContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ContentCarousel } from '../components/ContentCarousel';

interface AudiothekViewProps {
    onSelectItem: (item: ArchiveItemSummary) => void;
}

type ShelfResults = Record<string, ArchiveItemSummary[]>;

export const AudiothekView: React.FC<AudiothekViewProps> = ({ onSelectItem }) => {
    const { t } = useLanguage();
    const [heroItem, setHeroItem] = useState<ArchiveItemSummary | null>(null);
    const [isHeroLoading, setIsHeroLoading] = useState(true);

    const [shelves, setShelves] = useState<ShelfResults>({});
    const [areShelvesLoading, setAreShelvesLoading] = useState(true);
    
    const { searchAndGo } = useSearch();

    const curatedShelves = [
        { id: 'newly_added', title: t('audiothek.shelves.newly_added'), query: 'mediatype:audio', sorts: ['-addeddate'] },
        { id: 'grateful_dead', title: t('audiothek.shelves.grateful_dead'), query: 'collection:GratefulDead AND mediatype:audio', sorts: ['-downloads'] },
        { id: 'otr', title: t('audiothek.shelves.otr'), query: 'collection:OldTimeRadio AND mediatype:audio', sorts: ['-downloads'] },
        { id: 'librivox', title: t('audiothek.shelves.librivox'), query: 'collection:librivoxaudio AND mediatype:audio', sorts: ['-downloads'] },
        { id: 'classical_music', title: t('audiothek.shelves.classical_music'), query: 'subject:classical AND mediatype:audio', sorts: ['-downloads'] },
        { id: 'poetry', title: t('audiothek.shelves.poetry'), query: '(subject:poetry OR subject:"spoken word")', sorts: ['-downloads'] },
        { id: '78rpm', title: t('audiothek.shelves.78rpm'), query: 'collection:georgeblood AND mediatype:audio', sorts: ['-downloads'] },
        { id: 'radio_plays', title: t('audiothek.shelves.radio_plays'), query: 'subject:"radio play" AND mediatype:audio', sorts: ['-downloads'] },
    ];

    const handleCategorySearch = (query: string) => {
        searchAndGo(query, {mediaType: new Set([MediaTypeValue.Audio])});
    };

    useEffect(() => {
        const fetchHero = async () => {
            setIsHeroLoading(true);
            try {
                // Feature the Live Music Archive in the hero
                const data = await searchArchive('collection:etree AND mediatype:audio', 1, ['-downloads']);
                if (data && data.response && data.response.docs.length > 0) {
                    setHeroItem(data.response.docs[0]);
                }
            } catch (error) {
                console.error("Failed to fetch hero item for Audiothek:", error);
            } finally {
                setIsHeroLoading(false);
            }
        };

        const fetchShelves = async () => {
            setAreShelvesLoading(true);
            try {
                const promises = curatedShelves.map(c => searchArchive(c.query, 1, c.sorts, undefined, 15));
                const results = await Promise.all(promises);
                
                const shelvesData = results.reduce((acc, result, index) => {
                    const shelfId = curatedShelves[index].id;
                    if (result && result.response && Array.isArray(result.response.docs)) {
                        acc[shelfId] = result.response.docs;
                    } else {
                        acc[shelfId] = [];
                    }
                    return acc;
                }, {} as ShelfResults);
                
                setShelves(shelvesData);

            } catch (error) {
                console.error("Failed to fetch shelves for Audiothek:", error);
            } finally {
                 setAreShelvesLoading(false);
            }
        };

        fetchHero();
        fetchShelves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t]); // Re-fetch on language change

    return (
        <div className="space-y-12 animate-fade-in">
            <AudiothekHero item={heroItem} isLoading={isHeroLoading} onSearch={handleCategorySearch} />
            <CategoryGrid onSearch={handleCategorySearch} />
            
            {curatedShelves.map(shelfInfo => {
                const items = shelves[shelfInfo.id] || [];
                if (!areShelvesLoading && items.length === 0) return null;
                
                return (
                    <ContentCarousel
                        key={shelfInfo.id}
                        title={shelfInfo.title}
                        items={items}
                        isLoading={areShelvesLoading}
                        onSelectItem={onSelectItem}
                        cardAspectRatio='square'
                    />
                );
            })}
        </div>
    );
};