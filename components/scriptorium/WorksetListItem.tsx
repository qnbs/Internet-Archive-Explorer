import React, { useState, useEffect, useRef } from 'react';
import type { Workset } from '../../types';
import { TrashIcon, ArrowRightIcon, PencilAltIcon } from '../Icons';
import { useLanguage } from '../../hooks/useLanguage';

interface WorksetListItemProps {
    workset: Workset;
    onSelect: (workset: Workset) => void;
    onDelete: (id: string) => void;
    onRename: (args: { id: string, newName: string }) => void;
}

export const WorksetListItem: React.FC<WorksetListItemProps> = ({ workset, onSelect, onDelete, onRename }) => {
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(workset.name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleRename = () => {
        if (name.trim() && name.trim() !== workset.name) {
            onRename({ id: workset.id, newName: name.trim() });
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleRename();
        if (e.key === 'Escape') {
            setName(workset.name);
            setIsEditing(false);
        }
    };
    
    return (
        <div 
            onClick={() => !isEditing && onSelect(workset)} 
            className="flex justify-between items-center p-4 bg-gray-800 hover:bg-gray-700/70 rounded-lg cursor-pointer transition-colors group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !isEditing && onSelect(workset)}
            aria-label={`Open workset ${workset.name}`}
        >
            <div>
                {isEditing ? (
                    <input
                        ref={inputRef}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={handleKeyDown}
                        className="bg-gray-900 text-white rounded px-2 py-1"
                        onClick={e => e.stopPropagation()}
                    />
                ) : (
                    <p className="font-bold text-white group-hover:text-cyan-400 transition-colors">{workset.name}</p>
                )}
                <p className="text-sm text-gray-400">{t('scriptorium.documentCount', { count: workset.documents.length })}</p>
            </div>
            <div className="flex items-center space-x-1">
                 <button 
                    onClick={(e) => { 
                        e.stopPropagation();
                        setIsEditing(true);
                    }} 
                    className="p-2 text-gray-500 hover:text-cyan-400 rounded-full hover:bg-cyan-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={t('scriptorium:renameWorkset')}
                 >
                    <PencilAltIcon className="w-5 h-5" />
                </button>
                 <button 
                    onClick={(e) => { 
                        e.stopPropagation();
                        onDelete(workset.id);
                    }} 
                    className="p-2 text-gray-500 hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={t('common:delete')}
                 >
                    <TrashIcon className="w-5 h-5" />
                </button>
                 <ArrowRightIcon className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
            </div>
        </div>
    );
};