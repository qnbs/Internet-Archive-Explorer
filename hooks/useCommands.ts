import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { UPLOADER_DATA } from '../pages/uploaderData';
import type { Command, View, Uploader } from '../types';
import {
  CompassIcon, StarIcon, UsersIcon, BookIcon, MovieIcon, AudioIcon, ImageIcon,
  JoystickIcon, SettingsIcon, HelpIcon, SunIcon, MoonIcon, LanguageIcon, ArrowRightIcon,
  SearchIcon
} from '../components/Icons';

interface CommandActions {
  navigateTo: (view: View) => void;
  selectUploader: (uploader: Uploader) => void;
  globalSearch: (query: string) => void;
}

export const useCommands = (actions: CommandActions): Command[] => {
  const { t, setLanguage, language } = useLanguage();
  const { setTheme, theme, resolvedTheme } = useTheme();

  const commands = useMemo(() => {
    const iconClass = "w-5 h-5 text-gray-400";

    const navigationCommands: Command[] = [
      // FIX: Replaced JSX with React.createElement to be valid in a .ts file
      { id: 'nav-explore', section: t('commandPalette.sections.navigation'), label: t('sideMenu.explore'), description: t('commandPalette.nav.exploreDesc'), icon: React.createElement(CompassIcon, { className: iconClass }), action: () => actions.navigateTo('explore'), keywords: 'home main discover search' },
      { id: 'nav-favorites', section: t('commandPalette.sections.navigation'), label: t('sideMenu.favorites'), description: t('commandPalette.nav.favoritesDesc'), icon: React.createElement(StarIcon, { className: iconClass }), action: () => actions.navigateTo('favorites'), keywords: 'saved bookmarks' },
      { id: 'nav-uploaders', section: t('commandPalette.sections.navigation'), label: t('sideMenu.uploaderHub'), description: t('commandPalette.nav.uploadersDesc'), icon: React.createElement(UsersIcon, { className: iconClass }), action: () => actions.navigateTo('uploaders'), keywords: 'community contributors' },
      { id: 'nav-scriptorium', section: t('commandPalette.sections.navigation'), label: t('sideMenu.scriptorium'), description: t('commandPalette.nav.scriptoriumDesc'), icon: React.createElement(BookIcon, { className: iconClass }), action: () => actions.navigateTo('scriptorium'), keywords: 'books texts documents' },
      { id: 'nav-cinematheque', section: t('commandPalette.sections.navigation'), label: t('sideMenu.cinematheque'), description: t('commandPalette.nav.cinemathequeDesc'), icon: React.createElement(MovieIcon, { className: iconClass }), action: () => actions.navigateTo('movies'), keywords: 'video film' },
      { id: 'nav-audiothek', section: t('commandPalette.sections.navigation'), label: t('sideMenu.audiothek'), description: t('commandPalette.nav.audiothekDesc'), icon: React.createElement(AudioIcon, { className: iconClass }), action: () => actions.navigateTo('audio'), keywords: 'music sound' },
      { id: 'nav-images', section: t('commandPalette.sections.navigation'), label: t('sideMenu.imagesHub'), description: t('commandPalette.nav.imagesDesc'), icon: React.createElement(ImageIcon, { className: iconClass }), action: () => actions.navigateTo('image'), keywords: 'pictures photos' },
      { id: 'nav-recroom', section: t('commandPalette.sections.navigation'), label: t('sideMenu.recRoom'), description: t('commandPalette.nav.recroomDesc'), icon: React.createElement(JoystickIcon, { className: iconClass }), action: () => actions.navigateTo('recroom'), keywords: 'games software dos' },
      { id: 'nav-settings', section: t('commandPalette.sections.navigation'), label: t('sideMenu.settings'), description: t('commandPalette.nav.settingsDesc'), icon: React.createElement(SettingsIcon, { className: iconClass }), action: () => actions.navigateTo('settings'), keywords: 'options config' },
      { id: 'nav-help', section: t('commandPalette.sections.navigation'), label: t('sideMenu.help'), description: t('commandPalette.nav.helpDesc'), icon: React.createElement(HelpIcon, { className: iconClass }), action: () => actions.navigateTo('help'), keywords: 'faq support' },
    ];

    const actionCommands: Command[] = [
      // FIX: Replaced JSX with React.createElement
      { id: 'action-theme', section: t('commandPalette.sections.actions'), label: t('commandPalette.actions.toggleTheme'), description: t('commandPalette.actions.toggleThemeDesc'), icon: resolvedTheme === 'dark' ? React.createElement(SunIcon, { className: iconClass }) : React.createElement(MoonIcon, { className: iconClass }), action: () => setTheme(resolvedTheme === 'light' ? 'dark' : 'light'), keywords: 'dark light mode appearance' },
      { id: 'action-language', section: t('commandPalette.sections.actions'), label: t('commandPalette.actions.toggleLanguage'), description: t('commandPalette.actions.toggleLanguageDesc'), icon: React.createElement(LanguageIcon, { className: iconClass }), action: () => setLanguage(language === 'en' ? 'de' : 'en'), keywords: 'german english sprache' },
    ];
    
    const uploaderCommands: Command[] = UPLOADER_DATA.map(uploader => ({
        id: `uploader-${uploader.searchUploader}`,
        section: t('commandPalette.sections.uploaders'),
        label: uploader.username,
        description: t('commandPalette.uploaders.goToDesc', { uploader: uploader.username }),
        // FIX: Replaced JSX with React.createElement
        icon: React.createElement(ArrowRightIcon, { className: iconClass }),
        action: () => actions.selectUploader(uploader),
        keywords: t(uploader.descriptionKey)
    }));
    
    return [...navigationCommands, ...actionCommands, ...uploaderCommands];

  }, [t, theme, resolvedTheme, language, actions, setLanguage, setTheme]);

  // FIX: Added missing return statement for the hook.
  return commands;
};