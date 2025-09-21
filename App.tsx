import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { 
    activeViewAtom, 
    modalAtom,
} from './store/app';
import {
    selectedProfileAtom,
    profileReturnViewAtom,
    toastAtom,
} from './store/atoms';
import { 
    defaultSettings,
} from './store/settings';
import type { View, Profile, ConfirmationOptions, AppSettings } from './types';

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
import { AppearanceManager } from './components/AppearanceManager';


// Hooks
import { useNavigation } from './hooks/useNavigation';

// View/Page Components (Lazy Loaded)
const ExplorerView = React.lazy(() => import('./pages/ExplorerView'));
const LibraryView = React.lazy(() => import('./pages/LibraryView'));
const ScriptoriumView = React.lazy(() => import('./pages/ScriptoriumView'));
const RecRoomView = React.lazy(() => import('./pages/RecRoomView'));
const VideothekView = React.lazy(() => import('./pages/VideothekView'));
const AudiothekView = React.lazy(() => import('./pages/AudiothekView'));
const ImagesHubView = React.lazy(() => import('./pages/ImagesHubView'));
const UploaderHubView = React.lazy(() => import('./pages/UploaderHubView'));
const UploaderDetailView = React.lazy(() => import('./pages/UploaderDetailView'));
const SettingsView = React.lazy(() => import('./pages/SettingsView'));
const HelpView = React.lazy(() => import('./pages/HelpView'));
const StorytellerView = React.lazy(() => import('./pages/StorytellerView'));
const MyArchiveView = React.lazy(() => import('./pages/MyArchiveView'));
const AIArchiveView = React.lazy(() => import('./pages/AIArchiveView'));
const WebArchiveView = React.lazy(() => import('./pages/WebArchiveView'));

const PageSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full pt-20">
        <Spinner size="lg" />
    </div>
);

// This component bridges the Jotai toastAtom to the ToastContext
const ToastBridge: React.FC = () => {
    const { addToast } = useToast();
    const [toast, setToast] = useAtom(toastAtom); 
    
    useEffect(() => {
        // The atom's value is an object or null. We act when it's an object.
        if (toast) {
            addToast(toast.message, toast.type);
            // Reset the atom to prevent the toast from re-appearing on re-renders.
            setToast(null);
        }
    }, [toast, addToast, setToast]);

    return null;
};

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const setModal = useSetAtom(modalAtom);
  const selectedProfile = useAtomValue(selectedProfileAtom);
  const profileReturnView = useAtomValue(profileReturnViewAtom);
  
  const { navigateTo, goBackFromProfile } = useNavigation();
  
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  useEffect(() => {
    const storedSettings = localStorage.getItem('app-settings-v2');
    let initialView: View;
    if (!storedSettings) {
        initialView = defaultSettings.defaultView;
    } else {
        const settings: Partial<AppSettings> = JSON.parse(storedSettings);
        initialView = settings.defaultView || defaultSettings.defaultView;
    }
    setActiveView(initialView);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCommandPalette = useCallback(() => setModal({ type: 'commandPalette' }), [setModal]);

  const showConfirmation = useCallback((options: ConfirmationOptions) => {
    setModal({ type: 'confirmation', options });
  }, [setModal]);
  
  const renderView = () => {
    switch (activeView) {
      case 'explore': return <ExplorerView />;
      case 'library': return <LibraryView />;
      case 'scriptorium': return <ScriptoriumView showConfirmation={showConfirmation} />;
      case 'recroom': return <RecRoomView />;
      case 'movies': return <VideothekView />;
      case 'audio': return <AudiothekView />;
      case 'image': return <ImagesHubView />;
      case 'uploaderHub': return <UploaderHubView />;
      case 'uploaderDetail':
        if (!selectedProfile) return <ExplorerView />;
        return <UploaderDetailView profile={selectedProfile} onBack={goBackFromProfile} returnView={profileReturnView} />;
      case 'settings': return <SettingsView showConfirmation={showConfirmation}/>;
      case 'help': return <HelpView />;
      case 'storyteller': return <StorytellerView />;
      case 'myArchive': return <MyArchiveView />;
      case 'aiArchive': return <AIArchiveView />;
      case 'webArchive': return <WebArchiveView />;
      default:
        return <ExplorerView />;
    }
  };

  return (
    <div className="md:pl-64">
      <AppearanceManager />
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        activeView={activeView}
        setActiveView={navigateTo}
      />
      <Header onMenuClick={() => setIsSideMenuOpen(true)} onOpenCommandPalette={openCommandPalette} />
      
      <main className="p-4 sm:p-6 pb-20 md:pb-6 pt-18 h-screen overflow-y-auto">
         <ErrorBoundary>
            <Suspense fallback={<PageSpinner />}>
                {renderView()}
            </Suspense>
         </ErrorBoundary>
      </main>

      <BottomNav activeView={activeView} setActiveView={navigateTo} />
      <ModalManager />
    </div>
  );
}

const App: React.FC = () => (
  <ToastProvider>
    <ToastContainer />
    <ToastBridge />
    <AppContent />
  </ToastProvider>
);

export default App;
