import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Language, Theme } from '../types';
import { useTheme } from '../contexts/ThemeContext';

// --- Helper Components ---
const SettingsCard: React.FC<{title: string, children: React.ReactNode, description?: string}> = ({ title, children, description }) => (
    <div className="bg-gray-200/50 dark:bg-gray-800/60 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{title}</h2>
        {description && <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">{description}</p>}
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const SettingRow: React.FC<{title: string, description: string, children: React.ReactNode}> = ({ title, description, children }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="mb-3 sm:mb-0">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">{description}</p>
        </div>
        <div className="flex-shrink-0">
            {children}
        </div>
    </div>
);

const ToggleSwitch: React.FC<{checked: boolean, onChange: (checked: boolean) => void}> = ({ checked, onChange }) => (
    <button
        type="button"
        className={`${
            checked ? 'bg-cyan-500' : 'bg-gray-400 dark:bg-gray-600'
        } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-cyan-500`}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
    >
        <span className={`${
            checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
    </button>
);

// --- Main Settings View ---

type AppSettings = {
    defaultSort: string;
    autoplayMedia: boolean;
    reduceMotion: boolean;
    enableAiFeatures: boolean;
};

const defaultSettings: AppSettings = {
    defaultSort: '-downloads',
    autoplayMedia: false,
    reduceMotion: false,
    enableAiFeatures: true,
};


export const SettingsView: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const { t, language, setLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();
    
    useEffect(() => {
        try {
            const storedSettings = localStorage.getItem('app-settings');
            if (storedSettings) {
                setSettings(JSON.parse(storedSettings));
            }
        } catch (e) { console.error("Failed to load settings:", e); }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('app-settings', JSON.stringify(settings));
        } catch (e) { console.error("Failed to save settings:", e); }
    }, [settings]);

    const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleExport = (key: string, fileName: string) => {
        const data = localStorage.getItem(key);
        if (!data) {
            alert('No data found to export.');
            return;
        }
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (key: string) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = event.target?.result as string;
                    JSON.parse(content);
                    localStorage.setItem(key, content);
                    alert(t('settings.data.importSuccess'));
                    window.location.reload();
                } catch (err) {
                    alert(t('settings.data.importError'));
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };
    
    const handleClearData = (key: string, nameKey: 'favorites' | 'worksets') => {
        const name = t(`settings.data.${nameKey}`);
        if (window.confirm(t('settings.data.confirmClear', { name }))) {
            localStorage.removeItem(key);
            alert(t('settings.data.clearSuccess', { name }));
            window.location.reload();
        }
    };


    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">{t('settings.title')}</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{t('settings.subtitle')}</p>
            </div>

            <SettingsCard title={t('settings.search.title')}>
                 <SettingRow title={t('settings.search.defaultSort')} description={t('settings.search.defaultSortDesc')}>
                    <select
                        value={settings.defaultSort}
                        onChange={e => updateSetting('defaultSort', e.target.value)}
                        className="bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg py-1 px-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="-downloads">{t('explorer.sortPopular')}</option>
                        <option value="-publicdate">{t('explorer.sortNewest')}</option>
                        <option value="publicdate">{t('explorer.sortOldest')}</option>
                        <option value="titleSorter">{t('explorer.sortTitle')}</option>
                    </select>
                </SettingRow>
            </SettingsCard>

            <SettingsCard title={t('settings.accessibility.title')}>
                 <SettingRow title={t('settings.accessibility.theme')} description={t('settings.accessibility.themeDesc')}>
                     <div className="flex space-x-2 p-1 bg-gray-300/50 dark:bg-gray-900/50 rounded-lg">
                        <button onClick={() => setTheme('light')} className={`flex-1 py-1 px-3 text-sm font-semibold rounded-md transition-colors ${theme === 'light' ? 'bg-white text-cyan-600 shadow-sm' : 'bg-transparent text-gray-700 dark:text-white'}`}>{t('settings.theme.light')}</button>
                        <button onClick={() => setTheme('dark')} className={`flex-1 py-1 px-3 text-sm font-semibold rounded-md transition-colors ${theme === 'dark' ? 'bg-gray-700 text-cyan-300 ring-1 ring-inset ring-gray-600' : 'bg-transparent text-gray-700 dark:text-white'}`}>{t('settings.theme.dark')}</button>
                        <button onClick={() => setTheme('system')} className={`flex-1 py-1 px-3 text-sm font-semibold rounded-md transition-colors ${theme === 'system' ? 'bg-cyan-500/20 text-cyan-500 ring-1 ring-inset ring-cyan-500' : 'bg-transparent text-gray-700 dark:text-white'}`}>{t('settings.theme.system')}</button>
                    </div>
                </SettingRow>
                 <SettingRow title={t('settings.accessibility.languageTitle')} description={t('settings.accessibility.languageDesc')}>
                    <div className="flex space-x-2 p-1 bg-gray-300/50 dark:bg-gray-900/50 rounded-lg">
                        <button onClick={() => setLanguage('en')} className={`flex-1 py-1 px-3 text-sm font-semibold rounded-md ${language === 'en' ? 'bg-cyan-500/20 text-cyan-500 ring-1 ring-inset ring-cyan-500' : 'bg-transparent text-gray-700 dark:text-white'}`}>English</button>
                        <button onClick={() => setLanguage('de')} className={`flex-1 py-1 px-3 text-sm font-semibold rounded-md ${language === 'de' ? 'bg-cyan-500/20 text-cyan-500 ring-1 ring-inset ring-cyan-500' : 'bg-transparent text-gray-700 dark:text-white'}`}>Deutsch</button>
                    </div>
                </SettingRow>
                <SettingRow title={t('settings.accessibility.reduceMotion')} description={t('settings.accessibility.reduceMotionDesc')}>
                    <ToggleSwitch checked={settings.reduceMotion} onChange={val => updateSetting('reduceMotion', val)} />
                </SettingRow>
            </SettingsCard>
            
            <SettingsCard title={t('settings.playback.title')} description={t('settings.playback.description')}>
                 <SettingRow title={t('settings.playback.autoplay')} description={t('settings.playback.autoplayDesc')}>
                    <ToggleSwitch checked={settings.autoplayMedia} onChange={val => updateSetting('autoplayMedia', val)} />
                </SettingRow>
            </SettingsCard>

            <SettingsCard title={t('settings.ai.title')} description={t('settings.ai.description')}>
                <SettingRow title={t('settings.ai.enable')} description={t('settings.ai.enableDesc')}>
                    <ToggleSwitch checked={settings.enableAiFeatures} onChange={val => updateSetting('enableAiFeatures', val)} />
                </SettingRow>
            </SettingsCard>

            <SettingsCard title={t('settings.data.title')} description={t('settings.data.description')}>
                <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-gray-300 dark:border-gray-700 space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t('settings.data.favorites')}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.data.favoritesDesc')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleImport('archive-favorites')} className="px-3 py-1.5 text-sm bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors">{t('settings.data.import')}</button>
                        <button onClick={() => handleExport('archive-favorites', 'archive-explorer-favorites.json')} className="px-3 py-1.5 text-sm bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors">{t('settings.data.export')}</button>
                        <button onClick={() => handleClearData('archive-favorites', 'favorites')} className="px-3 py-1.5 text-sm bg-red-600/80 dark:bg-red-800/80 text-white dark:text-red-200 rounded-lg hover:bg-red-700 transition-colors">{t('settings.data.clearAll')}</button>
                    </div>
                </div>
                <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-gray-300 dark:border-gray-700 space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t('settings.data.worksets')}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.data.worksetsDesc')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                         <button onClick={() => handleImport('scriptorium-worksets')} className="px-3 py-1.5 text-sm bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors">{t('settings.data.import')}</button>
                        <button onClick={() => handleExport('scriptorium-worksets', 'archive-explorer-worksets.json')} className="px-3 py-1.5 text-sm bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors">{t('settings.data.export')}</button>
                        <button onClick={() => handleClearData('scriptorium-worksets', 'worksets')} className="px-3 py-1.5 text-sm bg-red-600/80 dark:bg-red-800/80 text-white dark:text-red-200 rounded-lg hover:bg-red-700 transition-colors">{t('settings.data.clearAll')}</button>
                    </div>
                </div>
            </SettingsCard>
            
            <SettingsCard title={t('settings.about.title')}>
                <p className="text-gray-700 dark:text-gray-300">
                    {t('settings.about.version')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: t('settings.about.description') }} />
            </SettingsCard>
        </div>
    );
};