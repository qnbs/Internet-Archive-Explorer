import React, { useEffect, useState, useRef, useId } from 'react';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../hooks/useLanguage';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';

interface ConfirmationModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    confirmClass?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, onConfirm, onCancel, confirmLabel, confirmClass }) => {
    const [isMounted, setIsMounted] = useState(false);
    const { t } = useLanguage();
    const modalRef = useRef<HTMLDivElement>(null);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const messageId = useId();

    useModalFocusTrap({ modalRef, isOpen: isMounted, onClose: onCancel });

    useEffect(() => {
        setIsMounted(true);
        confirmButtonRef.current?.focus();
    }, []);

    return (
        <div
            className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isMounted ? 'opacity-100' : 'opacity-0'}`}
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
            aria-describedby={messageId}
        >
            <div
                ref={modalRef}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 transition-all duration-300 ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="confirmation-title" className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
                <p id={messageId} className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors"
                    >
                        {t('common:cancel')}
                    </button>
                    <button
                        ref={confirmButtonRef}
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-semibold text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${confirmClass || 'bg-red-600 hover:bg-red-700 focus:ring-red-500'}`}
                    >
                        {confirmLabel || t('common:confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};