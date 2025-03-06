import React from 'react'

import CreateButton from '../Header/ButtonHeader'
import CardViewButton from '../Header/CardViewButton'
import FilterButton from '../Header/FilterButton'
import TableViewButton from '../Header/TableViewButton'

import GridSearchProvider from './Provider'
import SearchDialog from './SearchDialog'
import SearchList from './SearchList'
import SearchListMobile from './SearchListMobile'
import Search from './View'

// eslint-disable-next-line react/destructuring-assignment
export default function Main({ parentType = 'grid' }: any) {
  return (
    <GridSearchProvider>
      <div className="ml-0 mt-0 flex w-full max-w-[100%] flex-col justify-end gap-x-2 sm:mt-0 lg:mt-4">
        <div className="relative flex flex-1 flex-row gap-x-2">
          <div className="my-2 h-[40px] w-full md:my-0">
            <Search />
          </div>
        </div>
        <div className="hidden min-h-[40px] lg:block">
          <SearchList />
        </div>
        <div className="min-h-[40px] lg:hidden">
          <SearchListMobile parentType={parentType} />
        </div>
      </div>
    </GridSearchProvider>
  )
}
