"use client";
import { set } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import useWindowSize from "~/hooks/use-resize";
import { remToPx } from "~/utils/fetcher";

export const ScrollContainerContext = React.createContext<any>(null);

const ScrollContainer: React.FC<any> = ({ children }) => {
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
        style={{ height: _height - 20 }}
        ref={scrollableRef}
        onScroll={handleScroll}
        // className="w-full -auto px-2"
        className="mx-2 main-grid-scroll-container h-[690px] overflow-x-auto rounded-md border bg-card text-card-foreground"
      >
        {children}
      </div>
    </ScrollContainerContext.Provider>
  );
};

export default ScrollContainer;
