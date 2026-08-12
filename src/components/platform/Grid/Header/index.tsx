'use client';

import React, { Fragment, useContext } from 'react';
import GridTabs from '../Tabs/Tabs';
import Search from '../Search';
import BulkActionButton from './BulkActionButton';
import Sorting from '../Sorting';
import { GridContext } from '../Provider';
import { cn } from '~/lib/utils';
import TableViewButton from './TableViewButton';
import CardViewButton from './CardViewButton';
import CreateButton from './ButtonHeader';
interface IProps {
  gridKey?: string;
  grid_tabs?: any[];
  switchable?: boolean;
  creatable?: boolean
}
export default function Header({
  gridKey,
  grid_tabs,
  switchable: _switchable = false,
  creatable = true
}: IProps) {
  const { state, actions } = useContext(GridContext);
  const switchable = state?.config?.switchable ?? _switchable;
  const addNewButtonPosition = state?.config?.addNewButtonPosition ?? 'default';
  const showGridTab = state?.config?.showGridTab ?? true;

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
    <>
      <div className='flex items-center justify-between mt-2'>
        {showGridTab ? <GridTabs gridKey={gridKey} grid_tabs={grid_tabs} /> : null}
        <span className='right-2 top-[-1px] w-0 opacity-0 absolute' />
        <div
          className={cn(
            `relative flex flex-none flex-row justify-end 2xl:flex-1`,
            `${switchable ? 'gap-x-2' : ''}`,
          )}
        >
          {/* <div className="my-2 h-[40px] w-full md:my-0">
              <Search gridType={gridType} />
            </div> */}
          <div className="hidden flex-shrink-0 flex-row items-center lg:flex">
            {switchable ? (
              <>
                <TableViewButton />
                <CardViewButton />
              </>
            ) : null}
            {/* <div className="mx-2 h-full w-[1px] bg-tertiary" />
              <FilterButton /> */}
          </div>
          {/* Replace the existing create button with this logic */}
          {renderedCreateButton()}
        </div>
      </div>
      <div className="flex flex-col py-2 pb-0 lg:justify-between 2xl:flex-row">
        <div className="flex w-full max-w-full flex-col justify-between sm:flex-auto lg:flex-row">
          <div className="flex w-full flex-1 flex-col gap-2">
            {/* <div className="flex h-[36px] justify-between"></div> */}
            {state?.config?.hideFilterHeader ? null : <Sorting />}
          </div>
        </div>
        <Search />
      </div>
      {!state?.config?.customBulkButtonConfig?.hidden && <BulkActionButton />}
    </>
  );
}
