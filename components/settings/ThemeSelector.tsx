import React from 'react';
import { useAtom } from 'jotai';
import { themeAtom } from '@/store/settings';
import type { Theme } from '@/types';
import { SunIcon, MoonIcon, SettingsIcon } from '@/components/Icons';
import { useLanguage } from '@/hooks/useLanguage';

interface ThemeOption {
  value: Theme;
  labelKey: string;
  icon: React.ReactNode;
}

// Inline Sepia icon (book/feather)
const SepiaIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

export const ThemeSelector: React.FC<{ ariaProps: object }> = ({ ariaProps }) => {
  const [theme, setTheme] = useAtom(themeAtom);
  const { t } = useLanguage();

  const options: ThemeOption[] = [
    { value: 'light', labelKey: 'settings:ui.themes.light', icon: <SunIcon className="w-5 h-5" /> },
    { value: 'dark', labelKey: 'settings:ui.themes.dark', icon: <MoonIcon className="w-5 h-5" /> },
    { value: 'sepia', labelKey: 'settings:ui.themes.sepia', icon: <SepiaIcon className="w-5 h-5" /> },
    { value: 'system', labelKey: 'settings:ui.themes.system', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <div
      className="flex items-center flex-wrap gap-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg"
      {...ariaProps}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`flex-1 flex items-center justify-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            theme === opt.value
              ? 'bg-white dark:bg-gray-800 text-cyan-800 dark:text-cyan-200 shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-900/20'
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
