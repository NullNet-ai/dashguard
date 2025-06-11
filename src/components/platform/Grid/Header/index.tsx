'use client';

import React, { useContext } from 'react';
import GridTabs from '../Tabs/Tabs';
import Search from '../Search';
import BulkActionButton from './BulkActionButton';
import Sorting from '../Sorting';
import { GridContext } from '../Provider';
interface IProps {
  gridKey?: string;
  grid_tabs?: any[];
}
export default function Header({ gridKey, grid_tabs }: IProps) {
  const { state } = useContext(GridContext);

  return (
    <>
      <div className="flex flex-col py-2 pb-0 2xl:flex-row lg:justify-between">
        <div className="flex flex-col justify-between w-full max-w-full sm:flex-auto lg:flex-row">
          <div className="flex w-full flex-1 flex-col gap-2">
            <div className="flex h-[36px] justify-between">
              <GridTabs gridKey={gridKey} grid_tabs={grid_tabs} />
            </div>
            <Sorting />
          </div>
        </div>
        <Search />
      </div>
      {!state?.config?.customBulkButtonConfig?.hidden && <BulkActionButton />}
    </>
  );
}
