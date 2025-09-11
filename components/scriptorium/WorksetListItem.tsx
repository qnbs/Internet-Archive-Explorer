import React from 'react';
import type { Workset } from '../../types';
import { TrashIcon, ArrowRightIcon } from '../Icons';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../../hooks/useLanguage';

interface WorksetListItemProps {
    workset: Workset;
    onSelect: (workset: Workset) => void;
    onDelete: (id: string) => void;
}

export const WorksetListItem: React.FC<WorksetListItemProps> = ({ workset, onSelect, onDelete }) => {
    const { t } = useLanguage();
    
    return (
        <div 
            onClick={() => onSelect(workset)} 
            className="flex justify-between items-center p-4 bg-gray-800 hover:bg-gray-700/70 rounded-lg cursor-pointer transition-colors group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(workset)}
            aria-label={`Open workset ${workset.name}`}
        >
            <div>
                <p className="font-bold text-white group-hover:text-cyan-400 transition-colors">{workset.name}</p>
                <p className="text-sm text-gray-400">{t('scriptorium.documentCount', { count: workset.documents.length })}</p>
            </div>
            <div className="flex items-center space-x-3">
                 <button 
                    onClick={(e) => { 
                        e.stopPropagation();
                        onDelete(workset.id);
                    }} 
                    className="p-2 text-gray-500 hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors"
                    aria-label={t('common:delete')}
                 >
                    <TrashIcon className="w-5 h-5" />
                </button>
                 <ArrowRightIcon className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
            </div>
        </div>
    );
};