import { atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai';
import type { Profile, ToastMessage, View } from '../types';

export const myArchiveProfileAtom = atomWithStorage<Profile | null>('archive-user-profile-v1', null);

// Moved from store/app.ts to break a circular dependency.

/**
 * Holds the profile data for the currently viewed uploader or creator.
 */
// FIX: Add type assertion to ensure atom is inferred as writable, preventing type errors with useSetAtom/useAtom.
export const selectedProfileAtom = atom(null as Profile | null);


/**
 * Stores the view to return to after closing a profile page.
 */
// FIX: Add type assertion to ensure atom is inferred as writable, preventing type errors with useSetAtom/useAtom.
export const profileReturnViewAtom = atom(undefined as View | undefined);


// Moved toastAtom here from store/app.ts to break a circular dependency.
// This atom holds the toast state. The ToastBridge component consumes this state
// to show a toast and then resets it to null.
export const toastAtom = atom(null as Omit<ToastMessage, 'duration'> | null);