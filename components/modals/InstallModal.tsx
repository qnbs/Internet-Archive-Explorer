import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { deferredPromptAtom, isAppInstalledAtom } from '../../store/pwa';
import { useLanguage } from '../../hooks/useLanguage';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { CloseIcon, ArchiveLogoIcon, CheckIcon, DownloadIcon, ShareIOSIcon, PlusSquareIcon } from '../Icons';

export const InstallModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useLanguage();
    const modalRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    
    const [deferredPrompt, setDeferredPrompt] = useAtom(deferredPromptAtom);
    const isAppInstalled = useAtomValue(isAppInstalledAtom);

    const isIOS = useMemo(() => /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream, []);
    const canInstall = (deferredPrompt || isIOS) && !isAppInstalled;

    useModalFocusTrap({ modalRef, isOpen: isMounted, onClose });
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the PWA installation');
        }
        setDeferredPrompt(null);
        onClose();
    };
    
    const renderAction = () => {
        if (isIOS) {
            return (
                <div className="mt-6 text-left p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <h3 className="font-semibold text-white mb-3">{t('pwaModal:ios.title')}</h3>
                    <ol className="space-y-3 text-sm">
                        <li className="flex items-center gap-3">
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-600 rounded-md">
                                <ShareIOSIcon className="w-5 h-5 text-cyan-300" />
                            </span>
                            <span>{t('pwaModal:ios.step1')}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-600 rounded-md">
                                <PlusSquareIcon className="w-5 h-5 text-cyan-300" />
                            </span>
                            <span>{t('pwaModal:ios.step2')}</span>
                        </li>
                    </ol>
                </div>
            );
        }

        if (deferredPrompt) {
            return (
                 <button onClick={handleInstall} className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 text-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors shadow-lg">
                    <DownloadIcon />
                    <span>{t('pwaModal:installButton')}</span>
                </button>
            );
        }
        
        return <p className="mt-6 text-sm text-gray-400">{t('pwaModal:notAvailable')}</p>;
    }


    return (
        <div
            className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isMounted ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-modal-title"
        >
            <div
                ref={modalRef}
                className={`bg-gray-800 text-gray-200 rounded-xl shadow-2xl w-full max-w-sm text-center p-6 transition-all duration-300 ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-white rounded-full"><CloseIcon className="w-5 h-5" /></button>
                
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-700 rounded-2xl mb-4">
                    <ArchiveLogoIcon className="w-10 h-10 text-cyan-400" />
                </div>
                
                <h2 id="install-modal-title" className="text-2xl font-bold text-white">{t('pwaModal:title')}</h2>
                <p className="mt-2 text-gray-400">{t('pwaModal:description')}</p>

                <ul className="text-left space-y-2 text-sm mt-6 text-gray-300">
                    <li className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span>{t('pwaModal:benefits.item1')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span>{t('pwaModal:benefits.item2')}</span>
                    </li>
                     <li className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span>{t('pwaModal:benefits.item3')}</span>
                    </li>
                </ul>

                {renderAction()}
            </div>
        </div>
    );
};