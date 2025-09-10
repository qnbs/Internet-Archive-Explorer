import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCommands } from '../hooks/useCommands';
import type { Command, View, Uploader } from '../types';
import { SearchIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface CommandActions {
  navigateTo: (view: View) => void;
  selectUploader: (uploader: Uploader) => void;
  globalSearch: (query: string) => void;
}

interface CommandPaletteProps {
  onClose: () => void;
  actions: CommandActions;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose, actions }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const commands = useCommands(actions);
  const paletteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    setIsMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab' && paletteRef.current) {
        const focusableElements = paletteRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === firstElement) { lastElement.focus(); e.preventDefault(); }
        } else {
            if (document.activeElement === lastElement) { firstElement.focus(); e.preventDefault(); }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    inputRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd => 
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.keywords?.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery)
    );
  }, [query, commands]);
  
  const groupedCommands = useMemo(() => {
      const groups: Record<string, Command[]> = {};
      for (const command of filteredCommands) {
          if (!groups[command.section]) {
              groups[command.section] = [];
          }
          groups[command.section].push(command);
      }
      // Re-flatten into a list that can be indexed easily
      return Object.values(groups).flat();
  }, [filteredCommands]);


  useEffect(() => {
    // Reset active index when query changes
    setActiveIndex(0);
  }, [query]);
  
   useEffect(() => {
        const itemElement = document.getElementById(`command-item-${activeIndex}`);
        itemElement?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % groupedCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + groupedCommands.length) % groupedCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if(groupedCommands[activeIndex]) {
          groupedCommands[activeIndex].action();
      } else if (query.trim()) {
          // If no command is selected but there's text, perform a search
          actions.globalSearch(query);
      }
    }
  };
  
  return (
    <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-start pt-24 p-4 transition-opacity duration-300 ${isMounted ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}>
      <div
        ref={paletteRef}
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <SearchIcon className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('commandPalette.placeholder')}
            className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
            {groupedCommands.length > 0 ? (
                Object.entries(
                    groupedCommands.reduce((acc, cmd) => {
                        (acc[cmd.section] = acc[cmd.section] || []).push(cmd);
                        return acc;
                    }, {} as Record<string, Command[]>)
                ).map(([section, commandsInSection]) => (
                    <div key={section} className="mb-2">
                        <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">{section}</h3>
                        {commandsInSection.map(cmd => {
                             const currentIndex = groupedCommands.findIndex(c => c.id === cmd.id);
                             const isActive = currentIndex === activeIndex;
                            return (
                                <button
                                    id={`command-item-${currentIndex}`}
                                    key={cmd.id}
                                    onClick={cmd.action}
                                    className={`w-full text-left flex items-center space-x-3 p-2 rounded-md transition-colors ${isActive ? 'bg-cyan-100 dark:bg-cyan-500/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                                >
                                    {cmd.icon}
                                    <div className="flex-grow">
                                        <p className={`text-sm font-medium ${isActive ? 'text-cyan-800 dark:text-cyan-300' : 'text-gray-800 dark:text-gray-200'}`}>{cmd.label}</p>
                                        {cmd.description && <p className={`text-xs ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-500 dark:text-gray-400'}`}>{cmd.description}</p>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ))
            ) : (
                <div className="p-4 text-center text-sm text-gray-500">{t('common.noResultsFound')}</div>
            )}
        </div>
      </div>
    </div>
  );
};
