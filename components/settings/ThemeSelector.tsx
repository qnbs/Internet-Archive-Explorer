import React from 'react';
import { useAtom } from 'jotai';
// FIX: Use direct imports to prevent circular dependency issues.
import { themeAtom } from '../../store/settings';
import type { Theme } from '../../types';
import { SunIcon, MoonIcon, SettingsIcon } from '../Icons';
import { useLanguage } from '../../hooks/useLanguage';

interface ThemeOption {
    value: Theme;
    labelKey: string;
    icon: React.ReactNode;
}

export const ThemeSelector: React.FC<{ ariaProps: object }> = ({ ariaProps }) => {
    const [theme, setTheme] = useAtom(themeAtom);
    const { t } = useLanguage();

    const options: ThemeOption[] = [
        { value: 'light', labelKey: 'settings:ui.themes.light', icon: <SunIcon className="w-5 h-5" /> },
        { value: 'dark', labelKey: 'settings:ui.themes.dark', icon: <MoonIcon className="w-5 h-5" /> },
        { value: 'system', labelKey: 'settings:ui.themes.system', icon: <SettingsIcon className="w-5 h-5" /> },
    ];

    return (
        <div className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg" {...ariaProps}>
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        theme === opt.value
                            ? 'bg-white dark:bg-gray-800 text-cyan-700 dark:text-cyan-300 shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-900/20'
                    }`}
                    aria-pressed={theme === opt.value}
                >
                    {opt.icon}
                    <span>{t(opt.labelKey)}</span>
                </button>
            ))}
        </div>
    );
};