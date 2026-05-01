import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useCommands } from '@/hooks/useCommands';
import { useLanguage } from '@/hooks/useLanguage';
import { libraryItemIdentifiersAtom } from '@/store/favorites';
import type { View } from '@/types';
import { activeViewAtom, searchQueryAtom } from '../store';

interface CommandPaletteProps {
  onClose: () => void;
}

const SectionIcon: React.FC<{ section: string }> = ({ section }) => {
  const cls = 'w-3.5 h-3.5 inline-block mr-1.5 opacity-60';
  if (section.toLowerCase().includes('navig') || section.toLowerCase().includes('nav'))
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    );
  if (section.toLowerCase().includes('ai'))
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"
        />
      </svg>
    );
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose }) => {
  const setActiveView = useSetAtom(activeViewAtom);
  const setGlobalSearchQuery = useSetAtom(searchQueryAtom);
  const libraryIds = useAtomValue(libraryItemIdentifiersAtom);
  const { addToast } = useToast();
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

  const extraCommands = [
    {
      id: 'ai-insight',
      section: t('commandPalette:sections.ai') || 'AI',
      label: t('commandPalette:aiInsight') || 'AI Insight',
      description: t('commandPalette:aiInsightDesc') || 'Open AI Archive for deep analysis',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"
          />
        </svg>
      ),
      action: () => {
        setActiveView('aiArchive');
        onClose();
      },
      keywords: 'ai intelligence analysis insight gemini',
    },
    {
      id: 'share-current',
      section: t('commandPalette:sections.actions') || 'Actions',
      label: t('commandPalette:share') || 'Share current page',
      description: t('commandPalette:shareDesc') || 'Copy a link to this page to clipboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      ),
      action: () => {
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => addToast(t('commandPalette:shareCopied') || 'Link copied!', 'success'));
        onClose();
      },
      keywords: 'share copy link clipboard url',
    },
    {
      id: 'open-library',
      section: t('commandPalette:sections.actions') || 'Actions',
      label: t('commandPalette:myLibrary') || 'My Library',
      description: `${libraryIds.size} ${t('commandPalette:myLibraryItems') || 'saved items'}`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      ),
      action: () => {
        setActiveView('library');
        onClose();
      },
      keywords: 'library favorites saved bookmarks',
    },
  ];

  const allCommands = [...commands, ...extraCommands];
  const grouped = allCommands.reduce<Record<string, typeof allCommands>>((acc, cmd) => {
    (acc[cmd.section] = acc[cmd.section] || []).push(cmd);
    return acc;
  }, {});

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-start pt-24 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <Command
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t('commandPalette:title')}
          >
            <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <svg
                className="w-5 h-5 text-gray-400 mr-3 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <Command.Input
                autoFocus={window.matchMedia('(hover: hover) and (pointer: fine)').matches}
                placeholder={t('commandPalette:placeholder')}
                className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none text-base"
              />
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-xs text-gray-400 border border-gray-300 dark:border-gray-600 ml-2 shrink-0">
                ESC
              </kbd>
            </div>

            <Command.List
              className="max-h-[60vh] overflow-y-auto p-2 overscroll-contain"
              aria-live="polite"
            >
              <Command.Empty className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                {t('commandPalette:noResults') || t('common:noResultsFound')}
              </Command.Empty>

              {Object.entries(grouped).map(([section, cmds]) => (
                <Command.Group
                  key={section}
                  heading={
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1.5 flex items-center">
                      <SectionIcon section={section} />
                      {section}
                    </span>
                  }
                  className="mb-2"
                >
                  {cmds.map((cmd) => (
                    <Command.Item
                      key={cmd.id}
                      value={`${cmd.label} ${(cmd as { keywords?: string }).keywords ?? ''} ${cmd.description ?? ''}`}
                      onSelect={() => cmd.action()}
                      className="flex items-center space-x-3 p-2.5 rounded-lg cursor-pointer transition-colors text-gray-800 dark:text-gray-200 data-[selected=true]:bg-accent-500/15 data-[selected=true]:text-accent-700 dark:data-[selected=true]:text-accent-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 outline-none"
                    >
                      <span className="text-gray-500 dark:text-gray-400 shrink-0">{cmd.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{cmd.label}</p>
                        {cmd.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {cmd.description}
                          </p>
                        )}
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>

            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
              <span>
                <kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 mr-1">
                  ↑↓
                </kbd>
                {t('commandPalette:navigate') || 'Navigate'}
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 mr-1">
                  ↵
                </kbd>
                {t('commandPalette:select') || 'Select'}
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 mr-1">
                  ESC
                </kbd>
                {t('commandPalette:close') || 'Close'}
              </span>
            </div>
          </Command>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
