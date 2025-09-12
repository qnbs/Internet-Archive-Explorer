import { atom } from 'jotai';
// FIX: Import ToastMessage type to use in the atom definition.
import type { View, Profile, ArchiveItemSummary, ConfirmationOptions, ToastMessage, UserCollection } from '../types';

export type ModalState =
  | { type: 'closed' }
  | { type: 'itemDetail'; item: ArchiveItemSummary }
  | { type: 'emulator'; item: ArchiveItemSummary }
  | { type: 'bookReader'; item: ArchiveItemSummary }
  | { type: 'commandPalette' }
  | { type: 'newCollection' }
  | { type: 'addToCollection'; itemIds: string[] }
  | { type: 'addTags'; itemIds: string[] }
  | { type: 'confirmation'; options: ConfirmationOptions };

export const activeViewAtom = atom<View>('explore');
export const selectedProfileAtom = atom<Profile | null>(null);
// Used to store the view from which a profile was selected, to return to it later
export const profileReturnViewAtom = atom<View>('explore');
export const modalAtom = atom<ModalState>({ type: 'closed' });

// FIX: Changed toastAtom to be a readable/writable atom holding the toast state.
// The ToastBridge component will consume this state to show a toast and then reset it to null.
// The `id` property is included to ensure that setting the atom with the same message/type still triggers updates.
// By using a type assertion, we can help TypeScript resolve the type correctly in complex module dependency scenarios.
export const toastAtom = atom(null as Omit<ToastMessage, 'duration'> | null);