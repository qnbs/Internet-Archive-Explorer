import React from 'react';
import type { AIArchiveEntry, AIGenerationType, ExtractedEntities, ImageAnalysisResult } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { BookIcon, TagIcon, ImageIcon, StarIcon, SparklesIcon } from '../Icons';

interface AIArchiveItemCardProps {
  entry: AIArchiveEntry;
  isSelected: boolean;
  onSelect: () => void;
}

const ICONS: Record<AIGenerationType, React.ReactNode> = {
    summary: <BookIcon className="w-5 h-5" />,
    entities: <TagIcon className="w-5 h-5" />,
    imageAnalysis: <ImageIcon className="w-5 h-5" />,
    dailyInsight: <StarIcon className="w-5 h-5" />,
    story: <SparklesIcon className="w-5 h-5" />,
    answer: <SparklesIcon className="w-5 h-5" />,
};

const getContentSnippet = (entry: AIArchiveEntry): string => {
    if (typeof entry.content === 'string') {
        return entry.content;
    }
    if (entry.type === 'imageAnalysis') {
        return (entry.content as ImageAnalysisResult).description;
    }
    if (entry.type === 'entities') {
        const { people, places, organizations } = entry.content as ExtractedEntities;
        return [...people, ...places, ...organizations].slice(0, 5).join(', ');
    }
    return 'Complex object';
};


export const AIArchiveItemCard: React.FC<AIArchiveItemCardProps> = React.memo(({ entry, isSelected, onSelect }) => {
  const { t, language } = useLanguage();
  const date = new Date(entry.timestamp).toLocaleDateString(language, { month: 'short', day: 'numeric', year: 'numeric' });
  const thumbnailUrl = entry.source ? `https://archive.org/services/get-item-image.php?identifier=${entry.source.identifier}` : null;
  
  return (
    <article
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      aria-pressed={isSelected}
      className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
        isSelected 
          ? 'bg-cyan-500/20 border-cyan-500' 
          : 'bg-gray-800/60 border-transparent hover:bg-gray-700/80'
      }`}
    >
        <div className="flex-shrink-0 mt-1 flex items-center justify-center">
            {thumbnailUrl ? (
                <img
                    src={thumbnailUrl}
                    alt=""
                    className="w-10 h-10 object-cover rounded-md bg-gray-700"
                    loading="lazy"
                />
            ) : (
                <div className={`w-10 h-10 rounded-md flex items-center justify-center text-cyan-300 ${isSelected ? 'bg-cyan-500/20' : 'bg-gray-700'}`}>
                    {ICONS[entry.type]}
                </div>
            )}
        </div>
      <div className="flex-grow min-w-0">
         <div className="flex justify-between items-start">
            <h3 className={`font-semibold text-sm truncate pr-2 ${isSelected ? 'text-white' : 'text-gray-200'}`} title={entry.source?.title}>
              {entry.source?.title || t(`aiArchive:types.${entry.type}`)}
            </h3>
            <span className="text-xs text-gray-500 flex-shrink-0">{date}</span>
        </div>
        <p className="text-xs text-gray-400 truncate italic line-clamp-2">"{getContentSnippet(entry)}"</p>
      </div>
    </article>
  );
});