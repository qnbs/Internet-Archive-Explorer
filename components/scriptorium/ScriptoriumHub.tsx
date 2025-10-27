import React, { useState } from 'react';
import type { Workset } from '../../types';
import { WorksetListItem } from './WorksetListItem';
import { useLanguage } from '../../hooks/useLanguage';
import { PlusIcon, BookIcon } from '../Icons';

interface ScriptoriumHubProps {
    worksets: Workset[];
    onSelectWorkset: (workset: Workset) => void;
    onCreateWorkset: (name: string) => Workset;
    onDeleteWorkset: (id: string) => void;
    onRenameWorkset: (args: { id: string; newName: string }) => void;
}

export const ScriptoriumHub: React.FC<ScriptoriumHubProps> = ({ worksets, onSelectWorkset, onCreateWorkset, onDeleteWorkset, onRenameWorkset }) => {
    const { t } = useLanguage();
    const [newWorksetName, setNewWorksetName] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newWorksetName.trim()) {
            onCreateWorkset(newWorksetName.trim());
            setNewWorksetName('');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="p-6 bg-gray-800/60 rounded-xl shadow-lg text-center">
                <BookIcon className="w-12 h-12 mx-auto text-cyan-400 mb-4" />
                <h1 className="text-3xl font-bold text-cyan-400">{t('scriptorium:title')}</h1>
                <p className="mt-2 text-gray-300">{t('scriptorium:description')}</p>
            </header>
            
            <div className="p-6 bg-gray-800/60 rounded-xl shadow-lg">
                <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
                    <input 
                        value={newWorksetName} 
                        onChange={e => setNewWorksetName(e.target.value)} 
                        placeholder={t('scriptorium:newWorksetPlaceholder')}
                        className="flex-grow bg-gray-700 border-2 border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    />
                    <button 
                        type="submit" 
                        className="flex-shrink-0 flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300 shadow-lg"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        {t('scriptorium:create')}
                    </button>
                </form>
            </div>

            <div>
                {worksets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {worksets.map(ws => (
                            <WorksetListItem 
                                key={ws.id} 
                                workset={ws} 
                                onSelect={onSelectWorkset} 
                                onDelete={onDeleteWorkset}
                                onRename={onRenameWorkset}
                            />
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-10 bg-gray-800/60 rounded-lg">
                        <p className="text-gray-400">{t('scriptorium:noWorksets')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
