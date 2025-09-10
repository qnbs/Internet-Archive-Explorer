import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResultsGrid } from '../components/ResultsGrid';
import { useDebounce } from '../hooks/useDebounce';
import { searchArchive } from '../services/archiveService';
import type { ArchiveItemSummary } from '../types';
import { MediaType as MediaTypeValue } from '../types';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useSearch, Facets } from '../contexts/SearchContext';
import { OnThisDay } from '../components/OnThisDay';
// FIX: Replaced SmallItemCard with CarouselItemCard
import { CarouselItemCard } from '../components/CarouselItemCard';
import { TrendingIcon, ChevronDownIcon, CloseIcon, FilterIcon } from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';

// --- TYPES ---
interface ExplorerViewProps {
    onSelectItem: (item: ArchiveItemSummary) => void;
}

// --- SUB-COMPONENTS ---
const TrendingNow: React.FC<{ onSelectItem: (item: ArchiveItemSummary) => void }> = ({ onSelectItem }) => {
    const [items, setItems] = useState<ArchiveItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchTrending = async () => {
            setIsLoading(true);
            try {
                const query = 'mediatype:(movies OR audio OR image OR texts OR software)';
                const data = await searchArchive(query, 1, ['-week']);
                if (data.response?.docs) {
                    setItems(data.response.docs.slice(0, 15));
                }
            } catch (error) {
                console.error("Failed to fetch trending items:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrending();
    }, []);

    if (isLoading || items.length === 0) return null;

    return (
        <div className="bg-gray-200/50 dark:bg-gray-800/60 p-4 rounded-xl shadow-lg animate-fade-in">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <TrendingIcon className="w-5 h-5 mr-2 text-cyan-600 dark:text-cyan-400" />
                    {t('explorer.trending')}
                </h3>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 -mb-4">
                {/* FIX: Replaced SmallItemCard with CarouselItemCard and added necessary props */}
                {items.map((item, index) => (
                    <CarouselItemCard key={item.identifier} item={item} onSelect={onSelectItem} aspectRatio="portrait" index={index} />
                ))}
            </div>
        </div>
    );
};

const ThematicSearch: React.FC = () => {
    const { searchAndGo } = useSearch();
    const { t } = useLanguage();
    
    const THEMATIC_SEARCHES = useMemo(() => [
      { label: t('explorer.searches.classicFilms'), query: "collection:feature_films", mediaType: MediaTypeValue.Movies },
      { label: t('explorer.searches.cultFilms'), query: "subject:\"cult film\"", mediaType: MediaTypeValue.Movies },
      { label: t('explorer.searches.tedTalks'), query: "collection:tedtalks", mediaType: MediaTypeValue.Movies },
      { label: t('explorer.searches.liveConcerts'), query: "collection:etree", mediaType: MediaTypeValue.Audio },
      { label: t('explorer.searches.nasaImages'), query: "collection:nasa", mediaType: MediaTypeValue.Image },
      { label: t('explorer.searches.msDosGames'), query: "collection:softwarelibrary_msdos_games", mediaType: MediaTypeValue.Software },
      { label: t('explorer.searches.audiobooks'), query: "collection:librivoxaudio", mediaType: MediaTypeValue.Audio },
    ], [t]);

    const handleThematicSearch = (query: string, mediaType: MediaTypeValue) => {
        searchAndGo(query, { mediaType: new Set([mediaType]) });
    };

    return (
        <div className="bg-gray-200/50 dark:bg-gray-800/60 p-4 rounded-xl shadow-lg animate-fade-in">
             <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{t('explorer.quickSearch')}</h3>
             <div className="flex flex-wrap gap-3">
                {THEMATIC_SEARCHES.map(theme => (
                    <button 
                        key={theme.label}
                        onClick={() => handleThematicSearch(theme.query, theme.mediaType)}
                        className="px-4 py-2 text-sm font-medium rounded-full transition-colors bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-600"
                    >
                        {theme.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const FilterBar: React.FC<{
    sort: string;
    setSort: (s: string) => void;
    facets: Facets;
    setFacets: React.Dispatch<React.SetStateAction<Facets>>;
}> = ({ sort, setSort, facets, setFacets }) => {
    const { t } = useLanguage();
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    const SORT_OPTIONS = useMemo(() => ({
        '-downloads': t('explorer.sortPopular'),
        '-publicdate': t('explorer.sortNewest'),
        'publicdate': t('explorer.sortOldest'),
        'titleSorter': t('explorer.sortTitle'),
    }), [t]);

    const MEDIA_TYPE_FILTERS = useMemo(() => ([
        { id: MediaTypeValue.Movies, label: t('bottomNav.movies') },
        { id: MediaTypeValue.Audio, label: t('bottomNav.audio') },
        { id: MediaTypeValue.Texts, label: t('bottomNav.books') },
        { id: MediaTypeValue.Image, label: t('bottomNav.images') },
        { id: MediaTypeValue.Software, label: t('sideMenu.recRoom') },
    ]), [t]);

    const handleMediaTypeToggle = (mediaType: MediaTypeValue) => {
        setFacets(prev => {
            const newSet = new Set(prev.mediaType);
            if (newSet.has(mediaType)) newSet.delete(mediaType);
            else newSet.add(mediaType);
            return { ...prev, mediaType: newSet };
        });
    };

    const removeFacet = (facetType: keyof Facets, value?: any) => {
        setFacets(prev => {
            if (facetType === 'mediaType') {
                const newSet = new Set(prev.mediaType);
                newSet.delete(value);
                return { ...prev, mediaType: newSet };
            }
            const newFacets = { ...prev };
            delete newFacets[facetType];
            return newFacets;
        });
    };

    const activeFilters = useMemo(() => {
        const filters = [];
        for (const type of facets.mediaType) {
            filters.push({
                label: `${t('searchPopover.mediaType')}: ${type}`,
                action: () => removeFacet('mediaType', type),
            });
        }
        if (facets.yearStart || facets.yearEnd) {
            filters.push({
                label: `${t('searchPopover.yearRange')}: ${facets.yearStart || '*'} - ${facets.yearEnd || '*'}`,
                action: () => { 
                    setFacets(prev => ({...prev, yearStart: undefined, yearEnd: undefined}));
                }
            });
        }
        if (facets.collection) {
            filters.push({
                label: `${t('searchPopover.collection')}: ${facets.collection}`,
                action: () => removeFacet('collection'),
            });
        }
        return filters;
    }, [facets, t, setFacets]);

    return (
        <div className="bg-gray-200/50 dark:bg-gray-800/60 p-4 rounded-xl shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    {MEDIA_TYPE_FILTERS.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => handleMediaTypeToggle(filter.id)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                facets.mediaType.has(filter.id)
                                    ? 'bg-cyan-500 text-white shadow-sm'
                                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-grow min-w-[150px]">
                        <select value={sort} onChange={e => setSort(e.target.value)} aria-label={t('explorer.aria.sortBy')} className="w-full h-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors appearance-none pr-8">
                            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    </div>
                    <button onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} className="p-2.5 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600" aria-expanded={isAdvancedOpen}>
                        <FilterIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            {isAdvancedOpen && (
                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-gray-300 dark:border-gray-700 animate-fade-in">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('searchPopover.yearRange')}</label>
                        <div className="flex items-center gap-2">
                            <input type="number" placeholder={t('searchPopover.from')} aria-label={t('searchPopover.from')} value={facets.yearStart || ''} onChange={e => setFacets({...facets, yearStart: e.target.value})} className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500" />
                            <span className="text-gray-500">-</span>
                            <input type="number" placeholder={t('searchPopover.to')} aria-label={t('searchPopover.to')} value={facets.yearEnd || ''} onChange={e => setFacets({...facets, yearEnd: e.target.value})} className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="collection-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('searchPopover.collection')}</label>
                        <input id="collection-filter" type="text" placeholder={t('searchPopover.collectionPlaceholder')} aria-label={t('searchPopover.collection')} value={facets.collection || ''} onChange={e => setFacets({...facets, collection: e.target.value})} className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                </div>
            )}
             {activeFilters.length > 0 && (
                <div className="pt-4 border-t border-gray-300 dark:border-gray-700 flex flex-wrap items-center gap-2">
                    {activeFilters.map((filter, index) => (
                        <span key={index} className="flex items-center gap-1.5 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 text-xs font-semibold px-2 py-1 rounded-full">
                            {filter.label}
                            <button onClick={filter.action} className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-200">
                                <CloseIcon className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    <button onClick={() => setFacets({ mediaType: new Set() })} className="text-xs text-gray-500 dark:text-gray-400 hover:underline ml-2">{t('common.reset')}</button>
                </div>
            )}
        </div>
    );
};


// --- MAIN COMPONENT ---
export const ExplorerView: React.FC<ExplorerViewProps> = ({ onSelectItem }) => {
  const { searchQuery, facets, setFacets } = useSearch();
  const { t } = useLanguage();
  
  const [sort, setSort] = useState<string>('-downloads');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<ArchiveItemSummary[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const constructedQuery = useMemo(() => {
    const parts: string[] = [];
    
    if (searchQuery.trim()) {
      const trimmedQuery = searchQuery.trim();
      const isStructuredQuery = /[:"()\[\]]/.test(trimmedQuery) || trimmedQuery.includes(' AND ') || trimmedQuery.includes(' OR ') || trimmedQuery.includes(' NOT ');

      if (isStructuredQuery) {
          parts.push(`(${trimmedQuery})`);
      } else {
          const boostedQuery = `(title:(${trimmedQuery})^2 OR (${trimmedQuery}))`;
          parts.push(boostedQuery);
      }
    }
    
    if (facets.mediaType.size > 0) parts.push(`mediatype:(${Array.from(facets.mediaType).join(' OR ')})`);
    if (facets.yearStart || facets.yearEnd) parts.push(`publicdate:[${facets.yearStart || '*'} TO ${facets.yearEnd || '*'}]`);
    if (facets.collection?.trim()) parts.push(`collection:("${facets.collection.trim()}")`);

    return parts.join(' AND ');
  }, [searchQuery, facets]);

  const finalQuery = useDebounce(constructedQuery, 400);
  const isSearching = useMemo(() => finalQuery !== '' && finalQuery !== 'featured', [finalQuery]);

  const performSearch = useCallback(async (searchQuery: string, searchPage: number, currentSort: string) => {
    if (searchPage === 1) setIsLoading(true); else setIsLoadingMore(true);
    setError(null);

    try {
      const data = await searchArchive(searchQuery, searchPage, [currentSort]);
      if (data && data.response && Array.isArray(data.response.docs)) {
        setTotalResults(data.response.numFound);
        setResults(prev => searchPage === 1 ? data.response.docs : [...prev, ...data.response.docs]);
      } else {
        setTotalResults(0);
        setResults(prev => searchPage === 1 ? [] : prev);
      }
    } catch (err) {
      setError(t('common.error'));
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [t]);
  
  useEffect(() => {
    setPage(1);
    performSearch(finalQuery || 'featured', 1, sort);
  }, [finalQuery, sort, performSearch]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || isLoadingMore) return;
    setPage(prevPage => {
        const nextPage = prevPage + 1;
        performSearch(finalQuery, nextPage, sort);
        return nextPage;
    });
  }, [isLoading, isLoadingMore, performSearch, finalQuery, sort]);

  const hasMore = !isLoading && results.length < totalResults;
  const lastElementRef = useInfiniteScroll({
    isLoading: isLoadingMore,
    hasMore,
    onLoadMore: handleLoadMore,
    rootMargin: '400px'
  });

  return (
    <div className="space-y-6">
        {!isSearching && (
            <div className="space-y-6">
                <TrendingNow onSelectItem={onSelectItem} />
                <OnThisDay onSelectItem={onSelectItem} />
                <ThematicSearch />
            </div>
        )}
        
        {isSearching && (
            <FilterBar sort={sort} setSort={setSort} facets={facets} setFacets={setFacets} />
        )}

        <ResultsGrid
            results={results}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            error={error}
            onSelectItem={onSelectItem}
            hasMore={hasMore}
            totalResults={totalResults}
            lastElementRef={lastElementRef}
        />
    </div>
  );
};