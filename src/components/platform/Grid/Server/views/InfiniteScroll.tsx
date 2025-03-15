'use client';
import { useContext, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Loader } from '~/components/ui/loader';

import { GridContext } from '../../Provider';

import GridMobileRow from './common/GridMobileRow';
import getData from './actions/getData';
import useScreenType from '~/hooks/use-screen-type';
import { cn } from '~/lib/utils';

const InfiniteScrollContainer = ({gridlevel}: any) => {
  const screen = useScreenType();
  const ismobile = screen=== 'md' || screen === 'sm' || screen==='xs';

  const { state: gridState, actions } = useContext(GridContext);

  const { infinite_options, advanceFilter, sorting } = gridState ?? {};
  const { infiniteActions } = actions ?? {};
  const { limit, current = 0, infiniteCount } =
    infinite_options ?? {};
  const {  handleUpdateInfiniteData, handleMergeBufferInfinite } = infiniteActions ?? {};

  const { entity = '', searchConfig } = gridState?.config ?? {};

  const { resolver, query_params, router } = searchConfig ?? {};
  const { pluck } = query_params ?? {};

  const handleFetch = async (storageType:'buffer' | 'items', curr?: number, resultLimit?: number) => {
    if(!ismobile) {
      return;
    }
    const newLimit = resultLimit ? resultLimit : curr ? (curr * (limit ?? 1)) : limit
    const newCurr = storageType === 'buffer'  ? curr : current

    try {
      const result = await getData({
        config: {
          router,
          resolver,
        },
        params:{
          advance_filters: advanceFilter,
          entity,
          limit: newLimit,
          pluck,
          resolver,
          sorting,  
          current: newCurr,
        }
      });      

      const { items, totalCount } = result ?? {};

      if(handleUpdateInfiniteData) {
        handleUpdateInfiniteData({
          items,
          totalCount, 
          curr: newCurr ? newCurr + 1 : current + 1,
          storageType
        });
      }
    
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  

  useEffect(() => {
    const fetchdata = async () => {
      await   handleFetch('items', 3,);
      //get buffer data
      await   handleFetch('buffer', 4, limit );
    }
    if(ismobile && current === 1) {
      fetchdata();
    } 

  }, [current, ismobile])
  
  return (
    <div>
      <div
      id="scrollable-div-mobile-grid"
      className={cn(`${gridlevel === 1 ? 'h-[calc(100vh-380px)] w-full overflow-y-auto' : ''}`)}
    >
      <InfiniteScroll
        scrollableTarget="scrollable-div-mobile-grid"
        className="w-full rounded-md text-card-foreground"
        dataLength={infinite_options?.infiniteData?.length ?? 0}
        hasMore={(infinite_options?.infiniteData || [])?.length < (infiniteCount ?? 0)} 
        next={() => {
          if(current !== 1) {
            handleMergeBufferInfinite?.();
            handleFetch('buffer', current,  limit);
          } else {
            
          }
        }}
        endMessage={ gridState?.data?.length && gridlevel  === 1 ? (
          <p className="text-center py-4 text-sm">
            <span className="text-gray-400">
                No more data...
            </span>
          </p>
        ) : null    
        }
        loader={ gridlevel === 1 ?    <div className="flex justify-center p-4">
          <Loader size="md" variant="circularShadow" label="" />
        </div> : null
        }
      >
        <GridMobileRow gridLevel={gridState?.gridLevel} />
      </InfiniteScroll>
    </div>
    </div>
  );
};

export default InfiniteScrollContainer;
