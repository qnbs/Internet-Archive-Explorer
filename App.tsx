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
    resolvedThemeAtom, 
    disableAnimationsAtom,
    highContrastModeAtom,
    underlineLinksAtom,
    fontSizeAtom,
    scrollbarColorAtom,
    accentColorAtom,
    defaultViewAtom,
    defaultSettings,
} from './store/settings';
import type { View, Profile, ArchiveItemSummary, AccentColor, SelectItemHandler, ConfirmationOptions, MediaType } from './types';

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

const ACCENT_COLORS: Record<AccentColor, Record<string, string>> = {
  cyan: {
    '50': '#ecfeff', '100': '#cffafe', '200': '#a5f3fd', '300': '#67e8f9', '400': '#22d3ee',
    '500': '#06b6d4', '600': '#0891b2', '700': '#0e7490', '800': '#155e75', '900': '#164e63', '950': '#083344',
  },
  emerald: {
    '50': '#ecfdf5', '100': '#d1fae5', '200': '#a7f3d0', '300': '#6ee7b7', '400': '#34d399',
    '500': '#10b981', '600': '#059669', '700': '#047857', '800': '#065f46', '900': '#064e3b', '950': '#022c22',
  },
  rose: {
    '50': '#fff1f2', '100': '#ffe4e6', '200': '#fecdd3', '300': '#fda4af', '400': '#fb7185',
    '500': '#f43f5e', '600': '#e11d48', '700': '#be123c', '800': '#9f1239', '900': '#881337', '950': '#4c0519',
  },
  violet: {
    '50': '#f5f3ff', '100': '#ede9fe', '200': '#ddd6fe', '300': '#c4b5fd', '400': '#a78bfa',
    '500': '#8b5cf6', '600': '#7c3aed', '700': '#6d28d9', '800': '#5b21b6', '900': '#4c1d95', '950': '#2e1065',
  },
};

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const setModal = useSetAtom(modalAtom);
  const selectedProfile = useAtomValue(selectedProfileAtom);
  const profileReturnView = useAtomValue(profileReturnViewAtom);

  const defaultView = useAtomValue(defaultViewAtom);
  const resolvedTheme = useAtomValue(resolvedThemeAtom);
  const disableAnimations = useAtomValue(disableAnimationsAtom);
  const highContrastMode = useAtomValue(highContrastModeAtom);
  const underlineLinks = useAtomValue(underlineLinksAtom);
  const fontSize = useAtomValue(fontSizeAtom);
  const scrollbarColor = useAtomValue(scrollbarColorAtom);
  const accentColor = useAtomValue(accentColorAtom);
  
  const { navigateTo, goBackFromProfile } = useNavigation();
  
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  useEffect(() => {
    const storedSettings = localStorage.getItem('app-settings-v2');
    let initialView: View;
    if (!storedSettings) {
        initialView = defaultSettings.defaultView;
    } else {
        const settings = JSON.parse(storedSettings);
        initialView = settings.defaultView || defaultSettings.defaultView;
    }
    setActiveView(initialView);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.className = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    const root = document.documentElement;
    const colors = ACCENT_COLORS[accentColor];
    for (const [shade, color] of Object.entries(colors)) {
      root.style.setProperty(`--color-accent-${shade}`, color);
    }

    if (disableAnimations) root.classList.add('no-animations'); else root.classList.remove('no-animations');
    if (highContrastMode) document.body.classList.add('high-contrast'); else document.body.classList.remove('high-contrast');
    if (underlineLinks) document.body.classList.add('underline-links'); else document.body.classList.remove('underline-links');
    
    document.body.style.fontSize = { sm: '14px', base: '16px', lg: '18px' }[fontSize];

    const styleId = 'custom-scrollbar-style';
    let style = document.getElementById(styleId) as HTMLStyleElement;
    if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
    }
    style.innerHTML = `::-webkit-scrollbar-thumb { background-color: ${scrollbarColor} !important; }`;
  }, [accentColor, disableAnimations, highContrastMode, underlineLinks, fontSize, scrollbarColor]);

  const openCommandPalette = useCallback(() => setModal({ type: 'commandPalette' }), [setModal]);

  const handleSelectItem = useCallback<SelectItemHandler>((item) => {
    if(item.mediatype === 'image') {
        setModal({ type: 'imageDetail', item });
    } else {
        setModal({ type: 'itemDetail', item });
    }
  }, [setModal]);

  const showConfirmation = useCallback((options: ConfirmationOptions) => {
    setModal({ type: 'confirmation', options });
  }, [setModal]);

  const renderView = () => {
    switch (activeView) {
      case 'explore': return <ExplorerView onSelectItem={handleSelectItem} />;
      case 'library': return <LibraryView />;
      case 'scriptorium': return <ScriptoriumView showConfirmation={showConfirmation} />;
      case 'recroom': return <RecRoomView onSelectItem={(item) => setModal({ type: 'emulator', item })} />;
      case 'movies': return <VideothekView onSelectItem={handleSelectItem} />;
      case 'audio': return <AudiothekView onSelectItem={handleSelectItem} />;
      case 'image': return <ImagesHubView onSelectItem={handleSelectItem} />;
      case 'uploaderHub': return <UploaderHubView />;
      case 'uploaderDetail':
        if (!selectedProfile) return <ExplorerView onSelectItem={handleSelectItem} />;
        return <UploaderDetailView profile={selectedProfile} onBack={goBackFromProfile} onSelectItem={handleSelectItem} returnView={profileReturnView} />;
      case 'settings': return <SettingsView showConfirmation={showConfirmation}/>;
      case 'help': return <HelpView />;
      case 'storyteller': return <StorytellerView />;
      case 'myArchive': return <MyArchiveView onSelectItem={handleSelectItem} />;
      case 'aiArchive': return <AIArchiveView />;
      case 'webArchive': return <WebArchiveView />;
      default:
        return <ExplorerView onSelectItem={handleSelectItem} />;
    }
  };

  return (
    <div className="md:pl-64">
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        activeView={activeView}
        setActiveView={navigateTo}
      />
      <Header onMenuClick={() => setIsSideMenuOpen(true)} onOpenCommandPalette={openCommandPalette} />
      
      <main className="p-4 sm:p-6 pb-20 md:pb-6 pt-20 h-screen overflow-y-auto">
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
