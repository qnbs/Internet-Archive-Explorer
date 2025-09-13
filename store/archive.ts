import { safeAtomWithStorage } from './safeStorage';
import type { Profile } from '../types';
import { atom } from 'jotai';

export const myArchiveProfileAtom = safeAtomWithStorage<Profile | null>('archive-user-profile-v1', null);

export const disconnectMyArchiveAtom = atom(null, (get, set) => {
    set(myArchiveProfileAtom, null);
});

// selectedProfileAtom and profileReturnViewAtom were moved to store/app.ts to fix potential circular dependency issues.