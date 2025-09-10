import React, { useState, useEffect } from 'react';
import type { WorksetDocument, ExtractedEntities } from '../../types';
import { getItemPlainText } from '../../services/archiveService';
import { Spinner } from '../Spinner';
import { useDebounce } from '../../hooks/useDebounce';
import { extractEntities } from '../../services/geminiService';
import { useSearch } from '../../contexts/SearchContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CloseIcon, PlusIcon } from '../Icons';

interface DocumentReaderProps {
    item: WorksetDocument;
    onClose: () => void;
    onAddToWorkset: (item: WorksetDocument) => void;
    onUpdateNotes: (docIdentifier: string, newNotes: string) => void;
}

const EditIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TagIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.53 0 1.04.21 1.41.59l7 7a2 2 0 010 2.83l-5 5a2 2 0 01-2.83 0l-7-7A2 2 0 013 8V3z" /></svg>;


export const DocumentReader: React.FC<DocumentReaderProps> = ({ item, onClose, onAddToWorkset, onUpdateNotes }) => {
    const [textContent, setTextContent] = useState<string>('');
    const [isLoadingText, setIsLoadingText] = useState(true);
    const [notes, setNotes] = useState(item.notes || '');
    const debouncedNotes = useDebounce(notes, 500);

    const [entities, setEntities] = useState<ExtractedEntities | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [entityError, setEntityError] = useState<string | null>(null);
    const { searchAndGo } = useSearch();
    const { t, language } = useLanguage();

    useEffect(() => {
        const fetchText = async () => {
            setIsLoadingText(true);
            const text = await getItemPlainText(item.identifier);
            setTextContent(text);
            setIsLoadingText(false);
        };
        fetchText();
        setNotes(item.notes || '');
        setEntities(null); // Reset entities when item changes
        setEntityError(null);
    }, [item.identifier, item.notes]);

    useEffect(() => {
        // Only update if the debounced notes are different from the initial prop
        if (debouncedNotes !== (item.notes || '')) {
            onUpdateNotes(item.identifier, debouncedNotes);
        }
    }, [debouncedNotes, item.identifier, item.notes, onUpdateNotes]);

    const handleExtractEntities = async () => {
        if (!textContent) return;
        setIsExtracting(true);
        setEntityError(null);
        try {
            const result = await extractEntities(textContent, language);
            setEntities(result);
        } catch (err) {
            setEntityError((err as Error).message);
        } finally {
            setIsExtracting(false);
        }
    };

    const handleEntityClick = (entity: string) => {
        searchAndGo(`"${entity}"`);
        onClose(); // close the reader to show results
    };

    const EntitySection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => {
        if (!items || items.length === 0) return null;
        return (
            <div>
                <h4 className="font-semibold text-gray-300 mb-2">{title}</h4>
                <div className="flex flex-wrap gap-2">
                    {items.map((e, i) => (
                        <button key={`${title}-${i}`} onClick={() => handleEntityClick(e)} className="bg-gray-700 hover:bg-cyan-600 text-gray-200 hover:text-white text-xs font-medium px-2 py-1 rounded-full transition-colors">
                            {e}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-800/60 rounded-xl shadow-lg h-full flex flex-col max-h-[calc(100vh-8rem)]">
            <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-gray-700">
                <div className="truncate">
                    <h2 className="font-bold text-white truncate">{item.title}</h2>
                    <p className="text-sm text-gray-400 truncate">{Array.isArray(item.creator) ? item.creator.join(', ') : item.creator || 'Unknown'}</p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                     <button onClick={() => onAddToWorkset(item)} className="text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 transition-colors rounded-md p-2 flex items-center text-sm" aria-label={t('common.addToWorkset')} title={t('common.addToWorkset')}>
                       <PlusIcon className="w-4 h-4 mr-1" /> {t('common.add')}
                    </button>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-1" aria-label={t('common.close')}>
                       <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <main className="flex-grow overflow-hidden p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoadingText ? (
                    <div className="flex justify-center items-center h-full lg:col-span-2"><Spinner size="lg" /></div>
                ) : (
                    <>
                        <div className="h-full overflow-y-auto text-gray-300 leading-relaxed whitespace-pre-wrap font-serif border-r border-gray-700 pr-6">
                            {textContent}
                        </div>
                        <div className="h-full flex flex-col space-y-4 overflow-y-auto">
                           <div className="flex-shrink-0">
                               <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center"><EditIcon /> {t('scriptorium.reader.personalNotes')}</h3>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={t('scriptorium.reader.notesPlaceholder')}
                                    className="w-full h-40 bg-gray-900/50 rounded-md p-3 text-gray-300 placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-y"
                                />
                           </div>

                           <div className="pt-4 border-t border-gray-700 flex-shrink-0">
                                <div className="flex items-center justify-between mb-3">
                                   <h3 className="text-lg font-semibold text-cyan-400 flex items-center"><TagIcon className="h-5 w-5 mr-2" /> {t('scriptorium.reader.entityAnalysis')}</h3>
                                    <button onClick={handleExtractEntities} disabled={isExtracting || !textContent} className="flex items-center space-x-2 px-3 py-1 text-sm font-medium rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed">
                                        <span>{isExtracting ? t('scriptorium.reader.extracting') : t('scriptorium.reader.extract')}</span>
                                    </button>
                                </div>
                                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 min-h-[100px] space-y-4">
                                   {isExtracting && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                                   {entityError && <p className="text-red-400 text-sm">{entityError}</p>}
                                   {entities && (
                                       <>
                                           <EntitySection title={t('common.people')} items={entities.people} />
                                           <EntitySection title={t('common.places')} items={entities.places} />
                                           <EntitySection title={t('common.organizations')} items={entities.organizations} />
                                           <EntitySection title={t('common.dates')} items={entities.dates} />
                                       </>
                                   )}
                                   {!isExtracting && !entityError && !entities && <p className="text-gray-500 text-sm">{t('scriptorium.reader.extractPrompt')}</p>}
                                </div>
                           </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};