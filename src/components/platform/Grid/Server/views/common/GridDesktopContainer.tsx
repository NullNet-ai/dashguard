"use client";

import { Table, TableHeader } from "~/components/ui/table";
import MyTableHead from "../../../TableHead";
import MyTableBody from "../../../TableBody";
import { GridContext } from "../../../Provider";
import { useContext } from "react";
import { Card } from "~/components/ui/card";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import GridCardView from "./GridCardview";

const GridDesktopContainer = () => {
  const { state } = useContext(GridContext);

  if(state?.viewMode === "card") { 
    return (
        <Card className="col-span-full border-0 shadow-none py-4">
      {/* <CardHeader>
        <Header />
      </CardHeader> */}
      <ScrollArea
        style={{ height: "calc(100vh - 16rem)" }}
        className="mx-2 rounded-md text-card-foreground"
      >
        <section>
          <div>
            <GridCardView />
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
    </Card>
    )
  }

  return (
    <Table
      style={{width: state?.table?.getCenterTotalSize()}}
    >
      <TableHeader>
        <MyTableHead />
      </TableHeader>
      <MyTableBody />
    </Table>
  );
};

export default GridDesktopContainer;
