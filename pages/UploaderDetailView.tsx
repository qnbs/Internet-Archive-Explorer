import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import type { ArchiveItemSummary, Uploader, View } from '../types';
import { UploaderSidebar } from '../components/uploader/UploaderSidebar';
import { UploaderUploads } from '../components/uploader/UploaderUploads';
import { UploaderReviews } from '../components/uploader/UploaderReviews';
import { UploaderStatsTab } from '../components/uploader/UploaderStatsTab';
import { ArrowLeftIcon } from '../components/Icons';

interface UploaderDetailViewProps {
    uploader: Uploader;
    onBack: () => void;
    onSelectItem: (item: ArchiveItemSummary) => void;
    returnView: View;
}

type Tab = 'uploads' | 'reviews' | 'statistics';

const TabButton: React.FC<{ tab: Tab, label: string, activeTab: Tab, onClick: (tab: Tab) => void }> = ({ tab, label, activeTab, onClick }) => (
    <button
        onClick={() => onClick(tab)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50'}`}
    >
        {label}
    </button>
);

export const UploaderDetailView: React.FC<UploaderDetailViewProps> = ({ uploader, onBack, onSelectItem, returnView }) => {
    const { t } = useLanguage();
    const { settings } = useSettings();
    const [activeTab, setActiveTab] = useState<Tab>(settings.defaultUploaderDetailTab);

    const getBackLabelKey = () => {
        if (returnView === 'uploaderHub') {
            return 'uploaderDetail:backToUploaderHub';
        }
        return 'uploaderDetail:backToExplorer';
    };

    return (
        <div className="animate-page-fade-in">
            <button onClick={onBack} className="flex items-center space-x-2 text-sm text-cyan-400 hover:underline mb-6">
                <ArrowLeftIcon className="w-4 h-4" />
                <span>{t(getBackLabelKey())}</span>
            </button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <UploaderSidebar uploader={uploader} />
                </div>
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center space-x-2 border-b border-gray-700 pb-2">
                        <TabButton tab="uploads" label={t('uploaderDetail:tabs.uploads')} activeTab={activeTab} onClick={setActiveTab} />
                        <TabButton tab="reviews" label={t('uploaderDetail:tabs.reviews')} activeTab={activeTab} onClick={setActiveTab} />
                        <TabButton tab="statistics" label={t('uploaderDetail:tabs.statistics')} activeTab={activeTab} onClick={setActiveTab} />
                    </div>
                    <div className="pt-2">
                        {activeTab === 'uploads' && <UploaderUploads uploader={uploader} onSelectItem={onSelectItem} />}
                        {activeTab === 'reviews' && <UploaderReviews uploader={uploader} onSelectItem={onSelectItem} />}
                        {activeTab === 'statistics' && <UploaderStatsTab uploader={uploader} />}
                    </div>
                </div>
            </div>
        </div>
    );
};