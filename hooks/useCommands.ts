import React, { useMemo } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useAtom, useAtomValue } from 'jotai';
import { themeAtom, resolvedThemeAtom, languageAtom } from '../store';
import type { Command, View } from '../types';
import {
  CompassIcon, StarIcon, BookIcon, MovieIcon, AudioIcon, ImageIcon, UsersIcon,
  JoystickIcon, SettingsIcon, HelpIcon, SunIcon, MoonIcon, LanguageIcon, WebIcon
} from '../components/Icons';

interface CommandActions {
  navigateTo: (view: View) => void;
  globalSearch: (query: string) => void;
}

export const useCommands = (actions: CommandActions): Command[] => {
  const { t } = useLanguage();
  const [theme, setTheme] = useAtom(themeAtom);
  const [language, setLanguage] = useAtom(languageAtom);
  const resolvedTheme = useAtomValue(resolvedThemeAtom);

  const commands = useMemo(() => {
    const iconClass = "w-5 h-5 text-gray-400";

    const navigationCommands: Command[] = [
      { id: 'nav-explore', section: t('commandPalette:sections.navigation'), label: t('sideMenu:explore'), description: t('commandPalette:nav.exploreDesc'), icon: React.createElement(CompassIcon, { className: iconClass }), action: () => actions.navigateTo('explore'), keywords: 'home main discover search' },
      { id: 'nav-favorites', section: t('commandPalette:sections.navigation'), label: t('sideMenu:favorites'), description: t('commandPalette:nav.favoritesDesc'), icon: React.createElement(StarIcon, { className: iconClass }), action: () => actions.navigateTo('favorites'), keywords: 'saved bookmarks' },
      { id: 'nav-scriptorium', section: t('commandPalette:sections.navigation'), label: t('sideMenu:scriptorium'), description: t('commandPalette:nav.scriptoriumDesc'), icon: React.createElement(BookIcon, { className: iconClass }), action: () => actions.navigateTo('scriptorium'), keywords: 'books texts documents' },
      { id: 'nav-videothek', section: t('commandPalette:sections.navigation'), label: t('sideMenu:videothek'), description: t('commandPalette:nav.videothekDesc'), icon: React.createElement(MovieIcon, { className: iconClass }), action: () => actions.navigateTo('movies'), keywords: 'video film' },
      { id: 'nav-audiothek', section: t('commandPalette:sections.navigation'), label: t('sideMenu:audiothek'), description: t('commandPalette:nav.audiothekDesc'), icon: React.createElement(AudioIcon, { className: iconClass }), action: () => actions.navigateTo('audio'), keywords: 'music sound' },
      { id: 'nav-images', section: t('commandPalette:sections.navigation'), label: t('sideMenu:imagesHub'), description: t('commandPalette:nav.imagesDesc'), icon: React.createElement(ImageIcon, { className: iconClass }), action: () => actions.navigateTo('image'), keywords: 'pictures photos' },
      { id: 'nav-recroom', section: t('commandPalette:sections.navigation'), label: t('sideMenu:recRoom'), description: t('commandPalette:nav.recroomDesc'), icon: React.createElement(JoystickIcon, { className: iconClass }), action: () => actions.navigateTo('recroom'), keywords: 'games software dos' },
      { id: 'nav-webarchive', section: t('commandPalette:sections.navigation'), label: t('sideMenu:webArchive'), description: t('commandPalette:nav.webArchiveDesc'), icon: React.createElement(WebIcon, { className: iconClass }), action: () => window.open('https://web.archive.org/', '_blank'), keywords: 'wayback machine websites history' },
      { id: 'nav-settings', section: t('commandPalette:sections.navigation'), label: t('sideMenu:settings'), description: t('commandPalette:nav.settingsDesc'), icon: React.createElement(SettingsIcon, { className: iconClass }), action: () => actions.navigateTo('settings'), keywords: 'options config' },
      { id: 'nav-help', section: t('commandPalette:sections.navigation'), label: t('sideMenu:help'), description: t('commandPalette:nav.helpDesc'), icon: React.createElement(HelpIcon, { className: iconClass }), action: () => actions.navigateTo('help'), keywords: 'faq support' },
    ];

    const actionCommands: Command[] = [
      { id: 'action-theme', section: t('commandPalette:sections.actions'), label: t('commandPalette:actions.toggleTheme'), description: t('commandPalette:actions.toggleThemeDesc'), icon: resolvedTheme === 'dark' ? React.createElement(SunIcon, { className: iconClass }) : React.createElement(MoonIcon, { className: iconClass }), action: () => setTheme(resolvedTheme === 'light' ? 'dark' : 'light'), keywords: 'dark light mode appearance' },
      { id: 'action-language', section: t('commandPalette:sections.actions'), label: t('commandPalette:actions.toggleLanguage'), description: t('commandPalette:actions.toggleLanguageDesc'), icon: React.createElement(LanguageIcon, { className: iconClass }), action: () => setLanguage(language === 'en' ? 'de' : 'en'), keywords: 'german english sprache' },
    ];
    
    return [...navigationCommands, ...actionCommands];

  }, [t, resolvedTheme, language, actions, setLanguage, setTheme]);

  return commands;
};