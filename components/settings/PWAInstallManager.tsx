import React, { useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { isAppInstalledAtom, deferredPromptAtom } from '../../store/pwa';
import { modalAtom } from '../../store/app';
import { useLanguage } from '../../hooks/useLanguage';
import { DownloadIcon, CheckIcon } from '../Icons';

export const PWAInstallManager: React.FC = () => {
    const { t } = useLanguage();
    const setModal = useSetAtom(modalAtom);
    const isAppInstalled = useAtomValue(isAppInstalledAtom);
    const deferredPrompt = useAtomValue(deferredPromptAtom);

    const isIOS = useMemo(() => /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream, []);
    const canInstall = (deferredPrompt || isIOS) && !isAppInstalled;

    const renderContent = () => {
        if (isAppInstalled) {
            return (
                <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-500/10 rounded-full">
                        <CheckIcon className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="font-semibold text-green-400">{t('settings:data.installedButton')}</span>
                </div>
            );
        }

        if (canInstall) {
            return (
                <button
                    onClick={() => setModal({ type: 'pwaInstall' })}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold bg-accent-600 text-white rounded-md hover:bg-accent-700 transition-colors"
                >
                    <DownloadIcon />
                    <span>{t('settings:data.installButton')}</span>
                </button>
            );
        }
        
        return <p className="text-sm text-gray-500 dark:text-gray-400">{t('pwaModal:notAvailable')}</p>;
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white pt-2">{t('settings:data.installApp')}</h3>
            <div className="py-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings:data.installAppDesc')}</p>
                {renderContent()}
            </div>
        </div>
    );
};