import { Table, TableHeader } from "~/components/ui/table";
import { Card, CardFooter, CardHeader } from "~/components/ui/card";
import React, { useContext } from "react";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import MyTableHead from "../../TableHead";
import MyTableBody from "../../TableBody";
import Search from "../../Search";
import Pagination from "../../Pagination";
import { Button } from "~/components/ui/button";
import { GridContext } from "../../Provider";
import { Badge } from "~/components/ui/badge";

interface IGridDesktopProps {
  parentType: "grid" | "form" | "field";
}

function GridDesktop({ parentType }: IGridDesktopProps) {
  const { state, actions } = useContext(GridContext);

  return (
    <Card className="col-span-full border-0 shadow-none">
      {parentType !== "field" && (
        <CardHeader>
          <div className="flex flex-row space-x-2">
            {state?.config?.actionType === "multi-select" && (
              <Button
                onClick={() => {
                  actions?.handleMultiSelect();
                }}
                type="button"
              >
                <Badge color="green" className="mx-2 text-white">
                  {state?.totalCountSelected || 0}
                </Badge>
                Submit
              </Button>
            )}
            <div style={{ width: parentType ? "100%" : "calc(100vw - 29rem)" }}>
              <Search />
            </div>
          </div>
        </CardHeader>
      )}
      <ScrollArea
        style={
          parentType === "grid"
            ? { height: "calc(100vh - 16rem)" }
            : {
                // width: "calc(100vw - 40rem)",
                width: "auto",
              }
        }
        className="rounded-md border bg-card text-card-foreground"
      >
        <Table>
          <TableHeader>
            <MyTableHead />
          </TableHeader>
          <MyTableBody />
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {parentType === "grid" ? (
        <CardFooter>
          <Pagination />
        </CardFooter>
      ) : null}
    </Card>
  );
}

export default GridDesktop;
