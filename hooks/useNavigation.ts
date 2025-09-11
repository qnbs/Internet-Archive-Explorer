

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { activeViewAtom, selectedProfileAtom, profileReturnViewAtom } from '../store';
import { UPLOADER_DATA } from '../pages/uploaderData';
import type { View, Profile, Uploader } from '../types';

export const useNavigation = () => {
    const setActiveView = useSetAtom(activeViewAtom);
    // FIX: The `useSetAtom` hook was causing a type inference issue. Using `useAtom` and destructuring for the setter correctly provides a writable function without compiler errors.
    const [, setSelectedProfile] = useAtom(selectedProfileAtom);
    // FIX: Changed from `useSetAtom` to `useAtom` to mirror the fix for `setSelectedProfile`. This resolves a type inference issue where the setter was typed as `never`, causing errors in any `useCallback` that used it as a dependency.
    const [, setProfileReturnView] = useAtom(profileReturnViewAtom);
    const currentView = useAtomValue(activeViewAtom);

    const navigateTo = useCallback((view: View) => {
        setActiveView(view);
    }, [setActiveView]);

    const navigateToUploader = useCallback((searchIdentifier: string) => {
        const curatedData = UPLOADER_DATA.find(u => u.searchUploader === searchIdentifier);
        const profile: Profile = {
            name: curatedData?.username || searchIdentifier.split('@')[0],
            searchIdentifier: searchIdentifier,
            type: 'uploader',
            curatedData: curatedData,
        };
        setProfileReturnView(currentView);
        setSelectedProfile(profile);
        setActiveView('uploaderDetail');
    }, [setActiveView, setSelectedProfile, setProfileReturnView, currentView]);
    
    const navigateToCreator = useCallback((creatorName: string) => {
        const profile: Profile = {
            name: creatorName,
            searchIdentifier: creatorName,
            type: 'creator',
        };
        setProfileReturnView(currentView);
        setSelectedProfile(profile);
        setActiveView('uploaderDetail');
    }, [setActiveView, setSelectedProfile, setProfileReturnView, currentView]);

    const navigateToUploaderFromHub = useCallback((uploader: Uploader) => {
        const profile: Profile = {
            name: uploader.username,
            searchIdentifier: uploader.searchUploader,
            type: 'uploader',
            curatedData: uploader
        };
        setProfileReturnView('uploaderHub');
        setSelectedProfile(profile);
        setActiveView('uploaderDetail');
    }, [setActiveView, setSelectedProfile, setProfileReturnView]);

    const goBackFromProfile = useCallback((returnView?: View) => {
        setSelectedProfile(null);
        setActiveView(returnView || 'explore');
    }, [setActiveView, setSelectedProfile]);

    return {
        navigateTo,
        navigateToUploader,
        navigateToCreator,
        navigateToUploaderFromHub,
        goBackFromProfile
    };
};
