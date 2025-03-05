import { Card, CardFooter } from "~/components/ui/card";
import React from "react";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import GridMobileRow from "./common/GridMobileRow";
import Pagination from "../../Pagination";
import InfiniteScrollContainer from '../../Server/views/InfiniteScroll';
import CreateButton from '../../Header/ButtonHeader';

function GridMobile({shownPagination, parentType, gridLevel } : {
  shownPagination?: boolean;
  parentType?: string
  gridLevel?: number
}) {
  return (
    <Card className="col-span-full border-0 shadow-none">
      {/* <CardHeader>
        <Header />
      </CardHeader> */}
     <section className="px-2 lg:px-0"
        >
          <div
             id='scrollable-div-grid'
             className='w-full overflow-y-auto h-[calc(100vh-23rem)]'
          >
            <InfiniteScrollContainer />
          </div>
          <CreateButton className="fixed right-4 bottom-[5rem] md:bottom-[9rem]  size-10 rounded-full" />
        </section>
    </Card>
  );
}

export default GridMobile;
