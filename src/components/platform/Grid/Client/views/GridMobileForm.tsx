import { Card, CardFooter } from "~/components/ui/card";
import React from "react";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import GridMobileRow from "./common/GridMobileRow";
import Pagination from "../../Pagination";

function GridMobileForm({shownPagination, parentType } : {
  shownPagination?: boolean;
  parentType?: string
}) {
  return (
    <Card className="col-span-full border-0 shadow-none flex-1">
      {/* <CardHeader>
        <Header />
      </CardHeader> */}
      <ScrollArea
        style={{ height: "auto" }}
        className="rounded-md text-card-foreground"
      >
        <section>
          <div>
            <GridMobileRow parent={parentType} />
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
        shownPagination && parentType ==='grid' && (
          <CardFooter>
            <Pagination />
          </CardFooter>
        )
      }
    </Card>
  );
}

export default GridMobileForm;
