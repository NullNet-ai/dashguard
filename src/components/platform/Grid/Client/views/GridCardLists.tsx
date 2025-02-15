'use client'

import { useContext } from 'react'

import { GridContext } from '../../Provider'
import Search from '../../Search'
import GridClientTabs from '../components/GridClientTabs'

import GridCardListItem from './GridCardListItem'

const GridCardLists = ({ hideSearch, parentType, gridType }: any) => {
  const { state } = useContext(GridContext)

  return (
    <>
      <div className='flex flex-col lg:flex-row justify-between gap-y-2 lg:gap-y-0'>
        <div className='lg:w-[40%] w-full h-[36px]'>
          <GridClientTabs />
        </div>
        {!hideSearch && <Search parentType={parentType} creatable={false} switchable={false} gridType={gridType} />}
      </div>
      <div className='flex flex-col gap-y-2 lg:h-[calc(100vh-350px)] overflow-y-auto'>
        {state?.table.getRowModel().rows?.length
          ? state?.table.getRowModel().rows.map((row) => {
            return <GridCardListItem row={row} key={row.id} />
          })
          : (
              <div className="h-24 border rounded-md text-center text-foreground text-sm flex items-center justify-center mt-4">
                No results.
              </div>
            )}
      </div>
    </>
  )
};

export default GridCardLists
