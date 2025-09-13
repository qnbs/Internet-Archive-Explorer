import { atom } from 'jotai';
import type { Profile, View } from '../types';

/**
 * Holds the profile data for the currently viewed uploader or creator.
 * This atom is placed here to avoid circular dependencies between `store/app` and other stores.
 */
const baseSelectedProfileAtom = atom<Profile | null>(null);
// FIX: Removed explicit type on `update` parameter to allow TypeScript to correctly infer the atom as writable.
// The explicit type was too narrow and caused overload resolution to fail.
export const selectedProfileAtom = atom(
    (get) => get(baseSelectedProfileAtom),
    (get, set, update) => {
        set(baseSelectedProfileAtom, update);
    }
);


/**
 * Stores the view to return to after closing a profile page.
 * This atom is placed here to avoid circular dependencies.
 */
const baseProfileReturnViewAtom = atom<View | undefined>(undefined);
// FIX: Removed explicit type on `update` parameter to allow TypeScript to correctly infer the atom as writable.
// The explicit type was too narrow and caused overload resolution to fail.
export const profileReturnViewAtom = atom(
    (get) => get(baseProfileReturnViewAtom),
    (get, set, update) => {
        set(baseProfileReturnViewAtom, update);
    }
);