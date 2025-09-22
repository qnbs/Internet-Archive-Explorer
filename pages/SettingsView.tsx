import React, { useState, useId, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
    settingsAtom,
    setSettingAtom,
    resetSettingsAtom,
    themeAtom,
} from '../store/settings';
import {
    searchHistoryAtom,
    clearSearchHistoryAtom,
} from '../store/search';
import {
    languageAtom,
} from '../store/i18n';
import {
    clearLibraryAtom
} from '../store/favorites';
import {
    clearScriptoriumAtom
} from '../store/scriptorium';
import {
    clearAIArchiveAtom
} from '../store/aiArchive';
import { useLanguage } from '../hooks/useLanguage';
import type { AppSettings, Language, AccentColor, View } from '../types';
import { DownloadIcon, UploadIcon, SettingsIcon, SearchIcon, ImageIcon, SparklesIcon, TrashIcon, BookIcon, EyeIcon } from '../components/Icons';
import { exportAllData, importData } from '../services/dataService';
import type { ConfirmationOptions } from '../types';
import { useToast } from '../contexts/ToastContext';
import { ThemeSelector } from '../components/settings/ThemeSelector';

type SettingsSectionId = 'ui' | 'accessibility' | 'search' | 'content' | 'ai' | 'data';

// --- Reusable Setting Components ---

type SettingProps<K extends keyof AppSettings> = {
    settingKey: K;
    label: string;
    description: string;
    children: (value: AppSettings[K], onChange: (value: AppSettings[K]) => void, ariaProps: { 'aria-labelledby': string, 'aria-describedby': string }) => React.ReactNode;
};

// --- PWA Install Prompt Event Type ---
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

const SettingRow = <K extends keyof AppSettings>({ settingKey, label, description, children }: SettingProps<K>) => {
    const id = useId();
    const labelId = `${id}-label`;
    const descriptionId = `${id}-description`;
    
    const settings = useAtomValue(settingsAtom);
    const setSetting = useSetAtom(setSettingAtom);
    const { addToast } = useToast();
    const { t } = useLanguage();
    
    const value = settings[settingKey];
    const handleChange = (newValue: AppSettings[K]) => {
        setSetting({ key: settingKey, value: newValue });
        addToast(t('settings:saved'), 'success', 2000);
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between sm:items-start py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div className="mb-2 sm:mb-0 max-w-md">
                <h4 id={labelId} className="font-semibold text-gray-900 dark:text-gray-200">{label}</h4>
                <p id={descriptionId} className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
            <div className="flex-shrink-0 mt-2 sm:mt-0">{children(value, handleChange, { 'aria-labelledby': labelId, 'aria-describedby': descriptionId })}</div>
        </div>
    );
};

const Toggle = ({ value, onChange, ariaProps }: { value: boolean, onChange: (v: boolean) => void, ariaProps: object }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} className="sr-only peer" {...ariaProps} />
        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-accent-600"></div>
    </label>
);

const Select = <T extends string>({ value, onChange, options, ariaProps }: { value: T, onChange: (v: T) => void, options: {value: T, label: string}[], ariaProps: object }) => (
    <select value={value} onChange={e => onChange(e.target.value as T)} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-accent-500 focus:border-accent-500" {...ariaProps}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
);

const RadioGroup = <T extends string>({ value, onChange, options, ariaProps }: { value: T, onChange: (v: T) => void, options: {value: T, label: string}[], ariaProps: object }) => (
    <div className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg" {...ariaProps}>
        {options.map(opt => (
            <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    value === opt.value
                        ? 'bg-white dark:bg-gray-800 text-accent-700 dark:text-accent-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-900/20'
                }`}
                aria-pressed={value === opt.value}
            >
                <span>{opt.label}</span>
            </button>
        ))}
    </div>
);


const NumberInput = ({ value, onChange, ariaProps }: { value: number, onChange: (v: number) => void, ariaProps: object }) => (
    <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={1} max={100} className="w-20 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-accent-500 focus:border-accent-500" {...ariaProps} />
);

const LanguageSelector: React.FC<{ariaProps: object}> = ({ ariaProps }) => {
    const [lang, setLang] = useAtom(languageAtom);
    const { addToast } = useToast();
    
    const handleChange = (newLang: Language) => {
        setLang(newLang);
        addToast("Language updated", 'success', 2000);
    };

    return (
        <select value={lang} onChange={e => handleChange(e.target.value as Language)} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-accent-500 focus:border-accent-500" {...ariaProps}>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
        </select>
    );
};

const ColorPicker = ({ value, onChange, ariaProps }: { value: string, onChange: (v: string) => void, ariaProps: object }) => (
    <input 
        type="color" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="w-10 h-10 p-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
        {...ariaProps}
    />
);

const AccentColorSelector: React.FC<{ value: AccentColor; onChange: (v: AccentColor) => void; ariaProps: object }> = ({ value, onChange, ariaProps }) => {
    const colors: { name: AccentColor, class: string }[] = [
        { name: 'cyan', class: 'bg-cyan-500' },
        { name: 'emerald', class: 'bg-emerald-500' },
        { name: 'rose', class: 'bg-rose-500' },
        { name: 'violet', class: 'bg-violet-500' }
    ];
    return (
        <div className="flex gap-2" {...ariaProps}>
            {colors.map(color => (
                <button
                    key={color.name}
                    onClick={() => onChange(color.name)}
                    className={`w-8 h-8 rounded-full ${color.class} transition-transform hover:scale-110 ${value === color.name ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}
                    aria-label={color.name}
                    aria-pressed={value === color.name}
                />
            ))}
        </div>
    );
};

