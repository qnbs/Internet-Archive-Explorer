import React from 'react';
import { useSetAtom } from 'jotai';
import { modalAtom } from '../../store/app';
import type { ArchiveItemSummary } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { ArrowRightIcon } from '../Icons';

interface SourceItemCardProps {
    source: ArchiveItemSummary;
}

export const SourceItemCard: React.FC<SourceItemCardProps> = ({ source }) => {
    const { t } = useLanguage();
    const setModal = useSetAtom(modalAtom);
    const thumbnailUrl = `https://archive.org/services/get-item-image.php?identifier=${source.identifier}`;
    const creator = Array.isArray(source.creator) ? source.creator.join(', ') : source.creator;

    const handleClick = () => {
        setModal({ type: 'itemDetail', item: source });
    };

    return (
        <div className="mt-1">
            <h4 className="font-semibold text-gray-300 mb-2">{t('aiArchive:details.source')}</h4>
            <button
                onClick={handleClick}
                className="w-full flex items-center space-x-3 p-3 bg-gray-900/50 hover:bg-gray-700/80 rounded-lg text-left transition-colors group"
            >
                <img
                    src={thumbnailUrl}
                    alt=""
                    className="w-12 h-16 object-cover rounded-md flex-shrink-0 bg-gray-700"
                    loading="lazy"
                />
                <div className="flex-grow min-w-0">
                    <h5 className="font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">{source.title}</h5>
                    <p className="text-sm text-gray-400 truncate">{creator}</p>
                </div>
                <ArrowRightIcon className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
            </button>
        </div>
    );
};