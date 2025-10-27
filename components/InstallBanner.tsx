import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import type { BeforeInstallPromptEvent } from '../store/pwa';
import { DownloadIcon, CloseIcon } from './Icons';

interface InstallBannerProps {
    deferredPrompt: BeforeInstallPromptEvent | null;
    isAppInstalled: boolean;
}

const InstallBanner: React.FC<InstallBannerProps> = ({ deferredPrompt, isAppInstalled }) => {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);

    const isIOS = useMemo(() => /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream, []);

    useEffect(() => {
        const isDismissed = sessionStorage.getItem('pwaInstallDismissed') === 'true';
        if (!isDismissed && !isAppInstalled && (deferredPrompt || isIOS)) {
            // Add a small delay to prevent layout shift on load
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [deferredPrompt, isAppInstalled, isIOS]);

    const handleDismiss = () => {
        sessionStorage.setItem('pwaInstallDismissed', 'true');
        setIsVisible(false);
    };

    const handleInstall = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
        } else if (isIOS) {
            alert(t('pwaModal:ios.title') + '\n\n' + t('pwaModal:ios.step1') + ' ' + t('pwaModal:ios.step2'));
        }
        handleDismiss();
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div 
            className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-4 bg-gray-800/90 backdrop-blur-md border border-cyan-500/50 rounded-xl shadow-2xl animate-fade-in"
            role="dialog"
            aria-labelledby="install-banner-title"
            aria-describedby="install-banner-desc"
        >
            <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                    <DownloadIcon className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                    <p id="install-banner-title" className="text-base font-medium text-white">{t('installBanner:title')}</p>
                    <p id="install-banner-desc" className="mt-1 text-sm text-gray-300">{t('installBanner:description')}</p>
                    <div className="mt-3 flex gap-3">
                        <button
                            onClick={handleInstall}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700"
                        >
                            {t('installBanner:install')}
                        </button>
                         <button
                            onClick={handleDismiss}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-600 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700"
                        >
                            {t('installBanner:dismiss')}
                        </button>
                    </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button
                        onClick={handleDismiss}
                        className="inline-flex rounded-md p-1.5 text-gray-400 hover:text-white"
                        aria-label={t('common:close')}
                    >
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallBanner;