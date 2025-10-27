import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
// FIX: Corrected import path to useItemDetail where the type is defined.
import type { ItemDetailTab } from '../hooks/useItemDetail';
import { SparklesIcon, FileIcon, CollectionIcon, BookIcon } from './Icons';

interface ItemDetailTabsProps {
    activeTab: ItemDetailTab;
    setActiveTab: (tab: ItemDetailTab) => void;
    showAiTab: boolean;
    uniqueId: string;
}

const ICONS: Record<ItemDetailTab, React.ReactNode> = {
    description: <BookIcon className="w-5 h-5"/>,
    ai: <SparklesIcon className="w-5 h-5"/>,
    files: <FileIcon className="w-5 h-5"/>,
    related: <CollectionIcon className="w-5 h-5"/>
};

const TabButton: React.FC<{tab: ItemDetailTab, label: string, activeTab: ItemDetailTab, setActiveTab: (tab: ItemDetailTab) => void, uniqueId: string}> = ({tab, label, activeTab, setActiveTab, uniqueId}) => (
    <button
      id={`${uniqueId}-tab-${tab}`}
      role="tab"
      aria-selected={activeTab === tab}
      aria-controls={`${uniqueId}-tabpanel-${tab}`}
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-700/50'}`}
    >
      {ICONS[tab]}
      <span>{label}</span>
    </button>
);


export const ItemDetailTabs: React.FC<ItemDetailTabsProps> = ({ activeTab, setActiveTab, showAiTab, uniqueId }) => {
    const { t } = useLanguage();

    return (
        <div role="tablist" aria-label="Item details" className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700/50">
            <TabButton tab="description" label={t('common:description')} activeTab={activeTab} setActiveTab={setActiveTab} uniqueId={uniqueId} />
            {showAiTab && <TabButton tab="ai" label={t('common:aiAnalysis')} activeTab={activeTab} setActiveTab={setActiveTab} uniqueId={uniqueId} />}
            <TabButton tab="files" label={t('common:files')} activeTab={activeTab} setActiveTab={setActiveTab} uniqueId={uniqueId} />
            <TabButton tab="related" label={t('common:related')} activeTab={activeTab} setActiveTab={setActiveTab} uniqueId={uniqueId} />
        </div>
    );
};