// --- Settings Panels ---

const UISettingsPanel: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="space-y-2">
            {/* FIX: Add children render prop to SettingRow */}
            <SettingRow settingKey="layoutDensity" label={t('settings:ui.layoutDensity')} description={t('settings:ui.layoutDensityDesc')}>
                {(value, onChange, ariaProps) => <RadioGroup value={value} onChange={onChange} options={[
                    {value: 'comfortable', label: t('settings:ui.densities.comfortable')},
                    {value: 'compact', label: t('settings:ui.densities.compact')}
                ]} ariaProps={ariaProps} />}
            </SettingRow>
             {/* FIX: Add children render prop to SettingRow */}
             <SettingRow settingKey="accentColor" label={t('settings:ui.accentColor')} description={t('settings:ui.accentColorDesc')}>
                {(value, onChange, ariaProps) => <AccentColorSelector value={value} onChange={onChange} ariaProps={ariaProps} />}
            </SettingRow>
             {/* FIX: Add children render prop to SettingRow */}
             <SettingRow settingKey="scrollbarColor" label={t('settings:ui.scrollbarColor')} description={t('settings:ui.scrollbarColorDesc')}>
                {(value, onChange, ariaProps) => <ColorPicker value={value} onChange={onChange} ariaProps={ariaProps} />}
            </SettingRow>
             <div className="flex flex-col sm:flex-row justify-between sm:items-start py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="mb-2 sm:mb-0 max-w-md">
                    <h4 id="theme-label" className="font-semibold text-gray-900 dark:text-gray-200">{t('settings:ui.theme')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings:ui.themeDesc')}</p>
                </div>
                <ThemeSelector ariaProps={{'aria-labelledby': 'theme-label'}} />
            </div>
             <div className="flex flex-col sm:flex-row justify-between sm:items-center py-4">
                <div className="mb-2 sm:mb-0 max-w-md">
                    <h4 id="lang-label" className="font-semibold text-gray-900 dark:text-gray-200">{t('settings:ui.language')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings:ui.languageDesc')}</p>
                </div>
                <LanguageSelector ariaProps={{'aria-labelledby': 'lang-label'}} />
            </div>
        </div>
    );
};

const AccessibilitySettingsPanel: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="space-y-2">
             {/* FIX: Add children render prop to SettingRow */}
             <SettingRow settingKey="fontSize" label={t('settings:accessibility.fontSize')} description={t('settings:accessibility.fontSizeDesc')}>
                {(value, onChange, ariaProps) => <RadioGroup value={value} onChange={onChange} options={[
                    {value: 'sm', label: t('settings:accessibility.sizes.sm')},
                    {value: 'base', label: t('settings:accessibility.sizes.base')},
                    {value: 'lg', label: t('settings:accessibility.sizes.lg')}
                ]} ariaProps={ariaProps} />}
            </SettingRow>
            {/* FIX: Add children render prop to SettingRow */}
            <SettingRow settingKey="highContrastMode" label={t('settings:accessibility.highContrast')} description={t('settings:accessibility.highContrastDesc')}>
                {(value, onChange, ariaProps) => <Toggle value={value} onChange={onChange} ariaProps={ariaProps} />}
            </SettingRow>
             {/* FIX: Add children render prop to SettingRow */}
             <SettingRow settingKey="underlineLinks" label={t('settings:accessibility.underlineLinks')} description={t('settings:accessibility.underlineLinksDesc')}>
                {(value, onChange, ariaProps) => <Toggle value={value} onChange={onChange} ariaProps={ariaProps} />}
            </SettingRow>
            {/* FIX: Add children render prop to SettingRow */}
            <SettingRow settingKey="disableAnimations" label={t('settings:accessibility.disableAnimations')} description={t('settings:accessibility.disableAnimationsDesc')}>
                {(value, onChange, ariaProps) => <Toggle value={value} onChange={onChange} ariaProps={ariaProps} />}
            </SettingRow>
        </div>
    );
}

