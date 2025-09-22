
import { atom } from 'jotai';

// BeforeInstallPromptEvent is not in standard TS lib, so we define it here for use in the atom.
export interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

/**
 * Stores the deferred PWA installation prompt event.
 * If this is not null, the app can be installed.
 */
export const deferredPromptAtom = atom<BeforeInstallPromptEvent | null>(null);

/**
 * Stores whether the app is currently installed (running in standalone mode).
 */
export const isAppInstalledAtom = atom<boolean>(false);
