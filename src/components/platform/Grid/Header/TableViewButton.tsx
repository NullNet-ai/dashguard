"use client";
import React from "react";
import { Button } from "~/components/ui/button";
import { TableIcon } from "lucide-react";
import { GridContext } from "../Provider";
import { testIDFormatter } from "~/utils/formatter";

export default function TableViewButton() {
  const { state, actions } = React.useContext(GridContext);


  const active = state?.viewMode === "table";

  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size='md'
      className="rounded-r-none hidden lg:block"
      onClick={() => actions?.handleSwitchViewMode("table")}
      data-test-id={testIDFormatter(`${state?.config.entity}-grd-tbl-view-btn`)}
    >
      <TableIcon className="h-4 w-4" />
    </Button>
  );
}
