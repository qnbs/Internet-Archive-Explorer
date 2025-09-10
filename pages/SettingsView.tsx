import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { AppSettings } from '../contexts/SettingsContext';
import { DownloadIcon, UploadIcon } from '../components/Icons';
import { exportAllData, importData } from '../services/dataService';
import type { ConfirmationOptions } from '../types';
import { useToast } from '../contexts/ToastContext';

type SettingProps<K extends keyof AppSettings> = {
    settingKey: K;
    label: string;
    description: string;
    children: (value: AppSettings[K], onChange: (value: AppSettings[K]) => void) => React.ReactNode;
};

interface SettingsViewProps {
  showConfirmation: (options: ConfirmationOptions) => void;
}

// FIX: Destructured `settings` and `setSetting` from props to make them available in the component scope.
const SettingRow = <K extends keyof AppSettings>({ settingKey, label, description, children, settings, setSetting }: SettingProps<K> & { settings: AppSettings, setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void }) => {
    const value = settings[settingKey];
    const handleChange = (newValue: AppSettings[K]) => {
        setSetting(settingKey, newValue);
    };
    return (
        <div className="flex flex-col sm:flex-row justify-between sm:items-center py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div className="mb-2 sm:mb-0 max-w-md">
                <h4 className="font-semibold text-gray-900 dark:text-gray-200">{label}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
            <div className="flex-shrink-0">{children(value, handleChange)}</div>
        </div>
    );
};

