import React from 'react';
import type { ArchiveFile } from '../types';
import { FileIcon } from './Icons';
import { formatBytes } from '../../utils/formatter';

interface ItemDetailFilesTabProps {
    files: ArchiveFile[];
    itemIdentifier: string;
}

export const ItemDetailFilesTab: React.FC<ItemDetailFilesTabProps> = ({ files, itemIdentifier }) => {
    const filteredFiles = files.filter(f => f.format !== 'Metadata' && f.format !== 'Item Image');

    return (
        <div className="max-h-80 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 space-y-2 border border-gray-200 dark:border-gray-700">
            {filteredFiles.map((file: ArchiveFile) => (
                <a
                    key={file.name}
                    href={`https://archive.org/download/${itemIdentifier}/${encodeURIComponent(file.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                    <div className="flex items-center space-x-3 truncate">
                        <FileIcon />
                        <span className="truncate text-gray-800 dark:text-gray-300 text-sm" title={file.name}>{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                        <span className="text-xs text-gray-500 dark:text-gray-500">{formatBytes(file.size)}</span>
                        <span className="text-xs font-mono bg-gray-100 text-cyan-800 dark:bg-gray-600 dark:text-cyan-300 px-2 py-0.5 rounded">{file.format}</span>
                    </div>
                </a>
            ))}
        </div>
    );
};