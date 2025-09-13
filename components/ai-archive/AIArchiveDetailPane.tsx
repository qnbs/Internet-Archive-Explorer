import React, { useState } from 'react';
import { useSetAtom } from 'jotai';
import { updateAIArchiveEntryAtom, deleteAIArchiveEntryAtom, updateAIEntryTagsAtom, regenerateAIArchiveEntryAtom } from '../../store/aiArchive';
import { modalAtom } from '../../store/app';
import { AIGenerationType, type AIArchiveEntry, type ExtractedEntities, type ImageAnalysisResult } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { RichTextEditor } from '../RichTextEditor';
import { CloseIcon, TagIcon, TrashIcon, RefreshIcon, ArrowLeftIcon } from '../Icons';
import { useSearchAndGo } from '../../hooks/useSearchAndGo';
import { Spinner } from '../Spinner';
import { SourceItemCard } from './SourceItemCard';
import { sanitizeHtml } from '../../utils/sanitizer';

interface AIArchiveDetailPaneProps {
    selectedEntry: AIArchiveEntry | null;
    onBack: () => void;
}

const Tag: React.FC<{ tag: string, onRemove: () => void }> = ({ tag, onRemove }) => (
    <div className="flex items-center gap-1.5 bg-gray-700 text-cyan-300 text-xs font-semibold px-2 py-1 rounded-full capitalize">
        <span>{tag}</span>
        <button onClick={onRemove} className="rounded-full hover:bg-black/20" aria-label={`Remove ${tag} tag`}>
            <CloseIcon className="w-3.5 h-3.5" />
        </button>
    </div>
);

const EntityButton: React.FC<{ entity: string }> = ({ entity }) => {
    const searchAndGo = useSearchAndGo();
    return (
        <button onClick={() => searchAndGo(`"${entity}"`)} className="bg-gray-700 hover:bg-cyan-600 text-gray-200 hover:text-white text-xs font-medium px-2 py-1 rounded-full transition-colors">
            {entity}
        </button>
    );
};

const ObjectViewer: React.FC<{ data: ExtractedEntities | ImageAnalysisResult, type: 'entities' | 'imageAnalysis'}> = ({ data, type }) => {
    const { t } = useLanguage();
    
    if (type === 'imageAnalysis') {
        const { description, tags } = data as ImageAnalysisResult;
        return (
            <div className="space-y-4 text-sm p-4 bg-gray-900/50 rounded-lg">
                <p className="italic text-gray-300">"{description}"</p>
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => <EntityButton key={tag} entity={tag} />)}
                </div>
            </div>
        );
    }
    
    if (type === 'entities') {
        const { people, places, organizations, dates } = data as ExtractedEntities;
        return (
             <div className="space-y-4 text-sm p-4 bg-gray-900/50 rounded-lg">
                {people.length > 0 && <div><h4 className="font-semibold text-gray-400 mb-1">{t('common:people')}</h4><div className="flex flex-wrap gap-2">{people.map(p => <EntityButton key={p} entity={p} />)}</div></div>}
                {places.length > 0 && <div><h4 className="font-semibold text-gray-400 mb-1">{t('common:places')}</h4><div className="flex flex-wrap gap-2">{places.map(p => <EntityButton key={p} entity={p} />)}</div></div>}
                {organizations.length > 0 && <div><h4 className="font-semibold text-gray-400 mb-1">{t('common:organizations')}</h4><div className="flex flex-wrap gap-2">{organizations.map(p => <EntityButton key={p} entity={p} />)}</div></div>}
                {dates.length > 0 && <div><h4 className="font-semibold text-gray-400 mb-1">{t('common:dates')}</h4><p className="text-gray-300">{dates.join(', ')}</p></div>}
            </div>
        );
    }
    return null;
};

// Encapsulates the logic for displaying different content types.
const ContentViewer: React.FC<{ entry: AIArchiveEntry }> = ({ entry }) => {
    if (typeof entry.content === 'string') {
        return (
            <div
                className="prose prose-sm dark:prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap p-3 bg-gray-900/50 rounded-lg"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(entry.content.replace(/\n/g, '<br />')) }}
            />
        );
    }

    if (entry.type === AIGenerationType.ImageAnalysis || entry.type === AIGenerationType.Entities) {
         return <ObjectViewer data={entry.content} type={entry.type} />;
    }

    return <p className="text-gray-500 text-sm">Cannot display content of this type.</p>;
};

