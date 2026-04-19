import { useAtomValue } from 'jotai';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AudioIcon,
  BookIcon,
  CollectionIcon,
  CompassIcon,
  HelpIcon,
  ImageIcon,
  InfoIcon,
  JoystickIcon,
  MovieIcon,
  SettingsIcon,
  SparklesIcon,
  StarIcon,
  UploadIcon,
  UsersIcon,
  WebIcon,
} from '@/components/Icons';
import { loadableTranslationsAtom } from '@/store/i18n';
import type { HelpTranslationNamespace } from '@/types';
import { useLanguage } from './useLanguage';

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
      const rootData = loadableTranslations.data as Record<string, unknown>;
      const helpData = rootData.help as HelpTranslationNamespace | undefined;
      const topicData = helpData?.topics;

      if (!Array.isArray(topicData)) {
        console.error('Help topics data is not an array:', topicData);
        return;
      }

      const translatedTopics: HelpTopic[] = topicData.map((topic) => ({
        ...topic,
        title: t(`help:${topic.id}.title`),
        questions: topic.questions.map((qa) => ({
          q: t(`help:${qa.q}`),
          a: t(`help:${qa.a}`),
        })),
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
    return allTopics.filter(
      (topic) =>
        topic.title.toLowerCase().includes(lowerQuery) ||
        topic.questions.some(
          (qa) =>
            qa.q.toLowerCase().includes(lowerQuery) || qa.a.toLowerCase().includes(lowerQuery),
        ),
    );
  }, [allTopics, searchQuery]);

  const selectTopic = useCallback(
    (topicId: string) => {
      const topic = allTopics.find((t) => t.id === topicId);
      if (topic) {
        setActiveTopic(topic);
      }
    },
    [allTopics],
  );

  useEffect(() => {
    if (
      filteredSidebarTopics.length > 0 &&
      activeTopic &&
      !filteredSidebarTopics.find((t) => t.id === activeTopic.id)
    ) {
      setActiveTopic(filteredSidebarTopics[0]);
    } else if (filteredSidebarTopics.length === 0) {
      setActiveTopic(null);
    }
  }, [filteredSidebarTopics, activeTopic]);

  type IconComponent = React.ComponentType<{ className?: string }>;
  const iconMap: Record<string, IconComponent> = useMemo(
    () => ({
      HelpIcon,
      UsersIcon,
      BookIcon,
      MovieIcon,
      AudioIcon,
      ImageIcon,
      JoystickIcon,
      WebIcon,
      StarIcon,
      SettingsIcon,
      InfoIcon,
      CompassIcon,
      CollectionIcon,
      SparklesIcon,
      UploadIcon,
    }),
    [],
  );

  return {
    t,
    activeTopic,
    selectTopic,
    searchQuery,
    setSearchQuery,
    filteredSidebarTopics,
    iconMap,
  };
};

export type HelpViewContextType = ReturnType<typeof useHelpView>;
