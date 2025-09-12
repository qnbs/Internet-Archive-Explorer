import React, { useState, useEffect, useMemo } from 'react';
import { useAtomValue } from 'jotai';
// FIX: Use direct imports to prevent circular dependency issues.
import { loadableTranslationsAtom } from '../store/i18n';
import { useLanguage } from '../hooks/useLanguage';
import { 
    SearchIcon, HelpIcon, UsersIcon, BookIcon, MovieIcon, AudioIcon, ImageIcon, 
    JoystickIcon, WebIcon, StarIcon, SettingsIcon, InfoIcon, CompassIcon, CollectionIcon, SparklesIcon, UploadIcon
} from '../components/Icons';
import { sanitizeHtml } from '../utils/sanitizer';

interface HelpQuestion {
    q: string;
    a: string;
}

interface HelpTopic {
    id: string;
    title: string;
    icon: string;
    questions: HelpQuestion[];
}

const AccordionItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-700">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-4" aria-expanded={isOpen}>
        <h3 className="font-semibold text-lg text-gray-200">{title}</h3>
        <svg className={`w-6 h-6 text-cyan-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
            <div className="p-4 pt-0 text-gray-300 leading-relaxed space-y-3 prose-a:text-cyan-400 hover:prose-a:underline prose-ul:list-disc prose-ul:pl-6 prose-li:mb-1 prose-code:bg-gray-700 prose-code:px-1 prose-code:rounded prose-strong:text-gray-200" dangerouslySetInnerHTML={{ __html: sanitizeHtml(children as string) }} />
        </div>
      </div>
    </div>
  );
};


const HelpView: React.FC = () => {
    const { t } = useLanguage();
    const loadableTranslations = useAtomValue(loadableTranslationsAtom);
    
    const [topics, setTopics] = useState<HelpTopic[]>([]);
    const [activeTopic, setActiveTopic] = useState<HelpTopic | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (loadableTranslations.state === 'hasData') {
            const helpData = (loadableTranslations.data as any).help;
            const topicData = helpData.topics as HelpTopic[];
            
            if (!Array.isArray(topicData)) {
                console.error("Help topics data is not an array:", topicData);
                return;
            }

            const translatedTopics = topicData.map(topic => ({
                ...topic,
                title: t(`help:${topic.id}.title`),
                questions: topic.questions.map(qa => ({
                    q: t(`help:${qa.q}`),
                    a: t(`help:${qa.a}`)
                }))
            }));

            setTopics(translatedTopics);
            if (translatedTopics.length > 0) {
                setActiveTopic(translatedTopics[0]);
            }
        }
    }, [loadableTranslations, t]);

    const filteredTopics = useMemo(() => {
        if (!searchQuery.trim()) {
            return topics;
        }
        const lowerQuery = searchQuery.toLowerCase();
        return topics.filter(topic =>
            topic.title.toLowerCase().includes(lowerQuery) ||
            topic.questions.some(qa => qa.q.toLowerCase().includes(lowerQuery) || qa.a.toLowerCase().includes(lowerQuery))
        );
    }, [topics, searchQuery]);

    const iconMap: Record<string, React.FC<any>> = {
        HelpIcon, UsersIcon, BookIcon, MovieIcon, AudioIcon, ImageIcon, JoystickIcon, WebIcon, StarIcon, SettingsIcon, InfoIcon, CompassIcon, CollectionIcon, SparklesIcon, UploadIcon
    };

    return (
        <div className="space-y-8 animate-page-fade-in">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">{t('help:title')}</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{t('help:subtitle')}</p>
            </header>
            
            <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('help:searchPlaceholder')}
                    className="w-full bg-white dark:bg-gray-800/60 border-2 border-gray-200 dark:border-gray-700/50 focus-within:border-cyan-500 rounded-lg py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-colors"
                />
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/3">
                    <h2 className="text-lg font-semibold mb-3">{t('common:topics')}</h2>
                    <nav className="space-y-2">
                        {filteredTopics.map(topic => {
                            const IconComponent = iconMap[topic.icon];
                            return (
                                <button 
                                    key={topic.id} 
                                    onClick={() => setActiveTopic(topic)}
                                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                                        activeTopic?.id === topic.id 
                                        ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300' 
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                    }`}
                                >
                                    {IconComponent && <IconComponent className="w-5 h-5 flex-shrink-0" />}
                                    <span className="font-medium">{topic.title}</span>
                                </button>
                            );
                        })}
                         {filteredTopics.length === 0 && (
                            <p className="text-gray-500 p-3">{t('common:noResultsFound')}</p>
                         )}
                    </nav>
                </aside>
                <main className="flex-1 p-6 bg-white dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50 min-h-[50vh]">
                    {activeTopic ? (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">{activeTopic.title}</h2>
                            <div className="space-y-2">
                                {activeTopic.questions.map((qa, index) => (
                                    <AccordionItem key={index} title={qa.q}>
                                        {qa.a}
                                    </AccordionItem>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400">{searchQuery ? t('common:noResultsFound') : t('help:selectTopic')}</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default HelpView;