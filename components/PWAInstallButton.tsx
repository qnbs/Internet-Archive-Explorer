import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { DownloadIcon } from './Icons';

// BeforeInstallPromptEvent is not in standard TS lib, so we define it
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export const PWAInstallButton: React.FC = () => {
    const { t } = useLanguage();
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isAppInstalled, setIsAppInstalled] = useState(false);

    useEffect(() => {
        const checkInstalledStatus = () => {
            // This media query is a reliable way to check if the app is running in standalone mode.
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            // The `standalone` property is a non-standard but widely supported way for iOS.
            if (isStandalone || (window.navigator as any).standalone) {
                setIsAppInstalled(true);
            } else {
                setIsAppInstalled(false);
            }
        };

        checkInstalledStatus();

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            // When the app is installed, clear the deferred prompt and update the state.
            setDeferredPrompt(null);
            setIsAppInstalled(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Listen for changes in display mode, which can happen if the app is installed
        // while the tab is still open in the browser.
        const mediaQueryList = window.matchMedia('(display-mode: standalone)');
        mediaQueryList.addEventListener('change', checkInstalledStatus);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            mediaQueryList.removeEventListener('change', checkInstalledStatus);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isAppInstalled || !deferredPrompt) return;
        
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt.
        await deferredPrompt.userChoice;
        // Clear the deferredPrompt so it can be garbage collected. The 'appinstalled'
        // event will handle the final state change if the user accepts.
        setDeferredPrompt(null);
    };
    
    // Only show the button if the browser has offered to install OR if the app is already installed.
    // This makes it a persistent UI element that provides feedback.
    if (!deferredPrompt && !isAppInstalled) {
        return null;
    }

    const buttonFocusStyles = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 dark:focus-visible:ring-offset-gray-800";
    const title = isAppInstalled 
        ? t('settings:data.installedButton') 
        : t('settings:data.installButton');

    return (
        <button
            onClick={handleInstallClick}
            disabled={isAppInstalled}
            className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700/50 transition-colors ${buttonFocusStyles} ${
                isAppInstalled 
                ? 'cursor-not-allowed bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-accent-600 dark:hover:text-accent-400'
            }`}
            title={title}
            aria-label={title}
        >
            <DownloadIcon className="w-5 h-5" />
        </button>
    );
};