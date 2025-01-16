import CreateButton from "../Header/ButtonHeader";
import CardViewButton from "../Header/CardViewButton";
import FilterButton from "../Header/FilterButton";
import TableViewButton from "../Header/TableViewButton";
import GridSearchProvider from "./Provider";
import SortingList from "./SortingList";
import SortingListMobile from "./SortingListMobile";
import Search from "./View";

export default function Main() {

  return (
    <GridSearchProvider>
      <div className="ml-0 mt-4 flex w-full flex-col justify-end max-w-[100%] gap-x-2 sm:mt-0 lg:ml-2 lg:w-[40%] lg:max-w-[40%]">
        <div className="relative flex flex-1 flex-row gap-x-2">
          <div className="my-2 w-full md:my-0  h-[40px]">
            <Search />
          </div>
          <div className="lg:flex h-[40px] flex-shrink-0 flex-row items-center hidden">
            <TableViewButton />
            <CardViewButton />
            <div className="mx-2 h-full w-[1px] bg-tertiary" />
            <FilterButton />
          </div>
          <CreateButton className="hidden lg:inline-flex" title="New" />
        </div>
        <div className="min-h-[40px] hidden lg:block">
          <SortingList />
        </div>
        <div className="min-h-[40px] lg:hidden">
        <SortingListMobile />
        </div>
        
      </div>
    </GridSearchProvider>
  );
}
