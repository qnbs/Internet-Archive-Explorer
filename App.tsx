



import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { Header } from './components/Header';
import { SideMenu } from './components/SideMenu';
import { BottomNav } from './components/BottomNav';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { UploaderFavoritesProvider } from './contexts/UploaderFavoritesContext';
import { SearchProvider, useSearch } from './contexts/SearchContext';
import type { View, ArchiveItemSummary, Uploader } from './types';
import { MediaType as MediaTypeValue } from './types';

// Lazy load components
const ExplorerView = React.lazy(() => import('./pages/ExplorerView').then(module => ({ default: module.ExplorerView })));
const FavoritesView = React.lazy(() => import('./pages/FavoritesView').then(module => ({ default: module.FavoritesView })));
const HelpView = React.lazy(() => import('./pages/HelpView').then(module => ({ default: module.HelpView })));
const SettingsView = React.lazy(() => import('./pages/SettingsView').then(module => ({ default: module.SettingsView })));
const CinemathequeView = React.lazy(() => import('./pages/CinemathequeView').then(module => ({ default: module.CinemathequeView })));
const AudiothekView = React.lazy(() => import('./pages/AudiothekView').then(module => ({ default: module.AudiothekView })));
const ImagesHubView = React.lazy(() => import('./pages/ImagesHubView').then(module => ({ default: module.ImagesHubView })));
const ScriptoriumView = React.lazy(() => import('./pages/ScriptoriumView').then(module => ({ default: module.ScriptoriumView })));
const RecRoomView = React.lazy(() => import('./pages/RecRoomView').then(module => ({ default: module.RecRoomView })));
const WebArchiveView = React.lazy(() => import('./pages/WebArchiveView').then(module => ({ default: module.WebArchiveView })));
const UploaderHubView = React.lazy(() => import('./pages/UploaderHubView').then(module => ({ default: module.UploaderHubView })));
const UploaderDetailView = React.lazy(() => import('./pages/UploaderDetailView').then(module => ({ default: module.UploaderDetailView })));
const ItemDetailModal = React.lazy(() => import('./components/ItemDetailModal').then(module => ({ default: module.ItemDetailModal })));
const AudioDetailModal = React.lazy(() => import('./components/AudioDetailModal').then(module => ({ default: module.AudioDetailModal })));
const VideoDetailModal = React.lazy(() => import('./components/VideoDetailModal').then(module => ({ default: module.VideoDetailModal })));
const EmulatorModal = React.lazy(() => import('./components/EmulatorModal').then(module => ({ default: module.EmulatorModal })));
// FIX: Corrected import to point to the placeholder component, fixing the "not a module" error.
const StorytellerView = React.lazy(() => import('./pages/StorytellerView').then(module => ({ default: module.StorytellerView })));
const CommandPalette = React.lazy(() => import('./components/CommandPalette').then(module => ({ default: module.CommandPalette })));


