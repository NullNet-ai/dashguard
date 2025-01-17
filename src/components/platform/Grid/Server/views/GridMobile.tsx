import { Card} from "~/components/ui/card";
import React from "react";
import CreateButton from "../../Header/ButtonHeader";
import InfiniteScrollContainer from "./InfiniteScroll";

function GridMobile() {
  return (
    <Card className="col-span-full border-0 shadow-none py-4">
        <section>
          <InfiniteScrollContainer />
          <CreateButton className="fixed right-4 bottom-[8rem] md:bottom-[9rem]  z-10 w-14 h-14 rounded-full" />
        </section>
    </Card>
  );
}

export default GridMobile;
