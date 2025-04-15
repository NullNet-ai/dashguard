import React from 'react';

import { cn } from '~/lib/utils';

import CreateButton from '../Header/ButtonHeader';
import CardViewButton from '../Header/CardViewButton';
import FilterButton from '../Header/FilterButton';
import TableViewButton from '../Header/TableViewButton';

import GridSearchProvider from './Provider';
import SearchDialog from './SearchDialog';
import SearchList from './SearchList';
import SearchListMobile from './SearchListMobile';
import Search from './View';
import GridSearchContainer from './_components/GridSearchContainer';
// eslint-disable-next-line react/destructuring-assignment
export default function Main({
  parentType = 'grid',
  creatable = true,
  switchable = true,
  gridType = 'table',
  viewMode='table'
}: any) {
  return (
    <GridSearchProvider>
      {parentType === 'grid' ? (
        <GridSearchContainer>
          <div
            className={cn(
              `relative flex flex-1 flex-row`,
              `${switchable ? 'gap-x-2' : ''}`,
            )}
          >
            <div className="my-2 h-[40px] w-full md:my-0">
              <Search gridType={gridType} />
            </div>
            <div className="hidden h-[36px] flex-shrink-0 flex-row items-center lg:flex">
              {switchable ? (
                <>
                  <TableViewButton />
                  <CardViewButton />
                </>
              ) : null}
              <div className="mx-2 h-full w-[1px] bg-tertiary" />
              <FilterButton />
            </div>
            {creatable ? (
              <CreateButton className="hidden lg:inline-flex" title="New" />
            ) : null}
          </div>
          <div className="hidden min-h-[40px] lg:block">
            <SearchList />
          </div>
          <div className="min-h-[40px] lg:hidden">
            <SearchListMobile gridType={gridType} />
          </div>
        </GridSearchContainer>
      ) : parentType === 'grid_expansion' ? (
        <div className={cn(`grid-expansion-search flex flex-row justify-between`, `${viewMode === 'table' ? 'lg:w-[49%]' : 'w-full'}`)}>
          <div className={cn(`hidden min-h-[40px] flex-1 lg:block`, `${viewMode ==='card' ? 'lg:hidden' : ''}`)}>
            <SearchList />
          </div>
          <div className={cn(`min-h-[40px]`, `${viewMode === 'table' ? 'lg:hidden' : ''}`)}>
            <SearchListMobile gridType={gridType} parentType={parentType}/>
          </div>
          <SearchDialog />
        </div>
      ) : (
        <div className="ml-0 mt-0 flex w-full max-w-[100%] md:max-w-[40%]  flex-col justify-end gap-x-2 sm:mt-0 lg:mt-4">
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
