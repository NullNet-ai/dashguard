'use client'

import { useContext } from 'react'

import { GridContext } from '../../Provider'
import Search from '../../Search'
import GridClientTabs from '../components/GridClientTabs'

import GridCardListItem from './GridCardListItem'

const GridCardLists = ({ hideSearch, parentType }: any) => {
  const { state } = useContext(GridContext)

  return (
    <>
      <div className='flex justify-between'>
        <div className='w-[40%] h-[36px]'>
          <GridClientTabs />
        </div>
        {!hideSearch && <Search parentType={parentType} creatable={false} switchable={false} />}
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
