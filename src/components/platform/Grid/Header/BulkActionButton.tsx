"use client";
import React from "react";
import { Button } from "~/components/ui/button";
import { GridContext } from "../Provider";
import { TrashIcon } from "@heroicons/react/20/solid";

export default function BulkActionButton() {
  const { state, actions } = React.useContext(GridContext);
  const {  table } = state ?? {};
  const selectedRows = table?.getSelectedRowModel().rows;

  if (!selectedRows?.length) return null;

  return (
    <Button
      data-test-id="gridBulkActionButton"
      className={"flex lg:inline-flex"}
      variant={"destructive"}
      loading={state?.archiveBulkLoading}
      onClick={() => {
        actions?.handleArchiveBulkRecord();
      }}
    >
      <TrashIcon className="h-4 w-4" />
      <span className="p-1">Archive</span>
    </Button>
  );
}
