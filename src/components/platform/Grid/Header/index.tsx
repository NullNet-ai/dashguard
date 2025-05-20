'use client';

import React, { useContext } from 'react';
import GridTabs from '../Tabs/Tabs';
import Search from '../Search';
import BulkActionButton from './BulkActionButton';
import Sorting from '../Sorting';
interface IProps {
  gridKey?: string;
  grid_tabs?: any[];
}
export default function Header({ gridKey, grid_tabs}: IProps) {
  return (
    <>
      <div className="flex flex-col-reverse gap-y-4 py-2 pb-0 lg:flex-row lg:justify-between">
        <div className="flex flex-col justify-between sm:flex-auto md:max-w-[43%] lg:flex-row">
          <div className="flex w-full flex-1 flex-col">
            <div className="flex h-[36px] justify-between">
              <GridTabs gridKey={gridKey} grid_tabs={grid_tabs}/>
            </div>
            <Sorting />
          </div>
        </div>
        <Search />
      </div>
      <BulkActionButton />
    </>
  );
}
