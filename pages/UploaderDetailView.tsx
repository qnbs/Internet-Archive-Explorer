import React, { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { defaultUploaderDetailTabAtom } from '../store';
import type { ArchiveItemSummary, Profile, View, UploaderTab, MediaType } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useUploaderStats } from '../hooks/useUploaderStats';
import { useUploaderTabCounts } from '../hooks/useUploaderTabCounts';
import { useUploaderUploads } from '../hooks/useUploaderUploads';
import { ArrowLeftIcon } from '../components/Icons';
import { UploaderHeader } from '../components/uploader/UploaderHeader';
import { ResultsGrid } from '../components/ResultsGrid';
import { UploaderCollections } from '../components/uploader/UploaderCollections';
import { UploaderFavorites } from '../components/uploader/UploaderFavorites';
import { UploaderReviewsTab } from '../components/uploader/UploaderReviewsTab';
import { UploaderPostsTab } from '../components/uploader/UploaderPostsTab';
import { UploaderWebArchiveTab } from '../components/uploader/UploaderWebArchiveTab';
import { Spinner } from '../components/Spinner';

interface UploaderDetailViewProps {
    profile: Profile;
    onBack: (returnView?: View) => void;
    onSelectItem: (item: ArchiveItemSummary) => void;
    returnView?: View;
}

export const UploaderDetailView: React.FC<UploaderDetailViewProps> = ({ profile, onBack, onSelectItem, returnView }) => {
    const { t } = useLanguage();
    const defaultTab = useAtomValue(defaultUploaderDetailTabAtom);
    const { stats } = useUploaderStats(profile);
    const { visibleTabs, isLoading: isLoadingTabs } = useUploaderTabCounts(profile);
    
    const [activeTab, setActiveTab] = useState<UploaderTab>('uploads');
    const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaType | 'all'>('all');

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
        <div className="space-y-6 animate-page-fade-in">
            <button onClick={() => onBack(returnView)} className="flex items-center space-x-2 text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                <ArrowLeftIcon className="w-4 h-4" />
                <span>{t('uploaderDetail:back')}</span>
            </button>
            
            <UploaderHeader 
                profile={profile}
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

            <main className="mt-6">
                {renderTabContent()}
            </main>
        </div>
    );
};