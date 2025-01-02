"use client";
import React from "react";
import { Button } from "~/components/ui/button";
import { GridContext } from "../Provider";
import { TrashIcon } from "@heroicons/react/20/solid";
import { testIDFormatter } from "~/utils/formatter";

export default function BulkActionButton() {
  const { state, actions } = React.useContext(GridContext);
  const { table } = state ?? {};
  const selectedRows = table?.getSelectedRowModel().rows;

  if (!selectedRows?.length) return null;

  return (
    <Button
      data-test-id={testIDFormatter(
        `${state?.config.entity}-grd-bulk-action-btn`,
      )}
      className={"flex lg:inline-flex"}
      variant={"destructive"}
      onClick={() => {
        actions?.setShowBulkActionConfirmationModal(true);
        actions?.setBulkActionType("archive");
      }}
    >
      <TrashIcon className="h-4 w-4" />
      <span className="p-1">Archive</span>
    </Button>
  );
}
