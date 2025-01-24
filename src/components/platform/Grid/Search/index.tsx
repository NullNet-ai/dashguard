import CreateButton from "../Header/ButtonHeader";
import CardViewButton from "../Header/CardViewButton";
import FilterButton from "../Header/FilterButton";
import TableViewButton from "../Header/TableViewButton";
import GridSearchProvider from "./Provider";
import SortingList from "./SortingList";
import SortingListMobile from "./SortingListMobile";
import Search from "./View";

export default function Main({ parentType = "grid" }: any) {
  return (
    <GridSearchProvider>
      {parentType === "grid" ? (
        <div className="ml-0 mt-0 flex w-full max-w-[100%] flex-col justify-end gap-x-2 sm:mt-0 lg:ml-2 lg:mt-4 lg:w-[40%] lg:max-w-[40%]">
          <div className="relative flex flex-1 flex-row gap-x-2">
            <div className="my-2 h-[40px] w-full md:my-0">
              <Search />
            </div>
            <div className="flex h-[36px] flex-shrink-0 flex-row items-center">
              <TableViewButton />
              <CardViewButton />
              <div className="mx-2 h-full w-[1px] bg-tertiary" />
              <FilterButton />
            </div>
            <CreateButton className="hidden lg:inline-flex" title="New" />
          </div>
          <div className="hidden min-h-[40px] lg:block">
            <SortingList />
          </div>
          <div className="min-h-[40px] lg:hidden">
            <SortingListMobile />
          </div>
        </div>
      ) : (
        <div className="ml-0 mt-0 flex w-full max-w-[100%] flex-col justify-end gap-x-2 sm:mt-0 lg:mt-4">
          <div className="relative flex flex-1 flex-row gap-x-2">
            <div className="my-2 h-[40px] w-full md:my-0">
              <Search />
            </div>
          </div>
          <div className="hidden min-h-[40px] lg:block">
            <SortingList />
          </div>
          <div className="min-h-[40px] lg:hidden">
            <SortingListMobile />
          </div>
        </div>
      )}
    </GridSearchProvider>
  );
}
