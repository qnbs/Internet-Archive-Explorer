import React from 'react';
import { useAtom } from 'jotai';
// FIX: Use direct imports to prevent circular dependency issues.
import { facetsAtom } from '../store/search';
import { useLanguage } from '../hooks/useLanguage';
import { MediaType, Availability } from '../types';
import { MovieIcon, AudioIcon, BookIcon, ImageIcon, JoystickIcon } from './Icons';

interface SearchPopoverProps {
    onClose: () => void;
}

const MEDIA_TYPE_OPTIONS = [
    { type: MediaType.Movies, icon: <MovieIcon className="w-4 h-4"/> },
    { type: MediaType.Audio, icon: <AudioIcon className="w-4 h-4"/> },
    { type: MediaType.Texts, icon: <BookIcon className="w-4 h-4"/> },
    { type: MediaType.Image, icon: <ImageIcon className="w-4 h-4"/> },
    { type: MediaType.Software, icon: <JoystickIcon className="w-4 h-4"/> },
];

const AVAILABILITY_OPTIONS: { key: Availability; labelKey: string }[] = [
    { key: 'all', labelKey: 'searchPopover:availabilities.all' },
    { key: 'free', labelKey: 'searchPopover:availabilities.free' },
    { key: 'borrowable', labelKey: 'searchPopover:availabilities.borrowable' },
];

const LANGUAGE_OPTIONS = [
    'English', 'German', 'French', 'Spanish', 'Chinese', 'Russian', 'Arabic', 'Portuguese'
];


export const SearchPopover: React.FC<SearchPopoverProps> = ({ onClose }) => {
    const [facets, setFacets] = useAtom(facetsAtom);
    const { t } = useLanguage();
    
    const handleMediaTypeToggle = (type: MediaType) => {
        setFacets(currentFacets => {
            const newMediaTypes = new Set(currentFacets.mediaType);
            if (newMediaTypes.has(type)) {
                newMediaTypes.delete(type);
            } else {
                newMediaTypes.add(type);
            }
            return { ...currentFacets, mediaType: newMediaTypes };
        });
    };

    const handleLanguageSelect = (lang: string) => {
        setFacets(currentFacets => {
            const newLang = currentFacets.language === lang ? undefined : lang;
            return { ...currentFacets, language: newLang };
        });
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 animate-fade-in z-30">
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('searchPopover:mediaType')}</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {MEDIA_TYPE_OPTIONS.map(option => (
                            <button 
                                key={option.type}
                                onClick={() => handleMediaTypeToggle(option.type)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors border-2 ${facets.mediaType.has(option.type) ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-500' : 'bg-gray-100 dark:bg-gray-700/50 border-transparent hover:border-gray-300 dark:hover:border-gray-500'}`}
                                aria-pressed={facets.mediaType.has(option.type)}
                            >
                                {option.icon}
                                <span className="text-xs mt-1 capitalize">{option.type}</span>
                            </button>
                        ))}
                    </div>
                </div>

                 <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('searchPopover:language')}</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {LANGUAGE_OPTIONS.map(lang => (
                            <button
                                key={lang}
                                onClick={() => handleLanguageSelect(lang)}
                                className={`text-center p-2 rounded-lg transition-colors border-2 text-xs ${facets.language === lang ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-500' : 'bg-gray-100 dark:bg-gray-700/50 border-transparent hover:border-gray-300 dark:hover:border-gray-500'}`}
                                aria-pressed={facets.language === lang}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                <div role="radiogroup" aria-labelledby="availability-label">
                    <h3 id="availability-label" className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('searchPopover:availability')}</h3>
                     <div className="space-y-1">
                        {AVAILABILITY_OPTIONS.map(option => (
                            <button
                                key={option.key}
                                onClick={() => setFacets(f => ({ ...f, availability: option.key }))}
                                className={`w-full text-left flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 ${facets.availability === option.key ? 'bg-gray-100 dark:bg-gray-700/50' : ''}`}
                                role="radio"
                                aria-checked={facets.availability === option.key}
                            >
                                <div className="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center flex-shrink-0">
                                    {facets.availability === option.key && <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>}
                                </div>
                                <span className="text-sm font-medium">{t(option.labelKey)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};