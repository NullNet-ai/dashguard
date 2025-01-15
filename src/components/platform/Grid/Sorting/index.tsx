"use client";
import React, { useContext } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { GridContext } from "../Provider";
import { formatAndCapitalize } from "~/lib/utils";
import { X } from "lucide-react";
import { ColumnSort } from "@tanstack/react-table";
import { testIDFormatter } from "~/utils/formatter";

const Sorting = () => {
  const { state, actions } = useContext(GridContext);
  if (!state?.sorting?.length) return null;

  const entity = state?.config?.entity;

  const getLabel = (id: string) => {
    const column = state?.config?.columns.find(
      (col: any) => col.accessorKey === id,
    );
    return column?.header || formatAndCapitalize(id);
  };

  return (
    <div className="flex flex-1 items-center">
      <span className="text-xs text-foreground">Sort By</span>
      {state?.sorting?.map((item: ColumnSort) => (
        <Badge key={item.id}                   
          variant="secondary"
          className="m-1 flex items-center gap-1 whitespace-nowrap"
        >
          {getLabel(item.id) as string} ({item.desc ? "Desc" : "Asce"})
          <Button
            variant="ghost"
            size="xs"
            name="removeSortingButton"
            data-test-id={testIDFormatter(`${entity}-remove-sorting-btn`)}
            key={`${item.id}-remove`}
                className="h-auto w-auto text-nowrap p-0 text-default/40 hover:bg-transparent focus:outline-none"
            onClick={() => {
              actions?.handleRemoveSorting(item.id);
            }}
          >
          <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
          <Button
              variant="outline"
              size="xs"
              name="removeSortingButton"
              className="h-[24px] w-auto text-nowrap bg-muted px-2 text-default/70 hover:bg-transparent focus:outline-none"
              onClick={() => {
                //
              }}
            >
              More (2)
            </Button>
      <Button
        name="resetSortButton"
        data-test-id={testIDFormatter(`${entity}-grd-sorting-reset`)}
        variant={"link"}
        className="text-default/60 underline hover:no-underline"
        onClick={() => {
          actions?.handleResetSorting();
        }}
      >
        Reset Sort
      </Button>
    </div>
  );
};

export default Sorting;
