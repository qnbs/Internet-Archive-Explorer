
import React from 'react';
import type { View } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { CompassIcon, StarIcon, BookIcon, MovieIcon, AudioIcon, ImageIcon, JoystickIcon, SettingsIcon, HelpIcon, CloseIcon, UsersIcon } from './Icons';

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
    { view: 'movies', labelKey: 'sideMenu:cinematheque', icon: <MovieIcon /> },
    { view: 'audio', labelKey: 'sideMenu:audiothek', icon: <AudioIcon /> },
    { view: 'image', labelKey: 'sideMenu:imagesHub', icon: <ImageIcon /> },
    { view: 'recroom', labelKey: 'sideMenu:recRoom', icon: <JoystickIcon /> },
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
            className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 ${isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-700'}`}
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
            <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-lg z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:shadow-none`}>
                <div className="p-4 h-full flex flex-col">
                    <div className="flex justify-between items-center md:hidden mb-4">
                        <h2 className="text-white text-lg font-bold">{t('sideMenu:title')}</h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
                            <CloseIcon />
                        </button>
                    </div>
                    <nav className="flex-grow overflow-y-auto">
                        <div>
                            {mainNavItems.map(item => <NavButton key={item.view} item={item} isActive={activeView === item.view} onClick={handleNavigation} />)}
                        </div>
                        <hr className="my-4 border-gray-700" />
                        <div>
                            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('sideMenu:community')}</h3>
                             {communityNavItems.map(item => <NavButton key={item.view} item={item} isActive={activeView === item.view} onClick={handleNavigation} />)}
                        </div>
                        <hr className="my-4 border-gray-700" />
                        <div>
                            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('sideMenu:collections')}</h3>
                            {collectionNavItems.map(item => <NavButton key={item.view} item={item} isActive={activeView === item.view} onClick={handleNavigation} />)}
                        </div>
                         <hr className="my-4 border-gray-700" />
                        <div>
                             {utilityNavItems.map(item => <NavButton key={item.view} item={item} isActive={activeView === item.view} onClick={handleNavigation} />)}
                        </div>
                    </nav>
                </div>
            </aside>
        </>
    );
};
