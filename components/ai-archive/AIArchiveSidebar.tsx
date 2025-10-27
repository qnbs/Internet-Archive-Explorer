import React, { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { allAIArchiveTagsAtom, aiArchiveAtom } from '../../store/aiArchive';
import { AIGenerationType, type AIArchiveFilter, type Language, type AIArchiveSortOption } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { 
    BrainIcon, StarIcon, CollectionIcon, TagIcon,
    BookIcon, ImageIcon, SparklesIcon, LanguageIcon,
    SearchIcon, SortAscendingIcon, CloseIcon,
    MovieIcon, AudioIcon, JoystickIcon
} from '../Icons';


interface AIArchiveSidebarProps {
    filter: AIArchiveFilter;
    setFilter: (filter: AIArchiveFilter) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    sort: AIArchiveSortOption;
    setSort: (sort: AIArchiveSortOption) => void;
    onClose?: () => void;
}

const FilterButton: React.FC<{ label: string; icon?: React.ReactNode; isActive: boolean; onClick: () => void; count?: number; }> = ({ label, icon, isActive, onClick, count }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between text-left pr-2 pl-3 py-2 text-sm rounded-md group transition-colors ${
            isActive ? 'bg-gray-700/80 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
        }`}
    >
        <div className="flex items-center space-x-2 truncate">
            {icon}
            <span className="truncate capitalize">{label}</span>
        </div>
        {typeof count === 'number' && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${isActive ? 'bg-gray-600 text-gray-200' : 'bg-gray-700 text-gray-400 group-hover:bg-gray-600'}`}>
                {count}
            </span>
        )}
    </button>
);


const generationTypeFilters: { type: AIGenerationType; labelKey: string; icon: React.ReactNode }[] = [
    { type: AIGenerationType.Summary, labelKey: 'aiArchive:types.summary', icon: <BookIcon className="w-4 h-4" /> },
    { type: AIGenerationType.Entities, labelKey: 'aiArchive:types.entities', icon: <TagIcon className="w-4 h-4" /> },
    { type: AIGenerationType.ImageAnalysis, labelKey: 'aiArchive:types.imageAnalysis', icon: <ImageIcon className="w-4 h-4" /> },
    { type: AIGenerationType.DailyInsight, labelKey: 'aiArchive:types.dailyInsight', icon: <StarIcon className="w-4 h-4" /> },
    { type: AIGenerationType.Story, labelKey: 'aiArchive:types.story', icon: <SparklesIcon className="w-4 h-4" /> },
    { type: AIGenerationType.Answer, labelKey: 'aiArchive:types.answer', icon: <SparklesIcon className="w-4 h-4" /> },
    { type: AIGenerationType.MagicOrganize, labelKey: 'aiArchive:types.magicOrganize', icon: <SparklesIcon className="w-4 h-4" /> },
    { type: AIGenerationType.MoviesInsight, labelKey: 'aiArchive:types.moviesInsight', icon: <MovieIcon className="w-4 h-4" /> },
    { type: AIGenerationType.AudioInsight, labelKey: 'aiArchive:types.audioInsight', icon: <AudioIcon className="w-4 h-4" /> },
    { type: AIGenerationType.ImagesInsight, labelKey: 'aiArchive:types.imagesInsight', icon: <ImageIcon className="w-4 h-4" /> },
    { type: AIGenerationType.RecRoomInsight, labelKey: 'aiArchive:types.recRoomInsight', icon: <JoystickIcon className="w-4 h-4" /> },
];

const languageFilters: { lang: Language, label: string }[] = [
    { lang: 'en', label: 'English' },
    { lang: 'de', label: 'Deutsch' },
];

