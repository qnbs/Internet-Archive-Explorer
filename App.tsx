import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { AppearanceManager } from './components/AppearanceManager';
import AudioPlayer from './components/audiothek/AudioPlayer';
import { BottomNav } from './components/BottomNav';
import { DownloadManager } from './components/DownloadManager';
import ErrorBoundary from './components/ErrorBoundary';
import { Header } from './components/Header';
import InstallBanner from './components/InstallBanner';
import { ModalManager } from './components/ModalManager';
// Layout Components
import { SideMenu } from './components/SideMenu';
import { Spinner } from './components/Spinner';
import { ToastContainer } from './components/Toast';
import UpdateNotification from './components/UpdateNotification';
// Providers & Contexts
import { ToastProvider, useToast } from './contexts/ToastContext';
// Hooks
import { useNavigation } from './hooks/useNavigation';
import {
  activeViewAtom,
  defaultSettings,
  deferredPromptAtom,
  isAppInstalledAtom,
  modalAtom,
  playlistAtom,
  profileReturnViewAtom,
  selectedProfileAtom,
  toastAtom,
  waitingWorkerAtom,
} from './store';
import type { BeforeInstallPromptEvent } from './store/pwa';
import type { AppSettings, ConfirmationOptions, View } from './types';

const ForYouView = lazy(() => import('./pages/ForYouView'));
const ExplorerView = lazy(() => import('./pages/ExplorerView'));
const LibraryView = lazy(() => import('./pages/LibraryView'));
const ScriptoriumView = lazy(() => import('./pages/ScriptoriumView'));
const RecRoomView = lazy(() => import('./pages/RecRoomView'));
const VideothekView = lazy(() => import('./pages/VideothekView'));
const AudiothekView = lazy(() => import('./pages/AudiothekView'));
const ImagesHubView = lazy(() => import('./pages/ImagesHubView'));
const UploaderHubView = lazy(() => import('./pages/UploaderHubView'));
const UploaderDetailView = lazy(() => import('./pages/UploaderDetailView'));
const SettingsView = lazy(() => import('./pages/SettingsView'));
const HelpView = lazy(() => import('./pages/HelpView'));
const StorytellerView = lazy(() => import('./pages/StorytellerView'));
const MyArchiveView = lazy(() => import('./pages/MyArchiveView'));
const AIArchiveView = lazy(() => import('./pages/AIArchiveView'));
const WebArchiveView = lazy(() => import('./pages/WebArchiveView'));

const PageSpinner: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div
      className="flex justify-center items-center h-full pt-20"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{t('common:loading')}</span>
      <Spinner size="lg" />
    </div>
  );
};

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
  }, [setIsAppInstalled, setActiveView]);

  // Effect for PWA installation management
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsAppInstalled(false);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsAppInstalled(true);
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

    window.addEventListener('swUpdateReady', handleUpdateReady as EventListener);

    return () => {
      window.removeEventListener('swUpdateReady', handleUpdateReady as EventListener);
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

  const showConfirmation = useCallback(
    (options: ConfirmationOptions) => {
      setModal({ type: 'confirmation', options });
    },
    [setModal],
  );

  const renderView = () => {
    switch (activeView) {
      case 'explore':
        return <ExplorerView />;
      case 'forYou':
        return <ForYouView />;
      case 'library':
        return <LibraryView />;
      case 'scriptorium':
        return <ScriptoriumView showConfirmation={showConfirmation} />;
      case 'recroom':
        return <RecRoomView />;
      case 'movies':
        return <VideothekView />;
      case 'audio':
        return <AudiothekView />;
      case 'image':
        return <ImagesHubView />;
      case 'uploaderHub':
        return <UploaderHubView />;
      case 'uploaderDetail':
        if (!selectedProfile) return <ExplorerView />;
        return (
          <UploaderDetailView
            profile={selectedProfile}
            onBack={goBackFromProfile}
            returnView={profileReturnView}
          />
        );
      case 'settings':
        return <SettingsView showConfirmation={showConfirmation} />;
      case 'help':
        return <HelpView />;
      case 'storyteller':
        return <StorytellerView />;
      case 'myArchive':
        return <MyArchiveView />;
      case 'aiArchive':
        return <AIArchiveView />;
      case 'webArchive':
        return <WebArchiveView />;
      default:
        return <ExplorerView />;
    }
  };

  return (
    <div className="md:pl-64">
      {/* Skip-link for keyboard / screen-reader users (WCAG 2.2 AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-accent-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <AppearanceManager />
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        activeView={activeView}
        setActiveView={navigateTo}
      />
      <Header
        onMenuClick={() => setIsSideMenuOpen(true)}
        onOpenCommandPalette={openCommandPalette}
      />

      <main id="main-content" className={`p-4 sm:p-6 pt-20 ${mainContentPadding}`}>
        <ErrorBoundary>
          <Suspense fallback={<PageSpinner />}>{renderView()}</Suspense>
        </ErrorBoundary>
      </main>

      <Suspense fallback={null}>
        <InstallBanner deferredPrompt={deferredPrompt} isAppInstalled={isAppInstalled} />
        <UpdateNotification waitingWorker={waitingWorker} onUpdate={handleUpdate} />
        {playlist.length > 0 && <AudioPlayer />}
      </Suspense>
      <DownloadManager />
      <BottomNav activeView={activeView} setActiveView={navigateTo} />
      <ModalManager />
    </div>
  );
};

const App = () => (
  <ToastProvider>
    <ToastContainer />
    <ToastBridge />
    <AppContent />
  </ToastProvider>
);

export default App;
