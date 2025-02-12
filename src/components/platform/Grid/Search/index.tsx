import React from 'react';

import CreateButton from '../Header/ButtonHeader';
import CardViewButton from '../Header/CardViewButton';
import FilterButton from '../Header/FilterButton';
import TableViewButton from '../Header/TableViewButton';

import GridSearchProvider from './Provider';
import SearchDialog from './SearchDialog';
import SearchList from './SearchList';
import SearchListMobile from './SearchListMobile';
import Search from './View';

// eslint-disable-next-line react/destructuring-assignment
export default function Main({ parentType = 'grid' }: any) {
  return (
    <GridSearchProvider>
      {parentType === 'grid'
        ? (
            <div className="ml-0 mt-0 flex w-full max-w-[100%] flex-col justify-end gap-x-2 sm:mt-0 lg:ml-2 lg:mt-0 lg:w-[40%] lg:max-w-[40%]">
              <div className="relative flex flex-1 flex-row gap-x-2">
                <div className="my-2 h-[40px] w-full md:my-0">
                  <Search />
                </div>
                <div className="hidden h-[36px] flex-shrink-0 flex-row items-center lg:flex">
                  <TableViewButton />
                  <CardViewButton />
                  <div className="mx-2 h-full w-[1px] bg-tertiary" />
                  <FilterButton />
                </div>
                <CreateButton className="hidden lg:inline-flex" title="New" />
              </div>
              <div className="hidden min-h-[40px] lg:block">
                <SearchList />
              </div>
              <div className="min-h-[40px] lg:hidden">
                <SearchListMobile />
              </div>
            </div>
          )
        : parentType === 'grid_expansion'
          ? (
              <div className='grid-expansion-search  flex-row flex lg:w-[49%] justify-between'>
                <div className="hidden min-h-[40px] lg:block flex-1">
                  <SearchList />
                </div>
                <div className="min-h-[40px] lg:hidden">
                  <SearchListMobile />
                </div>
                <SearchDialog />
              </div>
            )
          : (
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
                  <SearchListMobile />
                </div>
              </div>
            )}
    </GridSearchProvider>
  );
}
