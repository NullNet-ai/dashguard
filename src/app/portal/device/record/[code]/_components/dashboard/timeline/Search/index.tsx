import React from 'react'

import GraphSearchProvider from './Provider'
import SearchList from './SearchList'
import SearchListMobile from './SearchListMobile'
import Search from './View'

// eslint-disable-next-line react/destructuring-assignment
export default function Main() {
  return (
    <GraphSearchProvider>
      <div className="ml-auto flex w-full max-w-[50%] flex-col justify-end  gap-x-2">
        <div className="relative flex flex-1 flex-row gap-x-2">
          <div className="my-2 h-[40px] w-full md:my-0">
            <Search />
          </div>
        </div>
        <div className="hidden min-h-[40px] lg:block">
          <SearchList />
        </div>
        <div className="min-h-[40px] lg:hidden">
          <SearchListMobile />
        </div>
      </div>
    </GraphSearchProvider>
  )
}
