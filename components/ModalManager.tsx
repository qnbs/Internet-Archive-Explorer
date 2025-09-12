import React from 'react';
import { useAtom } from 'jotai';
import { modalAtom } from '../store';

// Import Modal Components
import { ItemDetailModal } from './ItemDetailModal';
import { EmulatorModal } from './EmulatorModal';
import { CommandPalette } from './CommandPalette';
import { ConfirmationModal } from './ConfirmationModal';
import { BookReaderModal } from './BookReaderModal';
import { NewCollectionModal } from './library/NewCollectionModal';
import { AddToCollectionModal } from './library/AddToCollectionModal';
import { AddTagsModal } from './library/AddTagsModal';


// Import navigation hook to pass actions to modals
import { useNavigation } from '../hooks/useNavigation';
import { useSearchAndGo } from '../hooks/useSearchAndGo';

export const ModalManager: React.FC = () => {
    const [modalState, setModalState] = useAtom(modalAtom);
    const navigation = useNavigation();
    const searchAndGo = useSearchAndGo();

    const handleClose = () => setModalState({ type: 'closed' });

    if (modalState.type === 'closed') {
        return null;
    }
    
    switch (modalState.type) {
        case 'itemDetail':
            return (
                <ItemDetailModal
                    item={modalState.item}
                    onClose={handleClose}
                    onCreatorSelect={(creator: string) => {
                        handleClose();
                        navigation.navigateToCreator(creator);
                    }}
                    onUploaderSelect={(uploader: string) => {
                        handleClose();
                        navigation.navigateToUploader(uploader);
                    }}
                    onEmulate={(item) => {
                        handleClose();
                        setModalState({ type: 'emulator', item });
                    }}
                    onSelectItem={(item) => {
                        // When selecting a related item, we effectively "replace" the current modal
                        setModalState({ type: 'itemDetail', item });
                    }}
                />
            );

        case 'emulator':
            return <EmulatorModal item={modalState.item} onClose={handleClose} />;
        
        case 'bookReader':
            return <BookReaderModal item={modalState.item} onClose={handleClose} />;

        case 'commandPalette':
            return (
                <CommandPalette
                    onClose={handleClose}
                    actions={{
                        navigateTo: (view) => {
                            handleClose();
                            navigation.navigateTo(view);
                        },
                        globalSearch: (query) => {
                            handleClose();
                            searchAndGo(query);
                        }
                    }}
                />
            );
            
        case 'confirmation':
            return (
                <ConfirmationModal
                    {...modalState.options}
                    onConfirm={async () => {
                        await modalState.options.onConfirm();
                        handleClose();
                    }}
                    onCancel={() => {
                        if(modalState.options.onCancel) modalState.options.onCancel();
                        handleClose();
                    }}
                />
            );
            
        case 'newCollection':
            return <NewCollectionModal onClose={handleClose} />;

        case 'addToCollection':
            return <AddToCollectionModal itemIds={modalState.itemIds} onClose={handleClose} />;
        
        case 'addTags':
            return <AddTagsModal itemIds={modalState.itemIds} onClose={handleClose} />;

        default:
             return null;
    }
};