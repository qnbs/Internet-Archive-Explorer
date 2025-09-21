import { atom } from 'jotai';
// FIX: Import safeAtomWithStorage to create atoms with robust writable types.
import { safeAtomWithStorage } from './safeStorage';
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

// --- Global Atoms Moved from store/atoms.ts for better organization ---

/**
 * Holds the profile data for the currently viewed uploader or creator.
 */
// FIX: Changed to safeAtomWithStorage to ensure it's correctly typed as a WritableAtom.
export const selectedProfileAtom = safeAtomWithStorage<Profile | null>('app-selected-profile', null);


/**
 * Stores the view to return to after closing a profile page.
 */
// FIX: Changed to safeAtomWithStorage to ensure it's correctly typed as a WritableAtom.
export const profileReturnViewAtom = safeAtomWithStorage<View | undefined>('app-profile-return-view', undefined);

/**
 * A vehicle atom to trigger toasts from anywhere in the app.
 * The ToastBridge component listens to this atom, displays the toast via context,
 * and then resets the atom to null.
 */
export type ToastUpdate = { message: string; type: ToastType } | null;
// FIX: Changed to safeAtomWithStorage to ensure it's correctly typed as a WritableAtom, preventing numerous type errors.
export const toastAtom = safeAtomWithStorage<ToastUpdate>('app-toast-trigger', null);