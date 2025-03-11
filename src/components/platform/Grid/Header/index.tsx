import React, { useContext } from "react";
import GridTabs from "../Tabs/Tabs";
import Search from "../Search";
import BulkActionButton from "./BulkActionButton";
import Sorting from "../Sorting";

export default function Header() {
  return (
    <>
      <div className="flex flex-col-reverse gap-y-4 py-2 pb-0 lg:flex-row lg:justify-between">
        <div className="flex flex-col justify-between sm:flex-auto lg:flex-row md:max-w-[43%]">
          <div className="flex-1 w-full flex flex-col"> 
            <div className="flex h-[36px] justify-between">
              <GridTabs />
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
