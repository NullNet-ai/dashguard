import React, { useContext } from "react";
import GridTabs from "../Tabs/Tabs";
import Search from "../Search";
import CreateButton from "./ButtonHeader";
import TableViewButton from "./TableViewButton";
import CardViewButton from "./CardViewButton";
import FilterButton from "./FilterButton";
import BulkActionButton from "./BulkActionButton";
import Sorting from "../Sorting";
import { cn } from "~/lib/utils";

export default function Header(props: any) {
  const  { parentType } = props;
  const cls = parentType === 'record' ? 'lg:flex-row lg:w-full 2xl:mt-4' : 'lg:flex-row md:max-w-[49%] lg:mt-4'

  return (
    <>

      <div className={cn(
        `${parentType === 'record' ? 'flex-col-reverse  2xl:flex-row' : 'lg:flex-row flex-col-reverse gap-y-4'}`,
        `flex   py-2 pb-0  `)}>
        <div className={cn('flex flex-col justify-between sm:flex-auto ', cls)}>
          <div className="flex-1 w-full flex flex-col"> 
            <div className={cn(`h-[36px] justify-between`, `${parentType === 'record' ? 'hidden 2xl:flex' : 'flex'}`)}>
              <GridTabs />
            </div>
           <Sorting />
          </div>
        </div>
        <Search parentType={parentType}/>
      </div>
      <BulkActionButton />
   
    </>
  );
}
