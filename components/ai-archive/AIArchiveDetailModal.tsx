import React, { useRef, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { deleteAIArchiveEntryAtom } from '../../store/aiArchive';
import { modalAtom } from '../../store/app';
import type { AIArchiveEntry, ExtractedEntities, ImageAnalysisResult, MagicOrganizeResult } from '../../types';
import { AIGenerationType } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { CloseIcon, TrashIcon } from '../Icons';
import { SourceItemCard } from './SourceItemCard';

const ContentRenderer: React.FC<{ entry: AIArchiveEntry }> = ({ entry }) => {
    const { t } = useLanguage();
    const content = entry.content;

    if (typeof content === 'string') {
        return <p className="text-gray-300 whitespace-pre-wrap">{content}</p>;
    }
    
    if (entry.type === AIGenerationType.Entities) {
        const entities = content as ExtractedEntities;
        return (
            <div className="space-y-3 text-sm">
                {entities.people.length > 0 && <div><h4 className="font-semibold text-gray-400 mb-1">{t('common:people')}</h4><p>{entities.people.join(', ')}</p></div>}
                {entities.places.length > 0 && <div><h4 className="font-semibold text-gray-400 mb-1">{t('common:places')}</h4><p>{entities.places.join(', ')}</p></div>}
                {entities.organizations.length > 0 && <div><h4 className="font-semibold text-gray-400 mb-1">{t('common:organizations')}</h4><p>{entities.organizations.join(', ')}</p></div>}
                {entities.dates.length > 0 && <div><h4 className="font-semibold text-gray-400 mb-1">{t('common:dates')}</h4><p>{entities.dates.join(', ')}</p></div>}
            </div>
        );
    }
    
    if (entry.type === AIGenerationType.ImageAnalysis) {
        const analysis = content as ImageAnalysisResult;
        return (
            <div className="space-y-3 text-sm">
                 <p className="italic">"{analysis.description}"</p>
                 <div className="flex flex-wrap gap-2">{analysis.tags.map(t => <span key={t} className="bg-gray-700 text-cyan-300 px-2 py-1 rounded-full text-xs">{t}</span>)}</div>
            </div>
        );
    }
    
    if (entry.type === AIGenerationType.MagicOrganize) {
        const suggestions = content as MagicOrganizeResult;
        return (
            <div className="space-y-3 text-sm">
                <div><h4 className="font-semibold text-gray-400 mb-1">{t('favorites:magicOrganize.suggestedTags')}</h4><p>{suggestions.tags.join(', ')}</p></div>
                <div><h4 className="font-semibold text-gray-400 mb-1">{t('favorites:magicOrganize.suggestedCollections')}</h4><p>{suggestions.collections.join(', ')}</p></div>
            </div>
        );
    }

    return <p className="text-gray-500">Cannot display this content type.</p>;
};

interface AIArchiveDetailModalProps {
    entry: AIArchiveEntry;
    onClose: () => void;
}

export const AIArchiveDetailModal: React.FC<AIArchiveDetailModalProps> = ({ entry, onClose }) => {
    const { t, language } = useLanguage();
    const setModal = useSetAtom(modalAtom);
    const deleteEntry = useSetAtom(deleteAIArchiveEntryAtom);
    const modalRef = useRef<HTMLDivElement>(null);
    
    useModalFocusTrap({ modalRef, isOpen: true, onClose });

    const handleDelete = () => {
        setModal({
            type: 'confirmation',
            options: {
                title: t('aiArchive:details.deleteTitle'),
                message: t('aiArchive:details.deleteMessage'),
                onConfirm: () => {
                    deleteEntry(entry.id);
                    onClose();
                },
            }
        });
    };
    
    const date = new Date(entry.timestamp).toLocaleString(language, { dateStyle: 'long', timeStyle: 'short' });

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog">
            <div ref={modalRef} className="bg-gray-800 w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <div className="min-w-0">
                         <h2 className="text-lg font-bold text-white truncate">{t(`aiArchive:types.${entry.type}`)}</h2>
                         <p className="text-sm text-gray-400 truncate">{date}</p>
                    </div>
                    <div className="flex items-center">
                        <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-400 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                        <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full"><CloseIcon /></button>
                    </div>
                </header>
                <div className="p-6 overflow-y-auto space-y-4">
                     {entry.source && <SourceItemCard source={entry.source} />}
                     <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ContentRenderer entry={entry} />
                     </div>
                </div>
            </div>
        </div>
    );
};
