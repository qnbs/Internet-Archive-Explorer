import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResultsGrid } from '../components/ResultsGrid';
import { searchArchive, getReviewsByUploader } from '../services/archiveService';
import type { ArchiveItemSummary, UploaderStats } from '../types';
import { MediaType as MediaTypeValue } from '../types';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { UPLOADER_DATA } from './uploaderData';
import { Spinner } from '../components/Spinner';
import { StarIcon, TotalUploadsIcon, MovieIcon, AudioIcon, BookIcon, ImageIcon, JoystickIcon, ArrowLeftIcon, ExternalLinkIcon, ChevronDownIcon, SortAscendingIcon, SortDescendingIcon, SearchIcon } from '../components/Icons';
import { useUploaderFavorites } from '../contexts/UploaderFavoritesContext';
import { useUploaderStats } from '../hooks/useUploaderStats';
import { useLanguage } from '../contexts/LanguageContext';
import { useDebounce } from '../hooks/useDebounce';
import { ReviewCard } from '../components/ReviewCard';

interface UploaderDetailViewProps {
    uploaderName: string;
    onSelectItem: (item: ArchiveItemSummary) => void;
    onClearUploader: () => void;
}

const UploaderReviews: React.FC<{ uploaderName: string, onSelectItem: (item: ArchiveItemSummary) => void }> = ({ uploaderName, onSelectItem }) => {
    const { t } = useLanguage();
    const [reviews, setReviews] = useState<ArchiveItemSummary[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const performSearch = useCallback(async (searchPage: number) => {
        if (searchPage === 1) setIsLoading(true); else setIsLoadingMore(true);
        setError(null);
        try {
            const data = await getReviewsByUploader(uploaderName, searchPage);
            setTotal(data.response.numFound);
            setReviews(prev => searchPage === 1 ? data.response.docs : [...prev, ...data.response.docs]);
        } catch (err) {
            setError(t('common.error'));
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [uploaderName, t]);
    
    useEffect(() => { performSearch(1); }, [performSearch]);

    const handleLoadMore = useCallback(() => {
        if (isLoading || isLoadingMore) return;
        setPage(prev => {
            const nextPage = prev + 1;
            performSearch(nextPage);
            return nextPage;
        });
    }, [performSearch, isLoading, isLoadingMore]);

    const hasMore = !isLoading && reviews.length < total;
    const lastElementRef = useInfiniteScroll({ isLoading: isLoadingMore, hasMore, onLoadMore: handleLoadMore, rootMargin: '400px' });
    
    if (isLoading) {
        return <div className="flex justify-center mt-8"><Spinner size="lg"/></div>;
    }
    if (error) {
        return <p className="text-center text-red-400 mt-8">{error}</p>;
    }
    if (reviews.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-800/60 rounded-lg">
                <h2 className="text-2xl font-bold text-white">{t('uploaderDetail.noReviews')}</h2>
                <p className="text-gray-400 mt-2">{t('uploaderDetail.noReviewsDesc')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
             <div className="pb-4 border-b border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">{t('common.itemsFound', { count: total, formattedCount: total.toLocaleString() })}</p>
            </div>
            {reviews.map((item, index) => (
                <div key={`${item.identifier}-${item.reviewdate}`} ref={index === reviews.length - 1 ? lastElementRef : undefined}>
                    <ReviewCard item={item} onSelect={onSelectItem} index={index} />
                </div>
            ))}
            {isLoadingMore && <div className="flex justify-center mt-8"><Spinner /></div>}
        </div>
    );
};

const UploaderSidebar: React.FC<{
    uploaderName: string;
    onClearUploader: () => void;
    stats: UploaderStats | null;
    isLoadingStats: boolean;
}> = ({ uploaderName, onClearUploader, stats, isLoadingStats }) => {
    const { t } = useLanguage();
    const { isUploaderFavorite, addUploaderFavorite, removeUploaderFavorite } = useUploaderFavorites();
    
    const uploaderDetails = useMemo(() => UPLOADER_DATA.find(u => u.searchUploader === uploaderName), [uploaderName]);
    const favoriteStatus = isUploaderFavorite(uploaderName);

    const handleFavoriteClick = () => {
        if (favoriteStatus) removeUploaderFavorite(uploaderName);
        else addUploaderFavorite(uploaderName);
    };

    const profileUrl = useMemo(() => {
        if (uploaderDetails?.screenname) return `https://archive.org/details/@${uploaderDetails.screenname}`;
        const screenname = uploaderName.includes('@') ? uploaderName.split('@')[0] : uploaderName.replace(/\s+/g, '_');
        return `https://archive.org/details/@${screenname}`;
    }, [uploaderName, uploaderDetails]);
    
    const statItems = useMemo(() => [
        { type: 'total', count: stats?.total, icon: <TotalUploadsIcon className="w-5 h-5"/>, label: t('uploaderDetail.stats.total') },
        { type: 'movies', count: stats?.movies, icon: <MovieIcon className="w-5 h-5"/>, label: t('uploaderDetail.stats.movies') },
        { type: 'audio', count: stats?.audio, icon: <AudioIcon className="w-5 h-5"/>, label: t('uploaderDetail.stats.audio') },
        { type: 'texts', count: stats?.texts, icon: <BookIcon className="w-5 h-5"/>, label: t('uploaderDetail.stats.texts') },
        { type: 'image', count: stats?.image, icon: <ImageIcon className="w-5 h-5"/>, label: t('uploaderDetail.stats.images') },
        { type: 'software', count: stats?.software, icon: <JoystickIcon className="w-5 h-5"/>, label: t('uploaderDetail.stats.software') },
    ].filter(item => typeof item.count !== 'undefined' && item.count > 0), [stats, t]);

    return (
        <aside className="lg:col-span-1 lg:sticky lg:top-24 space-y-6 self-start">
            <button 
                onClick={onClearUploader}
                className="flex items-center space-x-2 text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>{t('uploaderDetail.backToHub')}</span>
            </button>
            <div className="bg-gray-200/50 dark:bg-gray-800/60 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-start">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white break-words pr-4">{uploaderDetails?.username || uploaderName.split('@')[0]}</h1>
                    <button 
                        onClick={handleFavoriteClick}
                        className="p-2 bg-black/30 rounded-full text-white hover:text-yellow-400 transition-colors flex-shrink-0"
                        aria-label={favoriteStatus ? t('itemCard.removeFavorite') : t('itemCard.addFavorite')}
                    >
                        <StarIcon className="w-6 h-6" filled={favoriteStatus} />
                    </button>
                </div>
                {uploaderDetails && (
                    <div className="mt-4">
                        <span className="text-xs font-semibold bg-gray-700 text-cyan-300 px-3 py-1 rounded-full">{t(`uploaderHub.categories.${uploaderDetails.category}`)}</span>
                        {uploaderDetails.customDescriptionKey ? (
                            <div className="text-gray-600 dark:text-gray-400 mt-3 text-sm" dangerouslySetInnerHTML={{ __html: t(uploaderDetails.customDescriptionKey) }} />
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm">{t(uploaderDetails.descriptionKey)}</p>
                        )}
                    </div>
                )}
                 <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-cyan-600 dark:text-cyan-400 hover:underline mt-4">
                    {t('uploaderDetail.viewProfile')} <ExternalLinkIcon />
                </a>
                <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('uploaderDetail.stats.uploads')}</h2>
                    {isLoadingStats ? <Spinner/> : (
                        <div className="space-y-3">
                            {statItems.map(item => (
                                <div key={item.type} className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                                    <span className="flex items-center gap-2">{item.icon} {item.label}</span>
                                    <span className="font-mono bg-gray-300 dark:bg-gray-700 px-2 py-0.5 rounded-md text-xs">{item.count?.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}

export const UploaderDetailView: React.FC<UploaderDetailViewProps> = ({ uploaderName, onSelectItem, onClearUploader }) => {
    const { t } = useLanguage();
    const { stats, isLoading: isLoadingStats } = useUploaderStats(uploaderName, true);
    const [uploads, setUploads] = useState<ArchiveItemSummary[]>([]);
    const [uploadsPage, setUploadsPage] = useState(1);
    const [uploadsTotal, setUploadsTotal] = useState(0);
    const [isLoadingUploads, setIsLoadingUploads] = useState(true);
    const [isLoadingMoreUploads, setIsLoadingMoreUploads] = useState(false);
    const [uploadSearchTerm, setUploadSearchTerm] = useState('');
    const [sortCriterion, setSortCriterion] = useState('downloads');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [activeMediaType, setActiveMediaType] = useState<MediaTypeValue | 'all'>('all');
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'uploads' | 'reviews'>('uploads');

    const debouncedSearchTerm = useDebounce(uploadSearchTerm, 400);

    const SORT_CRITERIA = useMemo(() => ({
      'downloads': t('uploaderDetail.sortCriteria.downloads'),
      'month': t('uploaderDetail.sortCriteria.month'),
      'publicdate': t('uploaderDetail.sortCriteria.publicdate'),
      'addeddate': t('uploaderDetail.sortCriteria.addeddate'),
    }), [t]);
    
    const DYNAMIC_MEDIA_TYPES = useMemo(() => {
        if (!stats) return [];
        const types = [
            { id: 'all', label: t('uploaderHub.categories.all'), count: stats.total },
            { id: MediaTypeValue.Movies, label: t('bottomNav.movies'), count: stats.movies },
            { id: MediaTypeValue.Audio, label: t('bottomNav.audio'), count: stats.audio },
            { id: MediaTypeValue.Texts, label: t('bottomNav.books'), count: stats.texts },
            { id: MediaTypeValue.Image, label: t('bottomNav.images'), count: stats.image },
            { id: MediaTypeValue.Software, label: t('sideMenu.recRoom'), count: stats.software },
        ];
        return types.filter(t => t.count > 0);
    }, [stats, t]);
    
    const sort = useMemo(() => `${sortDirection === 'desc' ? '-' : ''}${sortCriterion}`, [sortCriterion, sortDirection]);

    const constructedUploadQuery = useMemo(() => {
        let parts = [`uploader:("${uploaderName}")`];
        if(debouncedSearchTerm.trim()) {
            const term = debouncedSearchTerm.trim();
            const boostedQuery = `(title:(${term})^2 OR (${term}))`;
            parts.push(boostedQuery);
        }
        if (activeMediaType !== 'all') {
            parts.push(`mediatype:(${activeMediaType})`);
        }
        return parts.join(' AND ');
    }, [uploaderName, debouncedSearchTerm, activeMediaType]);

    const performUploadsSearch = useCallback(async (page: number, query: string, currentSort: string) => {
        if (page === 1) setIsLoadingUploads(true); else setIsLoadingMoreUploads(true);
        setError(null);
        try {
            const data = await searchArchive(query, page, [currentSort]);
            setUploadsTotal(data.response.numFound);
            setUploads(prev => page === 1 ? data.response.docs : [...prev, ...data.response.docs]);
        } catch (err) {
            setError(t('common.error'));
        } finally {
            setIsLoadingUploads(false);
            setIsLoadingMoreUploads(false);
        }
    }, [t]);

    useEffect(() => {
        if (activeTab === 'uploads') {
            setUploadsPage(1);
            performUploadsSearch(1, constructedUploadQuery, sort);
        }
    }, [constructedUploadQuery, sort, performUploadsSearch, activeTab]);
    
    const handleLoadMoreUploads = useCallback(() => {
        if (isLoadingMoreUploads || isLoadingUploads) return;
        setUploadsPage(prev => {
            const nextPage = prev + 1;
            performUploadsSearch(nextPage, constructedUploadQuery, sort);
            return nextPage;
        });
    }, [isLoadingMoreUploads, isLoadingUploads, constructedUploadQuery, sort, performUploadsSearch]);
    
    const hasMoreUploads = !isLoadingUploads && uploads.length < uploadsTotal;
    const lastUploadRef = useInfiniteScroll({ isLoading: isLoadingMoreUploads, hasMore: hasMoreUploads, onLoadMore: handleLoadMoreUploads, rootMargin: '400px' });
    
    const TabButton: React.FC<{label: string; isActive: boolean; onClick: () => void}> = ({ label, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}
            role="tab"
            aria-selected={isActive}
        >
            {label}
        </button>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-page-fade-in">
            <UploaderSidebar uploaderName={uploaderName} onClearUploader={onClearUploader} stats={stats} isLoadingStats={isLoadingStats} />
            
            <main className="lg:col-span-3 space-y-6">
                <div className="border-b border-gray-700">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <TabButton label={t('uploaderDetail.tabs.uploads')} isActive={activeTab === 'uploads'} onClick={() => setActiveTab('uploads')} />
                        <TabButton label={t('uploaderDetail.tabs.reviews')} isActive={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} />
                    </nav>
                </div>

                {activeTab === 'uploads' && (
                    <>
                        <div className="bg-gray-200/50 dark:bg-gray-800/60 p-4 rounded-xl shadow-lg space-y-4 sticky top-20 z-10 backdrop-blur-md">
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <div className="relative flex-grow w-full">
                                    <input
                                        type="text"
                                        value={uploadSearchTerm}
                                        onChange={e => setUploadSearchTerm(e.target.value)}
                                        placeholder={t('uploaderDetail.searchInUploads')}
                                        className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg py-2.5 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                                </div>
                                <div className="flex-shrink-0 w-full sm:w-auto flex items-stretch gap-2">
                                    <div className="relative flex-grow">
                                        <select 
                                            value={sortCriterion} 
                                            onChange={e => setSortCriterion(e.target.value)} 
                                            aria-label={t('uploaderDetail.sortBy')}
                                            className="w-full h-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg py-2.5 pl-4 pr-8 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors appearance-none"
                                        >
                                            {Object.entries(SORT_CRITERIA).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                    <button
                                        onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}
                                        className="flex-shrink-0 p-2.5 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        aria-label={t('uploaderDetail.toggleSort', { direction: t(sortDirection === 'desc' ? 'uploaderDetail.descending' : 'uploaderDetail.ascending')})}
                                    >
                                        {sortDirection === 'desc' ? <SortDescendingIcon className="w-5 h-5" /> : <SortAscendingIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            {!isLoadingStats && DYNAMIC_MEDIA_TYPES.length > 1 && (
                                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-300 dark:border-gray-700">
                                    {DYNAMIC_MEDIA_TYPES.map(filter => (
                                        <button
                                            key={filter.id}
                                            onClick={() => setActiveMediaType(filter.id as MediaTypeValue | 'all')}
                                            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                                                activeMediaType === filter.id
                                                    ? 'bg-cyan-500 text-white shadow-sm'
                                                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <ResultsGrid
                            results={uploads}
                            isLoading={isLoadingUploads}
                            isLoadingMore={isLoadingMoreUploads}
                            error={error}
                            onSelectItem={onSelectItem}
                            hasMore={hasMoreUploads}
                            totalResults={uploadsTotal}
                            lastElementRef={lastUploadRef}
                        />
                    </>
                )}
                {activeTab === 'reviews' && (
                    <UploaderReviews uploaderName={uploaderName} onSelectItem={onSelectItem} />
                )}
            </main>
        </div>
    );
};