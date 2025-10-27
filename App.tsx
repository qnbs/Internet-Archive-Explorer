import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { 
    activeViewAtom, 
    modalAtom,
    defaultSettings,
    deferredPromptAtom,
    isAppInstalledAtom,
    toastAtom,
    selectedProfileAtom,
    profileReturnViewAtom,
    waitingWorkerAtom,
    playlistAtom,
} from './store';
import type { View, Profile, ConfirmationOptions, AppSettings } from './types';
import type { BeforeInstallPromptEvent } from './store/pwa';


// Providers & Contexts
import { ToastProvider, useToast } from './contexts/ToastContext';
import { useLanguage } from './hooks/useLanguage';

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
const UpdateNotification = React.lazy(() => import('./components/UpdateNotification'));
const AudioPlayer = React.lazy(() => import('./components/audiothek/AudioPlayer'));
const InstallBanner = React.lazy(() => import('./components/InstallBanner'));


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
        if (toast) {
            addToast(toast.message, toast.type);
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
  const [deferredPrompt, setDeferredPrompt] = useAtom(deferredPromptAtom);
  const [isAppInstalled, setIsAppInstalled] = useAtom(isAppInstalledAtom);
  const [waitingWorker, setWaitingWorker] = useAtom(waitingWorkerAtom);
  const [playlist] = useAtom(playlistAtom);
  
  const { navigateTo, goBackFromProfile } = useNavigation();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  
  // Dynamically adjust main content padding to account for the persistent audio player
  const mainContentPadding = playlist.length > 0 ? 'pb-44 md:pb-20' : 'pb-24 md:pb-6';

  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.style.transition = 'opacity 0.5s ease';
      loader.style.opacity = '0';
      loader.addEventListener('transitionend', () => loader.remove());
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewFromUrl = urlParams.get('view') as View;
    
    if (viewFromUrl) {
      // Special handling for Web Share Target API
      if (viewFromUrl === 'webArchive' && urlParams.has('url')) {
        const sharedUrl = urlParams.get('url');
        if (sharedUrl) {
          sessionStorage.setItem('sharedUrl', sharedUrl);
        }
      }
      setActiveView(viewFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const storedSettings = localStorage.getItem('app-settings-v2');
      let initialView: View;
      if (!storedSettings) {
          initialView = defaultSettings.defaultView;
      } else {
          const settings: Partial<AppSettings> = JSON.parse(storedSettings);
          initialView = settings.defaultView || defaultSettings.defaultView;
      }
      setActiveView(initialView);
    }
    
    // Check initial PWA installation state
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsAppInstalled(isStandalone);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect for PWA installation management
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsAppInstalled(false);
        console.log(`'beforeinstallprompt' event was fired and captured.`);
    };
    
    const handleAppInstalled = () => {
        setDeferredPrompt(null);
        setIsAppInstalled(true);
        console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setDeferredPrompt, setIsAppInstalled]);
  
  // Effect for PWA update management
  useEffect(() => {
      const handleUpdateReady = () => {
          if (window.waitingServiceWorker) {
              setWaitingWorker(window.waitingServiceWorker);
          }
      };

      document.addEventListener('swUpdateReady', handleUpdateReady);

      return () => {
          document.removeEventListener('swUpdateReady', handleUpdateReady);
      };
  }, [setWaitingWorker]);

  const handleUpdate = () => {
      if (waitingWorker) {
          waitingWorker.postMessage({ type: 'SKIP_WAITING' });
          // The 'controllerchange' listener in index.html will handle the reload
          setWaitingWorker(null);
      }
  };

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
      
      <main className={`p-4 sm:p-6 pt-20 ${mainContentPadding}`}>
         <ErrorBoundary>
            <Suspense fallback={<PageSpinner />}>
                {renderView()}
            </Suspense>
         </ErrorBoundary>
      </main>

      <Suspense fallback={null}>
          <InstallBanner deferredPrompt={deferredPrompt} isAppInstalled={isAppInstalled} />
          <UpdateNotification waitingWorker={waitingWorker} onUpdate={handleUpdate} />
          {playlist.length > 0 && <AudioPlayer />}
      </Suspense>
      <BottomNav activeView={activeView} setActiveView={navigateTo} />
      <ModalManager />
    </div>
  );
}

const App = () => (
  <ToastProvider>
    <ToastContainer />
    <ToastBridge />
    <AppContent />
  </ToastProvider>
);

export default App;