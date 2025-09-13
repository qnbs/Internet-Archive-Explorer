import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { UsersIcon } from '../components/Icons';

const UploaderHubView: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-15rem)] animate-page-fade-in">
            <div className="p-8 bg-gray-800/60 rounded-xl shadow-lg border border-cyan-500/20 max-w-2xl">
                <UsersIcon className="w-20 h-20 mx-auto text-cyan-400/50 mb-6" />
                <h1 className="text-4xl font-bold text-cyan-400">{t('uploaderHub:title')}</h1>
                <p className="mt-4 text-2xl font-semibold text-gray-300">{t('uploaderHub:comingSoon.title')}</p>
                <p className="mt-2 text-lg text-gray-400">
                    {t('uploaderHub:comingSoon.description')}
                </p>
            </div>
        </div>
    );
};
export default UploaderHubView;
