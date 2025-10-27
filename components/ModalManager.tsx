import React from 'react';
import { useAtom } from 'jotai';
import { modalAtom } from '../store';
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
import { ArchiveItemSummary } from '../types';
import { InstallModal } from './modals/InstallModal';

export const ModalManager: React.FC = () => {
    const [modal, setModal] = useAtom(modalAtom);
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

    switch (modal.type) {
        case 'itemDetail':
            return (
                <ItemDetailModal
                    item={modal.item}
                    onClose={closeModal}
                    onCreatorSelect={handleCreatorSelect}
                    onUploaderSelect={handleUploaderSelect}
                    onEmulate={handleEmulate}
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
            return <CommandPalette onClose={closeModal} />;
        case 'pwaInstall':
            return <InstallModal onClose={closeModal} />;
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