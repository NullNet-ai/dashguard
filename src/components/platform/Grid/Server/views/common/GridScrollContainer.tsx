"use client";
import { set } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import useWindowSize from "~/hooks/use-resize";
import { cn } from "~/lib/utils";
import { remToPx } from "~/utils/fetcher";

export const ScrollContainerContext = React.createContext<any>(null);

const ScrollContainer: React.FC<any> = ({ children, parentType }) => {
  const { height } = useWindowSize();
  const _height = height - remToPx(16);
  const scrollableRef = useRef<any>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isEndReached, setIsEndReached] = useState(false);

  const handleScroll = () => {
    const scrollDiv = scrollableRef.current;
    if (scrollDiv) {
      setScrollLeft(scrollDiv.scrollLeft);
      const isAtEnd =
        scrollDiv.scrollLeft + scrollDiv.clientWidth >= scrollDiv.scrollWidth - 100;
      setIsEndReached(isAtEnd);
    }
  };

  return (
    <ScrollContainerContext.Provider value={{ scrollLeft, isEndReached }}>
      <div
        style={{ height: _height - 20 - (parentType === 'record' ? 220 : 0 )}}
        ref={scrollableRef}
        onScroll={handleScroll}
        // className="w-full -auto px-2"
        className={cn(`mx-2 main-grid-scroll-container  overflow-x-auto rounded-md border bg-card text-card-foreground`, `${parentType === 'record' ? 'h-[400px]' : 'h-[690px]'}`)}
      >
        {children}
      </div>
    </ScrollContainerContext.Provider>
  );
};

export default ScrollContainer;
