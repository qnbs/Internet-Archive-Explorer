import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCommands } from '../hooks/useCommands';
import type { Command, View } from '../types';
import { SearchIcon } from './Icons';
import { useLanguage } from '../hooks/useLanguage';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';
import { useSetAtom } from 'jotai';
import { activeViewAtom } from '../store';
import { searchQueryAtom } from '../store';

interface CommandPaletteProps {
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  
  const setActiveView = useSetAtom(activeViewAtom);
  const setGlobalSearchQuery = useSetAtom(searchQueryAtom);
  
  const paletteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const commandActions = {
      navigateTo: (view: View) => {
          setActiveView(view);
          onClose();
      },
      globalSearch: (q: string) => {
          setGlobalSearchQuery(q);
          setActiveView('explore');
          onClose();
      },
      onClosePalette: onClose,
  };
  const commands = useCommands(commandActions);


  useModalFocusTrap({ modalRef: paletteRef, isOpen: isMounted, onClose });

  useEffect(() => {
    setIsMounted(true);
    inputRef.current?.focus();
  }, []);

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
      // FIX: Explicitly type the accumulator to help TypeScript infer the return type correctly.
      return filteredCommands.reduce((acc: Record<string, Command[]>, cmd) => {
          (acc[cmd.section] = acc[cmd.section] || []).push(cmd);
          return acc;
      // FIX: Cast the initial value of reduce to the correct type to avoid `unknown` type inference.
      }, {} as Record<string, Command[]>);
  }, [filteredCommands]);
  
  const flatCommands = useMemo(() => filteredCommands, [filteredCommands]);


  useEffect(() => {
    setActiveIndex(0);
  }, [query]);
  
   useEffect(() => {
        const itemElement = document.getElementById(`command-item-${activeIndex}`);
        itemElement?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % flatCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + flatCommands.length) % flatCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if(flatCommands[activeIndex]) {
          flatCommands[activeIndex].action();
      } else if (query.trim()) {
          commandActions.globalSearch(query);
      }
    }
  };
  
  return (
    <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-start pt-24 p-4 transition-opacity duration-300 ${isMounted ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}>
      <div
        ref={paletteRef}
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-label"
      >
        <h2 id="command-palette-label" className="sr-only">{t('commandPalette:title')}</h2>
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <SearchIcon className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('commandPalette:placeholder')}
            className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-list"
            aria-activedescendant={`command-item-${activeIndex}`}
          />
        </div>
        <div id="command-list" role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
            {flatCommands.length > 0 ? (
                Object.entries(groupedCommands).map(([section, commandsInSection]) => (
                    <div key={section} className="mb-2">
                        <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400" id={`section-header-${section}`}>{section}</h3>
                        <ul role="group" aria-labelledby={`section-header-${section}`}>
                        {commandsInSection.map(cmd => {
                             const currentIndex = flatCommands.findIndex(c => c.id === cmd.id);
                             const isActive = currentIndex === activeIndex;
                            return (
                                <li
                                    id={`command-item-${currentIndex}`}
                                    key={cmd.id}
                                    onClick={() => { cmd.action(); }}
                                    onMouseMove={() => setActiveIndex(currentIndex)}
                                    role="option"
                                    aria-selected={isActive}
                                    className={`w-full text-left flex items-center space-x-3 p-2 rounded-md transition-colors cursor-pointer ${isActive ? 'bg-cyan-100 dark:bg-cyan-500/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                                >
                                    {cmd.icon}
                                    <div className="flex-grow">
                                        <p className={`text-sm font-medium ${isActive ? 'text-cyan-800 dark:text-cyan-300' : 'text-gray-800 dark:text-gray-200'}`}>{cmd.label}</p>
                                        {cmd.description && <p className={`text-xs ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-500 dark:text-gray-400'}`}>{cmd.description}</p>}
                                    </div>
                                </li>
                            );
                        })}
                        </ul>
                    </div>
                ))
            ) : (
                <div className="p-4 text-center text-sm text-gray-500">{t('common:noResultsFound')}</div>
            )}
        </div>
      </div>
    </div>
  );
};