"use client";
import React from "react";
import { Button } from "~/components/ui/button";
import { GridContext } from "../Provider";
import { ListFilterIcon } from "lucide-react";

export default function FilterButton() {
  const { state } = React.useContext(GridContext);
  return (
    <Button
      loading={state?.createLoading}
      disabled
      variant={"outline"}
      className=""
      // onClick={() => actions?.handleCreate()}
    >
      <ListFilterIcon className="h-4 w-4" />
    </Button>
  );
}