export const AIArchiveDetailPane: React.FC<AIArchiveDetailPaneProps> = ({ selectedEntry, onBack }) => {
    const { t, language } = useLanguage();
    const setModal = useSetAtom(modalAtom);
    const updateEntry = useSetAtom(updateAIArchiveEntryAtom);
    const deleteEntry = useSetAtom(deleteAIArchiveEntryAtom);
    const updateTags = useSetAtom(updateAIEntryTagsAtom);
    const regenerateEntry = useSetAtom(regenerateAIArchiveEntryAtom);
    
    const [newTag, setNewTag] = useState('');
    const [isRegenerating, setIsRegenerating] = useState(false);
    
    const handleSaveNotes = (userNotes: string) => {
        if (selectedEntry) {
            updateEntry({ ...selectedEntry, userNotes });
        }
    };

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedEntry && newTag.trim()) {
            const newTags = [...selectedEntry.tags, newTag.trim()];
            updateTags({ entryId: selectedEntry.id, tags: newTags });
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        if (selectedEntry) {
            const newTags = selectedEntry.tags.filter(t => t !== tagToRemove);
            updateTags({ entryId: selectedEntry.id, tags: newTags });
        }
    };
    
    const handleDelete = () => {
        if (selectedEntry) {
             setModal({
                type: 'confirmation',
                options: {
                    title: t('aiArchive:delete.title'),
                    message: t('aiArchive:delete.message'),
                    confirmLabel: t('common:delete'),
                    confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
                    onConfirm: () => deleteEntry(selectedEntry.id),
                },
            });
        }
    };

    const handleRegenerate = async () => {
        if (!selectedEntry) return;
        setIsRegenerating(true);
        try {
            await regenerateEntry(selectedEntry.id);
        } catch (e) {
            // Error toast is shown by the atom
        } finally {
            setIsRegenerating(false);
        }
    };
    
    if (!selectedEntry) {
        return (
            <div className="bg-gray-800/60 rounded-xl h-full hidden md:flex items-center justify-center">
                <p className="text-gray-500">{t('aiArchive:empty.noSelection')}</p>
            </div>
        );
    }
    
    const sourceImageUrl = selectedEntry.type === AIGenerationType.ImageAnalysis && selectedEntry.source
        ? `https://archive.org/services/get-item-image.php?identifier=${selectedEntry.source.identifier}`
        : null;

    return (
        <div className="bg-gray-800/60 rounded-xl h-full flex flex-col">
            <header className="p-4 border-b border-gray-700 flex-shrink-0">
                 <div className="flex items-center gap-3 mb-3 md:hidden">
                    <button onClick={onBack} className="p-1 text-gray-400 hover:text-white" aria-label={t('aiArchive:details.back')}>
                        <ArrowLeftIcon />
                    </button>
                    <h3 className="font-bold text-lg text-white capitalize truncate">{t(`aiArchive:types.${selectedEntry.type}`)}</h3>
                </div>

                <div className="flex justify-between items-center">
                    <h3 className="hidden md:block font-bold text-lg text-white capitalize">{t(`aiArchive:types.${selectedEntry.type}`)}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={handleRegenerate} disabled={isRegenerating} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-wait" title={t('aiArchive:details.regenerate')}>
                            {isRegenerating ? <Spinner size="sm" /> : <RefreshIcon className="w-4 h-4" />}
                            <span className="hidden sm:inline">{t('aiArchive:details.regenerate')}</span>
                        </button>
                        <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors" title={t('common:delete')}>
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-grow p-4 space-y-4 min-h-0 overflow-y-auto">
                <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>{t('aiArchive:details.timestamp')}: {new Date(selectedEntry.timestamp).toLocaleString(language)}</span>
                    <span>{t('aiArchive:details.language')}: <span className="uppercase">{selectedEntry.language}</span></span>
                </div>
                
                {selectedEntry.source && (
                    <SourceItemCard source={selectedEntry.source as any} />
                )}

                {sourceImageUrl && (
                    <div className="mt-2">
                        <img src={sourceImageUrl} alt={selectedEntry.source?.title || 'Source Image'} className="w-full rounded-lg max-h-48 object-contain bg-gray-900/50" />
                    </div>
                )}

                <h4 className="font-semibold text-gray-300 pt-2">{t('aiArchive:details.content')}</h4>
                <div className="flex-grow min-h-0 flex flex-col -mt-2">
                    <ContentViewer entry={selectedEntry} />
                </div>
                
                 {selectedEntry.prompt && (
                    <div className="flex-shrink-0">
                        <h4 className="font-semibold text-gray-300 mb-2">{t('aiArchive:details.prompt')}</h4>
                        <p className="text-sm text-gray-400 bg-gray-900/50 p-3 rounded-lg italic">"{selectedEntry.prompt}"</p>
                    </div>
                )}

                <div className="flex-shrink-0">
                     <h4 className="font-semibold text-gray-300 mb-2 flex items-center gap-2"><TagIcon /> {t('favorites:itemDetail.tags')}</h4>
                     <div className="flex flex-wrap gap-2 items-center">
                        {selectedEntry.tags.map(tag => (
                            <Tag key={tag} tag={tag} onRemove={() => handleRemoveTag(tag)} />
                        ))}
                        <form onSubmit={handleAddTag} className="flex-grow">
                            <input
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                placeholder={t('favorites:itemDetail.addTagPlaceholder')}
                                className="bg-transparent text-sm w-full focus:outline-none"
                            />
                        </form>
                     </div>
                </div>

                <div className="flex-grow min-h-[200px] flex flex-col">
                     <h4 className="font-semibold text-gray-300 mb-2">{t('aiArchive:details.notes')}</h4>
                     <RichTextEditor
                        key={`${selectedEntry.id}-notes`}
                        initialValue={selectedEntry.userNotes}
                        onSave={handleSaveNotes}
                    />
                </div>
            </div>
        </div>
    );
};
