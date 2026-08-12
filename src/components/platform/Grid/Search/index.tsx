import React, { Fragment } from 'react';
import { cn } from '~/lib/utils';
import CreateButton from '../Header/ButtonHeader';
import CardViewButton from '../Header/CardViewButton';
import TableViewButton from '../Header/TableViewButton';
import GridSearchProvider from './Provider';
import SearchDialog from './SearchDialog';
import SearchList from './SearchList';
import SearchListMobile from './SearchListMobile';
import Search from './View';
import GridSearchContainer from './_components/GridSearchContainer';
import { useGrid } from '../Provider';
import SearchDialogTimeline from './SearchDialogTimeline';
import SearchListTimeline from './SearchListTimeline';
// eslint-disable-next-line react/destructuring-assignment
export default function Main({
  parentType = 'grid',
  creatable = true,
  switchable: _switchable = false,
  gridType = 'table',
  viewMode = 'table',
}: any) {
  const { state, actions } = useGrid(); // Add this hook to get grid context
  const switchable = state?.config?.switchable || _switchable;
  const renderedCreateButton = () => {
    if (creatable && state?.customCreateButton) {
      return state?.customCreateButton;
    } else if (creatable && state?.customCreateActionButton) {
      const selectedRows = state?.table?.getSelectedRowModel().rows;
      return (
        <Fragment>
          {state?.customCreateActionButton({
            config: state?.config,
            selected_rows: selectedRows,
            actions,
          })}
        </Fragment>
      );
    } else if (creatable) {
      return <CreateButton className="hidden lg:inline-flex" title="New" />;
    } else {
      return null;
    }
  };
  return (
    <GridSearchProvider>
      {parentType === 'grid' ? (
        <GridSearchContainer>
          <div className="hidden flex-1 lg:block 2xl:flex-none">
            {state?.config?.hideFilterHeader ? null : (
              state?.config?.searchDialog === 'timeline' ? (
                <SearchListTimeline parentType="grid" />
              ) : (
                <SearchList parentType="grid" />
              )
            )}
          </div>
          <div className="flex min-h-[40px] flex-row-reverse lg:hidden w-full">
            <div className="flex">
              <SearchDialog />
            </div>
            <SearchListMobile gridType={gridType} parentType={parentType} />
          </div>
        </GridSearchContainer>
      ) : parentType === 'grid_expansion' ? (
        <div
          className={cn(
            `grid-expansion-search flex flex-row justify-between`,
            `${viewMode === 'table' ? 'lg:w-[49%]' : 'w-full'}`,
          )}
        >
          <div
            className={cn(
              `hidden min-h-[40px] flex-1 lg:block`,
              `${viewMode === 'card' ? 'lg:hidden' : ''}`,
            )}
          >
            <SearchList parentType={parentType} />
          </div>
          <div
            className={cn(
              `min-h-[40px]`,
              `${viewMode === 'table' ? 'lg:hidden' : ''}`,
            )}
          >
            <SearchListMobile gridType={gridType} parentType={parentType} />
          </div>
          <SearchDialog />
        </div>
      ) : (
        <div className="ml-0 mt-0 flex w-full max-w-[100%] flex-col justify-end gap-x-2 sm:mt-0">
          {/* <div className="relative flex flex-1 flex-row gap-x-2">
            <div className="my-2 h-[40px] w-full md:my-0">
              <Search />
            </div>
          </div> */}
          <div className="my-2 hidden lg:block">
            <SearchList />
          </div>
          <div className="min-h-[40px] lg:hidden">
            <SearchListMobile parentType={parentType}/>
          </div>
        </div>
      )}
    </GridSearchProvider>
  );
}
