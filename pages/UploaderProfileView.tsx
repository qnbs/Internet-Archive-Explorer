import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Uploader } from '../types';
import { UploaderSidebar } from '../components/uploader/UploaderSidebar';
import { ArrowLeftIcon } from '../components/Icons';

interface UploaderProfileViewProps {
    uploader: Uploader;
    onBack: () => void;
}

export const UploaderProfileView: React.FC<UploaderProfileViewProps> = ({ uploader, onBack }) => {
    const { t } = useLanguage();

    return (
        <div className="animate-page-fade-in">
            <button onClick={onBack} className="flex items-center space-x-2 text-sm text-cyan-400 hover:underline mb-6">
                <ArrowLeftIcon className="w-4 h-4" />
                <span>{t('uploaderDetail:backToUploaderHub')}</span>
            </button>
            <div className="flex justify-center">
                <div className="w-full max-w-sm">
                    <UploaderSidebar uploader={uploader} />
                </div>
            </div>
        </div>
    );
};
