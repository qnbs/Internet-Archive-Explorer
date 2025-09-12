import React, { useState, useEffect } from 'react';
import { Spinner } from './Spinner';
import { useLanguage } from '../hooks/useLanguage';

interface AILoadingIndicatorProps {
  type: 'summary' | 'entities' | 'story';
}

const getMessageKeys = (type: AILoadingIndicatorProps['type']): string[] => {
    switch(type) {
        case 'summary':
            return [
                'aiTools:loadingMessages.connecting',
                'aiTools:loadingMessages.analyzing',
                'aiTools:loadingMessages.identifyingThemes',
                'aiTools:loadingMessages.craftingSummary',
                'aiTools:loadingMessages.finishing',
            ];
        case 'entities':
            return [
                'aiTools:loadingMessages.connecting',
                'aiTools:loadingMessages.analyzing',
                'aiTools:loadingMessages.scanningEntities',
                'aiTools:loadingMessages.compilingList',
                'aiTools:loadingMessages.finishing',
            ];
        case 'story':
            return [
                'aiTools:loadingMessages.connecting',
                'aiTools:loadingMessages.consultingMuse',
                'aiTools:loadingMessages.weavingNarrative',
                'aiTools:loadingMessages.findingWords',
                'aiTools:loadingMessages.finishing',
            ];
    }
};

export const AILoadingIndicator: React.FC<AILoadingIndicatorProps> = ({ type }) => {
    const { t } = useLanguage();
    const [messageIndex, setMessageIndex] = useState(0);
    const messageKeys = getMessageKeys(type);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % messageKeys.length);
        }, 2500);

        return () => clearInterval(interval);
    }, [messageKeys.length]);

    return (
        <div className="flex flex-col items-center justify-center space-y-3 p-4 text-center">
            <Spinner size="md" />
            <p className="text-gray-400 text-sm transition-opacity duration-500 animate-fade-in" key={messageIndex}>
                {t(messageKeys[messageIndex])}
            </p>
        </div>
    );
};