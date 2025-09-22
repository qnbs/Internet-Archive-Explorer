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
        // Check installation status on component mount.
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setIsAppInstalled(true);
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            setIsAppInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        
        setDeferredPrompt(null);
    };

    // Only show the header install button if the prompt is available and the app isn't installed.
    if (!deferredPrompt || isAppInstalled) {
        return null;
    }

    const buttonFocusStyles = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 dark:focus-visible:ring-offset-gray-800";

    return (
        <button
            onClick={handleInstallClick}
            className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700/50 hover:text-accent-600 dark:hover:text-accent-400 transition-colors ${buttonFocusStyles}`}
            title="Install App"
            aria-label="Install App"
        >
            <DownloadIcon className="w-5 h-5" />
        </button>
    );
};