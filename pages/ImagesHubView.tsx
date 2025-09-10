
import React, { useState, useEffect, FormEvent } from 'react';
import { searchArchive } from '../services/archiveService';
import { MediaType as MediaTypeValue } from '../types';
import { useSearch } from '../contexts/SearchContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ArtIcon, ScienceIcon, HistoryIcon, MapIcon, SearchIcon } from '../components/Icons';
import { SkeletonCard } from '../components/SkeletonCard';

interface CollectionData {
  identifier: string;
  itemCount: number;
  thumbnailUrl: string;
}

export const ImagesHubView: React.FC = () => {
    const { searchAndGo } = useSearch();
    const { t, language } = useLanguage();
    const [localQuery, setLocalQuery] = useState('');
    const [heroImage, setHeroImage] = useState<string | null>(null);
    const [collectionsData, setCollectionsData] = useState<Record<string, CollectionData>>({});
    const [isLoadingCollections, setIsLoadingCollections] = useState(true);

    const FEATURED_COLLECTIONS = [
      { identifier: 'metropolitanmuseumofart-gallery', title: t('imagesHub:collections.met'), description: t('imagesHub:collections.metDesc') },
      { identifier: 'nasa', title: t('imagesHub:collections.nasa'), description: t('imagesHub:collections.nasaDesc') },
      { identifier: 'flickrcommons', title: t('imagesHub:collections.flickr'), description: t('imagesHub:collections.flickrDesc') },
      { identifier: 'USGS_Maps', title: t('imagesHub:collections.usgs'), description: t('imagesHub:collections.usgsDesc') },
    ];
    
    const THEMATIC_CLUSTERS = [
      { title: t('imagesHub:themes.art'), keywords: 'art OR painting OR sculpture', icon: <ArtIcon /> },
      { title: t('imagesHub:themes.science'), keywords: 'science OR technology OR engineering OR astronomy', icon: <ScienceIcon /> },
      { title: t('imagesHub:themes.history'), keywords: 'history OR "historical photograph" OR war', icon: <HistoryIcon /> },
      { title: t('imagesHub:themes.maps'), keywords: 'map OR atlas OR cartography', icon: <MapIcon /> },
    ];

    // Fetch a dynamic hero image on mount
    useEffect(() => {
        const fetchHeroImage = async () => {
            try {
                const data = await searchArchive('collection:nasa AND mediatype:image', 1, ['-week'], undefined, 20);
                if (data && data.response && data.response.docs.length > 0) {
                    const randomItem = data.response.docs[Math.floor(Math.random() * data.response.docs.length)];
                    setHeroImage(`https://archive.org/services/get-item-image.php?identifier=${randomItem.identifier}`);
                } else {
                    throw new Error("No images found in NASA collection");
                }
            } catch (error) {
                console.error("Failed to fetch hero image", error);
                setHeroImage('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop'); // Fallback
            }
        };
        fetchHeroImage();
    }, []);

    // Fetch data for featured collections
    useEffect(() => {
        const fetchCollectionsData = async () => {
            setIsLoadingCollections(true);
            const dataPromises = FEATURED_COLLECTIONS.map(async (collection) => {
                try {
                    const data = await searchArchive(`collection:${collection.identifier} AND mediatype:${MediaTypeValue.Image}`, 1);
                    if (data && data.response && Array.isArray(data.response.docs)) {
                        const thumbnailUrl = data.response.docs.length > 0
                            ? `https://archive.org/services/get-item-image.php?identifier=${data.response.docs[0].identifier}`
                            : 'https://picsum.photos/400/300?grayscale';
                        return {
                            identifier: collection.identifier,
                            itemCount: data.response.numFound,
                            thumbnailUrl,
                        };
                    }
                    return null;
                } catch (error) {
                    console.error(`Failed to fetch data for ${collection.identifier}`, error);
                    return null;
                }
            });

            const results = await Promise.all(dataPromises);
            const dataMap = results.reduce((acc, data) => {
                if (data) {
                    acc[data.identifier] = data;
                }
                return acc;
            }, {} as Record<string, CollectionData>);
            setCollectionsData(dataMap);
            setIsLoadingCollections(false);
        };
        fetchCollectionsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t]); // Re-fetch if language changes to update descriptions
    
    const handleSearch = (query: string) => {
        searchAndGo(query, {mediaType: new Set([MediaTypeValue.Image])});
    }

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (localQuery.trim()) {
            handleSearch(localQuery);
        }
    };

    const HeroSection = () => (
      <div className="relative rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center text-center p-8 sm:p-16 min-h-[50vh] animate-fade-in">
        {heroImage ? (
            <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        ) : <div className="absolute inset-0 bg-gray-900 animate-pulse"></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>

        <div className="relative z-10 w-full max-w-2xl">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
                The <span className="text-cyan-400">Images Hub</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">
                {t('imagesHub:description')}
            </p>
            <form onSubmit={handleFormSubmit} className="mt-8 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                        placeholder={t('imagesHub:searchPlaceholder')}
                        className="w-full bg-gray-800/80 backdrop-blur-sm border-2 border-gray-600 rounded-lg py-3 pl-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    />
                    <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
                >
                    {t('common:search')}
                </button>
            </form>
        </div>
    </div>
    );
    
    const FeaturedCollections = () => (
      <section className="animate-fade-in" style={{animationDelay: '150ms'}}>
        <h2 className="text-3xl font-bold mb-6 text-white">{t('imagesHub:featuredCollections')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoadingCollections ? 
             Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg flex items-center space-x-4 p-4 animate-pulse">
                    <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-md bg-gray-700"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-5 w-3/4 bg-gray-700 rounded-full"></div>
                        <div className="h-3 w-full bg-gray-700 rounded-full"></div>
                        <div className="h-3 w-5/6 bg-gray-700 rounded-full"></div>
                        <div className="h-3 w-1/4 bg-gray-700 rounded-full pt-2"></div>
                    </div>
                </div>
             ))
          : FEATURED_COLLECTIONS.map(collection => {
            const data = collectionsData[collection.identifier];
            if (!data) return null;
            return (
              <div
                  key={collection.identifier}
                  onClick={() => handleSearch(`collection:${collection.identifier}`)}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group flex items-center space-x-4 p-4"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSearch(`collection:${collection.identifier}`)}
                  aria-label={`Explore the ${collection.title} collection`}
              >
                  <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden">
                    <img src={data.thumbnailUrl} alt={collection.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                      <h3 className="text-lg font-bold text-cyan-400">{collection.title}</h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-3">{collection.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{t('common:itemsFound_other', { count: data.itemCount, formattedCount: data.itemCount.toLocaleString(language) })}</p>
                  </div>
              </div>
            );
          })}
        </div>
      </section>
    );

    const ThematicClusters = () => (
      <section className="animate-fade-in" style={{animationDelay: '300ms'}}>
        <h2 className="text-3xl font-bold mb-6 text-white">{t('imagesHub:discoverByTheme')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {THEMATIC_CLUSTERS.map(theme => (
             <div
                key={theme.title}
                onClick={() => handleSearch(theme.keywords)}
                className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col items-center justify-center text-center"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSearch(theme.keywords)}
                aria-label={`Search for images related to ${theme.title}`}
              >
                  <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
                    {theme.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{theme.title}</h3>
              </div>
          ))}
        </div>
      </section>
    );

    return (
        <div className="space-y-12">
            <HeroSection />
            <FeaturedCollections />
            <ThematicClusters />
        </div>
    );
};
