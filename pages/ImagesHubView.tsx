import React, { useEffect, useMemo, useState } from 'react';
import { AIInsightPanel } from '@/components/AIInsightPanel';
import { ArtIcon, HistoryIcon, ScienceIcon } from '@/components/Icons';
import { CacheAgeIndicator } from '@/components/ui/CacheAgeIndicator';
import { useArchivalItems } from '@/hooks/useArchivalItems';
import { useLanguage } from '@/hooks/useLanguage';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useSearchAndGo } from '@/hooks/useSearchAndGo';
import { getItemCount } from '@/services/archiveService';
import { generateMuseumExhibitConcept } from '@/services/geminiService';
import { AIGenerationType, MediaType } from '@/types';

const HERO_QUERY = 'collection:nasa AND mediatype:image';

const HeroGallery: React.FC = () => {
  const { items, isLoading, offlineCachedAt } = useArchivalItems(HERO_QUERY, 10, ['-week']);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = useMemo(
    () =>
      items.map(
        (item) => `https://archive.org/services/get-item-image.php?identifier=${item.identifier}`,
      ),
    [items],
  );

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images]);

  if (isLoading && images.length === 0) {
    return <div className="absolute inset-0 bg-gray-900 animate-pulse z-[-1]" />;
  }

  if (images.length === 0) {
    return <div className="absolute inset-0 bg-gray-900 z-[-1]" />;
  }

  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden bg-black">
      {offlineCachedAt ? (
        <div className="absolute top-3 right-3 z-10">
          <CacheAgeIndicator cacheTimeMs={offlineCachedAt} />
        </div>
      ) : null}
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
  collection: { key: string; title: string; desc: string; icon: React.ReactNode; query: string };
}

const GalleryCard: React.FC<GalleryCardProps> = ({ collection }) => {
  const {
    items,
    isLoading,
    offlineCachedAt,
    numFound: cachedNumFound,
  } = useArchivalItems(collection.query, 1, ['-random']);
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const searchAndGo = useSearchAndGo();
  const { language } = useLanguage();
  const online = useOnlineStatus();

  useEffect(() => {
    if (!online) {
      setLiveCount(null);
      return;
    }
    let cancelled = false;
    void getItemCount(collection.query)
      .then((count) => {
        if (!cancelled) setLiveCount(count);
      })
      .catch(() => {
        if (!cancelled) setLiveCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [collection.query, online]);

  const handleSearch = () => {
    searchAndGo(collection.query, { mediaType: new Set([MediaType.Image]) });
  };

  const item = items[0];
  const itemCount = liveCount ?? cachedNumFound;

  if (isLoading) {
    return (
      <div className="bg-gray-800/60 rounded-xl p-4 animate-pulse">
        <div className="w-12 h-12 bg-gray-700 rounded-full mb-4" />
        <div className="h-5 w-3/4 bg-gray-700 rounded mb-2" />
        <div className="h-4 w-1/2 bg-gray-700 rounded mb-4" />
        <div className="aspect-square bg-gray-700 rounded-lg" />
      </div>
    );
  }

  if (!item) return null;

  const thumbnailUrl = `https://archive.org/services/get-item-image.php?identifier=${item.identifier}`;

  return (
    <button
      type="button"
      onClick={handleSearch}
      className="bg-gray-900 border border-gray-700/50 p-4 rounded-xl text-left hover:bg-gray-800 transition-all duration-300 group flex flex-col h-full shadow-sm"
    >
      <div className="flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="text-accent-400 w-12 h-12 flex items-center justify-center bg-gray-900/50 rounded-full group-hover:bg-accent-500/20 transition-colors">
            {collection.icon}
          </div>
          {offlineCachedAt ? <CacheAgeIndicator cacheTimeMs={offlineCachedAt} /> : null}
        </div>
        <h3 className="mt-4 font-bold text-lg text-white">{collection.title}</h3>
        <p className="text-sm text-gray-400 mb-2">{collection.desc}</p>
        {itemCount != null ? (
          <p className="text-xs font-semibold bg-gray-700 text-accent-300 px-2 py-0.5 rounded-full inline-block">
            {itemCount.toLocaleString(language)} items
          </p>
        ) : null}
      </div>
      <div className="flex-grow mt-4 relative aspect-square rounded-lg overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={collection.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const fallbackUrl = `https://archive.org/download/${item.identifier}/__ia_thumb.jpg`;
            const placeholderUrl = 'https://picsum.photos/400/400?grayscale';
            if (target.src.includes('__ia_thumb.jpg')) {
              target.onerror = null;
              target.src = placeholderUrl;
            } else {
              target.src = fallbackUrl;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
    </button>
  );
};

const getCollections = (t: (key: string) => string) => [
  {
    key: 'met',
    title: t('imagesHub:collections.met'),
    desc: t('imagesHub:collections.metDesc'),
    icon: <ArtIcon />,
    query: 'collection:metropolitanmuseumofart-gallery',
  },
  {
    key: 'nasa',
    title: t('imagesHub:collections.nasa'),
    desc: t('imagesHub:collections.nasaDesc'),
    icon: <ScienceIcon />,
    query: 'collection:nasa',
  },
  {
    key: 'brooklyn',
    title: t('imagesHub:collections.brooklyn'),
    desc: t('imagesHub:collections.brooklynDesc'),
    icon: <HistoryIcon />,
    query: 'collection:brooklynmuseum',
  },
];

const ImagesHubView: React.FC = () => {
  const { t } = useLanguage();
  const collections = getCollections(t);
  const { items: metItems } = useArchivalItems(collections[0].query);

  return (
    <div
      className="space-y-12 animate-page-fade-in"
      role="region"
      aria-label={t('sideMenu:imagesHub')}
    >
      <header className="relative text-center rounded-xl min-h-[40vh] flex flex-col justify-center items-center text-white p-6 overflow-hidden">
        <HeroGallery />
        <div className="absolute inset-0 z-0 bg-gray-900/55 pointer-events-none" aria-hidden />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-shadow-lg text-white">
            {t('imagesHub:title')}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-100 text-shadow">
            {t('imagesHub:description')}
          </p>
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
        {collections.map((collection) => (
          <GalleryCard key={collection.key} collection={collection} />
        ))}
      </div>
    </div>
  );
};

export default ImagesHubView;
