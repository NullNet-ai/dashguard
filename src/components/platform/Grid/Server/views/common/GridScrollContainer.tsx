'use client';
import React, { useContext, useRef, useState } from 'react';
import useWindowSize from '~/hooks/use-resize';
import { remToPx } from '~/utils/fetcher';
import { GridContext } from '../../../Provider';

export const ScrollContainerContext = React.createContext<any>(null);

const ScrollContainer: React.FC<any> = ({ children, parentType }) => {
  const { height } = useWindowSize();
  const _height = height - remToPx(16);
  const scrollableRef = useRef<any>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isEndReached, setIsEndReached] = useState(false);
  const { state } = useContext(GridContext);

  const { dimentionOptions } = state?.config || {};

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

  const newHeight = dimentionOptions?.gridStartPosition
    ? height - (dimentionOptions?.gridStartPosition || 0) - (dimentionOptions?.gridEndPosition || 90)
    : _height - (parentType === 'record' ? 20 : 20);

  const styles = {
    height: newHeight,
    ...(dimentionOptions?.minHeight ? { minHeight: dimentionOptions?.minHeight } : {})
  }

  return (
    <ScrollContainerContext.Provider value={{ scrollLeft, isEndReached }}>
      <div
        data-height={`grid-scroll-height-${newHeight}`}
        style={styles}
        ref={scrollableRef}
        onScroll={handleScroll}
        // className="w-full -auto px-2"
        className="main-grid-scroll-container mx-2 h-[619px] overflow-x-auto rounded-md border bg-card text-card-foreground"
      >
        {children}
      </div>
    </ScrollContainerContext.Provider>
  );
};

export default ScrollContainer;
