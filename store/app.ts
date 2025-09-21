import { atom } from 'jotai';
import type { View, Profile, ArchiveItemSummary, ConfirmationOptions, ToastType } from '../types';

export type ModalState =
  | { type: 'none' }
  | { type: 'itemDetail'; item: ArchiveItemSummary }
  | { type: 'imageDetail'; item: ArchiveItemSummary }
  | { type: 'emulator'; item: ArchiveItemSummary }
  | { type: 'bookReader'; item: ArchiveItemSummary }
  | { type: 'commandPalette' }
  | { type: 'confirmation'; options: ConfirmationOptions }
  | { type: 'newCollection' }
  | { type: 'addToCollection'; itemIds: string[] }
  | { type: 'addTags'; itemIds: string[] }
  | { type: 'magicOrganize'; itemIds: string[] };

/**
 * Represents the currently active main view/page of the application.
 */
export const activeViewAtom = atom<View>('explore');

/**
 * Controls the currently displayed modal. Set to '{ type: "none" }' to close.
 */
export const modalAtom = atom<ModalState>({ type: 'none' });

/**
 * A write-only atom to handle opening the correct item detail modal.
 * This decouples item cards from the main app logic.
 */
export const selectItemAtom = atom(
    null,
    (get, set, item: ArchiveItemSummary) => {
        if (item.mediatype === 'image') {
            set(modalAtom, { type: 'imageDetail', item });
        } else if (item.mediatype === 'software') {
            set(modalAtom, { type: 'emulator', item });
        } else {
            set(modalAtom, { type: 'itemDetail', item });
        }
    }
);