import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { activeViewAtom } from '../store/app';
// FIX: Import atoms from the new central 'atoms' store file to break circular dependencies.
import { selectedProfileAtom, profileReturnViewAtom } from '../store/atoms';
import { UPLOADER_DATA } from '../pages/uploaderData';
import type { View, Profile } from '../types';

export const useNavigation = () => {
    const setActiveView = useSetAtom(activeViewAtom);
    const setSelectedProfile = useSetAtom(selectedProfileAtom);
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