const SearchSettingsPanel: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="space-y-2">
            {/* FIX: Add children render prop to SettingRow */}
            <SettingRow settingKey="resultsPerPage" label={t('settings:search.resultsPerPage')} description={t('settings:search.resultsPerPageDesc')}>
                {(value, onChange, ariaProps) => <NumberInput value={value} onChange={onChange} ariaProps={ariaProps} />}
            </SettingRow>
            {/* FIX: Add children render prop to SettingRow */}
            <SettingRow settingKey="defaultSort" label={t('settings:search.defaultSort')} description={t('settings:search.defaultSortDesc')}>
                 {(value, onChange, ariaProps) => <Select value={value} onChange={onChange} options={[
                    {value: 'downloads', label: t('uploaderDetail:sortCriteria.downloads')},
                    {value: 'week', label: t('uploaderDetail:sortCriteria.week')},
                    {value: 'publicdate', label: t('uploaderDetail:sortCriteria.publicdate')}
                ]} ariaProps={ariaProps} />}
            </SettingRow>
            {/* FIX: Add children render prop to SettingRow */}
            <SettingRow settingKey="showExplorerHub" label={t('settings:search.showExplorerHub')} description={t('settings:search.showExplorerHubDesc')}>
                {(value, onChange, ariaProps) => <Toggle value={value} onChange={onChange} ariaProps={ariaProps} />}
            </SettingRow>
            {/* FIX: Add children render prop to SettingRow */}
            <SettingRow settingKey="rememberFilters" label={t('settings:search.rememberFilters')} description={t('settings:search.rememberFiltersDesc')}>
                {(value, onChange, ariaProps) => <Toggle value={value} onChange={onChange} ariaProps={ariaProps} />}
            </SettingRow>
            {/* FIX: Add children render prop to SettingRow */}
            <SettingRow settingKey="rememberSort" label={t('settings:search.rememberSort')} description={t('settings:search.rememberSortDesc')}>
                {(value, onChange, ariaProps) => <Toggle value={value} onChange={onChange} ariaProps={ariaProps} />}
            </SettingRow>
        </div>
    );
};

const ContentSettingsPanel: React.FC = () => {
    const { t } = useLanguage();
    const viewOptions: { value: View; label: string }[] = [
        { value: 'explore', label: t('sideMenu:explore') },
        { value: 'library', label: t('sideMenu:library') },
        { value: 'scriptorium', label: t('sideMenu:scriptorium') },
        { value: 'movies', label: t('sideMenu:videothek') },
        { value: 'audio', label: t('sideMenu:audiothek') },
        { value: 'image', label: t('sideMenu:imagesHub') },
        { value: 'recroom', label: t('sideMenu:recRoom') },
        { value: 'aiArchive', label: t('sideMenu:aiArchive') },
    ];
    return (
        <div className="space-y-2">
            {/* FIX: Add children render prop to SettingRow */}
            <SettingRow settingKey="defaultView" label={t('settings:content.defaultView')} description={t('settings:content.defaultViewDesc')}>
                {(value, onChange, ariaProps) => <Select value={value} onChange={onChange} options={viewOptions} ariaProps={ariaProps} />}
            </SettingRow>
            {/* FIX: Add children render prop to SettingRow */}
            <SettingRow settingKey="defaultDetailTabAll" label={t('settings:content.defaultDetailTabAll')} description={t('settings:content.defaultDetailTabAllDesc')}>
                {(value, onChange, ariaProps) => <Select value={value} onChange={onChange} options={[
                    {value: 'description', label: t('common:description')},
                    {value: 'files', label: t('common:files')},
                    {value: 'related', label: t('common:related')}
                ]} ariaProps={ariaProps} />}
            </SettingRow>
            {/* FIX: Add children render prop to SettingRow */}
            <SettingRow settingKey="defaultUploaderDetailTab" label={t('settings:content.defaultUploaderDetailTab')} description={t('settings:content.defaultUploaderDetailTabDesc')}>
                {(value, onChange, ariaProps) => <Select value={value} onChange={onChange} options={[
                    {value: 'uploads', label: t('uploaderDetail:tabs.uploads')},
                    {value: 'collections', label: t('uploaderDetail:tabs.collections')},
                    {value: 'favorites', label: t('uploaderDetail:tabs.favorites')}
                ]} ariaProps={ariaProps} />}
            </SettingRow>
            {/* FIX: Add children render prop to SettingRow */}
            <SettingRow settingKey="autoplayMedia" label={t('settings:content.autoplayMedia')} description={t('settings:content.autoplayMediaDesc')}>
                {(value, onChange, ariaProps) => <Toggle value={value} onChange={onChange} ariaProps={ariaProps} />}
            </SettingRow>
             {/* FIX: Add children render prop to SettingRow */}
             <SettingRow settingKey="openLinksInNewTab" label={t('settings:content.openLinksInNewTab')} description={t('settings:content.openLinksInNewTabDesc')}>
                {(value, onChange, ariaProps) => <Toggle value={value} onChange={onChange} ariaProps={ariaProps} />}
            </SettingRow>
        </div>
    );
};

