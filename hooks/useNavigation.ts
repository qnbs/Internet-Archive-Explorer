import { useSetAtom, useAtomValue } from 'jotai';
import { useCallback } from 'react';
import { activeViewAtom, selectedProfileAtom, profileReturnViewAtom } from '../store';
import type { View, Profile } from '../types';
import { UPLOADER_DATA } from '../pages/uploaderData';
import { formatIdentifierForDisplay } from '../utils/formatter';

export const useNavigation = () => {
    const setActiveView = useSetAtom(activeViewAtom);
    const setSelectedProfile = useSetAtom(selectedProfileAtom);
    const setProfileReturnView = useSetAtom(profileReturnViewAtom);
    const currentView = useAtomValue(activeViewAtom);
    const returnView = useAtomValue(profileReturnViewAtom);

    const navigateTo = useCallback((view: View) => {
        setActiveView(view);
    }, [setActiveView]);

    const navigateToProfile = useCallback((profile: Profile, newReturnView: View) => {
        setSelectedProfile(profile);
        setProfileReturnView(newReturnView);
        setActiveView('uploaderDetail');
    // FIX: Jotai set functions are stable and should not be in dependency arrays. Removing them fixes the type error.
    }, [setProfileReturnView, setActiveView]);
    
    const goBackFromProfile = useCallback(() => {
        setActiveView(returnView);
        setSelectedProfile(null);
    // FIX: Jotai set functions are stable and should not be in dependency arrays. Removing them fixes the type error.
    }, [setActiveView, returnView]);

    const navigateToUploaderFromHub = useCallback((searchIdentifier: string) => {
        const curatedData = UPLOADER_DATA.find(u => u.searchUploader === searchIdentifier);
        if (!curatedData) return;
        const profile: Profile = {
            name: curatedData.username,
            searchIdentifier: searchIdentifier,
            type: 'uploader',
            curatedData: curatedData
        };
        navigateToProfile(profile, 'uploaderHub');
    }, [navigateToProfile]);

    const navigateToUploader = useCallback((searchIdentifier: string) => {
        const curatedData = UPLOADER_DATA.find(u => u.searchUploader === searchIdentifier);
        const profile: Profile = curatedData 
            ? { name: curatedData.username, searchIdentifier, type: 'uploader', curatedData }
            : { name: formatIdentifierForDisplay(searchIdentifier), searchIdentifier, type: 'uploader' };
        navigateToProfile(profile, currentView);
    }, [navigateToProfile, currentView]);

    const navigateToCreator = useCallback((searchIdentifier: string) => {
        const profile: Profile = {
            name: formatIdentifierForDisplay(searchIdentifier),
            searchIdentifier,
            type: 'creator',
        };
        navigateToProfile(profile, currentView);
    }, [navigateToProfile, currentView]);

    return {
        navigateTo,
        navigateToUploaderFromHub,
        navigateToUploader,
        navigateToCreator,
        goBackFromProfile
    };
};