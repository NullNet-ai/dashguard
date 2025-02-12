'use client'
import { useContext } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

import { Loader } from '~/components/ui/loader'

import { GridContext } from '../../Provider'

import GridMobileRow from './common/GridMobileRow'

const InfiniteScrollContainer = () => {
  const { state } = useContext(GridContext)
  return (
    <InfiniteScroll
      className="rounded-md text-card-foreground w-full"
      dataLength={state?.data?.length}
      hasMore={true}
      next={() => null}
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
