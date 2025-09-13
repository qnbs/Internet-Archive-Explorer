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