import { atom } from 'jotai';
import type { Profile, View, ToastType } from '../types';

/**
 * Holds the profile data for the currently viewed uploader or creator.
 * This atom is placed here to avoid circular dependencies between `store/app` and other stores.
 */
// Fix: Use `atom(null as ...)` pattern for better type inference of writable atoms.
export const selectedProfileAtom = atom(null as Profile | null);


/**
 * Stores the view to return to after closing a profile page.
 * This atom is placed here to avoid circular dependencies.
 */
// Fix: Use `atom(undefined as ...)` pattern for better type inference of writable atoms.
export const profileReturnViewAtom = atom(undefined as View | undefined);

/**
 * A vehicle atom to trigger toasts from anywhere in the app.
 * The ToastBridge component listens to this atom, displays the toast via context,
 * and then resets the atom to null.
 * Placed here to avoid circular dependencies, as many stores need to trigger toasts.
 */
export type ToastUpdate = { message: string; type: ToastType } | null;
// Fix: Use `atom(null as ...)` pattern for better type inference of writable atoms.
export const toastAtom = atom(null as ToastUpdate);

/**
 * These AI Archive atoms are used by the AIArchiveView (for UI state) and also
 * by persistence services when deleting an entry, which could cause circular dependencies
 * if they were in the same file as the main `aiArchiveAtom`.
 */
// Fix: Use `atom(null as ...)` pattern for better type inference of writable atoms.
export const selectedAIEntryIdAtom = atom(null as string | null);
export const aiArchiveSearchQueryAtom = atom<string>('');