export const AIArchiveSidebar: React.FC<AIArchiveSidebarProps> = ({ filter, setFilter, searchQuery, setSearchQuery, sort, setSort, onClose }) => {
    const { t } = useLanguage();
    const allEntries = useAtomValue(aiArchiveAtom);
    const allTags = useAtomValue(allAIArchiveTagsAtom);

    const { counts, availableLanguages } = useMemo(() => {
        const generationCounts: Record<string, number> = {};
        const languageCounts: Record<string, number> = {};
        const languages = new Set<Language>();
        
        for (const entry of allEntries) {
            generationCounts[entry.type] = (generationCounts[entry.type] || 0) + 1;
            languageCounts[entry.language] = (languageCounts[entry.language] || 0) + 1;
            languages.add(entry.language);
        }

        const tagCounts = allTags.reduce((acc, tag) => {
            acc[tag] = allEntries.filter(entry => entry.tags.includes(tag)).length;
            return acc;
        }, {} as Record<string, number>);

        return {
            counts: {
                all: allEntries.length,
                generations: generationCounts,
                languages: languageCounts,
                tags: tagCounts
            },
            availableLanguages: Array.from(languages)
                .map(lang => languageFilters.find(f => f.lang === lang))
                .filter((f): f is { lang: Language, label: string } => !!f)
        };
    }, [allEntries, allTags]);

    return (
        <aside className="w-full md:w-64 flex-shrink-0 bg-gray-800/60 md:bg-transparent md:p-0 p-4 rounded-xl flex flex-col h-full">
            {onClose ? (
                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">{t('aiArchive:filters.title')}</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-white"><CloseIcon /></button>
                </div>
            ) : (
                <h2 className="text-xl font-bold text-white mb-2 px-2 flex items-center gap-2">
                    <BrainIcon /> {t('sideMenu:aiArchive')}
                </h2>
            )}

             <div className="relative mb-4 px-2 flex-shrink-0">
                <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('aiArchive:searchPlaceholder')}
                    className="w-full bg-gray-700/50 border-2 border-transparent focus-within:border-cyan-500 rounded-lg py-1.5 pl-9 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-colors"
                />
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 -mr-4 pr-4">
                <div className="space-y-1">
                    <FilterButton label={t('aiArchive:filters.all')} isActive={filter.type === 'all'} onClick={() => setFilter({ type: 'all' })} count={counts.all} />
                    
                     <div>
                        <h3 className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('aiArchive:filters.sort')}</h3>
                        <div className="p-2">
                            <select 
                                value={sort}
                                onChange={(e) => setSort(e.target.value as AIArchiveSortOption)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-1.5 px-2 text-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                            >
                                <option value="timestamp_desc">{t('aiArchive:sort.newest')}</option>
                                <option value="timestamp_asc">{t('aiArchive:sort.oldest')}</option>
                                <option value="type_asc">{t('aiArchive:sort.type')}</option>
                            </select>
                        </div>
                    </div>
                    
                    <h3 className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('aiArchive:filters.type')}</h3>
                    {generationTypeFilters.map(f => {
                        if (!counts.generations[f.type]) return null;
                        return (
                         <FilterButton 
                            key={f.type}
                            label={t(f.labelKey)} 
                            icon={f.icon}
                            isActive={filter.type === 'generation' && filter.generationType === f.type} 
                            onClick={() => setFilter({ type: 'generation', generationType: f.type })} 
                            count={counts.generations[f.type]}
                        />
                    )})}

                    <h3 className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('aiArchive:filters.language')}</h3>
                     {availableLanguages.map(f => (
                         <FilterButton 
                            key={f.lang}
                            label={f.label} 
                            icon={<LanguageIcon className="w-4 h-4"/>}
                            isActive={filter.type === 'language' && filter.language === f.lang} 
                            onClick={() => setFilter({ type: 'language', language: f.lang })} 
                            count={counts.languages[f.lang]}
                        />
                    ))}
                </div>
                
                 <div>
                    <h3 className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('favorites:sidebar.tags')}</h3>
                    <div className="space-y-1">
                        {allTags.map(tag => (
                            <FilterButton 
                                key={tag} 
                                label={tag} 
                                icon={<TagIcon className="w-4 h-4"/>} 
                                isActive={filter.type === 'tag' && filter.tag === tag} 
                                onClick={() => setFilter({ type: 'tag', tag })} 
                                count={counts.tags[tag]}
                            />
                        ))}
                        {allTags.length === 0 && <p className="px-3 text-sm text-gray-500">{t('favorites:sidebar.noTags')}</p>}
                    </div>
                </div>
            </div>
        </aside>
    );
};