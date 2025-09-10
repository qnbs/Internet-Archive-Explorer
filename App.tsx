import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { Header } from './components/Header';
import { SideMenu } from './components/SideMenu';
import { BottomNav } from './components/BottomNav';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { UploaderFavoritesProvider } from './contexts/UploaderFavoritesContext';
import { SearchProvider, useSearch } from './contexts/SearchContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/Toast';
import { CommandPalette } from './components/CommandPalette';
import { ConfirmationModal } from './components/ConfirmationModal';
import type { View, ArchiveItemSummary, Uploader, ConfirmationOptions } from './types';
import { UPLOADER_DATA } from './pages/uploaderData';

// Lazy load page-level components
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
const UploaderProfileView = React.lazy(() => import('./pages/UploaderProfileView').then(module => ({ default: module.UploaderProfileView })));
const ItemDetailModal = React.lazy(() => import('./components/ItemDetailModal').then(module => ({ default: module.ItemDetailModal })));
const EmulatorModal = React.lazy(() => import('./components/EmulatorModal').then(module => ({ default: module.EmulatorModal })));
const StorytellerView = React.lazy(() => import('./pages/StorytellerView').then(module => ({ default: module.StorytellerView })));


const AppContent: React.FC = () => {
    const [activeView, setActiveView] = useState<View>('explore');
    const [returnView, setReturnView] = useState<View>('explore');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ArchiveItemSummary | null>(null);
    const [selectedUploader, setSelectedUploader] = useState<Uploader | null>(null);
    const [itemToEmulate, setItemToEmulate] = useState<ArchiveItemSummary | null>(null);
    const [confirmationProps, setConfirmationProps] = useState<ConfirmationOptions | null>(null);

    
    const { registerViewSetter, setFacets, setSearchQuery } = useSearch();
    const { isLoading: isLanguageLoading, t } = useLanguage();

    const handleViewChange = (view: View) => {
      setActiveView(view);
      if (view !== 'uploaderDetail' && view !== 'uploaderProfile') {
          setSelectedUploader(null);
      }
      window.scrollTo(0, 0); // Scroll to top on view change
    };

    useEffect(() => {
        registerViewSetter(handleViewChange);
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

    const handleSelectCreator = (creator: string) => {
        setSelectedItem(null); // Close item modal if open
        setSearchQuery(`creator:("${creator}")`);
        setFacets({ mediaType: new Set() }); // Reset facets for new search
        setActiveView('explore');
    };
    
    const handleSelectUploader = (searchUploader: string) => {
        let uploader = UPLOADER_DATA.find(u => u.searchUploader === searchUploader);

        if (!uploader) {
            const username = searchUploader.split('@')[0];
            uploader = {
                username: username,
                searchUploader: searchUploader,
                descriptionKey: 'uploaderProfileCard:genericDescription',
                category: 'community',
                featured: false,
            };
        }
        
        const originatingView = activeView;
        setReturnView(originatingView);
        setSelectedItem(null);
        setSelectedUploader(uploader);

        // This is the key logic change: route to the correct view
        if (originatingView === 'uploaderHub') {
            setActiveView('uploaderProfile');
        } else {
            setActiveView('uploaderDetail');
        }
    };

    const handleCloseModals = () => {
        setSelectedItem(null);
        setItemToEmulate(null);
    };

    const handleNavigate = (view: View) => {
        setActiveView(view);
        setIsCommandPaletteOpen(false);
    };

    const commandActions = {
        navigateTo: handleNavigate,
        globalSearch: (query: string) => {
            setSearchQuery(query);
            setFacets({ mediaType: new Set() });
            setActiveView('explore');
            setIsCommandPaletteOpen(false);
        },
    };
    
    const handleConfirmation = async () => {
        if (confirmationProps?.onConfirm) {
            await confirmationProps.onConfirm();
        }
        setConfirmationProps(null);
    };

    const handleCancelConfirmation = () => {
        if (confirmationProps?.onCancel) {
            confirmationProps.onCancel();
        }
        setConfirmationProps(null);
    };

    const renderView = () => {
        switch (activeView) {
            case 'explore': return <ExplorerView onSelectItem={handleSelectItem} />;
            case 'scriptorium': return <ScriptoriumView showConfirmation={setConfirmationProps} />;
            case 'image': return <ImagesHubView />;
            case 'movies': return <CinemathequeView onSelectItem={handleSelectItem} />;
            case 'audio': return <AudiothekView onSelectItem={handleSelectItem} />;
            case 'recroom': return <RecRoomView onSelectItem={handleEmulate} />;
            case 'web': return <WebArchiveView />;
            case 'favorites': return <FavoritesView onSelectItem={handleSelectItem} />;
            case 'settings': return <SettingsView showConfirmation={setConfirmationProps} />;
            case 'help': return <HelpView />;
            case 'uploaderHub': return <UploaderHubView onSelectUploader={handleSelectUploader} />;
            case 'uploaderDetail':
                return selectedUploader ? <UploaderDetailView uploader={selectedUploader} onBack={() => handleViewChange(returnView)} onSelectItem={handleSelectItem} returnView={returnView} /> : <ExplorerView onSelectItem={handleSelectItem} />;
            case 'uploaderProfile':
                 return selectedUploader ? <UploaderProfileView uploader={selectedUploader} onBack={() => handleViewChange('uploaderHub')} /> : <UploaderHubView onSelectUploader={handleSelectUploader} />;
            case 'storyteller': return <StorytellerView />;
            default: return <ExplorerView onSelectItem={handleSelectItem} />;
        }
    };

    if (isLanguageLoading) {
        return <div className="fixed inset-0 flex justify-center items-center bg-white dark:bg-gray-900"><div className="text-xl">{t('common:loading')}</div></div>;
    }

    return (
        <div className={`min-h-screen flex flex-col transition-opacity duration-500 ${isLanguageLoading ? 'opacity-0' : 'opacity-100'}`}>
            <Header onMenuClick={() => setIsMenuOpen(true)} onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} activeView={activeView} setActiveView={handleViewChange} />
            <main className="flex-grow pt-20 pb-24 px-4 md:px-6 md:ml-64">
                <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="text-xl">{t('common:loading')}</div></div>}>
                    {renderView()}
                </Suspense>
            </main>
            <BottomNav activeView={activeView} setActiveView={handleViewChange} />

            {selectedItem && (
                <Suspense fallback={<div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center"><div className="text-xl">{t('common:loading')}</div></div>}>
                    <ItemDetailModal 
                      item={selectedItem} 
                      onClose={handleCloseModals} 
                      onCreatorSelect={handleSelectCreator}
                      onUploaderSelect={handleSelectUploader}
                      onEmulate={handleEmulate}
                      onSelectItem={handleSelectItem}
                    />
                </Suspense>
            )}

            {itemToEmulate && (
                 <Suspense fallback={<div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center"><div className="text-xl">{t('common:loading')}</div></div>}>
                    <EmulatorModal item={itemToEmulate} onClose={handleCloseModals} />
                </Suspense>
            )}
            
            {isCommandPaletteOpen && (
                <CommandPalette onClose={() => setIsCommandPaletteOpen(false)} actions={commandActions} />
            )}
            
            {confirmationProps && (
                <ConfirmationModal
                    title={confirmationProps.title}
                    message={confirmationProps.message}
                    onConfirm={handleConfirmation}
                    onCancel={handleCancelConfirmation}
                    confirmLabel={confirmationProps.confirmLabel}
                    confirmClass={confirmationProps.confirmClass}
                />
            )}
            
            <ToastContainer />
        </div>
    );
};

const App: React.FC = () => (
    <LanguageProvider>
      <ThemeProvider>
        <ToastProvider>
            <SettingsProvider>
                <UploaderFavoritesProvider>
                     <FavoritesProvider>
                        <SearchProvider>
                            <AppContent />
                        </SearchProvider>
                    </FavoritesProvider>
                </UploaderFavoritesProvider>
            </SettingsProvider>
        </ToastProvider>
      </ThemeProvider>
    </LanguageProvider>
);

export default App;