import React, { useContext } from "react";
import GridTabs from "../Tabs/Tabs";
import Search from "../Search";
import CreateButton from "./ButtonHeader";
import TableViewButton from "./TableViewButton";
import CardViewButton from "./CardViewButton";
import FilterButton from "./FilterButton";
import BulkActionButton from "./BulkActionButton";
import Sorting from "../Sorting";

export default function Header() {
  return (
    <>
      <div className="flex flex-col-reverse gap-y-4 py-2 lg:flex-row">
        <div className="flex flex-col justify-between sm:flex-auto lg:flex-row">
          <div className="flex items-center justify-between">
            <GridTabs />
          </div>
        </div>
        <div className="ml-0 mt-4 flex w-full flex-row justify-end gap-x-2 sm:mt-0 lg:ml-2 lg:w-1/2">
          <div className="my-2 w-full md:my-0 lg:w-1/2"> 
            <Search />
          </div>
          <div className="flex flex-row items-center">
            <TableViewButton />
            <CardViewButton />
            <div className="mx-2 h-full w-[1px] bg-tertiary" />
            <FilterButton />
          </div>
          <CreateButton className="hidden lg:inline-flex" title="Create" />
        </div>
      </div>
      <BulkActionButton />
      <Sorting />
    </>
  );
}
