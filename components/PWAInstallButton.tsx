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

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        
        setDeferredPrompt(null);
    };

    if (!deferredPrompt) {
        return null;
    }

    return (
        <button
            onClick={handleInstallClick}
            className="flex-shrink-0 h-10 w-10 flex flex-col items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700/50 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
            title="Install App"
            aria-label="Install App"
        >
            <DownloadIcon className="w-5 h-5" />
        </button>
    );
};
