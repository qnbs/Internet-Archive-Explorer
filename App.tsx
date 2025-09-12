import React, { useState, useEffect, Suspense } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { 
    activeViewAtom, 
    resolvedThemeAtom, 
    selectedProfileAtom, 
    modalAtom, 
    profileReturnViewAtom,
    reduceMotionAtom,
    highContrastModeAtom,
    underlineLinksAtom,
    fontSizeAtom,
    toastAtom
} from './store';
import type { View } from './types';

// Providers & Contexts
import { ToastProvider, useToast } from './contexts/ToastContext';

// Layout Components
import { SideMenu } from './components/SideMenu';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import { ModalManager } from './components/ModalManager';
import { Spinner } from './components/Spinner';


// Hooks
import { useNavigation } from './hooks/useNavigation';
import { useLanguage } from './hooks/useLanguage';

// View/Page Components (Lazy Loaded)
const ExplorerView = React.lazy(() => import('./pages/ExplorerView'));
const LibraryView = React.lazy(() => import('./pages/LibraryView'));
const ScriptoriumView = React.lazy(() => import('./pages/ScriptoriumView'));
const RecRoomView = React.lazy(() => import('./pages/RecRoomView'));
const VideothekView = React.lazy(() => import('./pages/VideothekView'));
const AudiothekView = React.lazy(() => import('./pages/AudiothekView'));
const ImagesHubView = React.lazy(() => import('./pages/ImagesHubView'));
const UploaderDetailView = React.lazy(() => import('./pages/UploaderDetailView'));
const SettingsView = React.lazy(() => import('./pages/SettingsView'));
const HelpView = React.lazy(() => import('./pages/HelpView'));
const StorytellerView = React.lazy(() => import('./pages/StorytellerView'));

const PageSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full pt-20">
        <Spinner size="lg" />
    </div>
);

// This component bridges the Jotai toastAtom to the ToastContext
const ToastBridge: React.FC = () => {
    const { addToast } = useToast();
    // FIX: Use `useAtom` to get both value and setter. This allows resetting the atom after consuming the toast.
    const [toast, setToast] = useAtom(toastAtom); 
    
    useEffect(() => {
        // The initial value of the atom is null, so we ignore it
        if (toast) {
            addToast(toast.message, toast.type);
            // FIX: Reset the atom to null so the toast doesn't re-appear on re-renders.
            setToast(null);
        }
    }, [toast, addToast, setToast]);

    return null;
};

// Main App component logic
const MainApp: React.FC = () => {
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const selectedProfile = useAtomValue(selectedProfileAtom);
  const resolvedTheme = useAtomValue(resolvedThemeAtom);
  const reduceMotion = useAtomValue(reduceMotionAtom);
  const highContrast = useAtomValue(highContrastModeAtom);
  const underlineLinks = useAtomValue(underlineLinksAtom);
  const fontSize = useAtomValue(fontSizeAtom);
  const setModal = useSetAtom(modalAtom);
  const profileReturnView = useAtomValue(profileReturnViewAtom);
  const { isLoading: isLoadingTranslations } = useLanguage();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navigation = useNavigation();

  // Apply theme and accessibility classes to the document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
    document.documentElement.classList.toggle('high-contrast', highContrast);
    document.documentElement.classList.toggle('underline-links', underlineLinks);
    
    document.documentElement.style.fontSize = 
      fontSize === 'sm' ? '14px' :
      fontSize === 'lg' ? '18px' :
      '16px'; // base
      
  }, [resolvedTheme, reduceMotion, highContrast, underlineLinks, fontSize]);
  
  // Ensure every view change scrolls the page to the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeView]);

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
      case 'library': return <LibraryView />;
      case 'scriptorium': return <ScriptoriumView showConfirmation={(options) => setModal({ type: 'confirmation', options })} />;
      case 'movies': return <VideothekView onSelectItem={(item) => setModal({ type: 'itemDetail', item })} />;
      case 'audio': return <AudiothekView onSelectItem={(item) => setModal({ type: 'itemDetail', item })} />;
      case 'image': return <ImagesHubView onSelectItem={(item) => setModal({ type: 'itemDetail', item })} />;
      case 'recroom': return <RecRoomView onSelectItem={(item) => setModal({ type: 'emulator', item })} />;
      case 'uploaderDetail':
        return selectedProfile ? <UploaderDetailView profile={selectedProfile} onBack={navigation.goBackFromProfile} onSelectItem={(item) => setModal({ type: 'itemDetail', item })} returnView={profileReturnView} /> : <ExplorerView onSelectItem={(item) => setModal({ type: 'itemDetail', item })} />;
      case 'settings': return <SettingsView showConfirmation={(options) => setModal({ type: 'confirmation', options })} />;
      case 'help': return <HelpView />;
      case 'storyteller': return <StorytellerView />;
      default:
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
          <Suspense fallback={<PageSpinner />}>
            {renderActiveView()}
          </Suspense>
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
        <ToastBridge />
        <MainApp />
        <ToastContainer />
      </ToastProvider>
  </ErrorBoundary>
);

export default App;