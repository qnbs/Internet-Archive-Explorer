

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
} from './store/settings';
import type { View, Profile, ArchiveItemSummary, AccentColor } from './types';

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

type SelectItemHandler = (item: ArchiveItemSummary) => void;

// Main App component logic
const MainApp: React.FC = () => {
  const defaultView = useAtomValue(defaultViewAtom);
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const selectedProfile = useAtomValue(selectedProfileAtom);
  const resolvedTheme = useAtomValue(resolvedThemeAtom);
  const disableAnimations = useAtomValue(disableAnimationsAtom);
  const highContrast = useAtomValue(highContrastModeAtom);
  const underlineLinks = useAtomValue(underlineLinksAtom);
  const fontSize = useAtomValue(fontSizeAtom);
  const scrollbarColor = useAtomValue(scrollbarColorAtom);
  const accentColor = useAtomValue(accentColorAtom);
  const setModal = useSetAtom(modalAtom);
  const profileReturnView = useAtomValue(profileReturnViewAtom);
  const { isLoading: isLoadingTranslations } = useLanguage();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navigation = useNavigation();

  // Set initial view from settings
  useEffect(() => {
    setActiveView(defaultView);
  }, [defaultView, setActiveView]);

  // Apply theme and accessibility classes to the document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.documentElement.classList.toggle('disable-animations', disableAnimations);
    document.documentElement.classList.toggle('high-contrast', highContrast);
    document.documentElement.classList.toggle('underline-links', underlineLinks);
    
    document.documentElement.style.fontSize = 
      fontSize === 'sm' ? '14px' :
      fontSize === 'lg' ? '18px' :
      '16px'; // base
      
    // Apply accent color
    const colors = ACCENT_COLORS[accentColor] || ACCENT_COLORS.cyan;
    for (const [shade, value] of Object.entries(colors)) {
        document.documentElement.style.setProperty(`--color-accent-${shade}`, value);
    }


    // Dynamic styles for scrollbar
    const styleId = 'dynamic-scrollbar-styles';
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
    }
    
    const trackColor = resolvedTheme === 'dark' ? '#2d3748' : '#f1f1f1'; // Corresponds to dark:bg-gray-800 and bg-gray-100
    
    styleElement.innerHTML = `
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: ${trackColor}; border-radius: 10px; }
      ::-webkit-scrollbar-thumb { background: ${scrollbarColor}; border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { filter: brightness(1.2); }
    `;
      
  }, [resolvedTheme, disableAnimations, highContrast, underlineLinks, fontSize, scrollbarColor, accentColor]);
  
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

  const handleSelectItem: SelectItemHandler = useCallback((item) => {
      setModal({ type: 'itemDetail', item });
  }, [setModal]);

  const renderActiveView = () => {
    // Prevent rendering views that rely on translations before they are loaded
    if (isLoadingTranslations) return null;

    switch (activeView) {
      case 'explore': return <ExplorerView onSelectItem={handleSelectItem} />;
      case 'library': return <LibraryView />;
      case 'myArchive': return <MyArchiveView onSelectItem={handleSelectItem} />;
      case 'scriptorium': return <ScriptoriumView showConfirmation={(options) => setModal({ type: 'confirmation', options })} />;
      case 'movies': return <VideothekView onSelectItem={handleSelectItem} />;
      case 'audio': return <AudiothekView onSelectItem={handleSelectItem} />;
      case 'image': return <ImagesHubView onSelectItem={(item) => setModal({ type: 'imageDetail', item })} />;
      case 'recroom': return <RecRoomView onSelectItem={(item) => setModal({ type: 'emulator', item })} />;
      case 'uploaderHub': return <UploaderHubView />;
      case 'uploaderDetail':
        return selectedProfile ? <UploaderDetailView profile={selectedProfile} onBack={navigation.goBackFromProfile} onSelectItem={handleSelectItem} returnView={profileReturnView} /> : <ExplorerView onSelectItem={handleSelectItem} />;
      case 'settings': return <SettingsView showConfirmation={(options) => setModal({ type: 'confirmation', options })} />;
      case 'help': return <HelpView />;
      case 'storyteller': return <StorytellerView />;
      case 'aiArchive': return <AIArchiveView />;
      default:
        return <ExplorerView onSelectItem={handleSelectItem} />;
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
      <ToastContainer />
      <ModalManager />
    </div>
  );
};


const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ToastBridge />
        <MainApp />
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
