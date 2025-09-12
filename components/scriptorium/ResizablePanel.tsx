import React, { useState, useCallback, useRef } from 'react';

interface ResizablePanelProps {
    panelA: React.ReactNode;
    panelB: React.ReactNode;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({ panelA, panelB }) => {
    const [panelASize, setPanelASize] = useState(50); // Initial size in percentage
    const isResizing = useRef(false);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        isResizing.current = true;
        e.preventDefault();
    };
    
    const handleMouseUp = useCallback(() => {
        isResizing.current = false;
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current) return;
        const parent = e.currentTarget as HTMLElement;
        const rect = parent.getBoundingClientRect();
        const newSize = ((e.clientX - rect.left) / rect.width) * 100;
        if (newSize > 20 && newSize < 80) { // Constrain size
            setPanelASize(newSize);
        }
    }, []);
    
    // Add and remove global mouse listeners
    React.useEffect(() => {
        const parentElement = document.getElementById('resizable-container');
        if (parentElement) {
            parentElement.addEventListener('mousemove', handleMouseMove);
            parentElement.addEventListener('mouseup', handleMouseUp);
            parentElement.addEventListener('mouseleave', handleMouseUp);
        }

        return () => {
             if (parentElement) {
                parentElement.removeEventListener('mousemove', handleMouseMove);
                parentElement.removeEventListener('mouseup', handleMouseUp);
                parentElement.removeEventListener('mouseleave', handleMouseUp);
            }
        };
    }, [handleMouseMove, handleMouseUp]);


    return (
        <div id="resizable-container" className="flex-grow flex flex-col md:flex-row min-h-0">
            {/* Mobile View: Tab-like behavior */}
            <div className="md:hidden flex flex-col h-full">
                <div className="h-1/2 overflow-hidden">{panelA}</div>
                <div className="h-1/2 overflow-hidden border-t-2 border-gray-700">{panelB}</div>
            </div>

            {/* Desktop View: Resizable Panels */}
            <div className="hidden md:flex w-full h-full">
                <div className="h-full" style={{ width: `${panelASize}%` }}>
                    {panelA}
                </div>
                <div 
                    className="w-1.5 h-full cursor-col-resize bg-gray-700 hover:bg-cyan-500 transition-colors"
                    onMouseDown={handleMouseDown}
                />
                <div className="h-full flex-grow" style={{ width: `${100 - panelASize}%` }}>
                    {panelB}
                </div>
            </div>
        </div>
    );
};