const AISettingsPanel: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="space-y-2">
            {/* FIX: Add children render prop to SettingRow */}
            <SettingRow settingKey="enableAiFeatures" label={t('settings:ai.enableAiFeatures')} description={t('settings:ai.enableAiFeaturesDesc')}>
                {(value, onChange, ariaProps) => <Toggle value={value} onChange={onChange} ariaProps={ariaProps} />}
            </SettingRow>
            {/* FIX: Add children render prop to SettingRow */}
            <SettingRow settingKey="autoArchiveAI" label={t('settings:ai.autoArchiveAI')} description={t('settings:ai.autoArchiveAIDesc')}>
                {(value, onChange, ariaProps) => <Toggle value={value} onChange={onChange} ariaProps={ariaProps} />}
            </SettingRow>
            {/* FIX: Add children render prop to SettingRow */}
            <SettingRow settingKey="defaultAiTab" label={t('settings:ai.defaultAiTab')} description={t('settings:ai.defaultAiTabDesc')}>
                {(value, onChange, ariaProps) => <Select value={value} onChange={onChange} options={[
                    {value: 'description', label: t('common:description')},
                    {value: 'ai', label: t('common:aiAnalysis')}
                ]} ariaProps={ariaProps} />}
            </SettingRow>
            {/* FIX: Add children render prop to SettingRow */}
            <SettingRow settingKey="autoRunEntityExtraction" label={t('settings:ai.autoRunEntityExtraction')} description={t('settings:ai.autoRunEntityExtractionDesc')}>
                {(value, onChange, ariaProps) => <Toggle value={value} onChange={onChange} ariaProps={ariaProps} />}
            </SettingRow>
             {/* FIX: Add children render prop to SettingRow */}
             <SettingRow settingKey="summaryTone" label={t('settings:ai.summaryTone')} description={t('settings:ai.summaryToneDesc')}>
                {(value, onChange, ariaProps) => <Select value={value} onChange={onChange} options={[
                    {value: 'simple', label: t('settings:ai.tones.simple')},
                    {value: 'detailed', label: t('settings:ai.tones.detailed')},
                    {value: 'academic', label: t('settings:ai.tones.academic')}
                ]} ariaProps={ariaProps} />}
            </SettingRow>
        </div>
    );
};

