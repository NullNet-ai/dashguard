'use client';
import { useContext, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Loader } from '~/components/ui/loader';

import { GridContext } from '../../Provider';

import GridMobileRow from './common/GridMobileRow';
import getData from './actions/getData';
import useScreenType from '~/hooks/use-screen-type';

const InfiniteScrollContainer = () => {
  const screen = useScreenType();
  const ismobile = screen=== 'md' || screen === 'sm' || screen==='xs';

  const { state: gridState, actions } = useContext(GridContext);
  const { infinite_options, advanceFilter, sorting } = gridState ?? {};
  const { infiniteActions } = actions ?? {};
  const { limit, current = 0, infiniteCount } =
    infinite_options ?? {};
  const {  handleUpdateInfiniteData } = infiniteActions ?? {};

  const { entity = '', searchConfig } = gridState?.config ?? {};

  const { resolver, query_params, router } = searchConfig ?? {};
  const { pluck } = query_params ?? {};

  const handleFetch = async (curr?: number) => {
    if(!ismobile) {
      return;
    }
    
    try {
      const result = await getData({
        config: {
          router,
          resolver,
        },
        params:{
          advance_filters: advanceFilter,
          entity,
          limit: curr ? (curr * (limit ?? 1)) : limit,
          pluck,
          resolver,
          sorting,  
          current: curr ? 1 : current + 1,
        }
      });      

      const { items, totalCount } = result ?? {};

      if(handleUpdateInfiniteData) {
        handleUpdateInfiniteData({
          items,
          totalCount, 
          current: curr ? curr : current
        });
      }
    
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if(current === 1 && ismobile) {
      //times 3 in first load
      handleFetch(3);
    }
  }, [current, ismobile])
  
  return (
    <div>
      <div
      id="scrollable-div-mobile-grid"
      className="h-[calc(100vh-380px)] w-full overflow-y-auto"
    >
      <InfiniteScroll
        scrollableTarget="scrollable-div-mobile-grid"
        className="w-full rounded-md text-card-foreground"
        dataLength={infinite_options?.infiniteData?.length ?? 0}
        hasMore={(infinite_options?.infiniteData || [])?.length < (infiniteCount ?? 0)} 
        next={() => {
          if(current !== 1) {
            handleFetch();
          }
        }}
        endMessage={
          <p className="text-center py-4 text-sm">
            <span className="text-gray-400">
                No more data...
            </span>
          </p>
        }
        loader={
          <div className="flex justify-center p-4">
            <Loader size="md" variant="circularShadow" label="" />
          </div>
        }
      >
        <GridMobileRow gridLevel={gridState?.gridLevel} />
      </InfiniteScroll>
    </div>
    </div>
  );
};

export default InfiniteScrollContainer;
