import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
// FIX: Import from specific store file to prevent circular dependencies.
import { activeViewAtom, selectedProfileAtom, profileReturnViewAtom } from '../store/app';
import { UPLOADER_DATA } from '../pages/uploaderData';
import type { View, Profile } from '../types';

export const useNavigation = () => {
    const setActiveView = useSetAtom(activeViewAtom);
    // FIX: The Jotai type error was caused by a subtle circular dependency issue within the state management files. By ensuring all store-related imports are direct (e.g., from `store/app` instead of a barrel file) and reordering exports in the barrel file (`store/index.ts`) to prioritize dependency-free atoms, the TypeScript compiler can correctly infer that the atoms are `WritableAtom`, resolving the error.
    const setSelectedProfile = useSetAtom(selectedProfileAtom);
    // FIX: The Jotai type error was caused by a subtle circular dependency issue within the state management files. By ensuring all store-related imports are direct (e.g., from `store/app` instead of a barrel file) and reordering exports in the barrel file (`store/index.ts`) to prioritize dependency-free atoms, the TypeScript compiler can correctly infer that the atoms are `WritableAtom`, resolving the error.
    const setProfileReturnView = useSetAtom(profileReturnViewAtom);
    const currentView = useAtomValue(activeViewAtom);

    const navigateTo = useCallback((view: View) => {
        setActiveView(view);
    }, [setActiveView]);
    
    const navigateToProfile = useCallback((profile: Profile) => {
        setProfileReturnView(currentView);
        setSelectedProfile(profile);
        setActiveView('uploaderDetail');
    }, [currentView, setActiveView, setSelectedProfile, setProfileReturnView]);

    const navigateToUploader = useCallback((searchIdentifier: string) => {
        const curatedData = UPLOADER_DATA.find(u => u.searchUploader === searchIdentifier);
        const profile: Profile = {
            name: curatedData?.username || searchIdentifier.split('@')[0],
            searchIdentifier: searchIdentifier,
            type: 'uploader',
            curatedData: curatedData,
        };
        navigateToProfile(profile);
    }, [navigateToProfile]);
    
    const navigateToCreator = useCallback((creatorName: string) => {
        const profile: Profile = {
            name: creatorName,
            searchIdentifier: creatorName,
            type: 'creator',
        };
        navigateToProfile(profile);
    }, [navigateToProfile]);

    const goBackFromProfile = useCallback((returnView?: View) => {
        setSelectedProfile(null);
        setActiveView(returnView || 'explore');
    }, [setActiveView, setSelectedProfile]);

    return {
        navigateTo,
        navigateToUploader,
        navigateToCreator,
        navigateToProfile,
        goBackFromProfile
    };
};