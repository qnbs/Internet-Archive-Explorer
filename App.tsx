import React, { useState, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { 
    activeViewAtom, 
    resolvedThemeAtom, 
    selectedProfileAtom, 
    modalAtom, 
    profileReturnViewAtom,
    reduceMotionAtom
} from './store';
import type { View } from './types';

// Providers & Contexts
import { ToastProvider } from './contexts/ToastContext';

// Layout Components
import { SideMenu } from './components/SideMenu';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';

// View/Page Components
import { ExplorerView } from './pages/ExplorerView';
import { CategoryView } from './pages/CategoryView';
import { WebArchiveView } from './pages/WebArchiveView';
import { FavoritesView } from './pages/FavoritesView';
import { ScriptoriumView } from './pages/ScriptoriumView';
import { RecRoomView } from './pages/RecRoomView';
import { VideothekView } from './pages/CinemathequeView';
import { AudiothekView } from './pages/AudiothekView';
import { ImagesHubView } from './pages/ImagesHubView';
import { UploaderHubView } from './pages/UploaderHubView';
import { UploaderDetailView } from './pages/UploaderDetailView';
import { SettingsView } from './pages/SettingsView';
import { HelpView } from './pages/HelpView';
import { StorytellerView } from './pages/StorytellerView';
import { categoryContent } from './pages/categoryContent';
import { ModalManager } from './components/ModalManager';


// Hooks
import { useNavigation } from './hooks/useNavigation';
import { useLanguage } from './hooks/useLanguage';

// Main App component logic
const MainApp: React.FC = () => {
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const selectedProfile = useAtomValue(selectedProfileAtom);
  const resolvedTheme = useAtomValue(resolvedThemeAtom);
  const reduceMotion = useAtomValue(reduceMotionAtom);
  const setModal = useSetAtom(modalAtom);
  const profileReturnView = useAtomValue(profileReturnViewAtom);
  const { isLoading: isLoadingTranslations } = useLanguage();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navigation = useNavigation();

  // Apply theme and motion reduction classes to the document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [resolvedTheme, reduceMotion]);
  
  // Keyboard shortcuts
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
              e.preventDefault();
              setModal({ type: 'commandPalette' });
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setModal]);

  const renderActiveView = () => {
    // Prevent rendering views that rely on translations before they are loaded
    if (isLoadingTranslations) return null;

    switch (activeView) {
      case 'explore': return <ExplorerView onSelectItem={(item) => setModal({ type: 'itemDetail', item })} />;
      case 'favorites': return <FavoritesView />;
      case 'scriptorium': return <ScriptoriumView showConfirmation={(options) => setModal({ type: 'confirmation', options })} />;
      case 'movies': return <VideothekView onSelectItem={(item) => setModal({ type: 'itemDetail', item })} />;
      case 'audio': return <AudiothekView onSelectItem={(item) => setModal({ type: 'itemDetail', item })} />;
      case 'image': return <ImagesHubView />;
      case 'recroom': return <RecRoomView onSelectItem={(item) => setModal({ type: 'emulator', item })} />;
      case 'web': return <WebArchiveView />;
      case 'uploaderHub': return <UploaderHubView onSelectUploader={navigation.navigateToUploaderFromHub} />;
      case 'uploaderDetail':
        return selectedProfile ? <UploaderDetailView profile={selectedProfile} onBack={navigation.goBackFromProfile} onSelectItem={(item) => setModal({ type: 'itemDetail', item })} returnView={profileReturnView} /> : <ExplorerView onSelectItem={(item) => setModal({ type: 'itemDetail', item })} />;
      case 'settings': return <SettingsView showConfirmation={(options) => setModal({ type: 'confirmation', options })} />;
      case 'help': return <HelpView />;
      case 'storyteller': return <StorytellerView />;
      default:
        if (categoryContent[activeView as keyof typeof categoryContent]) {
            const content = categoryContent[activeView as keyof typeof categoryContent];
            return <CategoryView onSelectItem={(item) => setModal({ type: 'itemDetail', item })} {...content} />
        }
        return <ExplorerView onSelectItem={(item) => setModal({ type: 'itemDetail', item })} />;
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans transition-colors">
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Header onMenuClick={() => setIsMenuOpen(true)} onOpenCommandPalette={() => setModal({ type: 'commandPalette' })} />
        <main className="flex-grow container mx-auto p-4 sm:p-6 mt-16 mb-16 md:mb-0">
          {renderActiveView()}
        </main>
        <BottomNav activeView={activeView} setActiveView={setActiveView} />
      </div>
      
      <ModalManager />
    </div>
  );
};

// App wrapper with providers, to be used in index.tsx
const App: React.FC = () => (
  <ErrorBoundary>
      <ToastProvider>
        <MainApp />
        <ToastContainer />
      </ToastProvider>
  </ErrorBoundary>
);

export default App;
