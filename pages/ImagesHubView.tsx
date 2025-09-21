import React, { useState, useEffect, useCallback } from 'react';
import type { ArchiveItemSummary } from '../types';
import { searchArchive, getItemCount } from '../services/archiveService';
import { useSearchAndGo } from '../hooks/useSearchAndGo';
import { useLanguage } from '../hooks/useLanguage';
import { SkeletonCard } from '../components/SkeletonCard';
import { ArtIcon, HistoryIcon, ScienceIcon } from '../components/Icons';
import { MediaType, AIGenerationType } from '../types';
import { useArchivalItems } from '../hooks/useArchivalItems';
import { AIInsightPanel } from '../components/AIInsightPanel';
import { generateMuseumExhibitConcept } from '../services/geminiService';

// --- Sub-Components ---

const HeroGallery: React.FC = () => {
    const [images, setImages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchHeroImages = async () => {
            try {
                const data = await searchArchive('collection:nasa AND mediatype:image', 1, ['-week'], undefined, 10);
                if (data.response?.docs) {
                    const urls = data.response.docs.map(item => `https://archive.org/services/get-item-image.php?identifier=${item.identifier}`);
                    setImages(urls);
                }
            } catch (error) {
                console.error("Failed to fetch hero images", error);
            }
        };
        fetchHeroImages();
    }, []);

    useEffect(() => {
        if (images.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images]);

    if (images.length === 0) {
        return <div className="absolute inset-0 bg-gray-900 animate-pulse z-[-1]"></div>;
    }

    return (
        <div className="absolute inset-0 z-[-1] overflow-hidden bg-black">
            {images.map((src, index) => (
                <img
                    key={src}
                    src={src}
                    alt=""
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-40' : 'opacity-0'}`}
                />
            ))}
        </div>
    );
};

interface GalleryCardProps {
    collection: { key: string; title: string; desc: string; icon: React.ReactNode, query: string };
}

const GalleryCard: React.FC<GalleryCardProps> = ({ collection }) => {
    const [data, setData] = useState<{ thumbnailUrl: string; itemCount: number; identifier: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const searchAndGo = useSearchAndGo();
    const { language } = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [itemData, count] = await Promise.all([
                    searchArchive(collection.query, 1, ['-random'], undefined, 1),
                    getItemCount(collection.query)
                ]);

                if (itemData.response?.docs[0]) {
                    const item = itemData.response.docs[0];
                    setData({
                        thumbnailUrl: `https://archive.org/services/get-item-image.php?identifier=${item.identifier}`,
                        itemCount: count,
                        identifier: item.identifier,
                    });
                }
            } catch (error) {
                console.error(`Failed to fetch data for ${collection.title}`, error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [collection.query, collection.title]);

    const handleSearch = () => {
        searchAndGo(collection.query, { mediaType: new Set([MediaType.Image]) });
    };

    if (isLoading) {
        return (
            <div className="bg-gray-800/60 rounded-xl p-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-700 rounded-full mb-4"></div>
                <div className="h-5 w-3/4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-700 rounded mb-4"></div>
                <div className="aspect-square bg-gray-700 rounded-lg"></div>
            </div>
        );
    }
    
    if (!data) return null;

    return (
        <button
            onClick={handleSearch}
            className="bg-gray-800/60 p-4 rounded-xl text-left hover:bg-gray-700/80 transition-all duration-300 group flex flex-col h-full"
        >
            <div className="flex-shrink-0">
                <div className="text-accent-400 w-12 h-12 flex items-center justify-center bg-gray-900/50 rounded-full group-hover:bg-accent-500/20 transition-colors">
                    {collection.icon}
                </div>
                <h3 className="mt-4 font-bold text-lg text-white">{collection.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{collection.desc}</p>
                <p className="text-xs font-semibold bg-gray-700 text-accent-300 px-2 py-0.5 rounded-full inline-block">
                    {data.itemCount.toLocaleString(language)} items
                </p>
            </div>
            <div className="flex-grow mt-4 relative aspect-square rounded-lg overflow-hidden">
                 <img
                    src={data.thumbnailUrl}
                    alt={collection.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const fallbackUrl = `https://archive.org/download/${data.identifier}/__ia_thumb.jpg`;
                        const placeholderUrl = 'https://picsum.photos/400/400?grayscale';
                        if (target.src.includes('__ia_thumb.jpg')) {
                            target.onerror = null;
                            target.src = placeholderUrl;
                        } else {
                            target.src = fallbackUrl;
                        }
                    }}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
        </button>
    );
};

const getCollections = (t: (key: string) => string) => [
    { key: 'met', title: t('imagesHub:collections.met'), desc: t('imagesHub:collections.metDesc'), icon: <ArtIcon />, query: 'collection:metropolitanmuseumofart-gallery' },
    { key: 'nasa', title: t('imagesHub:collections.nasa'), desc: t('imagesHub:collections.nasaDesc'), icon: <ScienceIcon />, query: 'collection:nasa' },
    { key: 'brooklyn', title: t('imagesHub:collections.brooklyn'), desc: t('imagesHub:collections.brooklynDesc'), icon: <HistoryIcon />, query: 'collection:brooklynmuseum' },
];

// --- Main Component ---
const ImagesHubView: React.FC = () => {
    const { t } = useLanguage();
    const collections = getCollections(t);
    const { items: metItems } = useArchivalItems(collections[0].query);
    
    return (
        <div className="space-y-12 animate-page-fade-in">
            <header className="relative text-center rounded-xl min-h-[40vh] flex flex-col justify-center items-center text-white p-6 overflow-hidden">
                <HeroGallery />
                <div className="relative z-10">
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-shadow-lg">{t('imagesHub:title')}</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-200 text-shadow">{t('imagesHub:description')}</p>
                </div>
            </header>
            
            <AIInsightPanel
                title={t('imagesHub:aiInsight.title')}
                description={t('imagesHub:aiInsight.description')}
                buttonLabel={t('imagesHub:aiInsight.button')}
                items={metItems}
                generationFn={generateMuseumExhibitConcept}
                generationType={AIGenerationType.ImagesInsight}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {collections.map(collection => (
                    <GalleryCard key={collection.key} collection={collection} />
                ))}
            </div>
        </div>
    );
};

// FIX: Add default export for React.lazy() to work correctly.
export default ImagesHubView;
