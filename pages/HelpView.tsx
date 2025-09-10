import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const AccordionItem: React.FC<{ title: string; children: React.ReactNode; startOpen?: boolean }> = ({ title, children, startOpen = false }) => {
  const [isOpen, setIsOpen] = useState(startOpen);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-4 px-2"
        aria-expanded={isOpen}
      >
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-200">{title}</h3>
        <svg
          className={`w-6 h-6 text-cyan-600 dark:text-cyan-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
            <div 
                className="p-4 pt-0 text-gray-600 dark:text-gray-300 leading-relaxed space-y-3 prose-a:text-cyan-600 prose-a:dark:text-cyan-400 hover:prose-a:underline prose-ul:list-disc prose-ul:pl-6 prose-li:mb-1 prose-code:bg-gray-200 prose-code:dark:bg-gray-700 prose-code:px-1 prose-code:rounded prose-strong:text-gray-800 prose-strong:dark:text-gray-200" 
                dangerouslySetInnerHTML={{ __html: children as string }} 
            />
        </div>
      </div>
    </div>
  );
};

export const HelpView: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-page-fade-in">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">{t('help:title')}</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{t('help:subtitle')}</p>
            </header>

            <section className="p-6 bg-gray-50 dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('help:gettingStartedTitle')}</h2>
                <div className="space-y-2">
                    <AccordionItem title={t('help:qSearch')} startOpen>
                        {t('help:aSearch')}
                    </AccordionItem>
                    <AccordionItem title={t('help:qFilters')}>
                       {t('help:aFilters')}
                    </AccordionItem>
                     <AccordionItem title={t('help:qNav')}>
                        {t('help:aNav')}
                    </AccordionItem>
                </div>
            </section>
            
             <section className="p-6 bg-gray-50 dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('help:explorerTitle')}</h2>
                <div className="space-y-2">
                    <AccordionItem title={t('help:qExplorer')}>
                        {t('help:aExplorer')}
                    </AccordionItem>
                    <AccordionItem title={t('help:qTrending')}>
                        {t('help:aTrending')}
                    </AccordionItem>
                    <AccordionItem title={t('help:qOnThisDay')}>
                        {t('help:aOnThisDay')}
                    </AccordionItem>
                     <AccordionItem title={t('help:qQuickSearch')}>
                        {t('help:aQuickSearch')}
                    </AccordionItem>
                </div>
            </section>

             <section className="p-6 bg-gray-50 dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('help:collectionsTitle')}</h2>
                <div className="space-y-2">
                    <AccordionItem title={t('help:qCinemaAudio')}>
                        {t('help:aCinemaAudio')}
                    </AccordionItem>
                    <AccordionItem title={t('help:qImages')}>
                        {t('help:aImages')}
                    </AccordionItem>
                     <AccordionItem title={t('help:qRecRoom')}>
                        {t('help:aRecRoom')}
                    </AccordionItem>
                     <AccordionItem title={t('help:qWebArchive')}>
                        {t('help:aWebArchive')}
                    </AccordionItem>
                </div>
            </section>
            
            <section className="p-6 bg-gray-50 dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('help:scriptoriumTitle')}</h2>
                 <div className="space-y-2">
                    <AccordionItem title={t('help:qScriptorium')}>
                        {t('help:aScriptorium')}
                    </AccordionItem>
                    <AccordionItem title={t('help:qWorksets')}>
                        {t('help:aWorksets')}
                    </AccordionItem>
                     <AccordionItem title={t('help:qReaderAi')}>
                        {t('help:aReaderAi')}
                    </AccordionItem>
                </div>
            </section>

             <section className="p-6 bg-gray-50 dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('help:communityTitle')}</h2>
                <div className="space-y-2">
                    <AccordionItem title={t('help:qUploaderHub')}>
                        {t('help:aUploaderHub')}
                    </AccordionItem>
                     <AccordionItem title={t('help:qFavorites')}>
                        {t('help:aFavorites')}
                    </AccordionItem>
                    <AccordionItem title={t('help:qSimilar')}>
                        {t('help:aSimilar')}
                    </AccordionItem>
                </div>
            </section>
            
             <section className="p-6 bg-gray-50 dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('help:faqTitle')}</h2>
                <div className="space-y-2">
                    <AccordionItem title={t('help:qDownload')}>
                        {t('help:aDownload')}
                    </AccordionItem>
                     <AccordionItem title={t('help:qOfficial')}>
                        {t('help:aOfficial')}
                    </AccordionItem>
                     <AccordionItem title={t('help:qAboutApp')}>
                        {t('help:aAboutApp')}
                    </AccordionItem>
                </div>
            </section>
        </div>
    );
};
