import React, { useRef, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
    playlistAtom, currentTrackIndexAtom, removeFromPlaylistAtom, clearPlaylistAtom
} from '../../store/audioPlayer';
import { useLanguage } from '../../hooks/useLanguage';
import { TrashIcon, PlayIcon, CloseIcon } from '../Icons';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';

interface PlaylistPanelProps {
    onClose: () => void;
}

export const PlaylistPanel: React.FC<PlaylistPanelProps> = ({ onClose }) => {
    const { t } = useLanguage();
    const panelRef = useRef<HTMLDivElement>(null);
    const playlist = useAtomValue(playlistAtom);
    const [currentIndex, setCurrentIndex] = useAtom(currentTrackIndexAtom);
    const removeFromPlaylist = useSetAtom(removeFromPlaylistAtom);
    const clearPlaylist = useSetAtom(clearPlaylistAtom);
    
    useModalFocusTrap({ modalRef: panelRef, isOpen: true, onClose });
    
    useEffect(() => {
        const currentItem = document.getElementById(`playlist-item-${currentIndex}`);
        currentItem?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [currentIndex]);


    return (
        <div ref={panelRef} className="absolute bottom-full right-4 mb-2 w-80 bg-gray-900/80 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl flex flex-col max-h-[50vh] animate-fade-in-left">
            <header className="flex justify-between items-center p-3 border-b border-gray-700 flex-shrink-0">
                <h3 className="font-bold text-white">{t('audiothek:player.playlist')}</h3>
                <div>
                     <button onClick={clearPlaylist} className="p-1.5 text-gray-400 hover:text-red-400 rounded-md text-xs font-semibold mr-2">{t('audiothek:player.clearPlaylist')}</button>
                     <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-md"><CloseIcon className="w-5 h-5"/></button>
                </div>
            </header>
            <div className="flex-grow overflow-y-auto p-2">
                {playlist.length === 0 ? (
                    <p className="text-center text-gray-500 p-8">{t('audiothek:player.emptyPlaylist')}</p>
                ) : (
                    playlist.map((track, index) => (
                        <div
                            id={`playlist-item-${index}`}
                            key={`${track.identifier}-${index}`}
                            className={`flex items-center gap-3 p-2 rounded-md group ${index === currentIndex ? 'bg-cyan-500/20' : 'hover:bg-gray-700/50'}`}
                        >
                            <img src={`https://archive.org/services/get-item-image.php?identifier=${track.identifier}`} alt="" className="w-10 h-10 rounded-md flex-shrink-0" />
                            <div className="flex-grow min-w-0">
                                <p className={`text-sm font-semibold truncate ${index === currentIndex ? 'text-cyan-300' : 'text-white'}`}>{track.title}</p>
                                <p className="text-xs text-gray-400 truncate">{Array.isArray(track.creator) ? track.creator.join(', ') : track.creator}</p>
                            </div>
                            <div className="flex-shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                               {index !== currentIndex && <button onClick={() => setCurrentIndex(index)} className="p-2 text-gray-300 hover:text-white"><PlayIcon/></button>}
                               <button onClick={() => removeFromPlaylist(index)} className="p-2 text-gray-300 hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
