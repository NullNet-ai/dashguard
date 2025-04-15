import { Card, CardFooter } from "~/components/ui/card";
import React from "react";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import GridMobileRow from "./common/GridMobileRow";
import Pagination from "../../Pagination";
import InfiniteScrollContainer from '../../Server/views/InfiniteScroll';
import CreateButton from '../../Header/ButtonHeader';
import Search from '../../Search';
import { cn } from '~/lib/utils';
import Sorting from '../../Sorting';

function GridMobile({shownPagination, parentType='grid', gridLevel = 1, hideSearch } : {
  shownPagination?: boolean;
  parentType?: string
  gridLevel?: number
  hideSearch?: boolean
}) {

  const isExpandedTable = parentType === 'grid_expansion';

  return (
    <Card className="col-span-full border-0 shadow-none w-full">
      {/* <CardHeader>
        <Header />
      </CardHeader> */}
      <div
        className={cn(
          `flex justify-between flex-col`,
        )}
      >
        {!hideSearch && <Search parentType={parentType} />}
        {/* <GridSearchProvider>
          <SearchDialog />
        </GridSearchProvider> */}
        {['form', 'grid_expansion'].includes(parentType) && (
          <Sorting
            className={cn(`${isExpandedTable ? 'mb-[2px] self-end' : ''}`)}
          />
        )}
      </div>
     <section className="px-2 lg:px-0"
        >
          <div
             id='scrollable-div-grid'
             className={cn(`w-full `, `${gridLevel === 1 ? 'h-[calc(100vh-23rem)] overflow-y-auto' :''}`)}
          >
            <InfiniteScrollContainer gridlevel={gridLevel}/>
          </div>
          <CreateButton className="fixed right-4 bottom-[5rem] md:bottom-[9rem]  size-10 rounded-full" />
        </section>
    </Card>
  );
}

export default GridMobile;
