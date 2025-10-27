import React from 'react';
import { useHelpViewContext } from '../../contexts/HelpViewContext';

export const HelpSidebar: React.FC = () => {
    const { t, filteredSidebarTopics, activeTopic, selectTopic, iconMap } = useHelpViewContext();
    
    return (
        <aside className="md:w-1/3">
            <h2 className="text-lg font-semibold mb-3">{t('common:topics')}</h2>
            <nav className="space-y-2">
                {filteredSidebarTopics.map(topic => {
                    const IconComponent = iconMap[topic.icon];
                    return (
                        <button 
                            key={topic.id} 
                            onClick={() => selectTopic(topic.id)}
                            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                                activeTopic?.id === topic.id 
                                ? 'bg-accent-50 text-accent-700 dark:bg-accent-500/20 dark:text-accent-300' 
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            {IconComponent && <IconComponent className="w-5 h-5 flex-shrink-0" />}
                            <span className="font-medium">{topic.title}</span>
                        </button>
                    );
                })}
                 {filteredSidebarTopics.length === 0 && (
                    <p className="text-gray-500 p-3">{t('common:noResultsFound')}</p>
                 )}
            </nav>
        </aside>
    );
};