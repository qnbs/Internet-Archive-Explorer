import React, { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { defaultUploaderDetailTabAtom } from '../store/settings';
import { profileSearchQueryAtom } from '../store/search';
import type { ArchiveItemSummary, Profile, View, UploaderTab, MediaType } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useUploaderStats } from '../hooks/useUploaderStats';
import { useUploaderTabCounts } from '../hooks/useUploaderTabCounts';
import { useUploaderUploads } from '../hooks/useUploaderUploads';
import { UploaderHeader } from '../components/uploader/UploaderHeader';
import { UploaderSidebar } from '../components/uploader/UploaderSidebar';
import { ResultsGrid } from '../components/ResultsGrid';
import { UploaderCollections } from '../components/uploader/UploaderCollections';
import { UploaderFavorites } from '../components/uploader/UploaderFavorites';
import { UploaderReviewsTab } from '../components/uploader/UploaderReviewsTab';
import { UploaderPostsTab } from '../components/uploader/UploaderPostsTab';
import { UploaderWebArchiveTab } from '../components/uploader/UploaderWebArchiveTab';
import { Spinner } from '../components/Spinner';
import { ChevronUpIcon, ChevronDownIcon } from '../components/Icons';

interface UploaderDetailViewProps {
    profile: Profile;
    onBack: (returnView?: View) => void;
    onSelectItem: (item: ArchiveItemSummary) => void;
    returnView?: View;
    isMyArchiveView?: boolean;
}

const UploaderDetailView: React.FC<UploaderDetailViewProps> = ({ profile, onBack, onSelectItem, returnView, isMyArchiveView }) => {
    const defaultTab = useAtomValue(defaultUploaderDetailTabAtom);
    const profileSearchQuery = useAtomValue(profileSearchQueryAtom);
    const { stats, isLoading: isLoadingStats } = useUploaderStats(profile);
    const { visibleTabs, isLoading: isLoadingTabs } = useUploaderTabCounts(profile);
    
    const [activeTab, setActiveTab] = useState<UploaderTab>('uploads');
    const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaType | 'all'>('all');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    const {
        results, isLoading: isLoadingUploads, isLoadingMore, error, totalResults, hasMore, lastElementRef, handleRetry,
        sort, setSort, sortDirection, toggleSortDirection
    } = useUploaderUploads(profile, mediaTypeFilter);

    useEffect(() => {
        if (!isLoadingTabs) {
            const initialTab = (defaultTab as any) === 'dashboard' ? 'uploads' : defaultTab;
            if (visibleTabs.includes(initialTab)) {
                setActiveTab(initialTab);
            } else if (visibleTabs.length > 0) {
                setActiveTab(visibleTabs[0]);
            }
        }
    }, [isLoadingTabs, visibleTabs, defaultTab]);


    const renderTabContent = () => {
        if (isLoadingTabs) {
            return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
        }

        const tabContentWrapperClass = "animate-fade-in";

        switch (activeTab) {
            case 'uploads':
                return (
                     <div className={tabContentWrapperClass}>
                        <ResultsGrid
                            results={results}
                            isLoading={isLoadingUploads}
                            isLoadingMore={isLoadingMore}
                            error={error}
                            onSelectItem={onSelectItem}
                            hasMore={hasMore}
                            totalResults={totalResults}
                            lastElementRef={lastElementRef}
                            onRetry={handleRetry}
                            searchQuery={profileSearchQuery}
                        />
                    </div>
                );
            case 'collections':
                return <div className={tabContentWrapperClass}><UploaderCollections profile={profile} onSelectItem={onSelectItem} /></div>;
            case 'favorites':
                return <div className={tabContentWrapperClass}><UploaderFavorites profile={profile} onSelectItem={onSelectItem} /></div>;
            case 'reviews':
                return <div className={tabContentWrapperClass}><UploaderReviewsTab profile={profile} /></div>;
            case 'posts':
                return <div className={tabContentWrapperClass}><UploaderPostsTab profile={profile} onSelectItem={onSelectItem} /></div>;
            case 'webArchive':
                return <div className={tabContentWrapperClass}><UploaderWebArchiveTab profile={profile} onSelectItem={onSelectItem} /></div>;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 animate-page-fade-in">
            <aside className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0">
                 <div className="lg:hidden bg-gray-800/60 rounded-lg mb-4 border border-gray-700/50">
                    <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="w-full flex justify-between items-center p-3">
                        <h3 className="font-semibold text-white">Profile & Stats</h3>
                        {isSidebarExpanded ? <ChevronUpIcon/> : <ChevronDownIcon/>}
                    </button>
                </div>
                <div className={`${isSidebarExpanded ? 'block' : 'hidden'} lg:block`}>
                    <UploaderSidebar 
                        profile={profile} 
                        stats={stats} 
                        isLoadingStats={isLoadingStats}
                        onBack={!isMyArchiveView ? () => onBack(returnView) : undefined}
                        onDisconnect={isMyArchiveView ? () => onBack() : undefined}
                    />
                </div>
            </aside>
            <main className="flex-grow min-w-0">
                <UploaderHeader 
                    visibleTabs={visibleTabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    stats={stats}
                    activeFilter={mediaTypeFilter}
                    onFilterChange={setMediaTypeFilter}
                    sort={sort}
                    setSort={setSort}
                    sortDirection={sortDirection}
                    toggleSortDirection={toggleSortDirection}
                />
                 <div className="mt-6">
                    {renderTabContent()}
                </div>
            </main>
        </div>
    );
};

export default UploaderDetailView;