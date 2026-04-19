import { useAtom } from 'jotai';
import React, { lazy, Suspense } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import type { ArchiveItemSummary } from '@/types';
import { modalAtom } from '../store';
import { ConfirmationModal } from './ConfirmationModal';
import { Spinner } from './Spinner';

const ItemDetailModal = lazy(() =>
  import('./ItemDetailModal').then((module) => ({ default: module.ItemDetailModal })),
);
const ImageDetailModal = lazy(() =>
  import('./ImageDetailModal').then((module) => ({ default: module.ImageDetailModal })),
);
const EmulatorModal = lazy(() =>
  import('./EmulatorModal').then((module) => ({ default: module.EmulatorModal })),
);
const CommandPalette = lazy(() =>
  import('./CommandPalette').then((module) => ({ default: module.CommandPalette })),
);
const BookReaderModal = lazy(() =>
  import('./BookReaderModal').then((module) => ({ default: module.BookReaderModal })),
);
const NewCollectionModal = lazy(() =>
  import('./library/NewCollectionModal').then((module) => ({ default: module.NewCollectionModal })),
);
const AddToCollectionModal = lazy(() =>
  import('./library/AddToCollectionModal').then((module) => ({
    default: module.AddToCollectionModal,
  })),
);
const AddTagsModal = lazy(() =>
  import('./library/AddTagsModal').then((module) => ({ default: module.AddTagsModal })),
);
const MagicOrganizeModal = lazy(() =>
  import('./library/MagicOrganizeModal').then((module) => ({ default: module.MagicOrganizeModal })),
);
const InstallModal = lazy(() =>
  import('./modals/InstallModal').then((module) => ({ default: module.InstallModal })),
);

const ModalFallback: React.FC = () => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    aria-hidden="true"
  >
    <Spinner size="lg" />
  </div>
);

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
        <Suspense fallback={<ModalFallback />}>
          <ItemDetailModal
            item={modal.item}
            onClose={closeModal}
            onCreatorSelect={handleCreatorSelect}
            onUploaderSelect={handleUploaderSelect}
            onEmulate={handleEmulate}
          />
        </Suspense>
      );
    case 'imageDetail':
      return (
        <Suspense fallback={<ModalFallback />}>
          <ImageDetailModal
            item={modal.item}
            onClose={closeModal}
            onCreatorSelect={handleCreatorSelect}
            onUploaderSelect={handleUploaderSelect}
          />
        </Suspense>
      );
    case 'emulator':
      return (
        <Suspense fallback={<ModalFallback />}>
          <EmulatorModal item={modal.item} onClose={closeModal} />
        </Suspense>
      );
    case 'bookReader':
      return (
        <Suspense fallback={<ModalFallback />}>
          <BookReaderModal item={modal.item} onClose={closeModal} />
        </Suspense>
      );
    case 'commandPalette':
      return (
        <Suspense fallback={<ModalFallback />}>
          <CommandPalette onClose={closeModal} />
        </Suspense>
      );
    case 'pwaInstall':
      return (
        <Suspense fallback={<ModalFallback />}>
          <InstallModal onClose={closeModal} />
        </Suspense>
      );
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
      return (
        <Suspense fallback={<ModalFallback />}>
          <NewCollectionModal onClose={closeModal} />
        </Suspense>
      );
    case 'addToCollection':
      return (
        <Suspense fallback={<ModalFallback />}>
          <AddToCollectionModal itemIds={modal.itemIds} onClose={closeModal} />
        </Suspense>
      );
    case 'addTags':
      return (
        <Suspense fallback={<ModalFallback />}>
          <AddTagsModal itemIds={modal.itemIds} onClose={closeModal} />
        </Suspense>
      );
    case 'magicOrganize':
      return (
        <Suspense fallback={<ModalFallback />}>
          <MagicOrganizeModal itemIds={modal.itemIds} onClose={closeModal} />
        </Suspense>
      );
    case 'none':
    default:
      return null;
  }
};
