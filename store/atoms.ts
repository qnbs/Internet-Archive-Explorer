import { atom } from 'jotai';
import type { Profile, View } from '../types';

/**
 * Holds the profile data for the currently viewed uploader or creator.
 * This atom is placed here to avoid circular dependencies between `store/app` and other stores.
 */
// FIX: Simplified atom to be a primitive writable atom.
export const selectedProfileAtom = atom<Profile | null>(null);


/**
 * Stores the view to return to after closing a profile page.
 * This atom is placed here to avoid circular dependencies.
 */
// FIX: Simplified atom to be a primitive writable atom.
export const profileReturnViewAtom = atom<View | undefined>(undefined);
