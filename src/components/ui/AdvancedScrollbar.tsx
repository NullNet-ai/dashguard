import React from 'react';
import { useAdvancedScrollbar } from '~/hooks/useAdvancedScrollbar';
import { cn } from '~/lib/utils';

interface AdvancedScrollbarProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  scrollbarClassName?: string;
  thumbClassName?: string;
  containerStyle?: React.CSSProperties;
  scrollbarStyle?: React.CSSProperties;
  thumbStyle?: React.CSSProperties;
}

/**
 * AdvancedScrollbar component with drag support and mobile optimization
 * Uses the useAdvancedScrollbar hook for scrollbar logic
 * Designed to work perfectly on all devices including iPhone browsers
 */
const AdvancedScrollbar: React.FC<AdvancedScrollbarProps> = ({
  children,
  className,
  containerClassName,
  scrollbarClassName,
  thumbClassName,
  containerStyle,
  scrollbarStyle,
  thumbStyle,
}) => {
  const {
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
  } = useAdvancedScrollbar();

  return (
    <div className={cn('relative', className)}>
      <div
        ref={containerRef}
        className={cn(
          'w-full overflow-x-auto overflow-y-hidden pb-2',
          containerClassName
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          ...containerStyle,
        }}
        onScroll={handleScroll}
      >
        <div
          ref={contentRef}
          style={{ width: 'max-content' }}
        >
          {children}
        </div>
      </div>
      
      {/* Custom Scrollbar */}
      {scrollbarVisible && (
        <div
          ref={scrollbarRef}
          className={cn(
            'absolute bottom-0 left-0 w-full h-1 bg-gray-100 rounded-sm px-1',
            scrollbarClassName
          )}
          style={{ zIndex: 10, ...scrollbarStyle }}
        >
          <div
            ref={thumbRef}
            className={cn(
              'h-full bg-gray-400 rounded-sm cursor-pointer transition-colors duration-200',
              isDragging ? 'bg-gray-500' : 'hover:bg-gray-700',
              thumbClassName
            )}
            style={{
              width: `${thumbWidth}px`,
              transform: `translateX(${thumbPosition}px)`,
              ...thumbStyle,
            }}
            onMouseDown={handleThumbMouseDown}
            onTouchStart={handleThumbMouseDown as any}
          />
        </div>
      )}
    </div>
  );
};

export default AdvancedScrollbar;