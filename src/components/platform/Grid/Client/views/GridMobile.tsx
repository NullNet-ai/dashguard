import { Card, CardFooter } from "~/components/ui/card";
import React from "react";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import GridMobileRow from "./common/GridMobileRow";
import Pagination from "../../Pagination";

function GridMobile({shownPagination, parentType } : {
  shownPagination?: boolean;
  parentType?: string
}) {
  return (
    <Card className="col-span-full border-0 shadow-none">
      {/* <CardHeader>
        <Header />
      </CardHeader> */}
      <ScrollArea
        style={{ height: "calc(100vh - 16rem)" }}
        className="mx-2 rounded-md text-card-foreground"
      >
        <section>
          <div>
            <GridMobileRow />
          </div>
        </section>
        {/* <Table>
          <TableHeader>
            <MyTableHead />
          </TableHeader>
          <MyTableBody />
        </Table> */}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {
        shownPagination && parentType === 'grid' && (
          <CardFooter>
            <Pagination />
          </CardFooter>
        )
      }
    </Card>
  );
}

export default GridMobile;