const Toggle = ({ value, onChange }: { value: boolean, onChange: (v: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-cyan-600"></div>
    </label>
);

const Select = <T extends string>({ value, onChange, options }: { value: T, onChange: (v: T) => void, options: {value: T, label: string}[] }) => (
    <select value={value} onChange={e => onChange(e.target.value as T)} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-cyan-500 focus:border-cyan-500">
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
);

const NumberInput = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => (
    <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={1} max={100} className="w-20 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500" />
);

const SettingsSection: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <section className="p-6 bg-gray-50 dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
        <div className="space-y-2">
            {children}
        </div>
    </section>
);


const SettingsView: React.FC<SettingsViewProps> = ({ showConfirmation }) => {
    const { settings, setSetting, resetSettings, searchHistory, clearSearchHistory } = useSettings();
    const { t } = useLanguage();
    const { addToast } = useToast();
    
    const handleExport = () => {
        try {
            const dataStr = exportAllData();
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            a.download = `archive-explorer-backup-${timestamp}.json`;
            a.click();
            URL.revokeObjectURL(url);
            addToast(t('settings:data.exportSuccess'), 'success');
        } catch (error) {
            addToast(t('settings:data.exportError'), 'error');
            console.error(error);
        }
    };
    
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        const inputElement = event.target; // Cache the element reference

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                addToast(t('settings:data.importErrorFile'), 'error');
                return;
            }
            showConfirmation({
                title: t('settings:data.importAll'),
                message: t('settings:data.importConfirm'),
                confirmLabel: t('settings:data.importButtonConfirm'),
                confirmClass: 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500',
                onConfirm: () => {
                    try {
                        importData(text);
                        addToast(t('settings:data.importSuccess'), 'success', 10000);
                        setTimeout(() => window.location.reload(), 2000);
                    } catch (error) {
                        addToast(`${t('settings:data.importError')}: ${(error as Error).message}`, 'error');
                        console.error(error);
                    } finally {
                        if (inputElement) inputElement.value = ''; // Reset file input
                    }
                },
                onCancel: () => {
                    if (inputElement) inputElement.value = ''; // Also reset on cancel
                }
            });
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        showConfirmation({
            title: t('settings:data.resetAll'),
            message: t('settings:data.resetAllDesc'),
            confirmLabel: t('settings:data.resetButton'),
            confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            onConfirm: () => {
                resetSettings();
                addToast(t('settings:data.resetSuccess'), 'info');
            }
        });
    };
    
    const handleClearHistory = () => {
        showConfirmation({
            title: t('settings:data.clearHistoryTitle'),
            message: t('settings:data.clearHistoryDesc'),
            confirmLabel: t('settings:data.clearHistory'),
            confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            onConfirm: () => {
                clearSearchHistory();
                addToast(t('settings:data.clearHistorySuccess'), 'info');
            }
        });
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-page-fade-in">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">{t('settings:title')}</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{t('settings:subtitle')}</p>
            </header>

            <SettingsSection title={t('settings:search.title')}>
                 <SettingRow settingKey="resultsPerPage" label={t('settings:search.resultsPerPage')} description={t('settings:search.resultsPerPageDesc')} settings={settings} setSetting={setSetting}>
                    {(value, onChange) => <NumberInput value={value} onChange={onChange} />}
                </SettingRow>
                <SettingRow settingKey="showExplorerHub" label={t('settings:search.showExplorerHub')} description={t('settings:search.showExplorerHubDesc')} settings={settings} setSetting={setSetting}>
                    {(value, onChange) => <Toggle value={value} onChange={onChange} />}
                </SettingRow>
            </SettingsSection>

            <SettingsSection title={t('settings:ui.title')}>
                <SettingRow settingKey="reduceMotion" label={t('settings:ui.reduceMotion')} description={t('settings:ui.reduceMotionDesc')} settings={settings} setSetting={setSetting}>
                    {(value, onChange) => <Toggle value={value} onChange={onChange} />}
                </SettingRow>
            </SettingsSection>
            
            <SettingsSection title={t('settings:content.title')}>
                <SettingRow settingKey="defaultUploaderDetailTab" label={t('settings:content.defaultUploaderDetailTab')} description={t('settings:content.defaultUploaderDetailTabDesc')} settings={settings} setSetting={setSetting}>
                    {(value, onChange) => <Select value={value} onChange={onChange} options={[
                        {value: 'uploads', label: t('uploaderDetail:tabs.uploads')},
                        {value: 'reviews', label: t('uploaderDetail:tabs.reviews')},
                        {value: 'statistics', label: t('uploaderDetail:tabs.statistics')}
                    ]} />}
                </SettingRow>
                 <SettingRow settingKey="autoplayMedia" label={t('settings:content.autoplayMedia')} description={t('settings:content.autoplayMediaDesc')} settings={settings} setSetting={setSetting}>
                    {(value, onChange) => <Toggle value={value} onChange={onChange} />}
                </SettingRow>
            </SettingsSection>
            
            <SettingsSection title={t('settings:ai.title')}>
                <SettingRow settingKey="enableAiFeatures" label={t('settings:ai.enableAiFeatures')} description={t('settings:ai.enableAiFeaturesDesc')} settings={settings} setSetting={setSetting}>
                    {(value, onChange) => <Toggle value={value} onChange={onChange} />}
                </SettingRow>
                <SettingRow settingKey="defaultAiTab" label={t('settings:ai.defaultAiTab')} description={t('settings:ai.defaultAiTabDesc')} settings={settings} setSetting={setSetting}>
                    {(value, onChange) => <Select value={value} onChange={onChange} options={[
                        {value: 'description', label: t('common:description')},
                        {value: 'ai', label: t('common:aiAnalysis')}
                    ]} />}
                </SettingRow>
                 <SettingRow settingKey="autoRunEntityExtraction" label={t('settings:ai.autoRunEntityExtraction')} description={t('settings:ai.autoRunEntityExtractionDesc')} settings={settings} setSetting={setSetting}>
                    {(value, onChange) => <Toggle value={value} onChange={onChange} />}
                </SettingRow>
            </SettingsSection>
            
            <SettingsSection title={t('settings:data.dataAndPrivacyTitle')}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pt-2">{t('settings:data.backupAndRestore')}</h3>
                <div className="py-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">{t('settings:data.exportAll')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings:data.exportAllDesc')}</p>
                    <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                        <DownloadIcon />
                        <span>{t('settings:data.exportButton')}</span>
                    </button>
                </div>
                <div className="py-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">{t('settings:data.importAll')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings:data.importAllDesc')}</p>
                    <label className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors cursor-pointer">
                        <UploadIcon />
                        <span>{t('settings:data.importButton')}</span>
                        <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                    </label>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pt-6 border-t border-gray-200 dark:border-gray-700">{t('settings:data.privacy')}</h3>
                <div className="py-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">{t('settings:data.searchHistory')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings:data.searchHistoryDesc')}</p>
                    {searchHistory.length > 0 ? (
                        <>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {searchHistory.slice(0, 5).map((term, i) => <span key={i} className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-1 rounded-full">{term}</span>)}
                                {searchHistory.length > 5 && <span className="text-xs text-gray-500">...and {searchHistory.length - 5} more</span>}
                            </div>
                             <button onClick={handleClearHistory} className="text-sm font-semibold text-red-600 dark:text-red-400 hover:underline">{t('settings:data.clearHistory')}</button>
                        </>
                    ) : (
                         <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">{t('settings:data.noHistory')}</p>
                    )}
                </div>
                <div className="py-4">
                     <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">{t('settings:data.resetAll')}</h4>
                     <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings:data.resetAllDesc')}</p>
                     <button onClick={handleReset} className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">{t('settings:data.resetButton')}</button>
                </div>
            </SettingsSection>
        </div>
    );
};

export { SettingsView };