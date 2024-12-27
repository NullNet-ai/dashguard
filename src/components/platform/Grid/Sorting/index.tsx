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

  return (
    <div className="flex flex-1 items-center gap-2">
      <span className="text-xs text-foreground">Sort By</span>
      {state?.sorting?.map((item: ColumnSort) => (
        <Badge  key={item.id} variant="default" >
          {formatAndCapitalize(item.id)} ({item.desc ? "Desc" : "Asce"})
          <Button
            variant="ghost"
            size="xs"
            name="removeSortingButton"
            data-test-id={testIDFormatter(`${entity}-remove-sorting-btn`)}
            key={`${item.id}-remove`}
            className="h-auto w-auto p-0 focus:outline-none"
            onClick={() => {
              actions?.handleRemoveSorting(item.id);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </Badge>
      ))}
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
