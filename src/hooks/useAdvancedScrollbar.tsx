import { useRef, useState, useEffect } from 'react';

interface UseAdvancedScrollbarReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  scrollbarRef: React.RefObject<HTMLDivElement | null>;
  thumbRef: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  scrollbarVisible: boolean;
  thumbWidth: number;
  thumbPosition: number;
  handleScroll: () => void;
  handleThumbMouseDown: (e: React.MouseEvent) => void;
}

/**
 * Advanced custom scrollbar hook with drag support and mobile optimization
 * Provides a fully custom scrollbar implementation that works across all devices
 */
export const useAdvancedScrollbar = (): UseAdvancedScrollbarReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollbarVisible, setScrollbarVisible] = useState(false);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbPosition, setThumbPosition] = useState(0);

  const updateScrollbar = () => {
    if (!containerRef.current || !contentRef.current) return;
    
    const container = containerRef.current;
    const content = contentRef.current;
    
    const containerWidth = container.clientWidth;
    const contentWidth = content.scrollWidth;
    const scrollLeft = container.scrollLeft;
    
    // Show scrollbar if content overflows
    const hasOverflow = contentWidth > containerWidth;
    setScrollbarVisible(hasOverflow);
    
    if (hasOverflow) {
      // Calculate thumb width and position
      const thumbWidthRatio = containerWidth / contentWidth;
      const newThumbWidth = Math.max(thumbWidthRatio * containerWidth, 30); // Minimum 30px
      const maxThumbPosition = containerWidth - newThumbWidth;
      const scrollRatio = scrollLeft / (contentWidth - containerWidth);
      const newThumbPosition = scrollRatio * maxThumbPosition;
      
      setThumbWidth(newThumbWidth);
      setThumbPosition(newThumbPosition);
    }
  };

  const handleScroll = () => {
    updateScrollbar();
  };

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current || !contentRef.current) return;
    
    const container = containerRef.current;
    const content = contentRef.current;
    const containerRect = container.getBoundingClientRect();
    
    const mouseX = e.clientX - containerRect.left;
    const containerWidth = container.clientWidth;
    const contentWidth = content.scrollWidth;
    
    const scrollRatio = mouseX / (containerWidth - thumbWidth);
    const newScrollLeft = scrollRatio * (contentWidth - containerWidth);
    
    container.scrollLeft = Math.max(0, Math.min(newScrollLeft, contentWidth - containerWidth));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    updateScrollbar();
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove as any);
      document.addEventListener('touchend', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove as any);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, thumbWidth]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const resizeObserver = new ResizeObserver(updateScrollbar);
      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return {
    containerRef,
    contentRef,
    scrollbarRef,
    thumbRef,
    isDragging,
    scrollbarVisible,
    thumbWidth,
    thumbPosition,
    handleScroll,
    handleThumbMouseDown,
  };
};

export default useAdvancedScrollbar;