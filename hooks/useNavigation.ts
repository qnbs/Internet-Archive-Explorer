

import { useSetAtom, useAtomValue, useAtom } from 'jotai';
import { useCallback } from 'react';
// FIX: Changed import path to `../store/app` to bypass the barrel file (`../store`) and resolve a TypeScript type inference issue where `selectedProfileAtom` was not being correctly identified as a writable atom.
import { activeViewAtom, selectedProfileAtom, profileReturnViewAtom } from '../store/app';
import type { View, Profile, Uploader } from '../types';
import { UPLOADER_DATA } from '../pages/uploaderData';
import { formatIdentifierForDisplay } from '../utils/formatter';

export const useNavigation = () => {
    // FIX: Switched from `useAtom` to `useSetAtom` to get stable setter functions and resolve the "not callable" type error.
    const setActiveView = useSetAtom(activeViewAtom);
    const [, setSelectedProfile] = useAtom(selectedProfileAtom);
    const [, setProfileReturnView] = useAtom(profileReturnViewAtom);
    const currentView = useAtomValue(activeViewAtom);
    const returnView = useAtomValue(profileReturnViewAtom);

    const navigateTo = useCallback((view: View) => {
        setActiveView(view);
    }, [setActiveView]);

    const navigateToProfile = useCallback((profile: Profile, newReturnView: View) => {
        setSelectedProfile(profile);
        setProfileReturnView(newReturnView);
        setActiveView('uploaderDetail');
    }, [setSelectedProfile, setProfileReturnView, setActiveView]);
    
    const goBackFromProfile = useCallback(() => {
        setActiveView(returnView);
        setSelectedProfile(null);
    }, [returnView, setActiveView, setSelectedProfile]);

    const navigateToUploaderFromHub = useCallback((uploader: Uploader) => {
        const profile: Profile = {
            name: uploader.username,
            searchIdentifier: uploader.searchUploader,
            type: 'uploader',
            curatedData: uploader
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