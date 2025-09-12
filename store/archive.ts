import { atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai';
import type { Profile, ToastMessage, View } from '../types';

export const myArchiveProfileAtom = atomWithStorage<Profile | null>('archive-user-profile-v1', null);

// FIX: Moved from store/app.ts to break a circular dependency.
// These atoms were previously derived writable atoms to work around a TypeScript bug.

/**
 * Holds the profile data for the currently viewed uploader or creator.
 */
// FIX: Reverted to derived writable atoms to resolve a persistent circular dependency issue
// that caused type errors with useSetAtom in hooks/useNavigation.ts.
const _selectedProfileAtom = atom<Profile | null>(null);
export const selectedProfileAtom = atom(
    (get) => get(_selectedProfileAtom),
    (_get, set, update: Profile | null | ((prev: Profile | null) => Profile | null)) => set(_selectedProfileAtom, update)
);

/**
 * Stores the view to return to after closing a profile page.
 */
const _profileReturnViewAtom = atom<View | undefined>(undefined);
export const profileReturnViewAtom = atom(
    (get) => get(_profileReturnViewAtom),
    (_get, set, update: View | undefined | ((prev: View | undefined) => View | undefined)) => set(_profileReturnViewAtom, update)
);


// FIX: Moved toastAtom here from store/app.ts to break a circular dependency.
// This atom holds the toast state. The ToastBridge component consumes this state
// to show a toast and then resets it to null.
export const toastAtom = atom(null as Omit<ToastMessage, 'duration'> | null);
