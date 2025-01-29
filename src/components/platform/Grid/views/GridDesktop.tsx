import { Table, TableHeader } from "~/components/ui/table";
import MyTableHead from "../TableHead";
import MyTableBody from "../TableBody";
import { Card, CardFooter, CardHeader } from "~/components/ui/card";
import Pagination from "../Pagination";
import React from "react";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import Header from "../Header";

interface IGridDesktopProps {
  parentRenderType: "client" | "server";
}

function GridDesktop({ parentRenderType = "server" }: IGridDesktopProps) {
  return (
    <Card className="col-span-full border-0 shadow-none">
      {parentRenderType === "server" ? (
        <CardHeader>
          <Header />
        </CardHeader>
      ) : null}
      <ScrollArea
        style={{ height: "calc(100vh - 16rem)" }}
        className="mx-2 rounded-md border bg-card text-card-foreground"
      >
        <Table>
          <TableHeader>
            <MyTableHead />
          </TableHeader>
          <MyTableBody />
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <CardFooter>
        <Pagination />
      </CardFooter>
    </Card>
  );
}

export default GridDesktop;
