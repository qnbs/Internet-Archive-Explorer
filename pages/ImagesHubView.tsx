

import React, { useState, useEffect, FormEvent } from 'react';
import { searchArchive } from '../services/archiveService';
import { MediaType as MediaTypeValue } from '../types';
import { useSearch } from '../contexts/SearchContext';
import { useLanguage } from '../contexts/LanguageContext';

// Icons for themes, defined locally for simplicity
const ArtIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>;
const ScienceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.22 5.22a.75.75 0 011.06 0L7.5 6.44a.75.75 0 01-1.06 1.06L5.22 6.28a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zM5.22 14.78a.75.75 0 010-1.06l1.22-1.22a.75.75 0 011.06 1.06l-1.22 1.22a.75.75 0 01-1.06 0zM10 18a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5A.75.75 0 0110 18zM14.78 14.78a.75.75 0 01-1.06 0l-1.22-1.22a.75.75 0 011.06-1.06l1.22 1.22a.75.75 0 010 1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010 1.5h1.5A.75.75 0 0118 10zM14.78 5.22a.75.75 0 010 1.06l-1.22 1.22a.75.75 0 01-1.06-1.06l1.22-1.22a.75.75 0 011.06 0z" /><path fillRule="evenodd" d="M10 5a5 5 0 100 10 5 5 0 000-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" clipRule="evenodd" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.884 5.5 7.25 5.5s.738.23 1.006.527c.269.296.442.668.442 1.073 0 .405-.173.777-.442 1.073-.268.296-.636.527-1.006.527-.366 0-.738-.23-1.006-.527a6.01 6.01 0 01-1.912-2.706zM10 15c-1.385 0-2.74-.236-4.004-.687a.75.75 0 01-.295-1.428C6.918 12.35 8.39 12 10 12s3.082.35 4.3.885a.75.75 0 01-.295 1.428C12.74 14.764 11.385 15 10 15z" clipRule="evenodd" /></svg>;

const SearchIcon: React.FC<{className?: string}> = ({className}) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>);


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

    const FEATURED_COLLECTIONS = [
      { identifier: 'metropolitanmuseumofart-gallery', title: t('imagesHub.collections.met'), description: t('imagesHub.collections.metDesc') },
      { identifier: 'nasa', title: t('imagesHub.collections.nasa'), description: t('imagesHub.collections.nasaDesc') },
      { identifier: 'flickrcommons', title: t('imagesHub.collections.flickr'), description: t('imagesHub.collections.flickrDesc') },
      { identifier: 'USGS_Maps', title: t('imagesHub.collections.usgs'), description: t('imagesHub.collections.usgsDesc') },
    ];
    
    const THEMATIC_CLUSTERS = [
      { title: t('imagesHub.themes.art'), keywords: 'art OR painting OR sculpture', icon: <ArtIcon /> },
      { title: t('imagesHub.themes.science'), keywords: 'science OR technology OR engineering OR astronomy', icon: <ScienceIcon /> },
      { title: t('imagesHub.themes.history'), keywords: 'history OR "historical photograph" OR war', icon: <HistoryIcon /> },
      { title: t('imagesHub.themes.maps'), keywords: 'map OR atlas OR cartography', icon: <MapIcon /> },
    ];

    // Fetch a dynamic hero image on mount
    useEffect(() => {
        const fetchHeroImage = async () => {
            try {
                const data = await searchArchive('collection:nasa AND mediatype:image', 1);
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
                {t('imagesHub.description')}
            </p>
            <form onSubmit={handleFormSubmit} className="mt-8 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                        placeholder={t('imagesHub.searchPlaceholder')}
                        className="w-full bg-gray-800/80 backdrop-blur-sm border-2 border-gray-600 rounded-lg py-3 pl-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    />
                    <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
                >
                    {t('common.search')}
                </button>
            </form>
        </div>
    </div>
    );
    
    const FeaturedCollections = () => (
      <section className="animate-fade-in" style={{animationDelay: '150ms'}}>
        <h2 className="text-3xl font-bold mb-6 text-white">{t('imagesHub.featuredCollections')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURED_COLLECTIONS.map(collection => {
            const data = collectionsData[collection.identifier];
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
                      {data ? (
                          <img src={data.thumbnailUrl} alt={collection.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                          <div className="w-full h-full bg-gray-700 animate-pulse"></div>
                      )}
                  </div>
                  <div>
                      <h3 className="text-lg font-bold text-cyan-400">{collection.title}</h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-3">{collection.description}</p>
                      {data ? <p className="text-xs text-gray-500 mt-2">{t('common.itemsFound', { count: data.itemCount, formattedCount: data.itemCount.toLocaleString(language) })}</p> : <div className="h-3 w-16 bg-gray-700 rounded-full mt-2 animate-pulse"></div>}
                  </div>
              </div>
            );
          })}
        </div>
      </section>
    );

    const ThematicClusters = () => (
      <section className="animate-fade-in" style={{animationDelay: '300ms'}}>
        <h2 className="text-3xl font-bold mb-6 text-white">{t('imagesHub.discoverByTheme')}</h2>
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