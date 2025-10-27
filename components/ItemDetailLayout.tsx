import React, { useId } from 'react';
import { useItemDetailContext } from '../contexts/ItemDetailContext';
import { useAtomValue } from 'jotai';
import { enableAiFeaturesAtom } from '../store/settings';
import { useLanguage } from '../hooks/useLanguage';

import { Spinner } from './Spinner';
import { ItemDetailSidebar } from './ItemDetailSidebar';
import { ItemDetailTabs } from './ItemDetailTabs';
import { ItemDetailDescriptionTab } from './ItemDetailDescriptionTab';
import { ItemDetailFilesTab } from './ItemDetailFilesTab';
import { ItemDetailRelatedTab } from './ItemDetailRelatedTab';
import { AIToolsTab } from './AIToolsTab';
import type { ArchiveItemSummary } from '../types';

interface ItemDetailLayoutProps {
    onCreatorSelect: (creator: string) => void;
    onUploaderSelect: (uploader: string) => void;
    onEmulate: (item: ArchiveItemSummary) => void;
    onClose: () => void;
}

export const ItemDetailLayout: React.FC<ItemDetailLayoutProps> = ({ onCreatorSelect, onUploaderSelect, onEmulate, onClose }) => {
    const {
        item,
        metadata,
        isLoading,
        error,
        activeTab,
        setActiveTab,
        plainText,
        isLoadingText,
        textError,
        fetchMetadata,
    } = useItemDetailContext();
    const { t } = useLanguage();
    const enableAiFeatures = useAtomValue(enableAiFeaturesAtom);
    const uniqueId = useId();

    const renderTabContent = () => {
        if (!metadata) return null;

        return (
            <div className="pt-2 animate-fade-in" key={activeTab}>
                {activeTab === 'description' && (
                    <ItemDetailDescriptionTab description={metadata.metadata.description} />
                )}
                {activeTab === 'ai' && item.mediatype === 'texts' && enableAiFeatures && (
                    <AIToolsTab
                        item={item}
                        textContent={plainText}
                        isLoadingText={isLoadingText}
                        textError={textError}
                        onClose={onClose}
                    />
                )}
                {activeTab === 'files' && (
                    <ItemDetailFilesTab files={metadata.files} itemIdentifier={item.identifier} />
                )}
                {activeTab === 'related' && (
                    <ItemDetailRelatedTab metadata={metadata} currentItemIdentifier={item.identifier} />
                )}
            </div>
        );
    };

    return (
        <div className="flex-grow overflow-y-auto p-6">
            {isLoading && <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>}
            {error && (
                <div className="flex flex-col justify-center items-center h-full text-center">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={fetchMetadata}
                        className="px-4 py-2 bg-accent-600 text-white font-semibold rounded-lg hover:bg-accent-500 transition-colors"
                    >
                        {t('common:retry')}
                    </button>
                </div>
            )}
            {metadata && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <ItemDetailSidebar
                            onEmulate={onEmulate}
                            onCreatorSelect={onCreatorSelect}
                            onUploaderSelect={onUploaderSelect}
                        />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <ItemDetailTabs
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            showAiTab={item.mediatype === 'texts' && enableAiFeatures}
                            uniqueId={uniqueId}
                        />
                        {renderTabContent()}
                    </div>
                </div>
            )}
        </div>
    );
};
