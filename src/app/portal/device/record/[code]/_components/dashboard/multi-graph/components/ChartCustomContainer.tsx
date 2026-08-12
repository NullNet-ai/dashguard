import { createContext, useContext, useState, useRef, useEffect } from 'react';

// Create context with default values
const ChartSizeContext = createContext<{
  size: { width: number; height: number };
} | null>(null);

// Custom hook to use the chart size
export const useChartSize = () => {
  const context = useContext(ChartSizeContext);
  if (!context) {
    throw new Error('useChartSize must be used within ChartCustomContainer');
  }
  return context;
};

const ChartCustomContainer = ({ children }: { children: React.ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Initialize size
    setContainerSize({
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    // Create ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(element);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <ChartSizeContext.Provider value={{ size: containerSize }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
    </ChartSizeContext.Provider>
  );
};


export default ChartCustomContainer;