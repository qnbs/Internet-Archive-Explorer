import React from 'react';
import type { UploaderTab } from '../../types';
import { 
    UploadIcon, CollectionIcon, StarIcon, PencilAltIcon, WebIcon
} from '../Icons';
import { useLanguage } from '../../hooks/useLanguage';
import { UploadsFilterControls } from './UploadsFilterControls';

// All props for UploadsFilterControls are passed through UploaderHeaderProps
type UploadsFilterControlsProps = React.ComponentProps<typeof UploadsFilterControls>;

interface UploaderHeaderProps extends UploadsFilterControlsProps {
    visibleTabs: UploaderTab[];
    activeTab: UploaderTab;
    setActiveTab: (tab: UploaderTab) => void;
}


const TabButton: React.FC<{
    tabId: UploaderTab;
    label: string;
    icon: React.ReactNode;
    activeTab: UploaderTab;
    onClick: (tab: UploaderTab) => void;
}> = React.memo(({ tabId, label, icon, activeTab, onClick }) => (
    <button
        onClick={() => onClick(tabId)}
        role="tab"
        aria-selected={activeTab === tabId}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === tabId
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-700/50'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
));


export const UploaderHeader: React.FC<UploaderHeaderProps> = (props) => {
    const { visibleTabs, activeTab, setActiveTab, ...controlsProps } = props;
    const { t } = useLanguage();
    
    const TABS_CONFIG: Record<UploaderTab, { label: string; icon: React.ReactNode }> = {
        uploads: { label: t('uploaderDetail:tabs.uploads'), icon: <UploadIcon className="w-5 h-5" /> },
        collections: { label: t('uploaderDetail:tabs.collections'), icon: <CollectionIcon className="w-5 h-5" /> },
        favorites: { label: t('uploaderDetail:tabs.favorites'), icon: <StarIcon className="w-5 h-5" /> },
        reviews: { label: t('uploaderDetail:tabs.reviews'), icon: <PencilAltIcon className="w-5 h-5" /> },
        posts: { label: t('uploaderDetail:tabs.posts'), icon: <PencilAltIcon className="w-5 h-5" /> },
        webArchive: { label: t('uploaderDetail:tabs.webArchive'), icon: <WebIcon className="w-5 h-5" /> },
    };

    return (
        <div className="bg-white dark:bg-gray-800/60 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
            <div className="w-full overflow-x-auto">
                <div className="inline-flex flex-nowrap gap-2 bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-xl" role="tablist" aria-label={t('uploaderDetail:aria.profileSections')}>
                    {visibleTabs.map(tabId => (
                        <TabButton 
                            key={tabId}
                            tabId={tabId}
                            label={TABS_CONFIG[tabId].label}
                            icon={TABS_CONFIG[tabId].icon}
                            activeTab={activeTab}
                            onClick={setActiveTab}
                        />
                    ))}
                </div>
            </div>
            
            <div className={`grid transition-all duration-300 ease-in-out ${activeTab === 'uploads' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="border-t border-gray-200 dark:border-gray-700/80 pt-4 mt-4">
                        <UploadsFilterControls {...controlsProps} />
                    </div>
                </div>
            </div>
        </div>
    );
};