const AppContent: React.FC = () => {
    const [activeView, _setActiveView] = useState<View>('explore');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ArchiveItemSummary | null>(null);
    const [selectedUploader, setSelectedUploader] = useState<string | null>(null);
    const [itemToEmulate, setItemToEmulate] = useState<ArchiveItemSummary | null>(null);
    
    const { registerViewSetter, searchAndGo } = useSearch();
    const { isLoading: isLanguageLoading, t } = useLanguage();

    const setActiveView = (view: View) => {
      // Clear specific state when changing views
      if (view !== 'uploaderDetail') {
        setSelectedUploader(null);
      }
      _setActiveView(view);
      window.scrollTo(0, 0); // Scroll to top on view change
    };

    useEffect(() => {
        registerViewSetter(setActiveView);
    }, [registerViewSetter]);
    
    // Command Palette global hotkey
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(isOpen => !isOpen);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSelectItem = (item: ArchiveItemSummary) => {
        setSelectedItem(item);
    };

    const handleEmulate = (item: ArchiveItemSummary) => {
        setSelectedItem(null);
        setItemToEmulate(item);
    };
    
    const handleSelectUploader = useCallback((uploader: Uploader | string) => {
        const uploaderName = typeof uploader === 'string' ? uploader : uploader.searchUploader;
        setSelectedUploader(uploaderName);
        setActiveView('uploaderDetail');
    }, []);
    
    const commandActions = {
        navigateTo: (view: View) => {
            setActiveView(view);
            setIsCommandPaletteOpen(false);
        },
        selectUploader: (uploader: Uploader) => {
            handleSelectUploader(uploader);
            setIsCommandPaletteOpen(false);
        },
        globalSearch: (query: string) => {
            searchAndGo(query);
            setIsCommandPaletteOpen(false);
        }
    };


    const renderView = () => {
        if (selectedUploader && activeView === 'uploaderDetail') {
            return <UploaderDetailView uploaderName={selectedUploader} onSelectItem={handleSelectItem} onClearUploader={() => setActiveView('uploaders')} />
        }

        switch (activeView) {
            case 'explore': return <ExplorerView onSelectItem={handleSelectItem} />;
            case 'favorites': return <FavoritesView onSelectItem={handleSelectItem} onSelectUploader={handleSelectUploader} />;
            case 'help': return <HelpView />;
            case 'settings': return <SettingsView />;
            case 'movies': return <CinemathequeView onSelectItem={handleSelectItem} />;
            case 'audio': return <AudiothekView onSelectItem={handleSelectItem} />;
            case 'image': return <ImagesHubView />;
            case 'scriptorium': return <ScriptoriumView />;
            case 'recroom': return <RecRoomView onSelectItem={handleEmulate} />;
            case 'web': return <WebArchiveView />;
            case 'uploaders': return <UploaderHubView onSelectUploader={handleSelectUploader} />;
            case 'storyteller': return <StorytellerView />;
            default: return <ExplorerView onSelectItem={handleSelectItem} />;
        }
    };
    
    const renderModal = () => {
        if (!selectedItem) return null;
        
        const closeModal = () => setSelectedItem(null);
        
        const handleCreatorSelect = (creator: string) => {
          closeModal();
          searchAndGo(`creator:("${creator}")`);
        };
        const handleUploaderSelect = (uploader: string) => {
          closeModal();
          handleSelectUploader(uploader);
        };
        
        switch(selectedItem.mediatype) {
          case MediaTypeValue.Audio:
            return <AudioDetailModal item={selectedItem} onClose={closeModal} onCreatorSelect={handleCreatorSelect} onUploaderSelect={handleUploaderSelect} onSelectItem={handleSelectItem} />;
          case MediaTypeValue.Movies:
            return <VideoDetailModal item={selectedItem} onClose={closeModal} onCreatorSelect={handleCreatorSelect} onUploaderSelect={handleUploaderSelect} onSelectItem={handleSelectItem} />;
          default:
            return <ItemDetailModal item={selectedItem} onClose={closeModal} onCreatorSelect={handleCreatorSelect} onUploaderSelect={handleUploaderSelect} onEmulate={handleEmulate} onSelectItem={handleSelectItem} />;
        }
    };

    const FullScreenLoader: React.FC = () => (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 z-50" role="status">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
      </div>
    );
    
    if (isLanguageLoading) {
      return <FullScreenLoader />;
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
            <Header 
              onMenuClick={() => setIsMenuOpen(true)}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            />
            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} activeView={activeView} setActiveView={setActiveView} />
            
            <main className="pt-20 pb-24 md:pb-8 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
              <Suspense fallback={<FullScreenLoader />}>
                {renderView()}
              </Suspense>
            </main>
            
            <BottomNav activeView={activeView} setActiveView={setActiveView} />

            <Suspense fallback={null}>
              {renderModal()}
              {itemToEmulate && <EmulatorModal item={itemToEmulate} onClose={() => setItemToEmulate(null)} />}
              {isCommandPaletteOpen && (
                <CommandPalette 
                  onClose={() => setIsCommandPaletteOpen(false)}
                  actions={commandActions}
                />
              )}
            </Suspense>
        </div>
    );
};

const App: React.FC = () => (
    <LanguageProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <UploaderFavoritesProvider>
            <SearchProvider>
                <AppContent />
            </SearchProvider>
          </UploaderFavoritesProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </LanguageProvider>
);

export default App;