'use client';
import React, { useContext, useState, useEffect } from 'react';
import useWindowSize from '~/hooks/use-resize';
import { remToPx } from '~/utils/fetcher';
import { GridContext } from '../Provider';
import { useCustomScrollbar } from '~/hooks/useCustomScrollbar';
import { CustomScrollbar } from '~/components/ui/CustomScrollbar';
import { ChevronUp } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import getData from '../Action/getData';
import { Loader } from '~/components/ui/loader';
import { usePathname } from 'next/navigation';

export const ScrollContainerContext = React.createContext<any>(null);

interface ScrollContainerProps {
  children: React.ReactNode;
  parentType?: string;
  gridRecordClass?: string;
}

const ScrollContainer: React.FC<ScrollContainerProps> = ({
  children,
  parentType,
  gridRecordClass = '',
}) => {
  const { height } = useWindowSize();
  const { state, actions } = useContext(GridContext);
  const pathname = usePathname();
  const [, , , application] = pathname.split("/");
  
  const {
    showPagination = true,
    showScrollToTop = false,
    isInfinite,
  } = state?.config ?? {};
  const _height = height - remToPx(showPagination ? 16 : 10);

  const { infinite_options, advanceFilter, sorting, totalCount: fixedTotalCount } = state ?? {};
  const { infiniteActions } = actions ?? {};
  const { limit, current = 0, infiniteCount, infiniteData } = infinite_options ?? {};
  const { handleUpdateInfiniteData, handleMergeBufferInfinite } =
    infiniteActions ?? {};

  const { entity = '', searchConfig } = state?.config ?? {};

  const { resolver, query_params, router } = searchConfig ?? {};
  const { pluck } = query_params ?? {};

  const handleFetch = async (
    storageType: 'buffer' | 'items',
    curr?: number,
    resultLimit?: number,
  ) => {
    const newLimit = resultLimit
      ? resultLimit
      : curr
        ? curr * (limit ?? 1)
        : limit;
    const newCurr = curr ? curr : current;

 
    try {
      const result = await getData({
        config: {
          router,
          resolver,
        },
        params: {
          advance_filters: advanceFilter,
          entity,
          limit: newLimit,
          pluck,
          resolver,
          sorting,
          current: newCurr === 1 ? 2 : newCurr,
        },
      });

      const { items, totalCount } = result ?? {};

      if (handleUpdateInfiniteData) {
        handleUpdateInfiniteData({
          items,
          totalCount: fixedTotalCount || totalCount,
          curr: newCurr ? newCurr + 1 : current + 1,
          storageType,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const {
    scrollableRef,
    customScrollRef,
    scrollLeft,
    isEndReached,
    scrollWidth,
    clientWidth,
    showCustomScroll,
    handleScroll,
    handleCustomScrollDrag,
  } = useCustomScrollbar(children);

  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);

  useEffect(() => {
    if (!showScrollToTop || !scrollableRef.current) return;

    const handleScrollEvent = () => {
      if (scrollableRef.current) {
        setShowScrollToTopButton(scrollableRef.current.scrollTop > 300);
      }
    };

    const scrollElement = scrollableRef.current;
    scrollElement.addEventListener('scroll', handleScrollEvent);

    return () => {
      scrollElement.removeEventListener('scroll', handleScrollEvent);
    };
  }, [showScrollToTop, scrollableRef]);

  const scrollToTop = () => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const { dimentionOptions } = state?.config || {};

  const newHeight = dimentionOptions?.gridStartPosition
    ? height -
      (dimentionOptions?.gridStartPosition || 0) -
      (dimentionOptions?.gridEndPosition || 90)
    : _height - (parentType === 'record' ? 20 : 20);

  const styles = {
    height: newHeight,
    ...(dimentionOptions?.minHeight
      ? { minHeight: dimentionOptions?.minHeight }
      : {}),
  };

  
  if (isInfinite && entity === 'timeline') {

    const classHeight = application === 'grid' ? 'h-[calc(100dvh-194px)] md:h-[calc(100dvh-194px)]' : 'h-[calc(100dvh-300px)] md:h-[calc(100dvh-300px)]';

    return (
      <div
        id="scrollable-div-infinite"
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex h-[calc(100dvh-194px)] md:h-[calc(100dvh-194px)] flex-col gap-2 overflow-auto overscroll-none scroll-smooth "
      >
        <InfiniteScroll
          scrollableTarget="scrollable-div-infinite"
          className="w-full rounded-md text-card-foreground"
          dataLength={infinite_options?.infiniteData?.length ?? 0}
          hasMore={
            (infinite_options?.infiniteData || [])?.length <
            (fixedTotalCount ?? 0)
          }
          next={() => {
             handleFetch('items', current, limit);
            
          }}
          endMessage={
            state?.data?.length ? (
              <p className="py-4 text-center text-sm">
                <span className="text-gray-400">No more data...</span>
              </p>
            ) : null
          }
          loader={
            <div className="flex justify-center p-4">
              <Loader size="md" variant="circularShadow" label="" />
            </div>
          }
        >
          {children}
        </InfiniteScroll>
      </div>
    );
  }

  if (parentType === 'record') {
    return (
      <div className="relative">
        <div
          ref={scrollableRef}
          onScroll={handleScroll}
          className={`grid-scrollview-record main-grid-scroll-container mx-2 min-h-[300px] overflow-x-auto rounded-md border bg-card text-card-foreground ${gridRecordClass}`}
          style={
            {
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            } as React.CSSProperties
          }
        >
          {children}
        </div>
        <CustomScrollbar
          scrollLeft={scrollLeft}
          scrollWidth={scrollWidth}
          clientWidth={clientWidth}
          showCustomScroll={showCustomScroll}
          customScrollRef={customScrollRef as React.RefObject<HTMLDivElement>}
          onCustomScrollDrag={handleCustomScrollDrag}
        />
        {showScrollToTop && showScrollToTopButton && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl"
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <ScrollContainerContext.Provider
      value={{ scrollLeft, isEndReached, showCustomScroll }}
    >
      <div className="relative">
        <div
          data-height={`grid-scroll-height-${newHeight}`}
          style={{
            ...styles,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          ref={scrollableRef}
          onScroll={handleScroll}
          className="main-grid-scroll-container mx-2 h-[619px] overflow-x-auto rounded-md border bg-card text-card-foreground"
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {children}
        </div>
        <CustomScrollbar
          scrollLeft={scrollLeft}
          scrollWidth={scrollWidth}
          clientWidth={clientWidth}
          showCustomScroll={showCustomScroll}
          customScrollRef={customScrollRef as React.RefObject<HTMLDivElement>}
          onCustomScrollDrag={handleCustomScrollDrag}
        />
        {showScrollToTop && showScrollToTopButton && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl"
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        )}
      </div>
    </ScrollContainerContext.Provider>
  );
};

export default ScrollContainer;
