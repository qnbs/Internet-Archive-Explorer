

import React from 'react';
import type { View } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// SVG Icons for Navigation
const CompassIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A9.003 9.003 0 003.06 11H1v2h2.06A9.003 9.003 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06z" /></svg>;
const MovieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m0 0v8m-4-8h4m10-8h4v8h-4m0 0v8h4M5 8h14a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2z" /></svg>;
const AudioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;

interface NavItem {
    view: View;
    labelKey: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { view: 'explore', labelKey: 'bottomNav.explore', icon: <CompassIcon /> },
    { view: 'scriptorium', labelKey: 'bottomNav.books', icon: <BookIcon /> },
    { view: 'image', labelKey: 'bottomNav.images', icon: <ImageIcon /> },
    { view: 'movies', labelKey: 'bottomNav.movies', icon: <MovieIcon /> },
    { view: 'audio', labelKey: 'bottomNav.audio', icon: <AudioIcon /> },
];

interface BottomNavProps {
    activeView: View;
    setActiveView: (view: View) => void;
}

const NavButton: React.FC<{ item: NavItem, isActive: boolean, onClick: (view: View) => void }> = ({ item, isActive, onClick }) => {
    const { t } = useLanguage();
    return (
        <button
            onClick={() => onClick(item.view)}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            aria-current={isActive ? 'page' : undefined}
        >
            {item.icon}
            <span className="text-xs font-medium mt-1">{t(item.labelKey)}</span>
        </button>
    );
};


export const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-t-lg dark:shadow-black/30 border-t border-gray-200 dark:border-gray-700/50 flex md:hidden z-20">
      {navItems.map(item => (
        <NavButton
          key={item.view}
          item={item}
          isActive={activeView === item.view}
          onClick={setActiveView}
        />
      ))}
    </nav>
  );
};
