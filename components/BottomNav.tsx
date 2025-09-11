import React from 'react';
import type { View } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { CompassIcon, MovieIcon, AudioIcon, ImageIcon, BookIcon } from './Icons';

interface NavItem {
    view: View;
    labelKey: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { view: 'explore', labelKey: 'bottomNav:explore', icon: <CompassIcon /> },
    { view: 'scriptorium', labelKey: 'bottomNav:books', icon: <BookIcon /> },
    { view: 'image', labelKey: 'bottomNav:images', icon: <ImageIcon /> },
    { view: 'movies', labelKey: 'bottomNav:movies', icon: <MovieIcon /> },
    { view: 'audio', labelKey: 'bottomNav:audio', icon: <AudioIcon /> },
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