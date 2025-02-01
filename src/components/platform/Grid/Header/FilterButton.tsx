"use client";
import React from "react";
import { Button } from "~/components/ui/button";
import { GridContext } from "../Provider";
import { ListFilterIcon } from "lucide-react";
import { testIDFormatter } from "~/utils/formatter";

export default function FilterButton() {
  const { state } = React.useContext(GridContext);
  return (
    <Button
      disabled
      size='md'
      variant={"outline"}
      className=""
      data-test-id={testIDFormatter(`${state?.config.entity}-grd-filter-btn`)}
      // onClick={() => actions?.handleCreate()}
    >
      <ListFilterIcon className="h-4 w-4" />
    </Button>
  );
}
