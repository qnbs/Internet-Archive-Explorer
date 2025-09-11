import React from 'react';
import type { View } from '../types';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../hooks/useLanguage';
import { CompassIcon, StarIcon, BookIcon, MovieIcon, AudioIcon, ImageIcon, JoystickIcon, SettingsIcon, HelpIcon, CloseIcon, UsersIcon, WebIcon } from './Icons';

interface NavItem {
    view: View;
    labelKey: string;
    icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
    { view: 'explore', labelKey: 'sideMenu:explore', icon: <CompassIcon /> },
    { view: 'favorites', labelKey: 'sideMenu:favorites', icon: <StarIcon /> },
];

const communityNavItems: NavItem[] = [
    { view: 'uploaderHub', labelKey: 'sideMenu:uploaderHub', icon: <UsersIcon /> },
];

const collectionNavItems: NavItem[] = [
    { view: 'scriptorium', labelKey: 'sideMenu:scriptorium', icon: <BookIcon /> },
    { view: 'movies', labelKey: 'sideMenu:videothek', icon: <MovieIcon /> },
    { view: 'audio', labelKey: 'sideMenu:audiothek', icon: <AudioIcon /> },
    { view: 'image', labelKey: 'sideMenu:imagesHub', icon: <ImageIcon /> },
    { view: 'recroom', labelKey: 'sideMenu:recRoom', icon: <JoystickIcon /> },
];

const toolNavItems: NavItem[] = [
    { view: 'web', labelKey: 'sideMenu:webArchive', icon: <WebIcon /> },
];

const utilityNavItems: NavItem[] = [
    { view: 'settings', labelKey: 'sideMenu:settings', icon: <SettingsIcon /> },
    { view: 'help', labelKey: 'sideMenu:help', icon: <HelpIcon /> },
];

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    activeView: View;
    setActiveView: (view: View) => void;
}

const NavButton: React.FC<{ item: NavItem, isActive: boolean, onClick: (view: View) => void }> = ({ item, isActive, onClick }) => {
    const { t } = useLanguage();
    return (
        <button
            onClick={() => onClick(item.view)}
            className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 ${isActive ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            aria-current={isActive ? 'page' : undefined}
        >
            <span className="mr-3">{item.icon}</span>
            <span className="font-medium">{t(item.labelKey)}</span>
        </button>
    );
};

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, activeView, setActiveView }) => {
    const { t } = useLanguage();
    const handleNavigation = (view: View) => {
        setActiveView(view);
        onClose();
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-30 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
            <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:shadow-none flex flex-col border-r border-gray-200 dark:border-transparent`}>
                {/* Desktop Logo Header */}
                <div className="hidden md:flex flex-shrink-0 items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700/50">
                     <button
                        onClick={() => handleNavigation('explore')}
                        className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white flex-shrink-0"
                        aria-label="Home"
                    >
                        <img src="/logo192.png" alt="Archive Explorer Logo" className="h-8 w-8" />
                        <span>Archive Explorer</span>
                    </button>
                </div>
                
                {/* Scrollable Nav section */}
                <div className="flex-grow flex flex-col overflow-y-auto">
                    <div className="p-4">
                        <div className="flex justify-between items-center md:hidden mb-4">
                            <h2 className="text-gray-900 dark:text-white text-lg font-bold">{t('sideMenu:title')}</h2>
                            <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                <CloseIcon />
                            </button>
                        </div>
                        <nav>
                            <div>
                                {mainNavItems.map(item => <NavButton key={item.view} item={item} isActive={activeView === item.view} onClick={handleNavigation} />)}
                            </div>
                            <hr className="my-4 border-gray-200 dark:border-gray-700" />
                            <div>
                                <h3 className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('sideMenu:community')}</h3>
                                {communityNavItems.map(item => <NavButton key={item.view} item={item} isActive={activeView === item.view} onClick={handleNavigation} />)}
                            </div>
                            <hr className="my-4 border-gray-200 dark:border-gray-700" />
                            <div>
                                <h3 className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('sideMenu:collections')}</h3>
                                {collectionNavItems.map(item => <NavButton key={item.view} item={item} isActive={activeView === item.view} onClick={handleNavigation} />)}
                            </div>
                             <hr className="my-4 border-gray-200 dark:border-gray-700" />
                            <div>
                                <h3 className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('sideMenu:tools')}</h3>
                                {toolNavItems.map(item => <NavButton key={item.view} item={item} isActive={activeView === item.view} onClick={handleNavigation} />)}
                            </div>
                            <hr className="my-4 border-gray-200 dark:border-gray-700" />
                            <div>
                                {utilityNavItems.map(item => <NavButton key={item.view} item={item} isActive={activeView === item.view} onClick={handleNavigation} />)}
                            </div>
                        </nav>
                    </div>
                </div>
            </aside>
        </>
    );
};