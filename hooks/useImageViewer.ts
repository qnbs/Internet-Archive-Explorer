import { useState, useCallback, MouseEvent as ReactMouseEvent } from 'react';

const ZOOM_SENSITIVITY = 0.001;
const MAX_ZOOM = 10;
const MIN_ZOOM = 0.5;

interface UseImageViewerReturn {
  zoom: number;
  rotation: number;
  offset: { x: number; y: number };
  isDragging: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  rotateCW: () => void;
  rotateCCW: () => void;
  reset: () => void;
  handleMouseDown: (e: ReactMouseEvent<HTMLDivElement>) => void;
  handleMouseMove: (e: ReactMouseEvent<HTMLDivElement>) => void;
  handleMouseUp: () => void;
  handleWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
}

export const useImageViewer = (): UseImageViewerReturn => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const clampZoom = (newZoom: number) => Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);

  const zoomIn = useCallback(() => setZoom(prev => clampZoom(prev * 1.2)), []);
  const zoomOut = useCallback(() => setZoom(prev => clampZoom(prev / 1.2)), []);

  const rotateCW = useCallback(() => setRotation(prev => (prev + 90) % 360), []);
  const rotateCCW = useCallback(() => setRotation(prev => (prev - 90 + 360) % 360), []);

  const reset = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  }, [offset]);

  const handleMouseMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const { clientX, clientY, deltaY } = e;
    const rect = e.currentTarget.getBoundingClientRect();
    
    const newZoom = clampZoom(zoom - deltaY * ZOOM_SENSITIVITY * zoom);
    
    // Calculate the mouse position relative to the image container
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Calculate the offset adjustment needed to keep the point under the cursor stationary
    const newOffsetX = x - (x - offset.x) * (newZoom / zoom);
    const newOffsetY = y - (y - offset.y) * (newZoom / zoom);

    setZoom(newZoom);
    setOffset({ x: newOffsetX, y: newOffsetY });
  }, [zoom, offset]);

  return {
    zoom,
    rotation,
    offset,
    isDragging,
    zoomIn,
    zoomOut,
    rotateCW,
    rotateCCW,
    reset,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
  };
};