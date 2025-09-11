import React, { useId } from 'react';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../hooks/useLanguage';
import type { ItemDetailTab } from '../hooks/useItemMetadata';

interface ItemDetailTabsProps {
    activeTab: ItemDetailTab;
    setActiveTab: (tab: ItemDetailTab) => void;
    showAiTab: boolean;
    uniqueId: string;
}

const TabButton: React.FC<{tab: ItemDetailTab, label: string, activeTab: ItemDetailTab, setActiveTab: (tab: ItemDetailTab) => void, uniqueId: string}> = ({tab, label, activeTab, setActiveTab, uniqueId}) => (
    <button
      id={`${uniqueId}-tab-${tab}`}
      role="tab"
      aria-selected={activeTab === tab}
      aria-controls={`${uniqueId}-tabpanel-${tab}`}
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'}`}
    >{label}</button>
);


export const ItemDetailTabs: React.FC<ItemDetailTabsProps> = ({ activeTab, setActiveTab, showAiTab, uniqueId }) => {
    const { t } = useLanguage();

    return (
        <div role="tablist" aria-label="Item details" className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700 pb-2">
            <TabButton tab="description" label={t('common:description')} activeTab={activeTab} setActiveTab={setActiveTab} uniqueId={uniqueId} />
            {showAiTab && <TabButton tab="ai" label={t('common:aiAnalysis')} activeTab={activeTab} setActiveTab={setActiveTab} uniqueId={uniqueId} />}
            <TabButton tab="files" label={t('common:files')} activeTab={activeTab} setActiveTab={setActiveTab} uniqueId={uniqueId} />
            <TabButton tab="related" label={t('common:related')} activeTab={activeTab} setActiveTab={setActiveTab} uniqueId={uniqueId} />
        </div>
    );
};