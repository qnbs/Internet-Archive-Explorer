import React, { useState, useEffect } from 'react';
// FIX: AIGenerationType is an enum used as a value, and MagicOrganizeResult is a new type dependency.
import { AIGenerationType, type AIArchiveEntry, type ExtractedEntities, type ImageAnalysisResult, type MagicOrganizeResult } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { BookIcon, TagIcon, ImageIcon, StarIcon, SparklesIcon, MovieIcon, AudioIcon, JoystickIcon } from '../Icons';

interface AIArchiveItemCardProps {
  entry: AIArchiveEntry;
  isSelected: boolean;
  onSelect: () => void;
}

// FIX: Added missing enum members to the ICONS record to satisfy the type and provide specific icons.
const ICONS: Record<AIGenerationType, React.ReactNode> = {
    [AIGenerationType.Summary]: <BookIcon className="w-5 h-5" />,
    [AIGenerationType.Entities]: <TagIcon className="w-5 h-5" />,
    [AIGenerationType.ImageAnalysis]: <ImageIcon className="w-5 h-5" />,
    [AIGenerationType.DailyInsight]: <StarIcon className="w-5 h-5" />,
    [AIGenerationType.Story]: <SparklesIcon className="w-5 h-5" />,
    [AIGenerationType.Answer]: <SparklesIcon className="w-5 h-5" />,
    [AIGenerationType.MagicOrganize]: <SparklesIcon className="w-5 h-5" />,
    [AIGenerationType.MoviesInsight]: <MovieIcon className="w-5 h-5" />,
    [AIGenerationType.AudioInsight]: <AudioIcon className="w-5 h-5" />,
    [AIGenerationType.ImagesInsight]: <ImageIcon className="w-5 h-5" />,
    [AIGenerationType.RecRoomInsight]: <JoystickIcon className="w-5 h-5" />,
};

const getContentSnippet = (entry: AIArchiveEntry): string => {
    if (typeof entry.content === 'string') {
        return entry.content;
    }
    if (entry.type === AIGenerationType.ImageAnalysis) {
        return (entry.content as ImageAnalysisResult).description;
    }
    if (entry.type === AIGenerationType.Entities) {
        const { people, places, organizations } = entry.content as ExtractedEntities;
        return [...people, ...places, ...organizations].slice(0, 5).join(', ');
    }
    // Add support for MagicOrganize content type to display a relevant snippet.
    if (entry.type === AIGenerationType.MagicOrganize) {
        const { tags } = entry.content as MagicOrganizeResult;
        return `Tags: ${tags.slice(0, 5).join(', ')}`;
    }
    return 'Complex object';
};


export const AIArchiveItemCard: React.FC<AIArchiveItemCardProps> = React.memo(({ entry, isSelected, onSelect }) => {
  const { t, language } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const date = new Date(entry.timestamp).toLocaleDateString(language, { month: 'short', day: 'numeric', year: 'numeric' });
  const thumbnailUrl = entry.source ? `https://archive.org/services/get-item-image.php?identifier=${entry.source.identifier}` : null;
  
  useEffect(() => {
    setImageError(false);
  }, [entry.id]);

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
        <div className={`flex-shrink-0 mt-1 w-10 h-10 rounded-md flex items-center justify-center text-cyan-300 ${isSelected ? 'bg-cyan-500/20' : 'bg-gray-700'}`}>
            {thumbnailUrl && !imageError ? (
                <img
                    src={thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover rounded-md"
                    loading="lazy"
                    onError={() => setImageError(true)}
                />
            ) : ICONS[entry.type]}
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
