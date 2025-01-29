import { Table, TableHeader } from "~/components/ui/table";
import { Card, CardFooter, CardHeader } from "~/components/ui/card";
import React, { useContext, useMemo } from "react";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import MyTableHead from "../../TableHead";
import MyTableBody from "../../TableBody";
import Search from "../../Search";
import Pagination from "../../Pagination";
import { Button } from "~/components/ui/button";
import { GridContext } from "../../Provider";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import Sorting from "../../Sorting";

interface IGridDesktopProps {
  parentType: "grid" | "form" | "field";
  hideSearch?: boolean;
  height?: string;
  showAction?: boolean;
  parentProps?: {
    width?: string;
    open?: boolean;
    summary?: boolean;
  };
}

function GridDesktop({
  parentType,
  hideSearch,
  height,
  showAction,
  parentProps,
}: IGridDesktopProps) {
  const { state, actions } = useContext(GridContext);

  const { open, summary } = parentProps || {};

  const conWidth = useMemo(() => {
    if (open && summary) {
      return "lg:w-[calc(100vw-578px)]";
    } else if (!open && summary) {
      return "w-auto";
    } else if (open && !summary) {
      return "w-[calc(100vw-320px)]";
    } else return "";
  }, [open, summary]);

  return (
    <>
      {hideSearch ? null : (
        <div
          style={{ width: "calc(100vw - 37rem)" }}
          className="flex flex-col justify-between px-4"
        >
          <Search parentType="form" />
          {parentType === "form" && <Sorting />}
        </div>
      )}
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
            </div>
          </CardHeader>
        )}
        <div className={cn(`${parentType === 'form' ? 'px-4' : ''}`)}>
          <ScrollArea
            style={
              parentType === "grid"
                ? { height: "calc(100vh - 16rem)" }
                : {
                    // width: "calc(100vw - 40rem)",
                    height: height || "auto",
                  }
            }
            className={cn(
              `m-auto overflow-auto rounded-md border bg-card text-card-foreground lg:w-auto`,
              conWidth,
              parentType === "grid"
                ? "w-[350px] md:w-[460px]"
                : "w-[350px] md:w-[100%]",
            )}
          >
            <Table>
              <TableHeader>
                <MyTableHead />
              </TableHeader>
              <MyTableBody showAction={showAction} />
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        {parentType === "grid" ? (
          <CardFooter>
            <Pagination />
          </CardFooter>
        ) : null}
      </Card>
    </>
  );
}

export default GridDesktop;
