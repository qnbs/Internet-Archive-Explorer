import { atom } from 'jotai';
import type { Profile, View } from '../types';

/**
 * Holds the profile data for the currently viewed uploader or creator.
 * This atom is placed here to avoid circular dependencies between `store/app` and other stores.
 */
const baseSelectedProfileAtom = atom<Profile | null>(null);
// FIX: The explicit generic type arguments for `atom` were causing incorrect type inference.
// Switched to inferring the type from the read/write functions, with an explicit type on the `update` parameter to guide TypeScript.
export const selectedProfileAtom = atom(
    (get) => get(baseSelectedProfileAtom),
    (get, set, update: Profile | null) => {
        set(baseSelectedProfileAtom, update);
    }
);


/**
 * Stores the view to return to after closing a profile page.
 * This atom is placed here to avoid circular dependencies.
 */
const baseProfileReturnViewAtom = atom<View | undefined>(undefined);
// FIX: The explicit generic type arguments for `atom` were causing incorrect type inference.
// Switched to inferring the type from the read/write functions, with an explicit type on the `update` parameter to guide TypeScript.
export const profileReturnViewAtom = atom(
    (get) => get(baseProfileReturnViewAtom),
    (get, set, update: View | undefined) => {
        set(baseProfileReturnViewAtom, update);
    }
);
