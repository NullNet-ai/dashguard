import React from "react";
import { Card, CardFooter, CardHeader } from "~/components/ui/card";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import CreateButton from "../../Header/ButtonHeader";
import MobileHeader from "../../Header/MobileHeader";
import InfiniteScrollContainer from "./InfiniteScroll";

function GridMobile() {
  return (
    <Card className="col-span-full border-0 shadow-none py-2">
      <CardHeader>
        <MobileHeader />
      </CardHeader>
      <ScrollArea
        style={{ height: "calc(100vh - 16rem)" }}
        className="rounded-md text-card-foreground"
      >
        <section className="px-2 lg:px-0">
          <InfiniteScrollContainer />
          <CreateButton className="fixed right-4 bottom-[8rem] md:bottom-[9rem]  z-10 w-14 h-14 rounded-full" />
        </section>
      </ScrollArea>
    </Card>
  )
}

export default GridMobile;
