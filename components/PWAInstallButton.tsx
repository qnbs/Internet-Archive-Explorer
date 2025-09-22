
import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { deferredPromptAtom, isAppInstalledAtom } from '../store/pwa';
import { useLanguage } from '../hooks/useLanguage';
import { DownloadIcon, CheckIcon } from './Icons';

export const PWAInstallButton: React.FC = () => {
    const { t } = useLanguage();
    const deferredPrompt = useAtomValue(deferredPromptAtom);
    const setDeferredPrompt = useSetAtom(deferredPromptAtom);
    const isAppInstalled = useAtomValue(isAppInstalledAtom);

    const handleInstallClick = async () => {
        if (isAppInstalled || !deferredPrompt) return;
        
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt.
        await deferredPrompt.userChoice;
        // The prompt is a one-time use object. We clear it from state.
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
            {isAppInstalled ? <CheckIcon className="w-5 h-5" /> : <DownloadIcon className="w-5 h-5" />}
        </button>
    );
};
