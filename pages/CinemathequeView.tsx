import React, { useState, useEffect } from 'react';
import type { ArchiveItemSummary } from '../types';
import { searchArchive } from '../services/archiveService';
import { HeroSection } from '../components/cinematheque/HeroSection';
import { useLanguage } from '../contexts/LanguageContext';
import { ContentCarousel } from '../components/ContentCarousel';

interface CinemathequeViewProps {
    onSelectItem: (item: ArchiveItemSummary) => void;
}

type CollectionResults = Record<string, ArchiveItemSummary[]>;

export const CinemathequeView: React.FC<CinemathequeViewProps> = ({ onSelectItem }) => {
    const { t } = useLanguage();
    const [heroItem, setHeroItem] = useState<ArchiveItemSummary | null>(null);
    const [isHeroLoading, setIsHeroLoading] = useState(true);

    const [collections, setCollections] = useState<CollectionResults>({});
    const [areCollectionsLoading, setAreCollectionsLoading] = useState(true);

    const curatedCollections = [
        { id: 'prelinger', title: t('cinematheque.collections.prelinger'), query: 'collection:prelinger AND mediatype:movies', sorts: ['-downloads'] },
        { id: 'film_noir', title: t('cinematheque.collections.film_noir'), query: 'subject:"film noir" AND mediatype:movies', sorts: ['-downloads'] },
        { id: 'sci_fi', title: t('cinematheque.collections.sci_fi'), query: '(subject:"science fiction" OR subject:"sci-fi") AND mediatype:movies', sorts: ['-downloads'] },
        { id: 'comedy', title: t('cinematheque.collections.comedy'), query: 'subject:comedy AND mediatype:movies', sorts: ['-downloads'] },
        { id: 'silent_films', title: t('cinematheque.collections.silent_films'), query: 'subject:"silent film" AND mediatype:movies', sorts: ['-downloads'] },
        { id: 'animation', title: t('cinematheque.collections.animation'), query: '(collection:animation_and_cartoons OR subject:animation) AND mediatype:movies', sorts: ['-downloads'] },
        { id: 'documentaries', title: t('cinematheque.collections.documentaries'), query: 'subject:documentary AND mediatype:movies', sorts: ['-publicdate'] },
        { id: 'ted_talks', title: t('cinematheque.collections.ted_talks'), query: 'collection:tedtalks AND mediatype:movies', sorts: ['-downloads'] },
        { id: 'tv_commercials', title: t('cinematheque.collections.tv_commercials'), query: 'subject:"television commercials" AND mediatype:movies', sorts: ['-publicdate'] },
        { id: 'newly_added', title: t('cinematheque.collections.newly_added'), query: 'mediatype:movies', sorts: ['-addeddate'] },
    ];

    useEffect(() => {
        const fetchHero = async () => {
            setIsHeroLoading(true);
            try {
                // Fetch a highly downloaded, well-regarded feature film
                const data = await searchArchive('collection:feature_films', 1, ['-downloads']);
                if (data && data.response && data.response.docs.length > 0) {
                    setHeroItem(data.response.docs[0]);
                }
            } catch (error) {
                console.error("Failed to fetch hero item:", error);
            } finally {
                setIsHeroLoading(false);
            }
        };

        const fetchCollections = async () => {
            setAreCollectionsLoading(true);
            try {
                const promises = curatedCollections.map(c => searchArchive(c.query, 1, c.sorts, undefined, 15));
                const results = await Promise.all(promises);
                
                const collectionsData = results.reduce((acc, result, index) => {
                    const collectionId = curatedCollections[index].id;
                    if (result && result.response && Array.isArray(result.response.docs)) {
                        acc[collectionId] = result.response.docs;
                    } else {
                        acc[collectionId] = [];
                    }
                    return acc;
                }, {} as CollectionResults);
                
                setCollections(collectionsData);

            } catch (error) {
                console.error("Failed to fetch collections:", error);
            } finally {
                 setAreCollectionsLoading(false);
            }
        };

        fetchHero();
        fetchCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t]); // Re-fetch collections when language changes to update titles

    return (
        <div className="space-y-12 animate-fade-in">
            <HeroSection item={heroItem} isLoading={isHeroLoading} onSelectItem={onSelectItem} />
            
            {curatedCollections.map(collectionInfo => {
                const items = collections[collectionInfo.id] || [];
                if (!areCollectionsLoading && items.length === 0) return null;
                
                return (
                    <ContentCarousel
                        key={collectionInfo.id}
                        title={collectionInfo.title}
                        items={items}
                        isLoading={areCollectionsLoading}
                        onSelectItem={onSelectItem}
                        cardAspectRatio='video'
                    />
                );
            })}
        </div>
    );
};