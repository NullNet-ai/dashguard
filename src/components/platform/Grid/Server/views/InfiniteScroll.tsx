'use client'
import { useContext } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

import { Loader } from '~/components/ui/loader'

import { GridContext } from '../../Provider'

import GridMobileRow from './common/GridMobileRow'

const InfiniteScrollContainer = () => {
  const { state, actions } = useContext(GridContext)

  const hasMore = state?.hasMore || false

  const { handleGetInfiniteData } = actions ?? {}

  return (

      <InfiniteScroll
      scrollableTarget="scrollable-div-grid"
        className="rounded-md text-card-foreground w-full"
        dataLength={state?.data?.length}
        hasMore={hasMore}
        scrollThreshold={0.9}
        next={() => {
          if(handleGetInfiniteData) {
            handleGetInfiniteData ()
          }
        }}
        loader={(
          <div className="flex justify-center p-4">
            <Loader size='md' variant='circularShadow' label="" />
          </div>
        )}
      >
        <GridMobileRow />
      </InfiniteScroll>

  )
};

export default InfiniteScrollContainer
