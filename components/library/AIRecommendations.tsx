import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { SparklesIcon, BookIcon } from '../Icons';

const RecommendationCard: React.FC<{ title: string; description: string; buttonLabel: string; icon: React.ReactNode; onClick: () => void; }> = 
({ title, description, buttonLabel, icon, onClick }) => (
    <div className="bg-gray-800/60 p-5 rounded-xl flex flex-col items-start gap-4">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gray-700 rounded-lg text-cyan-400">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <p className="text-sm text-gray-400 flex-grow">{description}</p>
        <button
            onClick={onClick}
            className="flex-shrink-0 flex items-center justify-center bg-cyan-600/80 hover:bg-cyan-600 text-white font-semibold py-2 px-4 text-sm rounded-lg transition-colors duration-300 shadow-lg"
        >
            {buttonLabel}
        </button>
    </div>
);


export const AIRecommendations: React.FC = () => {
    const { t } = useLanguage();

    const handleComingSoon = () => {
        alert('This AI feature is coming soon!');
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><SparklesIcon/> AI Librarian</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RecommendationCard 
                    title="Find Hidden Gems"
                    description="Let the AI analyze your library to find thematically similar items you might have forgotten about."
                    buttonLabel="Discover Connections"
                    icon={<SparklesIcon />}
                    onClick={handleComingSoon}
                />
                <RecommendationCard 
                    title="Curate a Collection"
                    description="The AI can analyze your untagged items and suggest a new, themed collection for them."
                    buttonLabel="Suggest a Collection"
                    icon={<BookIcon />}
                    onClick={handleComingSoon}
                />
            </div>
        </div>
    );
};