const DataSettingsPanel: React.FC<{ showConfirmation: (options: ConfirmationOptions) => void; }> = ({ showConfirmation }) => {
    const { t } = useLanguage();
    const { addToast } = useToast();
    const resetSettings = useSetAtom(resetSettingsAtom);
    const clearSearchHistory = useSetAtom(clearSearchHistoryAtom);
    const clearLibrary = useSetAtom(clearLibraryAtom);
    const clearScriptorium = useSetAtom(clearScriptoriumAtom);
    const clearAIArchive = useSetAtom(clearAIArchiveAtom);

    const handleExport = () => {
        try {
            const data = exportAllData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `archive-explorer-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addToast(t('settings:data.exportSuccess'), 'success');
        } catch (error) {
            console.error(error);
            addToast(t('settings:data.exportError'), 'error');
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonString = e.target?.result as string;
                showConfirmation({
                    title: t('settings:data.importButtonConfirm'),
                    message: t('settings:data.importConfirm'),
                    confirmLabel: t('settings:data.importButtonConfirm'),
                    onConfirm: () => {
                        try {
                            importData(jsonString);
                            addToast(t('settings:data.importSuccess'), 'success');
                            setTimeout(() => window.location.reload(), 1500);
                        } catch (importError) {
                             addToast(importError instanceof Error ? importError.message : t('settings:data.importError'), 'error');
                        }
                    },
                });
            } catch (readError) {
                 addToast(t('settings:data.importErrorFile'), 'error');
            } finally {
                if(event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };
    
    const createDataResetHandler = (
        name: string,
        descriptionKey: string,
        clearAtom: () => void
    ) => () => {
        showConfirmation({
            title: t('settings:data.clearDataTitle', { name }),
            message: t(descriptionKey),
            confirmLabel: t('common:delete'),
            confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            onConfirm: () => {
                clearAtom();
                addToast(t('settings:data.clearDataSuccess', { name }), 'success');
            },
        });
    };
    
    const dataClearingActions = [
        { name: t('sideMenu:library'), descriptionKey: 'settings:data.clearLibraryDesc', handler: createDataResetHandler(t('sideMenu:library'), 'settings:data.clearLibraryDesc', clearLibrary) },
        { name: t('sideMenu:scriptorium'), descriptionKey: 'settings:data.clearScriptoriumDesc', handler: createDataResetHandler(t('sideMenu:scriptorium'), 'settings:data.clearScriptoriumDesc', clearScriptorium) },
        { name: t('sideMenu:aiArchive'), descriptionKey: 'settings:data.clearAIArchiveDesc', handler: createDataResetHandler(t('sideMenu:aiArchive'), 'settings:data.clearAIArchiveDesc', clearAIArchive) },
        { name: t('settings:data.searchHistory'), descriptionKey: 'settings:data.clearHistoryDesc', handler: createDataResetHandler(t('settings:data.searchHistory'), 'settings:data.clearHistoryDesc', clearSearchHistory) },
        { name: t('settings:data.resetAll'), descriptionKey: 'settings:data.resetAllDesc', handler: createDataResetHandler(t('settings:data.resetAll'), 'settings:data.resetAllDesc', resetSettings) }
    ];

    return (
        <div className="space-y-8">
            <div>
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
                    <label className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold bg-accent-600 text-white rounded-md hover:bg-accent-700 transition-colors cursor-pointer">
                        <UploadIcon />
                        <span>{t('settings:data.importButton')}</span>
                        <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                    </label>
                </div>
            </div>

            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <h3 className="text-lg font-semibold text-red-400">{t('settings:data.dangerZone')}</h3>
                <p className="text-sm text-red-300/80 mb-4">{t('settings:data.dangerZoneDesc')}</p>
                 <div className="space-y-4">
                    {dataClearingActions.map(action => (
                        <div key={action.name} className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-200">{action.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">{t(action.descriptionKey)}</p>
                            </div>
                            <button onClick={action.handler} className="mt-2 sm:mt-0 flex-shrink-0 px-3 py-1.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">{t('common:delete')}</button>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

const getSections = (t: (key: string) => string) => [
    { id: 'ui', label: t('settings:sections.ui'), icon: <ImageIcon className="w-5 h-5" /> },
    { id: 'accessibility', label: t('settings:sections.accessibility'), icon: <EyeIcon className="w-5 h-5" /> },
    { id: 'search', label: t('settings:sections.search'), icon: <SearchIcon className="w-5 h-5" /> },
    { id: 'content', label: t('settings:sections.content'), icon: <BookIcon className="w-5 h-5" /> },
    { id: 'ai', label: t('settings:sections.ai'), icon: <SparklesIcon className="w-5 h-5" /> },
    { id: 'data', label: t('settings:sections.data'), icon: <TrashIcon className="w-5 h-5" /> },
];

// --- Main View ---

interface SettingsViewProps {
  showConfirmation: (options: ConfirmationOptions) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ showConfirmation }) => {
    const { t } = useLanguage();
    const [activeSection, setActiveSection] = useState<SettingsSectionId>('ui');
    const sections = getSections(t);
    
    const renderSectionContent = () => {
        switch (activeSection) {
            case 'ui': return <UISettingsPanel />;
            case 'accessibility': return <AccessibilitySettingsPanel />;
            case 'search': return <SearchSettingsPanel />;
            case 'content': return <ContentSettingsPanel />;
            case 'ai': return <AISettingsPanel />;
            case 'data': return <DataSettingsPanel showConfirmation={showConfirmation} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8 animate-page-fade-in">
             <header className="text-center">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-accent-400">{t('settings:title')}</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{t('settings:subtitle')}</p>
            </header>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/4">
                    <nav className="space-y-2">
                        {sections.map(section => (
                            <button 
                                key={section.id} 
                                onClick={() => setActiveSection(section.id as SettingsSectionId)}
                                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                                    activeSection === section.id 
                                    ? 'bg-accent-50 text-accent-700 dark:bg-accent-500/20 dark:text-accent-300' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                {section.icon}
                                <span className="font-medium">{section.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1 p-6 bg-white dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50">
                    {renderSectionContent()}
                </main>
            </div>
        </div>
    );
};

export default SettingsView;