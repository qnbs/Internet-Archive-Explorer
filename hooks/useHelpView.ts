import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { loadableTranslationsAtom } from '../store/i18n';
import { useLanguage } from './useLanguage';
import {
    HelpIcon, UsersIcon, BookIcon, MovieIcon, AudioIcon, ImageIcon,
    JoystickIcon, WebIcon, StarIcon, SettingsIcon, InfoIcon, CompassIcon, CollectionIcon, SparklesIcon, UploadIcon
} from '../components/Icons';

export interface HelpQuestion {
    q: string;
    a: string;
}

export interface HelpTopic {
    id: string;
    title: string;
    icon: string;
    questions: HelpQuestion[];
}


export const useHelpView = () => {
    const { t } = useLanguage();
    const loadableTranslations = useAtomValue(loadableTranslationsAtom);

    const [allTopics, setAllTopics] = useState<HelpTopic[]>([]);
    const [activeTopic, setActiveTopic] = useState<HelpTopic | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (loadableTranslations.state === 'hasData') {
            const helpData = (loadableTranslations.data as any).help;
            const topicData = helpData.topics as Omit<HelpTopic, 'title' | 'questions'>[];

            if (!Array.isArray(topicData)) {
                console.error("Help topics data is not an array:", topicData);
                return;
            }

            const translatedTopics: HelpTopic[] = topicData.map(topic => ({
                ...topic,
                title: t(`help:${topic.id}.title`),
                questions: (topic as any).questions.map((qa: {q: string, a: string}) => ({
                    q: t(`help:${qa.q}`),
                    a: t(`help:${qa.a}`)
                }))
            }));

            setAllTopics(translatedTopics);
            if (translatedTopics.length > 0 && !activeTopic) {
                setActiveTopic(translatedTopics[0]);
            }
        }
    }, [loadableTranslations, t, activeTopic]);

    const filteredSidebarTopics = useMemo(() => {
        if (!searchQuery.trim()) {
            return allTopics;
        }
        const lowerQuery = searchQuery.toLowerCase();
        return allTopics.filter(topic =>
            topic.title.toLowerCase().includes(lowerQuery) ||
            topic.questions.some(qa => qa.q.toLowerCase().includes(lowerQuery) || qa.a.toLowerCase().includes(lowerQuery))
        );
    }, [allTopics, searchQuery]);

    const selectTopic = useCallback((topicId: string) => {
        const topic = allTopics.find(t => t.id === topicId);
        if (topic) {
            setActiveTopic(topic);
        }
    }, [allTopics]);
    
    useEffect(() => {
        if (filteredSidebarTopics.length > 0 && activeTopic && !filteredSidebarTopics.find(t => t.id === activeTopic.id)) {
            setActiveTopic(filteredSidebarTopics[0]);
        } else if (filteredSidebarTopics.length === 0) {
            setActiveTopic(null);
        }
    }, [filteredSidebarTopics, activeTopic]);


    const iconMap: Record<string, React.FC<any>> = useMemo(() => ({
        HelpIcon, UsersIcon, BookIcon, MovieIcon, AudioIcon, ImageIcon, JoystickIcon, WebIcon, StarIcon, SettingsIcon, InfoIcon, CompassIcon, CollectionIcon, SparklesIcon, UploadIcon
    }), []);

    return { t, activeTopic, selectTopic, searchQuery, setSearchQuery, filteredSidebarTopics, iconMap };
};

export type HelpViewContextType = ReturnType<typeof useHelpView>;