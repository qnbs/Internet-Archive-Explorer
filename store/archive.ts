import { atom } from 'jotai';
import type { Profile } from '@/types';
import { safeAtomWithStorage } from './safeStorage';

export const myArchiveProfileAtom = safeAtomWithStorage<Profile | null>(
  'archive-user-profile-v1',
  null,
);

export const disconnectMyArchiveAtom = atom(null, (_get, set) => {
  set(myArchiveProfileAtom, null);
});
