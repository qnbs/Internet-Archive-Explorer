import React from 'react';
import type { WorksetDocument } from '../../types';
import { CloseIcon } from '../Icons';
import { useLanguage } from '../../hooks/useLanguage';

interface DocumentListItemProps {
    document: WorksetDocument;
    isSelected: boolean;
    onSelect: () => void;
    onRemove: () => void;
}

export const DocumentListItem: React.FC<DocumentListItemProps> = ({ document, isSelected, onSelect, onRemove }) => {
    const { t } = useLanguage();

    return (
        <div 
            onClick={onSelect}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
            aria-pressed={isSelected}
            aria-label={`Select document: ${document.title}`}
            className={`flex justify-between items-center p-3 rounded-md cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 ${isSelected ? 'bg-cyan-500/20' : 'hover:bg-gray-700/50'}`}
        >
            <div className="truncate pr-2">
                <p className={`font-semibold truncate ${isSelected ? 'text-cyan-300' : 'text-gray-200'}`}>{document.title}</p>
                <p className="text-xs text-gray-400 truncate">{document.creator?.toString()}</p>
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="flex-shrink-0 p-1 text-gray-500 hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors"
                aria-label={`${t('common:remove')} ${document.title}`}
            >
                <CloseIcon className="w-4 h-4" />
            </button>
        </div>
    );
};