import React, { useState, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { profileSearchQueryAtom, defaultUploaderDetailTabAtom } from '../store';
import type { ArchiveItemSummary, Profile, View } from '../types';
import { UploaderSidebar } from '../components/uploader/UploaderSidebar';
import { UploaderUploads } from '../components/uploader/UploaderUploads';
import { UploaderCollections } from '../components/uploader/UploaderCollections';
import { UploaderFavorites } from '../components/uploader/UploaderFavorites';
import { UploaderStatsTab } from '../components/uploader/UploaderStatsTab';
import { ArrowLeftIcon, CollectionIcon, ChartPieIcon, UploadIcon, StarIcon } from '../components/Icons';
import { useLanguage } from '../hooks/useLanguage';

interface ProfileViewProps {
    profile: Profile;
    onBack: () => void;
    onSelectItem: (item: ArchiveItemSummary) => void;
    returnView: View;
}

type UploaderTab = 'dashboard' | 'uploads' | 'collections' | 'favorites';

const TabButton: React.FC<{
    tabId: UploaderTab;
    label: string;
    icon: React.ReactNode;
    activeTab: UploaderTab;
    onClick: (tab: UploaderTab) => void;
}> = ({ tabId, label, icon, activeTab, onClick }) => (
    <button
        onClick={() => onClick(tabId)}
        role="tab"
        aria-selected={activeTab === tabId}
        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === tabId
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-gray-300 hover:bg-gray-700/50'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);


export const UploaderDetailView: React.FC<ProfileViewProps> = ({ profile, onBack, onSelectItem, returnView }) => {
    const { t } = useLanguage();
    const defaultTab = useAtomValue(defaultUploaderDetailTabAtom);
    const setProfileSearchQuery = useSetAtom(profileSearchQueryAtom);
    
    const validTabs: UploaderTab[] = ['dashboard', 'uploads', 'collections', 'favorites'];
    const initialTab: UploaderTab = validTabs.includes(defaultTab as UploaderTab) ? defaultTab as UploaderTab : 'uploads';
    
    const [activeTab, setActiveTab] = useState<UploaderTab>(initialTab);

    // This effect ensures that if a user switches from an uploader profile to a creator profile,
    // they don't land on a tab that is invalid for creators.
    useEffect(() => {
        if (profile.type === 'creator' && (activeTab === 'collections' || activeTab === 'favorites')) {
            setActiveTab('uploads');
        }
    }, [profile.type, activeTab]);


    const handleBack = () => {
        setProfileSearchQuery('');
        onBack();
    };

    const getBackLabelKey = () => {
        if (returnView === 'uploaderHub') {
            return 'uploaderDetail:backToUploaderHub';
        }
        return 'uploaderDetail:backToExplorer';
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <UploaderStatsTab profile={profile} />
                    </div>
                );
            case 'uploads':
                return <UploaderUploads profile={profile} onSelectItem={onSelectItem} />;
            case 'collections':
                 return profile.type === 'uploader' ? <UploaderCollections profile={profile} onSelectItem={onSelectItem} /> : null;
            case 'favorites':
                 return profile.type === 'uploader' ? <UploaderFavorites profile={profile} onSelectItem={onSelectItem} /> : null;
            default:
                return null;
        }
    };

    return (
        <div className="animate-page-fade-in space-y-6">
            <button onClick={handleBack} className="flex items-center space-x-2 text-sm text-cyan-400 hover:underline">
                <ArrowLeftIcon className="w-4 h-4" />
                <span>{t(getBackLabelKey())}</span>
            </button>
            
            <UploaderSidebar profile={profile} />
            
            <div className="bg-gray-800/60 p-2 rounded-xl border border-gray-700/50 flex flex-wrap gap-2" role="tablist" aria-label={t('uploaderDetail:tabs.ariaLabel')}>
                 <TabButton 
                    tabId="dashboard" 
                    label={t('uploaderDetail:tabs.dashboard')} 
                    icon={<ChartPieIcon className="w-5 h-5"/>} 
                    activeTab={activeTab} 
                    onClick={setActiveTab} 
                />
                <TabButton 
                    tabId="uploads" 
                    label={t('uploaderDetail:tabs.uploads')} 
                    icon={<UploadIcon className="w-5 h-5"/>} 
                    activeTab={activeTab} 
                    onClick={setActiveTab} 
                />
                {profile.type === 'uploader' && (
                    <>
                        <TabButton 
                            tabId="collections" 
                            label={t('uploaderDetail:tabs.collections')} 
                            icon={<CollectionIcon className="w-5 h-5"/>} 
                            activeTab={activeTab} 
                            onClick={setActiveTab} 
                        />
                        <TabButton 
                            tabId="favorites" 
                            label={t('uploaderDetail:tabs.favorites')} 
                            icon={<StarIcon className="w-5 h-5"/>} 
                            activeTab={activeTab} 
                            onClick={setActiveTab} 
                        />
                    </>
                )}
            </div>

            <div className="pt-2">
                {renderTabContent()}
            </div>
        </div>
    );
};
