
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { BookIcon, PencilAltIcon } from '../Icons';

interface ResizablePanelProps {
    panelA: React.ReactNode; // Reader
    panelB: React.ReactNode; // Notes
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({ panelA, panelB }) => {
    const { t } = useLanguage();
    const [panelASize, setPanelASize] = useState(50); // Initial size in percentage
    const isResizing = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mobileTab, setMobileTab] = useState<'reader' | 'notes'>('reader');

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        isResizing.current = true;
        e.preventDefault();
    };
    
    const handleMouseUp = useCallback(() => {
        isResizing.current = false;
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current || !containerRef.current) return;
        
        const parent = containerRef.current;
        const rect = parent.getBoundingClientRect();
        const newSize = ((e.clientX - rect.left) / rect.width) * 100;
        if (newSize > 20 && newSize < 80) { // Constrain size
            setPanelASize(newSize);
        }
    }, []);
    
    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);


    return (
        <div ref={containerRef} className="flex-grow flex flex-col min-h-0">
            {/* Mobile View: Tab-based interface */}
            <div className="md:hidden flex flex-col h-full">
                <div className="flex-shrink-0 border-b border-gray-700 flex">
                    <button 
                        onClick={() => setMobileTab('reader')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium ${mobileTab === 'reader' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}
                    >
                        <BookIcon className="w-4 h-4" /> {t('scriptorium:reader.tabReader')}
                    </button>
                    <button 
                        onClick={() => setMobileTab('notes')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium ${mobileTab === 'notes' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}
                    >
                        <PencilAltIcon className="w-4 h-4" /> {t('scriptorium:reader.tabNotes')}
                    </button>
                </div>
                <div className="flex-grow overflow-hidden">
                    {mobileTab === 'reader' ? panelA : panelB}
                </div>
            </div>

            {/* Desktop View: Resizable Panels */}
            <div className="hidden md:flex w-full h-full">
                <div className="h-full" style={{ width: `${panelASize}%` }}>
                    {panelA}
                </div>
                <div 
                    className="w-1.5 h-full cursor-col-resize bg-gray-700 hover:bg-cyan-500 transition-colors flex-shrink-0"
                    onMouseDown={handleMouseDown}
                />
                <div className="h-full flex-grow" style={{ width: `${100 - panelASize}%` }}>
                    {panelB}
                </div>
            </div>
        </div>
    );
};
