import React, { useEffect, useRef } from 'react';
import type { View } from '../types';
import { HelpIcon, JoystickIcon, SettingsIcon, StarIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

// Icons
const CompassIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A9.003 9.003 0 003.06 11H1v2h2.06A9.003 9.003 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06z" /></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const MovieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m0 0v8m-4-8h4m10-8h4v8h-4m0 0v8h4M5 8h14a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2z" /></svg>;
const AudioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const WebIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9M3 12a9 9 0 019-9m-9 9a9 9 0 009 9m-9-9h18" /></svg>;
const ExternalLinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;
const UsersIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1H9" /></svg>;

interface NavItem {
    view?: View;
    labelKey: string;
    icon: React.ReactNode;
    href?: string;
}

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    activeView: View;
    setActiveView: (view: View) => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, activeView, setActiveView }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();
    
    const mainNavItems: NavItem[] = [ { view: 'explore', labelKey: 'sideMenu.explore', icon: <CompassIcon /> } ];
    const personalItems: NavItem[] = [ { view: 'favorites', labelKey: 'sideMenu.favorites', icon: <StarIcon className="h-6 w-6" /> } ];
    const communityItems: NavItem[] = [ { view: 'uploaders', labelKey: 'sideMenu.uploaderHub', icon: <UsersIcon className="h-6 w-6" /> } ];
    const collectionItems: NavItem[] = [
        { view: 'recroom', labelKey: 'sideMenu.recRoom', icon: <JoystickIcon className="h-6 w-6" /> },
        { view: 'scriptorium', labelKey: 'sideMenu.scriptorium', icon: <BookIcon /> },
        { view: 'movies', labelKey: 'sideMenu.cinematheque', icon: <MovieIcon /> },
        { view: 'audio', labelKey: 'sideMenu.audiothek', icon: <AudioIcon /> },
        { view: 'image', labelKey: 'sideMenu.imagesHub', icon: <ImageIcon /> },
    ];
    const toolItems: NavItem[] = [ { href: 'https://web.archive.org/', labelKey: 'sideMenu.waybackMachine', icon: <WebIcon className="h-6 w-6" /> } ];
    const appItems: NavItem[] = [
        { view: 'settings', labelKey: 'sideMenu.settings', icon: <SettingsIcon className="h-6 w-6" /> },
        { view: 'help', labelKey: 'sideMenu.help', icon: <HelpIcon className="h-6 w-6" /> },
        { href: 'https://archive.org/about/', labelKey: 'sideMenu.aboutIA', icon: <ExternalLinkIcon /> },
    ];

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    
    const handleNavigation = (item: NavItem) => {
        if(item.view) {
            setActiveView(item.view);
            onClose();
        }
    };

    const NavSection: React.FC<{titleKey: string, items: NavItem[]}> = ({ titleKey, items }) => (
        <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t(titleKey)}</h3>
            {items.map(item => {
                if(item.href) {
                     return (
                         <a key={item.labelKey} href={item.href} target="_blank" rel="noopener noreferrer" className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700/50">
                            {item.icon}
                            <span>{t(item.labelKey)}</span>
                        </a>
                     );
                }
                const isActive = activeView === item.view;
                return (
                    <button 
                        key={item.view} 
                        onClick={() => handleNavigation(item)} 
                        className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left ${isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-700/50'}`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {item.icon}
                        <span>{t(item.labelKey)}</span>
                    </button>
                );
            })}
        </div>
    );

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/70 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={menuRef}
                className={`fixed top-0 left-0 bottom-0 w-72 bg-gray-800 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="sidemenu-title"
            >
                <div className="p-4 border-b border-gray-700">
                    <h2 id="sidemenu-title" className="text-xl font-bold text-white">{t('sideMenu.title')}</h2>
                </div>
                <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100%-4.5rem)]">
                    <NavSection titleKey="sideMenu.main" items={mainNavItems} />
                    <NavSection titleKey="sideMenu.personal" items={personalItems} />
                    <NavSection titleKey="sideMenu.community" items={communityItems} />
                    <NavSection titleKey="sideMenu.collections" items={collectionItems} />
                    <NavSection titleKey="sideMenu.tools" items={toolItems} />
                    <div className="pt-4 border-t border-gray-700">
                        <NavSection titleKey="sideMenu.application" items={appItems} />
                    </div>
                </nav>
            </div>
        </>
    );
};
