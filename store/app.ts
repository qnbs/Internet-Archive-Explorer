import { atom } from 'jotai';
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

// This atom holds the toast state. The ToastBridge component consumes this state 
// to show a toast and then resets it to null.
export const toastAtom = atom(null as Omit<ToastMessage, 'duration'> | null);