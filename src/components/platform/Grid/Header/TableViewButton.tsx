"use client";
import React from "react";
import { Button } from "~/components/ui/button";
import { TableIcon } from "lucide-react";
import { GridContext } from "../Provider";

export default function TableViewButton() {
  const { state, actions } = React.useContext(GridContext);

  const active = state?.viewMode === "table";

  return (
    <Button
      variant={active ? 'default' : 'outline'}
      className="rounded-r-none"
      loading={state?.createLoading}
      onClick={() => actions?.handleSwitchViewMode("table")}
    >
      <TableIcon className="h-4 w-4" />
    </Button>
  );
}
