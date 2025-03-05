import React from "react";
import { Card, CardFooter, CardHeader } from "~/components/ui/card";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import CreateButton from "../../Header/ButtonHeader";
import MobileHeader from "../../Header/MobileHeader";
import InfiniteScrollContainer from "./InfiniteScroll";

function GridMobile() {
  return (
    <Card className="col-span-full border-0 shadow-none py-2 pt-0">
      <CardHeader>
        <MobileHeader />
      </CardHeader>
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
  )
}

export default GridMobile;
