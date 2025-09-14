import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AIGenerationType, type ArchiveItemSummary, type ImageAnalysisResult, MediaType } from '../../types';
import { Spinner } from './Spinner';
import { StarIcon, CloseIcon, ZoomInIcon, ZoomOutIcon, RotateClockwiseIcon, RotateCounterClockwiseIcon, RefreshIcon, ExpandIcon, DownloadIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';
import { useAtomValue, useSetAtom } from 'jotai';
import { libraryItemIdentifiersAtom, addLibraryItemAtom, removeLibraryItemAtom } from '../store/favorites';
import { autoArchiveAIAtom, enableAiFeaturesAtom } from '../store/settings';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../hooks/useLanguage';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';
import { useItemMetadata } from '../hooks/useItemMetadata';
import { useImageViewer } from '../hooks/useImageViewer';
import { findBestImageUrl, urlToBase64 } from '../utils/imageUtils';
import { analyzeImage, askAboutImage } from '../services/geminiService';
import { ItemDetailSidebar } from './ItemDetailSidebar';
import { findArchivedItemAnalysis, archiveAIGeneration } from '../services/aiPersistenceService';
import { aiArchiveAtom, addAIArchiveEntryAtom } from '../store/aiArchive';
import { AILoadingIndicator } from './AILoadingIndicator';
import { useSearchAndGo } from '../hooks/useSearchAndGo';


// --- Sub-components moved inside to manage complex state ---

const ViewerToolbar: React.FC<{
    viewer: ReturnType<typeof useImageViewer>;
    onDownload: () => void;
    onFullscreen: () => void;
}> = ({ viewer, onDownload, onFullscreen }) => {
    const { t } = useLanguage();
    const controls = [
        { label: t('common:imageViewer.zoomIn'), action: viewer.zoomIn, icon: <ZoomInIcon /> },
        { label: t('common:imageViewer.zoomOut'), action: viewer.zoomOut, icon: <ZoomOutIcon /> },
        { label: t('common:imageViewer.rotateRight'), action: viewer.rotateCW, icon: <RotateClockwiseIcon /> },
        { label: t('common:imageViewer.rotateLeft'), action: viewer.rotateCCW, icon: <RotateCounterClockwiseIcon /> },
        { label: t('common:imageViewer.resetView'), action: viewer.reset, icon: <RefreshIcon /> },
        { label: t('common:imageViewer.fullscreen'), action: onFullscreen, icon: <ExpandIcon /> },
        { label: t('common:imageViewer.download'), action: onDownload, icon: <DownloadIcon className="w-5 h-5"/> },
    ];
    
    return (
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm p-2 rounded-xl flex items-center space-x-1 border border-white/20 shadow-lg z-30">
            {controls.map(({ label, action, icon }) => (
                <button
                    key={label}
                    onClick={action}
                    title={label}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                    {icon}
                </button>
            ))}
        </div>
    );
};

const TagButton: React.FC<{ tag: string; onCloseModal: () => void }> = ({ tag, onCloseModal }) => {
    const searchAndGo = useSearchAndGo();
    const handleTagClick = () => {
        onCloseModal();
        setTimeout(() => searchAndGo(tag, { mediaType: new Set([MediaType.Image]) }), 300);
    };
    return (
        <button
            onClick={handleTagClick}
            className="bg-gray-700 hover:bg-cyan-600 text-gray-200 hover:text-white text-xs font-medium px-2 py-1 rounded-full transition-colors"
        >
            {tag}
        </button>
    );
};

interface Conversation {
  q: string;
  a: string;
}
interface AnalysisPanelProps {
  initialAnalysis: ImageAnalysisResult | null;
  isInitiallyAnalyzing: boolean;
  onAskFollowUp: (question: string) => Promise<string | null>;
  onCloseModal: () => void;
}
const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ initialAnalysis, isInitiallyAnalyzing, onAskFollowUp, onCloseModal }) => {
    const { t } = useLanguage();
    const [question, setQuestion] = useState('');
    const [conversation, setConversation] = useState<Conversation[]>([]);
    const [isAnswering, setIsAnswering] = useState(false);

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;
        setIsAnswering(true);
        const answer = await onAskFollowUp(question);
        
        setConversation(prev => [...prev, {
            q: question,
            a: answer || t('aiTools:summaryErrorApi')
        }]);

        setQuestion('');
        setIsAnswering(false);
    };
    
    return (
      <div className="space-y-4">
        {isInitiallyAnalyzing ? <AILoadingIndicator type="summary" /> :
         initialAnalysis && (
             <div className="space-y-3 text-sm animate-fade-in">
                <p className="italic text-gray-300">"{initialAnalysis.description}"</p>
                {initialAnalysis.tags.length > 0 && (
                     <div className="flex flex-wrap gap-2">
                        {initialAnalysis.tags.map((tag) => <TagButton key={tag} tag={tag} onCloseModal={onCloseModal} />)}
                    </div>
                )}
             </div>
         )
        }
        <div className="space-y-3">
          {conversation.map((turn, i) => (
            <div key={i} className="space-y-1 text-sm animate-fade-in">
              <p className="font-semibold text-gray-400">Q: {turn.q}</p>
              <p className="text-gray-200">A: {turn.a}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleAsk} className="flex gap-2 items-center">
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder={t('aiTools:image.askPlaceholder')}
            className="flex-grow bg-gray-700 border-2 border-gray-600 rounded-lg py-1.5 px-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={isAnswering}
          />
          <button type="submit" disabled={isAnswering || !question.trim()} className="p-2 bg-cyan-600 rounded-lg text-white disabled:bg-gray-500">
            {isAnswering ? <Spinner size="sm"/> : <SparklesIcon className="w-4 h-4" />}
          </button>
        </form>
      </div>
    );
};

// --- Main Modal Component ---

interface ImageDetailModalProps {
  item: ArchiveItemSummary;
  onClose: () => void;
  onCreatorSelect: (creator: string) => void;
  onUploaderSelect: (uploader: string) => void;
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ item, onClose, onCreatorSelect, onUploaderSelect }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  const { t, language } = useLanguage();
  
  const enableAiFeatures = useAtomValue(enableAiFeaturesAtom);
  const autoArchive = useAtomValue(autoArchiveAIAtom);
  const libraryItemIdentifiers = useAtomValue(libraryItemIdentifiersAtom);
  const addLibraryItem = useSetAtom(addLibraryItemAtom);
  const removeLibraryItem = useSetAtom(removeLibraryItemAtom);
  const aiArchive = useAtomValue(aiArchiveAtom);
  const addAIEntry = useSetAtom(addAIArchiveEntryAtom);

  const { metadata, isLoading, error } = useItemMetadata(item);
  const viewer = useImageViewer();

  const [imageUrl, setImageUrl] = useState<string | null>(`https://archive.org/services/get-item-image.php?identifier=${item.identifier}`);
  const [imageError, setImageError] = useState<string | null>(null);

  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [hasCheckedCache, setHasCheckedCache] = useState(false);
  
  const isFavorite = libraryItemIdentifiers.has(item.identifier);
  
  useModalFocusTrap({ modalRef, isOpen: isMounted && !isClosing, onClose });

  useEffect(() => { setIsMounted(true); }, []);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isMounted || isClosing) return;
        switch(e.key) {
            case '+': case '=': viewer.zoomIn(); break;
            case '-': viewer.zoomOut(); break;
            case 'r': e.shiftKey ? viewer.rotateCCW() : viewer.rotateCW(); break;
            case '0': viewer.reset(); break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMounted, isClosing, viewer]);

  useEffect(() => {
      if (metadata?.files) {
          const bestUrl = findBestImageUrl(metadata.files, item.identifier);
          if (bestUrl) setImageUrl(bestUrl);
      }
  }, [metadata, item.identifier]);
  
  useEffect(() => {
    if (!metadata || !enableAiFeatures || hasCheckedCache) return;

    const archivedAnalysis = findArchivedItemAnalysis<ImageAnalysisResult>(item.identifier, AIGenerationType.ImageAnalysis, aiArchive);
    if (archivedAnalysis) {
        setAnalysisResult(archivedAnalysis);
        setIsAiPanelOpen(true);
    }
    setHasCheckedCache(true);
  }, [metadata, item.identifier, aiArchive, enableAiFeatures, hasCheckedCache]);


  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleFavoriteClick = () => {
    if (isFavorite) {
      removeLibraryItem(item.identifier);
      addToast(t('favorites:removed'), 'info');
    } else {
      addLibraryItem(item);
      addToast(t('favorites:added'), 'success');
    }
  };

  const handleFullscreen = () => imageContainerRef.current?.requestFullscreen().catch(err => console.error(err));
  const handleDownload = () => imageUrl && window.open(imageUrl, '_blank');
  
  const handleAnalyze = async () => {
    if (!imageUrl || isAnalyzing || analysisResult) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const { base64, mimeType } = await urlToBase64(imageUrl);
      const result = await analyzeImage(base64, mimeType, language);
      setAnalysisResult(result);
      archiveAIGeneration({
          type: AIGenerationType.ImageAnalysis,
          content: result, language,
          // Fix: Corrected typo from mediaType to mediatype.
          source: { ...item, mediatype: item.mediatype },
      }, addAIEntry, autoArchive);
    } catch(err) {
      addToast(err instanceof Error ? err.message : 'Failed to analyze image.', 'error');
      setIsAiPanelOpen(false); // Close panel on error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskFollowUp = async (question: string): Promise<string | null> => {
    if (!imageUrl) return null;
    try {
        const { base64, mimeType } = await urlToBase64(imageUrl);
        const answer = await askAboutImage(base64, mimeType, question, language);
        
        archiveAIGeneration({
            type: AIGenerationType.Answer,
            content: answer,
            language,
            prompt: question,
            // Fix: Corrected typo from mediaType to mediatype.
            source: { ...item, mediatype: item.mediatype }
        }, addAIEntry, autoArchive);
        
        return answer;
    } catch(err) {
        console.error("Follow-up question failed:", err);
        return null;
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isMounted && !isClosing ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden transition-all duration-300 ${isMounted && !isClosing ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          ref={imageContainerRef}
          className="flex-grow bg-gray-900 overflow-hidden cursor-grab active:cursor-grabbing relative"
          onMouseDown={viewer.handleMouseDown} onMouseMove={viewer.handleMouseMove} onMouseUp={viewer.handleMouseUp} onMouseLeave={viewer.handleMouseUp} onWheel={viewer.handleWheel}
        >
            {imageUrl && !imageError ? (
                <img src={imageUrl} alt={item.title} onError={() => setImageError(t('common:imageViewer.loadingError'))}
                    className="absolute top-0 left-0 transition-transform duration-200"
                    style={{
                        width: '100%', height: '100%', objectFit: 'contain',
                        transform: `translate(${viewer.offset.x}px, ${viewer.offset.y}px) scale(${viewer.zoom}) rotate(${viewer.rotation}deg)`,
                        cursor: 'inherit'
                    }}/>
            ) : (<div className="w-full h-full flex items-center justify-center text-red-400">{imageError}</div>)}
             <ViewerToolbar viewer={viewer} onDownload={handleDownload} onFullscreen={handleFullscreen} />
        </div>

        <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-gray-800/50 flex flex-col">
             <header className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3 min-w-0">
                    <button onClick={handleFavoriteClick} className="text-gray-400 hover:text-yellow-400" aria-label={isFavorite ? t('itemCard:removeFavorite') : t('itemCard:addFavorite')}><StarIcon filled={isFavorite} className="w-6 h-6" /></button>
                    <h2 id="modal-title" className="text-lg font-bold text-white truncate">{item.title}</h2>
                </div>
                <button onClick={handleClose} className="text-gray-400 hover:text-white" aria-label={t('common:close')}><CloseIcon /></button>
            </header>
             <div className="flex-grow overflow-y-auto p-4 space-y-4">
                 {isLoading && <div className="flex justify-center pt-10"><Spinner size="lg" /></div>}
                 {error && <div className="text-center text-red-400 p-4">{error}</div>}
                 {metadata && ( <>
                    <ItemDetailSidebar
                        item={item} metadata={metadata} onEmulate={() => {}} onCreatorSelect={onCreatorSelect} onUploaderSelect={onUploaderSelect}
                        playableMedia={null} mediaRef={{current: null}} isPlaying={false} handlePlayPause={() => {}}
                        mediaEventListeners={{ onPlay: ()=>{}, onPause: ()=>{}, onEnded: ()=>{} }}
                    />
                     {enableAiFeatures && (
                        <div className="border border-gray-700 rounded-lg">
                            <button onClick={() => {
                                if (!isAiPanelOpen && !analysisResult) {
                                    handleAnalyze();
                                }
                                setIsAiPanelOpen(o => !o);
                             }} className="w-full flex justify-between items-center p-3 text-left">
                                <h3 className="font-semibold text-cyan-400 flex items-center gap-2"><SparklesIcon/> {t('common:aiAnalysis')}</h3>
                                { isAiPanelOpen ? <ChevronUpIcon/> : <ChevronDownIcon/> }
                            </button>
                            {isAiPanelOpen && (
                                <div className="p-3 border-t border-gray-700">
                                    <AnalysisPanel 
                                        initialAnalysis={analysisResult} 
                                        isInitiallyAnalyzing={isAnalyzing} 
                                        onAskFollowUp={handleAskFollowUp}
                                        onCloseModal={handleClose}
                                    />
                                </div>
                            )}
                        </div>
                     )}
                 </>)}
            </div>
        </aside>
      </div>
    </div>
  );
};