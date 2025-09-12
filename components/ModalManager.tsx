import React from 'react';
import { useAtom } from 'jotai';
import { modalAtom } from '../store/app';
import { useNavigation } from '../hooks/useNavigation';
import { ItemDetailModal } from './ItemDetailModal';
import { ImageDetailModal } from './ImageDetailModal';
import { EmulatorModal } from './EmulatorModal';
import { CommandPalette } from './CommandPalette';
import { ConfirmationModal } from './ConfirmationModal';
import { BookReaderModal } from './BookReaderModal';
import { NewCollectionModal } from './library/NewCollectionModal';
import { AddToCollectionModal } from './library/AddToCollectionModal';
import { AddTagsModal } from './library/AddTagsModal';
import { MagicOrganizeModal } from './library/MagicOrganizeModal';
import { searchQueryAtom } from '../store/search';
import { ArchiveItemSummary } from '../types';

export const ModalManager: React.FC = () => {
    const [modal, setModal] = useAtom(modalAtom);
    const [, setSearchQuery] = useAtom(searchQueryAtom);
    const navigation = useNavigation();

    const closeModal = () => setModal({ type: 'none' });

    const handleCreatorSelect = (creator: string) => {
        closeModal();
        navigation.navigateToCreator(creator);
    };

    const handleUploaderSelect = (uploader: string) => {
        closeModal();
        navigation.navigateToUploader(uploader);
    };
    
    const handleEmulate = (item: ArchiveItemSummary) => {
        setModal({ type: 'emulator', item });
    };
    
    const handleSelectItem = (item: ArchiveItemSummary) => {
        setModal({ type: 'itemDetail', item });
    };
    
    const handleGlobalSearch = (query: string) => {
        setSearchQuery(query);
        navigation.navigateTo('explore');
        closeModal();
    };

    switch (modal.type) {
        case 'itemDetail':
            return (
                <ItemDetailModal
                    item={modal.item}
                    onClose={closeModal}
                    onCreatorSelect={handleCreatorSelect}
                    onUploaderSelect={handleUploaderSelect}
                    onEmulate={handleEmulate}
                    onSelectItem={handleSelectItem}
                />
            );
        case 'imageDetail':
             return (
                <ImageDetailModal
                    item={modal.item}
                    onClose={closeModal}
                    onCreatorSelect={handleCreatorSelect}
                    onUploaderSelect={handleUploaderSelect}
                />
            );
        case 'emulator':
            return <EmulatorModal item={modal.item} onClose={closeModal} />;
        case 'bookReader':
            return <BookReaderModal item={modal.item} onClose={closeModal} />;
        case 'commandPalette':
            return <CommandPalette onClose={closeModal} actions={{ navigateTo: (view) => { navigation.navigateTo(view); closeModal(); }, globalSearch: handleGlobalSearch }} />;
        case 'confirmation':
            return (
                <ConfirmationModal
                    {...modal.options}
                    onConfirm={async () => {
                        await modal.options.onConfirm();
                        closeModal();
                    }}
                    onCancel={() => {
                        modal.options.onCancel?.();
                        closeModal();
                    }}
                />
            );
        case 'newCollection':
            return <NewCollectionModal onClose={closeModal} />;
        case 'addToCollection':
            return <AddToCollectionModal itemIds={modal.itemIds} onClose={closeModal} />;
        case 'addTags':
            return <AddTagsModal itemIds={modal.itemIds} onClose={closeModal} />;
        case 'magicOrganize':
             return <MagicOrganizeModal itemIds={modal.itemIds} onClose={closeModal} />;
        case 'none':
        default:
            return null;
    }
};
