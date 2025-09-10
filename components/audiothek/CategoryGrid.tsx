
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const MusicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V3z" /></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.22 5.22a.75.75 0 011.06 0L7.5 6.44a.75.75 0 01-1.06 1.06L5.22 6.28a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zM5.22 14.78a.75.75 0 010-1.06l1.22-1.22a.75.75 0 011.06 1.06l-1.22 1.22a.75.75 0 01-1.06 0zM10 18a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5A.75.75 0 0110 18zM14.78 14.78a.75.75 0 01-1.06 0l-1.22-1.22a.75.75 0 011.06-1.06l1.22 1.22a.75.75 0 010 1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010 1.5h1.5A.75.75 0 0118 10zM14.78 5.22a.75.75 0 010 1.06l-1.22 1.22a.75.75 0 01-1.06-1.06l1.22-1.22a.75.75 0 011.06 0z" clipRule="evenodd" /><path d="M10 5a5 5 0 100 10 5 5 0 000-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" /></svg>;
const RadioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /><path d="M10 3a7 7 0 100 14 7 7 0 000-14zM3 10a7 7 0 1114 0 7 7 0 01-14 0z" /></svg>;
const PodcastIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path d="M8.25 3.75a.75.75 0 01.75-.75h2a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5h-.5a.75.75 0 01-.75-.75z" /><path fillRule="evenodd" d="M5 6a3 3 0 013-3h4a3 3 0 013 3v6a3 3 0 01-3 3h-1.025a.75.75 0 01-.75-.75V12.75a.75.75 0 00-.75-.75h-2.5a.75.75 0 00-.75.75v1.5a.75.75 0 01-.75.75H8a3 3 0 01-3-3V6zm3-1.5a1.5 1.5 0 00-1.5 1.5v6a1.5 1.5 0 001.5 1.5h1.025a2.25 2.25 0 002.25-2.25V9a2.25 2.25 0 00-2.25-2.25H8z" clipRule="evenodd" /></svg>;

interface CategoryGridProps {
  onSearch: (query: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSearch }) => {
    const { t } = useLanguage();

    const categories = [
        { title: t('audiothek.categories.music'), query: 'collection:78rpm', icon: <MusicIcon /> },
        { title: t('audiothek.categories.audiobooks'), query: 'collection:librivoxaudio OR subject:poetry', icon: <BookIcon /> },
        { title: t('audiothek.categories.radio'), query: 'collection:OldTimeRadio', icon: <RadioIcon /> },
        { title: t('audiothek.categories.podcasts'), query: 'subject:podcast', icon: <PodcastIcon /> },
    ];

    return (
        <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map(cat => (
                    <div
                        key={cat.title}
                        onClick={() => onSearch(cat.query)}
                        className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col items-center justify-center text-center"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSearch(cat.query)}
                        aria-label={`Search for ${cat.title}`}
                    >
                        <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
                            {cat.icon}
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-white">{cat.title}</h3>
                    </div>
                ))}
            </div>
        </section>
    );
};
