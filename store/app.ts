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
 * Holds the profile data for the currently viewed uploader or creator.
 */
export const selectedProfileAtom = atom<Profile | null>(null);

/**
 * Stores the view to return to after closing a profile page.
 */
export const profileReturnViewAtom = atom<View | undefined>(undefined);

/**
 * A vehicle atom to trigger toasts from anywhere in the app.
 * The ToastBridge component listens to this atom, displays the toast via context,
 * and then resets the atom to null.
 */
export const toastAtom = atom<{ message: string; type: ToastType } | null>(null);