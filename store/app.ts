import { atom } from 'jotai';
import type { View, Profile, ArchiveItemSummary, ConfirmationOptions } from '../types';

export type ModalState =
  | { type: 'closed' }
  | { type: 'itemDetail'; item: ArchiveItemSummary }
  | { type: 'emulator'; item: ArchiveItemSummary }
  | { type: 'commandPalette' }
  | { type: 'confirmation'; options: ConfirmationOptions };

export const activeViewAtom = atom<View>('explore');
export const selectedProfileAtom = atom<Profile | null>(null);
// Used to store the view from which a profile was selected, to return to it later
export const profileReturnViewAtom = atom<View>('explore');
export const modalAtom = atom<ModalState>({ type: 'closed' });