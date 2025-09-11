import { atom } from 'jotai';
import type { View, Profile, ArchiveItemSummary, ConfirmationOptions } from '../types';

// --- Core App State ---
export const activeViewAtom = atom<View>('explore');
export const selectedProfileAtom = atom<Profile | null>(null);
export const profileReturnViewAtom = atom<View>('explore');

// --- Modal Management ---
type ItemDetailModalState = { type: 'itemDetail'; item: ArchiveItemSummary };
type EmulatorModalState = { type: 'emulator'; item: ArchiveItemSummary };
type CommandPaletteModalState = { type: 'commandPalette' };
type ConfirmationModalState = { type: 'confirmation'; options: ConfirmationOptions };
type NoModalState = { type: null };

export type ModalState =
    | ItemDetailModalState
    | EmulatorModalState
    | CommandPaletteModalState
    | ConfirmationModalState
    | NoModalState;

export const modalAtom = atom<ModalState>({ type: null });
