import React from 'react';

interface CustomScrollbarProps {
  scrollLeft: number;
  scrollWidth: number;
  clientWidth: number;
  showCustomScroll: boolean;
  customScrollRef: React.RefObject<HTMLDivElement>;
  onCustomScrollDrag: (e: React.MouseEvent) => void;
  className?: string;
}

export const CustomScrollbar: React.FC<CustomScrollbarProps> = ({
  scrollLeft,
  scrollWidth,
  clientWidth,
  showCustomScroll,
  customScrollRef,
  onCustomScrollDrag,
  className = "sticky z-[50] bottom-[55px] ml-2 right-2 h-2 bg-gray-100 rounded-sm border"
}) => {
  if (!showCustomScroll) return null;

  const thumbWidth = (clientWidth / scrollWidth) * 100;
  const thumbPosition = scrollWidth > clientWidth 
    ? (scrollLeft / (scrollWidth - clientWidth)) * (clientWidth - (clientWidth / scrollWidth) * clientWidth)
    : 0;

  return (
    <div className={`${className} data-test-id-CustomScrollbar`}>
      <div 
        ref={customScrollRef}
        className="h-full bg-gray-400 rounded-sm cursor-pointer hover:bg-gray-500 transition-colors"
        style={{
          width: `${thumbWidth}%`,
          transform: `translateX(${thumbPosition}px)`
        }}
        onMouseDown={onCustomScrollDrag}
      />
    </div>
  );
};