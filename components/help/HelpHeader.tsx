import React from 'react';
import { useHelpViewContext } from '../../contexts/HelpViewContext';

export const HelpHeader: React.FC = () => {
    const { t } = useHelpViewContext();
    return (
        <header className="text-center">
            <h1 className="text-4xl font-bold text-accent-600 dark:text-accent-400">{t('help:title')}</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{t('help:subtitle')}</p>
        </header>
    );
};