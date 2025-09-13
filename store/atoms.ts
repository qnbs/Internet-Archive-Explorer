import { atom } from 'jotai';
import type { Profile, View, ToastType } from '../types';

/**
 * Holds the profile data for the currently viewed uploader or creator.
 * This atom is placed here to avoid circular dependencies between `store/app` and other stores.
 */
export const selectedProfileAtom = atom<Profile | null>(null);


/**
 * Stores the view to return to after closing a profile page.
 * This atom is placed here to avoid circular dependencies.
 */
export const profileReturnViewAtom = atom<View | undefined>(undefined);

/**
 * A vehicle atom to trigger toasts from anywhere in the app.
 * The ToastBridge component listens to this atom, displays the toast via context,
 * and then resets the atom to null.
 * Placed here to avoid circular dependencies, as many stores need to trigger toasts.
 */
export type ToastUpdate = { message: string; type: ToastType } | null;
export const toastAtom = atom<ToastUpdate>(null);

/**
 * These AI Archive atoms are used by the AIArchiveView (for UI state) and also
 * by persistence services when deleting an entry, which could cause circular dependencies
 * if they were in the same file as the main `aiArchiveAtom`.
 */
export const selectedAIEntryIdAtom = atom<string | null>(null);
export const aiArchiveSearchQueryAtom = atom<string>('');
