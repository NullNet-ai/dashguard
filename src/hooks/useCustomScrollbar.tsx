import { useRef, useState, useEffect } from 'react';

interface UseCustomScrollbarReturn {
  scrollableRef: React.RefObject<HTMLDivElement | null>;
  customScrollRef: React.RefObject<HTMLDivElement | null>;
  scrollLeft: number;
  isEndReached: boolean;
  scrollWidth: number;
  clientWidth: number;
  showCustomScroll: boolean;
  handleScroll: () => void;
  handleCustomScrollDrag: (e: React.MouseEvent) => void;
}

export const useCustomScrollbar = (children?: React.ReactNode): UseCustomScrollbarReturn => {
  const scrollableRef = useRef<HTMLDivElement>(null);
  const customScrollRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isEndReached, setIsEndReached] = useState(false);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [clientWidth, setClientWidth] = useState(0);
  const [showCustomScroll, setShowCustomScroll] = useState(false);

  const handleScroll = () => {
    const scrollDiv = scrollableRef.current;
    if (scrollDiv) {
      setScrollLeft(scrollDiv.scrollLeft);
      const isAtEnd =
        scrollDiv.scrollLeft + scrollDiv.clientWidth >=
        scrollDiv.scrollWidth - 100;
      setIsEndReached(isAtEnd);
    }
  };

  const handleCustomScrollDrag = (e: React.MouseEvent) => {
    const customScroll = customScrollRef.current;
    const scrollDiv = scrollableRef.current;
    if (!customScroll || !scrollDiv) return;

    const startX = e.clientX;
    const startScrollLeft = scrollDiv.scrollLeft;
    const scrollRatio = scrollDiv.scrollWidth / customScroll.clientWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newScrollLeft = startScrollLeft + (deltaX * scrollRatio);
      scrollDiv.scrollLeft = Math.max(0, Math.min(newScrollLeft, scrollDiv.scrollWidth - scrollDiv.clientWidth));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    const scrollDiv = scrollableRef.current;
    if (scrollDiv) {
      const updateScrollInfo = () => {
        setScrollWidth(scrollDiv.scrollWidth);
        setClientWidth(scrollDiv.clientWidth);
        setShowCustomScroll(scrollDiv.scrollWidth > scrollDiv.clientWidth);
      };
      
      updateScrollInfo();
      const resizeObserver = new ResizeObserver(updateScrollInfo);
      resizeObserver.observe(scrollDiv);
      
      return () => resizeObserver.disconnect();
    }
  }, [children]);

  return {
    scrollableRef,
    customScrollRef,
    scrollLeft,
    isEndReached,
    scrollWidth,
    clientWidth,
    showCustomScroll,
    handleScroll,
    handleCustomScrollDrag
  };
};