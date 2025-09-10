import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { ArchiveItemSummary, Uploader } from '../types';
import { UploaderSidebar } from '../components/uploader/UploaderSidebar';
import { UploaderUploads } from '../components/uploader/UploaderUploads';
import { UploaderReviews } from '../components/uploader/UploaderReviews';
import { UploaderStatsTab } from '../components/uploader/UploaderStatsTab';
import { ArrowLeftIcon } from '../components/Icons';

interface UploaderDetailViewProps {
    uploader: Uploader;
    onBack: () => void;
    onSelectItem: (item: ArchiveItemSummary) => void;
}

type UploaderTab = 'uploads' | 'reviews' | 'statistics';

export const UploaderDetailView: React.FC<UploaderDetailViewProps> = ({ uploader, onBack, onSelectItem }) => {
    const { settings } = useSettings();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<UploaderTab>(settings.defaultUploaderDetailTab);

    const TabButton: React.FC<{ tab: UploaderTab, label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50'}`}
        >
            {label}
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'uploads':
                return <UploaderUploads uploader={uploader} onSelectItem={onSelectItem} />;
            case 'reviews':
                return <UploaderReviews uploader={uploader} onSelectItem={onSelectItem} />;
            case 'statistics':
                return <UploaderStatsTab uploader={uploader} />;
            default:
                return null;
        }
    };

    return (
        <div className="animate-page-fade-in">
            <button onClick={onBack} className="flex items-center space-x-2 text-sm text-cyan-400 hover:underline mb-6">
                <ArrowLeftIcon className="w-4 h-4" />
                <span>{t('uploaderDetail:backToExplorer')}</span>
            </button>
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/3 lg:max-w-sm flex-shrink-0">
                    <UploaderSidebar uploader={uploader} />
                </div>
                <div className="flex-grow min-w-0">
                    <div className="bg-gray-800/60 rounded-xl p-4 sm:p-6">
                        <div className="flex items-center space-x-2 border-b border-gray-700 pb-3 mb-4 overflow-x-auto">
                            <TabButton tab="uploads" label={t('uploaderDetail:tabs.uploads')} />
                            <TabButton tab="reviews" label={t('uploaderDetail:tabs.reviews')} />
                            <TabButton tab="statistics" label={t('uploaderDetail:tabs.statistics')} />
                        </div>
                        <div className="pt-2">
                           {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};